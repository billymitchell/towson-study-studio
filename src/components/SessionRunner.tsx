'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import type { Graph, StudySession } from '@/content/types';
import { sessionStats } from '@/lib/studySession';
import { useProgress } from './ProgressProvider';
import { PracticeCard } from './PracticeCard';
import { SessionHeader } from './SessionHeader';
import { AutoAdvance } from './AutoAdvance';
const DiagramEditor=dynamic(()=>import('./DiagramEditor').then(m=>m.DiagramEditor),{ssr:false,loading:()=> <p role="status">Loading diagram workspace…</p>});
export function SessionRunner({session}:{session:StudySession}){
  const {navigate,pauseAdvance,finish,error}=useProgress();const stats=sessionStats(session),item=session.items[session.index];
  const prompt=useRef<HTMLDivElement>(null),previousIndex=useRef(session.index);
  useEffect(()=>{if(previousIndex.current!==session.index){previousIndex.current=session.index;prompt.current?.querySelector<HTMLElement>('.question-heading')?.focus();}},[session.index]);
  function move(index:number){pauseAdvance(session.id,item.id);navigate(session.id,index);}
  return <><SessionHeader session={session}/>{session.status==='completed'?<>
    <section className="panel session-complete" aria-live="polite"><h2>{session.mode==='mock'?'Mock complete · review your work':'Study session complete'}</h2><p>All {stats.total} responses are saved. {stats.pending?'Record the remaining written self-check scores below.':'Review your responses and explanations below.'}</p></section>
    {session.items.map(i=><details className="session-review" key={i.id} open={session.mode==='mock'&&'type' in i&&i.type==='short-answer'}><summary>{'title' in i?i.title:i.prompt}</summary>{'diagramType' in i?<DiagramEditor exercise={i} reviewGraph={session.submissions[i.id].response as Graph} sessionId={session.id}/>:<PracticeCard item={i} session={session}/>}</details>)}
  </>:<>
    <div className="practice-nav"><span>Fixed session queue · submissions and drafts survive reloads</span><div className="button-row"><button className="button secondary" disabled={session.index===0||!!error} onClick={()=>move(session.index-1)}>Previous</button><button className="button secondary" disabled={session.index===session.items.length-1||!!error} onClick={()=>move(session.index+1)}>Next item →</button></div></div>
    <div ref={prompt}>{'diagramType' in item?<DiagramEditor key={item.id} exercise={item} studySession={session}/>:<PracticeCard key={item.id} item={item} session={session}/>}</div>
    <AutoAdvance key={item.id} session={session}/>
    <div className="exam-actions"><p>{stats.submitted}/{stats.total} responses saved{session.mode!=='mock'&&stats.pending?' · finish the pending self-check scores':''}.</p><button className="button warm" disabled={!stats.complete||(session.mode!=='mock'&&stats.scored!==stats.total)||!!error} onClick={()=>finish(session.id)}>{session.mode==='mock'?'Finish mock and reveal review':'Finish study session'}</button></div>
  </>}</>;
}
