import { describe,expect,it } from 'vitest';
import { content } from '@/lib/contentRepository';
import { correctIds,exactChoiceCorrect,isChoice,scoreChoice } from '@/lib/questions';
import { newStudySession,submitSessionItem,finishSession,sessionStats,sessionAttempts } from '@/lib/studySession';
import { emptyStore,parseStore,saveStore,STORAGE_KEY,MIGRATION_BACKUP_KEY } from '@/lib/storage';
import { diagramLesson,validateDiagramLesson } from '@/lib/diagramLesson';
import { exampleGraph } from '@/lib/diagramGrader';
import type { ChoiceQuestion } from '@/content/types';
const multi=content.questions.find(q=>q.type==='multiple-answer'&&q.correctChoiceIds.length===2)! as ChoiceQuestion;
const single=content.questions.find(q=>q.id==='mcq-expanded-03')! as ChoiceQuestion;
const written=content.questions.find(q=>q.type==='short-answer')!,caseItem=content.cases[0],diagram=content.diagrams[0];
const clone=<T,>(value:T):T=>JSON.parse(JSON.stringify(value));

describe('partial-credit scoring and correctness',()=>{
  it('scores omissions and wrong selections; exhaustive subsets never reward selecting everything',()=>{
    const right=correctIds(multi),wrong=multi.choiceIds.filter(id=>!right.includes(id));
    expect(scoreChoice(multi,[right[0]],'partial')).toBe(0.5);
    expect(scoreChoice(multi,[...right,wrong[0]],'partial')).toBe(0.5);
    expect(scoreChoice(multi,[right[0],wrong[0]],'partial')).toBe(0);
    for(const q of content.questions.filter(isChoice).filter(q=>q.type==='multiple-answer')){
      for(let mask=0;mask<16;mask++){
        const selected=q.choiceIds.filter((_,i)=>mask&(1<<i)),score=scoreChoice(q,selected,'partial');
        expect(score).toBeGreaterThanOrEqual(0);expect(score).toBeLessThanOrEqual(1);
        expect(score===1).toBe(exactChoiceCorrect(q,selected));
      }
      expect(scoreChoice(q,q.choiceIds,'partial')).toBe(0);
    }
    expect(scoreChoice(multi,[right[0]],'exact')).toBe(0);
    expect(scoreChoice(multi,[right[0],right[0]],'partial')).toBe(0);
    expect(scoreChoice(multi,['unknown'],'partial')).toBe(0);
  });
  it('uses only authored fractional weights for single-answer choices',()=>{
    expect(scoreChoice(single,['a'],'partial')).toBe(0.5);expect(exactChoiceCorrect(single,['a'])).toBe(false);
    expect(scoreChoice(single,['a'],'exact')).toBe(0);expect(scoreChoice(single,['b'],'partial')).toBe(0);
    expect(scoreChoice(single,correctIds(single),'partial')).toBe(1);
    const bad=clone(single);if(bad.type!=='multiple-choice')throw Error();
    bad.partialCredits={unknown:{score:0.5,explanation:'Invalid key'}};
    expect(()=>newStudySession('multiple-choice',[bad])).toThrow('incorrect choice');
    bad.partialCredits={[bad.choiceIds[bad.answer]]:{score:0.5,explanation:'Invalid key'}};
    expect(()=>newStudySession('multiple-choice',[bad])).toThrow('incorrect choice');
    bad.partialCredits={a:{score:1,explanation:'Must be fractional'}};expect(()=>newStudySession('multiple-choice',[bad])).toThrow();
  });
  it('persists fractional points independently from exact accuracy and retains the policy',()=>{
    let session=newStudySession('multiple-choice',[multi,single],{autoAdvance:false});
    session=submitSessionItem(session,multi.id,[correctIds(multi)[0]],'High');
    session=submitSessionItem(session,single.id,correctIds(single),'Low');session=finishSession(session);
    expect(sessionStats(session)).toMatchObject({percent:75,exactPercent:50,exactCorrect:1,choiceScored:2});
    const attempts=sessionAttempts(session);expect(attempts[0]).toMatchObject({score:0.5,exactCorrect:false,scoringPolicy:'partial',scoringVersion:1});
    const restored=parseStore(JSON.stringify({...emptyStore(),studySessions:[session],attempts}));expect(restored.studySessions[0]).toEqual(session);
    const bad=clone(restored);bad.attempts[0].score=0.9;expect(()=>parseStore(JSON.stringify(bad))).toThrow('scoring');
  });
});

describe('sample exam immediate navigation',()=>{
  it('advances all four formats on submit, locks duplicates, and leaves final submission explicit',()=>{
    let session=newStudySession('mock',[multi,written,caseItem,diagram]);
    const responses=[correctIds(multi).slice(0,1),'Written reasoning','Case reasoning',exampleGraph(diagram)];
    session.items.forEach((item,index)=>{
      session=submitSessionItem(session,item.id,responses[index],'Medium');
      expect(session.index).toBe(Math.min(index+1,3));expect(session.status).toBe('active');
      expect(session.submissions[item.id]).toMatchObject({score:null,exactCorrect:null});
      expect(sessionAttempts(session)).toEqual([]);expect(sessionStats(session).exactPercent).toBeNull();
      expect(submitSessionItem(session,item.id,responses[index],'High')).toBe(session);
    });
    expect(sessionStats(session).complete).toBe(true);
    session=finishSession(session);expect(session.submissions[multi.id]).toMatchObject({score:0.5,exactCorrect:false});
    expect(sessionStats(session)).toMatchObject({scored:2,pending:2,percent:75,exactPercent:0});
  });
  it('respects manual/countdown settings, required confidence, and missing answers',()=>{
    for(const settings of [{autoAdvance:false},{mockAdvance:'countdown' as const}]){
      const session=newStudySession('mock',[multi,written],settings);
      expect(submitSessionItem(session,multi.id,correctIds(multi),'High').index).toBe(0);
      expect(()=>submitSessionItem(session,multi.id,[],'High')).toThrow();
    }
  });
});

describe('v2 history preservation and failed saves',()=>{
  it('restores exact/countdown defaults for old active sessions, without revising saved scores',()=>{
    const session=submitSessionItem(newStudySession('multiple-choice',[multi],{scoringPolicy:'exact'}),multi.id,[correctIds(multi)[0]],'Low');
    const old=JSON.parse(JSON.stringify({...emptyStore(),studySessions:[session],attempts:sessionAttempts(session)}));
    old.version=2;delete old.studySessions[0].settings.scoringPolicy;delete old.studySessions[0].settings.scoringVersion;delete old.studySessions[0].settings.mockAdvance;
    delete old.studySessions[0].submissions[multi.id].exactCorrect;for(const attempt of old.attempts){delete attempt.scoringPolicy;delete attempt.scoringVersion;delete attempt.exactCorrect;}
    const raw=JSON.stringify(old),restored=parseStore(raw);expect(restored.version).toBe(4);
    expect(restored.studySessions[0].settings).toMatchObject({scoringPolicy:'exact',mockAdvance:'countdown'});
    expect(restored.attempts[0].score).toBe(0);expect(restored.studySessions[0].submissions[multi.id].score).toBe(0);
    const data=new Map([[STORAGE_KEY,raw]]),adapter={getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);},removeItem:(k:string)=>{data.delete(k);}};
    saveStore(adapter,restored);expect(data.get(MIGRATION_BACKUP_KEY)).toBe(raw);
    saveStore(adapter,restored);expect(data.get(MIGRATION_BACKUP_KEY)).toBe(raw);
    const blocked={...adapter,setItem:()=>{throw new Error('quota');}};const before=data.get(STORAGE_KEY);
    expect(()=>saveStore(blocked,restored)).toThrow('quota');expect(data.get(STORAGE_KEY)).toBe(before);
  });
  it('rejects premature exact correctness as well as premature points in unfinished mocks',()=>{
    const session=submitSessionItem(newStudySession('mock',[multi]),multi.id,correctIds(multi),'High');
    session.submissions[multi.id].exactCorrect=true;
    expect(()=>parseStore(JSON.stringify({...emptyStore(),studySessions:[session]}))).toThrow('correctness exposed');
  });
});

describe('sourced diagram lesson',()=>{
  it('retains ATM message order, three alternatives, all airline actors, and the requested include direction',()=>{
    expect(diagramLesson.sequence.messages.map(m=>m.id)).toEqual(['insert','verify','pin','check-pin','amount','funds']);
    expect(diagramLesson.sequence.branches.map(b=>b.id)).toEqual(['approved','rejected','blocked']);
    expect(diagramLesson.sequence.branches.find(b=>b.id==='blocked')!.messages.map(m=>m.label)).toContain('Keep hold of the card');
    expect(diagramLesson.airline.nodes.filter(n=>n.kind!=='usecase').map(n=>n.id)).toEqual(['passenger','rep','baggage-system','tsa']);
    expect(diagramLesson.airline.edges.filter(e=>e.relation==='include').map(e=>[e.from,e.to])).toEqual([['checkin','pass'],['pass','security'],['boarding','pass']]);
    expect(diagramLesson.airline.sourceNote).toContain('handwritten instructor');
  });
  it('rejects broken citations, participants, actor connections, and comprehension keys',()=>{
    const bad=clone(diagramLesson);bad.sourceIds=['unknown'];expect(()=>validateDiagramLesson(bad)).toThrow('source');
    const wrong=clone(diagramLesson);wrong.sequence.messages[0].to='unknown';expect(()=>validateDiagramLesson(wrong)).toThrow('participant');
    const key=clone(diagramLesson);key.checks[0].answer=100;expect(()=>validateDiagramLesson(key)).toThrow('answer');
  });
});
