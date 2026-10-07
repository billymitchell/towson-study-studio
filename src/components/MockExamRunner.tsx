'use client';
import { useEffect, useRef, useState } from 'react';
import { createMockItems, type MockMix } from '@/lib/mockExam';
import { newStudySession } from '@/lib/studySession';
import { useProgress } from './ProgressProvider';
import { PageHeading } from './Shared';
import { SessionRunner } from './SessionRunner';
export function MockExamRunner(){
  const [mix,setMix]=useState<MockMix>({mcq:16,shortAnswer:2,cases:1,diagrams:1}),[sessionId,setSessionId]=useState('');
  const progress=useProgress(),{data,ready,error}=progress,initialized=useRef(false);
  useEffect(()=>{if(!ready||initialized.current)return;initialized.current=true;const id=new URLSearchParams(location.search).get('session');const saved=id?data.studySessions.find(s=>s.id===id&&s.mode==='mock'):[...data.studySessions].reverse().find(s=>s.mode==='mock'&&s.status==='active');if(saved)setSessionId(saved.id);},[ready,data.studySessions]);
  const session=data.studySessions.find(s=>s.id===sessionId);
  function start(){const items=createMockItems(mix),s=newStudySession('mock',items,{count:items.length});if(progress.startSession(s))setSessionId(s.id);}
  return <><PageHeading eyebrow="PUT THE PIECES TOGETHER" title="Your mock midterm." description="A saved practice mix of recall, written reasoning, cases, and diagrams. Solutions stay hidden until final submission."/><div className="note">These counts and equal normalized item scores are app settings, not professor-provided exam weights. There is no inferred exam time limit. Written work uses your 0–3 self-check score.</div>
    {!session?<section className="panel"><h2>Choose your practice mix</h2><div className="filters">{([['mcq','Multiple choice',80],['shortAnswer','Short answer',6],['cases','Cases',3],['diagrams','Diagrams',2]] as const).map(([key,label,max])=><label key={key}>{label}<select value={mix[key]} onChange={e=>setMix({...mix,[key]:Number(e.target.value)})}>{Array.from({length:max},(_,i)=><option key={i} value={i+1}>{i+1}</option>)}</select></label>)}</div><p>{Object.values(mix).reduce((s,n)=>s+n,0)} items · question order and drafts survive reloads</p><button className="button primary" onClick={start} disabled={!ready||!!error}>Start mock midterm →</button></section>:<><SessionRunner session={session}/>{session.status==='completed'&&<button className="button secondary" onClick={()=>setSessionId('')}>Configure another mock</button>}</>}
  </>;
}
