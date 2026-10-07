'use client';
import { useEffect, useRef, useState } from 'react';
import { content } from '@/lib/contentRepository';
import { missedIds, topicMastery } from '@/lib/mastery';
import { isChoice } from '@/lib/questions';
import { newStudySession, practiceQueue } from '@/lib/studySession';
import type { StudyItem, SessionSettings } from '@/content/types';
import { useProgress } from './ProgressProvider';
import { SessionRunner } from './SessionRunner';
import { PageHeading, Empty } from './Shared';
export function PracticeRunner({mode}:{mode:'multiple-choice'|'short-answer'|'case'}){
  const progress=useProgress();const {data,ready,error}=progress;
  const [selection,setSelection]=useState<SessionSettings>({topicId:'all',subtopicId:'all',filter:'mixed',style:'all',count:20,autoAdvance:true,target:70});
  const [sessionId,setSessionId]=useState(''),[initialized,setInitialized]=useState(false);const started=useRef(false);
  const missed=missedIds(data.attempts),weak=new Set(content.topics.filter(t=>topicMastery(t,data.attempts).status==='Weak'&&data.attempts.some(a=>a.topicId===t.id)).map(t=>t.id));
  const bank:StudyItem[]=mode==='case'?content.cases:content.questions.filter(q=>mode==='multiple-choice'?isChoice(q):q.type==='short-answer');
  const items=bank.filter(i=>{const topics='topicIds' in i?i.topicIds:[i.topicId];return (selection.topicId==='all'||topics.includes(selection.topicId))&&(selection.subtopicId==='all'||!('subtopicId' in i)||i.subtopicId===selection.subtopicId)&&(selection.filter==='mixed'||selection.filter==='missed'&&missed.has(i.id)||selection.filter==='weak'&&topics.some(t=>weak.has(t)))&&(selection.style==='all'||!isChoice(i)||(selection.style==='single'?i.type==='multiple-choice':i.type==='multiple-answer'));});
  useEffect(()=>{
    if(!ready||started.current)return;started.current=true;
    const p=new URLSearchParams(location.search),requested=p.get('session'),topic=p.get('topic')??'all',subtopic=p.get('subtopic')??'all';
    const saved=requested?data.studySessions.find(s=>s.id===requested&&s.mode===mode):[...data.studySessions].reverse().find(s=>s.mode===mode&&s.status==='active'&&(!p.has('topic')||s.settings.topicId===topic)&&(!p.has('subtopic')||s.settings.subtopicId===subtopic));
    if(saved){setSessionId(saved.id);setSelection(saved.settings);}
    else {setSelection(s=>({...s,topicId:content.topics.some(t=>t.id===topic)?topic:'all',subtopicId:content.subtopics.some(t=>t.id===subtopic)?subtopic:'all'}));}
    setInitialized(true);
  },[ready,data.studySessions,mode]);
  const autoStarted=useRef(false);
  useEffect(()=>{
    if(!initialized||sessionId||autoStarted.current||error||!items.length)return;
    autoStarted.current=true;const s=newStudySession(mode,practiceQueue(items,selection.count),selection);
    if(progress.startSession(s))setSessionId(s.id);
  },[initialized,sessionId,error,items,selection,mode,progress]);
  function start(){if(!items.length)return;const s=newStudySession(mode,practiceQueue(items,selection.count),selection);if(progress.startSession(s))setSessionId(s.id);}
  const session=data.studySessions.find(s=>s.id===sessionId),title=mode==='case'?'Reason through a real scenario.':mode==='multiple-choice'?'Make recall a habit.':'Explain it in your own words.';
  return <><PageHeading eyebrow="PRACTICE WITH PURPOSE" title={title} description="Your fixed question queue, drafts, confidence, and submissions are saved on this browser."/>
    <details className="session-config" open={!session||session.status==='completed'}><summary>Configure a new study session</summary><div className="filters">
      <label>Chapter<select value={selection.topicId} onChange={e=>setSelection({...selection,topicId:e.target.value,subtopicId:'all'})}><option value="all">All chapters</option>{content.topics.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></label>
      <label>Queue<select value={selection.filter} onChange={e=>setSelection({...selection,filter:e.target.value as SessionSettings['filter']})}><option value="mixed">Mixed practice</option><option value="weak">Weak areas</option><option value="missed">Missed questions</option></select></label>
      {mode==='multiple-choice'&&<label>Question style<select value={selection.style} onChange={e=>setSelection({...selection,style:e.target.value as SessionSettings['style']})}><option value="all">Single answer + select all</option><option value="single">Single answer</option><option value="multiple">Select all that apply</option></select></label>}
      <label>Session length<select value={selection.count} onChange={e=>setSelection({...selection,count:Number(e.target.value)})}>{[1,5,10,20,50,100].map(n=><option key={n} value={n}>{n===100?'All available (up to 100)':n+' questions'}</option>)}</select></label>
      {selection.subtopicId!=='all'&&<button className="button secondary" onClick={()=>setSelection({...selection,subtopicId:'all'})}>Clear subtopic filter</button>}
    </div><p>{items.length} matching items · next session: {Math.min(items.length,selection.count)} questions. Changing these settings leaves your current queue intact.</p><button className="button primary" disabled={!initialized||!!error||!items.length} onClick={start}>Start new study session</button></details>
    {!initialized?<p role="status">Loading saved session…</p>:session?<SessionRunner session={session}/>:<Empty text={error?'Open Progress to recover your saved data.':selection.filter==='mixed'?'No questions match these settings.': 'No questions match this review queue. Try mixed practice or another chapter.'}/>}
  </>;
}
