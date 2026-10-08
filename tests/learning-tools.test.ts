import { describe,it,expect } from 'vitest';
import { content } from '@/lib/contentRepository';
import { correctIds,isChoice } from '@/lib/questions';
import { newStudySession,submitSessionItem,selfScoreSessionItem,finishSession,sessionAttempts } from '@/lib/studySession';
import { emptyStore,parseStore,saveStore,STORAGE_KEY,SHEET_BACKUP_KEY } from '@/lib/storage';
import { learningResponses,learningMetrics,dailyScores } from '@/lib/learningHistory';
import { referenceSuggestions } from '@/lib/referenceSuggestions';
import { ReferenceDraftSchema,revisedSheet } from '@/lib/referenceSheet';
import type { Answer,StudyItem,Confidence,StudySession,ChoiceQuestion } from '@/content/types';
const single=content.questions.find(q=>q.id==='mcq-1')! as ChoiceQuestion;
const written=content.questions.find(q=>q.type==='short-answer')!;
const caseItem=content.cases[0];
const now=new Date('2026-10-08T18:00:00.000Z');
const filters={days:0 as const,topicId:'all',evaluation:'all' as const,policy:'all' as const};
function response(item:StudyItem,answer:Answer,id:string,date='2026-10-08T12:00:00.000Z',confidence:Confidence='High',settings:Parameters<typeof newStudySession>[2]={},mode?:StudySession['mode']){
  const format=mode??('diagramType' in item?'mock':'scenario' in item?'case':isChoice(item)?'multiple-choice':'short-answer');
  let session=newStudySession(format,[item],{autoAdvance:false,...settings},id,date);
  session=submitSessionItem(session,item.id,answer,confidence);session.submissions[item.id].submittedAt=date;return session;
}
const wrong=(item:typeof single)=>{if(!isChoice(item))throw Error();return [item.choiceIds.find(id=>!correctIds(item).includes(id))!];};

describe('revealed history and correct metric grain',()=>{
  it('counts one multi-topic case response, excludes unfinished mocks, and leaves pending written scores out of means',()=>{
    let c=response(caseItem,'Case reasoning','case');c=selfScoreSessionItem(c,caseItem.id,1);
    const pending=response(written,'Written reasoning','pending'),mock=response(single,wrong(single),'hidden',undefined,'High',{},'mock');
    const store={...emptyStore(),studySessions:[c,pending,mock],attempts:sessionAttempts(c)};
    const rows=learningResponses(store);expect(rows).toHaveLength(2);expect(rows.find(r=>r.itemId===caseItem.id)!.topicIds).toEqual(caseItem.topicIds);
    const stats=learningMetrics(rows,filters,now);expect(stats.selected).toHaveLength(2);expect(stats.scored).toHaveLength(1);expect(stats.selfMean).toBeCloseTo(1/3);expect(stats.calibration.every(c=>c.count===0)).toBe(true);
    for(const id of caseItem.topicIds)expect(stats.gaps.find(g=>g.topic.id===id)!.count).toBe(1);
  });
  it('keeps first tries defined across all history before date and policy filters; repeats cannot inflate them',()=>{
    const first=response(single,wrong(single),'first','2026-09-01T12:00:00.000Z'),repeat=response(single,correctIds(single),'repeat');
    const rows=learningResponses({...emptyStore(),studySessions:[repeat,first]});
    expect(rows.map(r=>r.firstTry)).toEqual([true,false]);
    const stats=learningMetrics(rows,{...filters,days:7},now);expect(stats.first).toHaveLength(0);expect(stats.firstAccuracy).toBeNull();expect(stats.recovery.objective).toMatchObject({count:1,recovered:1,delta:1});
    expect(learningMetrics(rows,filters,now).firstAccuracy).toBe(0);
  });
  it('uses exact MCQ correctness for confidence, not earned points or written self-assessment',()=>{
    const q=content.questions.find(q=>q.id==='mcq-expanded-03')!;
    const partial=response(q,['a'],'partial'),right=response(single,correctIds(single),'right',undefined,'Low');
    let self=response(written,'Written answer','self');self=selfScoreSessionItem(self,written.id,3);
    const stats=learningMetrics(learningResponses({...emptyStore(),studySessions:[partial,right,self]}),filters,now);
    expect(stats.calibration.find(r=>r.confidence==='High')).toMatchObject({count:1,correct:0,accuracy:0});expect(stats.highConfidenceErrors).toHaveLength(1);
    expect(stats.objectiveMean).toBe(0.75);expect(stats.selfMean).toBe(1);expect(stats.calibration.find(r=>r.confidence==='Medium')!.accuracy).toBeNull();
  });
  it('does not claim recovery across content versions, scoring policies, difficulty, or exam/practice mode',()=>{
    const first=response(single,wrong(single),'first',undefined,'Low',{scoringPolicy:'exact'});
    const partial=response(single,correctIds(single),'partial',undefined,'High',{scoringPolicy:'partial'});
    const v2=response({...single,version:2},correctIds(single),'v2',undefined,'High',{scoringPolicy:'exact'});
    const mock=finishSession(response(single,correctIds(single),'exam',undefined,'High',{scoringPolicy:'exact'},'mock'));
    const stats=learningMetrics(learningResponses({...emptyStore(),studySessions:[first,partial,v2,mock]}),filters,now);
    expect(stats.groups).toHaveLength(4);expect(stats.recovery.objective.count).toBe(0);
  });
  it('deduplicates legacy case topic rows and groups daily means with sample counts',()=>{
    const attempts=caseItem.topicIds.map(topicId=>({id:`legacy-${topicId}`,itemId:caseItem.id,topicId,itemType:'case' as const,response:'Same original response',score:1/3,confidence:'Low' as const,completedAt:'2026-10-08T12:00:00.000Z',sourceIds:caseItem.sourceIds}));
    const rows=learningResponses({...emptyStore(),attempts});expect(rows).toHaveLength(1);expect(rows[0].itemVersion).toBeNull();
    expect(dailyScores(rows)[0]).toMatchObject({count:1,score:1/3,firstCount:1});
  });
});

describe('reference suggestions and decisions',()=>{
  it('uses saved revealed scores strictly below two-thirds; pending and unfinished mock answers are excluded',()=>{
    const low=response(single,wrong(single),'low');let boundary=response(written,'Answer','boundary');boundary=selfScoreSessionItem(boundary,written.id,2);
    const pending=response(written,'Pending','pending'),mock=response(single,wrong(single),'hidden',undefined,'High',{},'mock');
    const suggestions=referenceSuggestions({...emptyStore(),studySessions:[low,boundary,pending,mock]});expect(suggestions).toHaveLength(1);expect(suggestions[0].responseIds).toEqual([`low:${single.id}`]);
    expect(suggestions[0].text).toBe('explanation' in single?single.explanation:'');
  });
  it('deduplicates repeated concept misses, persists dismissal per response, and offers to update an existing note',()=>{
    const a=response(single,wrong(single),'a','2026-10-07T12:00:00.000Z'),b=response(single,wrong(single),'b');
    const store={...emptyStore(),studySessions:[a,b]};const grouped=referenceSuggestions(store);expect(grouped).toHaveLength(1);expect(grouped[0].misses).toBe(2);
    store.suggestionDecisions=grouped[0].responseIds.map(responseId=>({responseId,conceptKey:grouped[0].conceptKey,decision:'dismissed',updatedAt:now.toISOString()}));
    expect(referenceSuggestions(parseStore(JSON.stringify(store)))).toEqual([]);
    store.studySessions.push(response(single,wrong(single),'c'));expect(referenceSuggestions(store)[0].misses).toBe(1);
    const suggestion=referenceSuggestions(store)[0];store.referenceSheet=revisedSheet(store.referenceSheet,{notes:[{id:'note',text:'My edited reminder',kind:'text',origin:'edited',conceptKey:suggestion.conceptKey,topicIds:suggestion.topicIds,sourceIds:suggestion.sourceIds,responseIds:[],updatedAt:now.toISOString()}]});
    expect(referenceSuggestions(store)[0].existingNote!.text).toBe('My edited reminder');
  });
  it('makes completed mock errors eligible only after final submit',()=>{
    const active=response(single,wrong(single),'mock',undefined,'High',{},'mock'),store={...emptyStore(),studySessions:[active]};expect(referenceSuggestions(store)).toEqual([]);
    store.studySessions=[finishSession(active)];expect(referenceSuggestions(store)).toHaveLength(1);
  });
});

describe('sheet migration and validation',()=>{
  it('migrates v3 without changing scores and keeps a pre-v4 backup on first write',()=>{
    const session=response(single,correctIds(single),'saved'),old={version:3,attempts:sessionAttempts(session),diagrams:[],sessions:[],studySessions:[session]},raw=JSON.stringify(old),store=parseStore(raw);
    expect(store.referenceSheet.notes).toEqual([]);expect(store.attempts[0].score).toBe(1);
    const map=new Map([[STORAGE_KEY,raw]]),adapter={getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);},removeItem:(k:string)=>{map.delete(k);}};
    saveStore(adapter,store);expect(map.get(SHEET_BACKUP_KEY)).toBe(raw);saveStore(adapter,store);expect(map.get(SHEET_BACKUP_KEY)).toBe(raw);
  });
  it('rejects duplicate attempts and conflicting topic rows for one response',()=>{
    let session=response(caseItem,'Case answer','consistent');session=selfScoreSessionItem(session,caseItem.id,1);
    const store={...emptyStore(),studySessions:[session],attempts:sessionAttempts(session)};
    expect(()=>parseStore(JSON.stringify(store))).not.toThrow();
    store.attempts.push({...store.attempts[0]});expect(()=>parseStore(JSON.stringify(store))).toThrow('Duplicate attempt');store.attempts.pop();
    if(store.attempts.length>1){store.attempts[1].confidence='Low';expect(()=>parseStore(JSON.stringify(store))).toThrow('Conflicting');}
  });
  it('preserves drafts and rejects invalid note metadata or stale draft references',()=>{
    const store=emptyStore();store.referenceSheet=revisedSheet(store.referenceSheet,{draft:ReferenceDraftSchema.parse({text:'Proposed note\n'.repeat(200)})});expect(parseStore(JSON.stringify(store)).referenceSheet.draft.text).toBe(store.referenceSheet.draft.text);
    store.referenceSheet.notes=[{id:'n',kind:'text',text:'Note',origin:'personal',topicIds:[],sourceIds:['unknown'],responseIds:[],updatedAt:now.toISOString()}];expect(()=>parseStore(JSON.stringify(store))).toThrow('source');
    store.referenceSheet.notes=[];store.referenceSheet.draft.noteId='missing';expect(()=>parseStore(JSON.stringify(store))).toThrow('draft note');
  });
});
