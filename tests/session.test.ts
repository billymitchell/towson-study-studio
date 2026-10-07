import { describe,it,expect } from 'vitest';
import { content } from '@/lib/contentRepository';
import { validateContent } from '@/content/validate';
import { isChoice, scoreChoice, correctIds } from '@/lib/questions';
import { newStudySession, updateSessionDraft, submitSessionItem, selfScoreSessionItem, finishSession, advanceSession, sessionAttempts, sessionStats, practiceQueue } from '@/lib/studySession';
import { emptyStore, parseStore, saveStore, loadStore, STORAGE_KEY, LEGACY_BACKUP_KEY } from '@/lib/storage';
import { exampleGraph } from '@/lib/diagramGrader';
import type { Confidence } from '@/content/types';
const single=content.questions.find(q=>q.type==='multiple-choice')!;
const multi=content.questions.find(q=>q.type==='multiple-answer')!;
const written=content.questions.find(q=>q.type==='short-answer')!;
const caseItem=content.cases[0],diagram=content.diagrams[0];
const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));
describe('expanded course bank',()=>{
  it('has 80 single-answer and 20 select-all items covering every blueprint row',()=>{
    expect(content.questions.filter(q=>q.type==='multiple-choice')).toHaveLength(80);
    expect(content.questions.filter(q=>q.type==='multiple-answer')).toHaveLength(20);
    for(const count of [2,3])expect(content.questions.filter(q=>q.type==='multiple-answer'&&q.correctChoiceIds.length===count)).toHaveLength(10);
    for(const row of content.subtopics)expect(content.questions.filter(isChoice).some(q=>q.subtopicId===row.id)).toBe(true);
    const authored=content.questions.filter(q=>q.id.startsWith('mcq-expanded-')&&q.type==='multiple-choice');
    for(let position=0;position<4;position++)expect(authored.filter(q=>'answer' in q&&q.answer===position).length).toBeGreaterThanOrEqual(15);
    expect(new Set(content.questions.map(q=>q.prompt.toLowerCase())).size).toBe(content.questions.length);
  });
  it('rejects duplicate or unknown select-all keys',()=>{
    const bad=clone(content),q=bad.questions.find(q=>q.type==='multiple-answer')!;
    if(q.type==='multiple-answer')q.correctChoiceIds=['a','a'];expect(()=>validateContent(bad)).toThrow();
    if(q.type==='multiple-answer')q.correctChoiceIds=['a','unknown'];expect(()=>validateContent(bad)).toThrow();
  });
  it('uses exact-set scoring without answer-order or select-everything credit',()=>{
    if(!isChoice(multi))throw Error();const right=correctIds(multi);
    expect(scoreChoice(multi,[...right].reverse())).toBe(1);
    expect(scoreChoice(multi,right.slice(0,1))).toBe(0);
    expect(scoreChoice(multi,multi.choiceIds)).toBe(0);
    expect(scoreChoice(multi,[...right,right[0]])).toBe(0);
    expect(scoreChoice(single,'')).toBe(0);
  });
});
describe('saved session workflow',()=>{
  it('keeps the exact queue, snapshot versions, index, draft and unset confidence on reload',()=>{
    let s=newStudySession('multiple-choice',practiceQueue(content.questions.filter(isChoice),20));
    expect(s.items).toHaveLength(20);expect(s.items[4]).toEqual(multi);
    s=updateSessionDraft(s,s.items[0].id,{response:['b'],confidence:null});s={...s,index:4};
    const loaded=parseStore(JSON.stringify({...emptyStore(),studySessions:[s]})).studySessions[0];expect(loaded).toEqual(s);
    const original=content.questions[0].prompt;if('prompt' in s.items[0])s.items[0].prompt='Frozen snapshot';expect(content.questions[0].prompt).toBe(original);
    const item=parseStore(JSON.stringify({...emptyStore(),studySessions:[s]})).studySessions[0].items[0];expect('prompt' in item?item.prompt:'').toBe('Frozen snapshot');
  });
  it('requires confidence and a valid complete answer; freezes confidence after submission',()=>{
    const s=newStudySession('multiple-choice',[single]);
    expect(()=>submitSessionItem(s,single.id,correctIds(single),null as unknown as Confidence)).toThrow('explicit confidence');
    expect(()=>submitSessionItem(s,single.id,[],'High')).toThrow();
    expect(()=>submitSessionItem(s,single.id,['unknown'],'High')).toThrow();
    const done=submitSessionItem(s,single.id,correctIds(single),'Low');
    expect(done.submissions[single.id].confidence).toBe('Low');
    expect(()=>updateSessionDraft(done,single.id,{confidence:'High'})).toThrow('locked');
    expect(()=>updateSessionDraft(done,single.id,{response:['b']})).toThrow('locked');
    expect(submitSessionItem(done,single.id,['b'],'High')).toBe(done);
  });
  it('records each attempt once and ignores a stale advance callback',()=>{
    const s=newStudySession('multiple-choice',[single,multi]);
    const done=submitSessionItem(s,single.id,correctIds(single),'High'),next=advanceSession(done,single.id);
    expect(sessionAttempts(done)).toHaveLength(1);expect(sessionAttempts(next)[0].id).toBe(sessionAttempts(done)[0].id);
    expect(next.index).toBe(1);expect(advanceSession(next,single.id)).toBe(next);
    const finished=advanceSession(submitSessionItem(next,multi.id,correctIds(multi),'Medium'),multi.id);
    expect(finished.status).toBe('completed');expect(sessionStats(finished).percent).toBe(100);
  });
  it('keeps written evaluations pending and counts a multi-topic case once in session accuracy',()=>{
    let s=newStudySession('mock',[single,written,caseItem]);
    s=submitSessionItem(s,single.id,correctIds(single),'High');s=submitSessionItem(s,written.id,'Written response','Low');s=submitSessionItem(s,caseItem.id,'Case response','Medium');
    expect(sessionStats(s).percent).toBeNull();expect(sessionAttempts(s)).toEqual([]);
    expect(()=>selfScoreSessionItem(s,written.id,3)).toThrow('hidden');s=finishSession(s);
    expect(sessionStats(s)).toMatchObject({submitted:3,scored:1,pending:2,percent:100});
    s=selfScoreSessionItem(s,written.id,0);s=selfScoreSessionItem(s,caseItem.id,3);
    expect(sessionStats(s)).toMatchObject({scored:3,pending:0,correct:2});expect(sessionStats(s).percent).toBeCloseTo(200/3);
    expect(sessionAttempts(s).length).toBe(2+caseItem.topicIds.length);
    expect(selfScoreSessionItem(s,caseItem.id,0)).toBe(s);
  });
  it('retains a written draft, case parts and checklist until scoring',()=>{
    let s=newStudySession('case',[caseItem]);const parts=caseItem.prompts.map((p,i)=>p+' answer '+i);
    s=updateSessionDraft(s,caseItem.id,{parts,confidence:'Medium'});
    s=parseStore(JSON.stringify({...emptyStore(),studySessions:[s]})).studySessions[0];expect(s.drafts[caseItem.id].parts).toEqual(parts);
    s=submitSessionItem(s,caseItem.id,parts.join('\n'),'Medium');expect(()=>finishSession(s)).toThrow('Complete all');
    s=updateSessionDraft(s,caseItem.id,{checked:[caseItem.rubric[0]],selfScore:2});s=selfScoreSessionItem(s,caseItem.id,2);
    expect(sessionStats(s).percent).toBeCloseTo(200/3);expect(finishSession(s).status).toBe('completed');
  });
  it('preserves diagram draft positions and captures graphs without early feedback',()=>{
    const graph=exampleGraph(diagram);let s=newStudySession('mock',[diagram]);
    graph.nodes[0].x=420;s=updateSessionDraft(s,diagram.id,{response:graph,confidence:'High'});
    expect(parseStore(JSON.stringify({...emptyStore(),studySessions:[s]})).studySessions[0]).toEqual(s);
    s=submitSessionItem(s,diagram.id,graph,'High');expect(s.submissions[diagram.id].score).toBeNull();expect(advanceSession(s,diagram.id)).toBe(s);
    s=finishSession(s);expect(s.submissions[diagram.id].score).toBe(1);expect(sessionAttempts(s)).toHaveLength(1);
  });
  it('rejects a malformed session queue or premature mock score',()=>{
    const s=newStudySession('multiple-choice',[single]);s.index=1;expect(()=>parseStore(JSON.stringify({...emptyStore(),studySessions:[s]}))).toThrow('queue');
    const mock=submitSessionItem(newStudySession('mock',[single]),single.id,correctIds(single),'High');mock.submissions[single.id].score=1;
    expect(()=>parseStore(JSON.stringify({...emptyStore(),studySessions:[mock]}))).toThrow('exposed');
  });
});
describe('existing data migration and recovery',()=>{
  const memory=()=>{const m=new Map<string,string>();return {getItem:(k:string)=>m.get(k)??null,setItem:(k:string,v:string)=>{m.set(k,v);},removeItem:(k:string)=>{m.delete(k);}};};
  it('keeps the original v1 backup and all existing progress when first saving v2',()=>{
    const adapter=memory(),legacy={version:1,attempts:[],diagrams:[],sessions:[]};const raw=JSON.stringify(legacy);adapter.setItem(STORAGE_KEY,raw);
    const next=loadStore(adapter);next.studySessions=[newStudySession('multiple-choice',[single])];saveStore(adapter,next);
    expect(adapter.getItem(LEGACY_BACKUP_KEY)).toBe(raw);expect(loadStore(adapter)).toEqual(next);
    saveStore(adapter,next);expect(adapter.getItem(LEGACY_BACKUP_KEY)).toBe(raw);
  });
  it('allows a validated import to recover corrupt storage',()=>{const adapter=memory();adapter.setItem(STORAGE_KEY,'corrupt');saveStore(adapter,emptyStore());expect(loadStore(adapter)).toEqual(emptyStore());});
});
