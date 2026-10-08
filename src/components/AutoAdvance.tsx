'use client';
import { useEffect, useState } from 'react';
import type { StudySession } from '@/content/types';
import { useProgress } from './ProgressProvider';
import { referenceSuggestions } from '@/lib/referenceSuggestions';
export function AutoAdvance({session}:{session:StudySession}){
  const {advance,pauseAdvance,error,data}=useProgress(),item=session.items[session.index],sub=session.submissions[item.id];
  const ready=!!sub&&(session.mode==='mock'?session.index<session.items.length-1:sub.score!==null);
  const suggestionPending=session.mode!=='mock'&&referenceSuggestions(data).some(s=>s.responseIds.includes(`${session.id}:${item.id}`));
  const active=!suggestionPending&&ready&&session.status==='active'&&session.settings.autoAdvance&&(session.mode!=='mock'||session.settings.mockAdvance==='countdown')&&!session.pausedItemIds.includes(item.id)&&!error;
  const [seconds,setSeconds]=useState(3);
  useEffect(()=>{setSeconds(3);},[item.id,ready,active]);
  useEffect(()=>{
    if(!active)return;
    if(document.hidden){pauseAdvance(session.id,item.id);return;}
    const visibility=()=>{if(document.hidden)pauseAdvance(session.id,item.id);};document.addEventListener('visibilitychange',visibility);
    const timer=window.setInterval(()=>setSeconds(n=>Math.max(0,n-1)),1000);
    return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',visibility);};
  },[active,item.id,session.id,pauseAdvance]);
  useEffect(()=>{if(active&&seconds===0)advance(session.id,item.id);},[active,seconds,advance,session.id,item.id]);
  if(!ready||session.status!=='active')return null;
  return <div className="auto-advance"><p role="status">{active?'Recorded. Continuing in '+seconds+' seconds…':suggestionPending?'Recorded. A suggested note is ready. Review it or choose Next now.':'Recorded. Stay and review, or continue when ready.'}</p><div className="button-row"><button className="button secondary" disabled={!!error} onClick={()=>pauseAdvance(session.id,item.id)}>Stay and review</button><button className="button primary" disabled={!!error} onClick={()=>advance(session.id,item.id)}>Next now →</button></div></div>;
}
