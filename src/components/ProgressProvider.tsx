'use client';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { emptyStore, loadStore, parseStore, saveStore, STORAGE_KEY, LEGACY_BACKUP_KEY, type Store } from '@/lib/storage';
import type { Answer, Attempt, Confidence, SavedDiagram, SessionDraft, SessionSettings, StudySession } from '@/content/types';
import { advanceSession, finishSession, selfScoreSessionItem, sessionAttempts, submitSessionItem, updateSessionDraft } from '@/lib/studySession';
type Progress = {
  data:Store;ready:boolean;error:string;notice:string;
  record:(attempts:Omit<Attempt,'id'|'completedAt'>[])=>boolean;
  saveDiagram:(diagram:SavedDiagram)=>boolean;
  startSession:(session:StudySession)=>boolean;
  draft:(sessionId:string,itemId:string,patch:Partial<SessionDraft>)=>boolean;
  submit:(sessionId:string,itemId:string,response:Answer,confidence:Confidence)=>boolean;
  selfScore:(sessionId:string,itemId:string,score:number)=>boolean;
  advance:(sessionId:string,itemId:string)=>boolean;
  navigate:(sessionId:string,index:number)=>boolean;
  finish:(sessionId:string)=>boolean;
  pauseAdvance:(sessionId:string,itemId:string)=>boolean;
  settings:(sessionId:string,patch:Partial<SessionSettings>)=>boolean;
  clear:()=>void;exportData:(raw?:boolean)=>void;importData:(raw:string)=>void;
};
const Context=createContext<Progress|null>(null);
export function ProgressProvider({children}:{children:ReactNode}) {
  const [data,setData]=useState<Store>(emptyStore),[ready,setReady]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
  useEffect(()=>{
    const load=()=>{try{setData(loadStore(localStorage));setError('');}catch{setError('Your saved data could not be read. Writing is paused to preserve it. Export the raw backup, import a valid backup, or intentionally reset in Progress.');}setReady(true);};
    load();const listen=(e:StorageEvent)=>{if(e.key===STORAGE_KEY)load();};window.addEventListener('storage',listen);return()=>window.removeEventListener('storage',listen);
  },[]);
  const mutate=useCallback((update:(store:Store)=>Store)=>{
    if(!ready||error)return false;
    try{const next=update(loadStore(localStorage));saveStore(localStorage,next);setData(next);setNotice('Saved on this browser.');return true;}catch{setError('Your work could not be saved. Existing data is preserved. Export a backup and check browser storage before resetting or importing.');return false;}
  },[ready,error]);
  const update=useCallback((id:string,operation:(session:StudySession)=>StudySession)=>mutate(s=>{
    const current=s.studySessions.find(x=>x.id===id);if(!current)throw new Error('Missing session');
    const result=operation(current);if(result===current)return s;
    const next={...result,revision:current.revision+1,updatedAt:new Date().toISOString()};
    const generated=sessionAttempts(next),attemptIds=new Set(s.attempts.map(a=>a.id));
    const sessions=next.mode==='mock'&&next.status==='completed'&&!s.sessions.some(x=>x.id===next.id)?[...s.sessions,{id:next.id,itemIds:next.items.map(i=>i.id),responses:Object.fromEntries(Object.entries(next.submissions).map(([id,v])=>[id,v.response])),confidence:Object.fromEntries(Object.entries(next.submissions).map(([id,v])=>[id,v.confidence])),completedAt:next.updatedAt}]:s.sessions;
    return {...s,studySessions:s.studySessions.map(x=>x.id===id?next:x),sessions,attempts:[...s.attempts,...generated.filter(a=>!attemptIds.has(a.id))]};
  }),[mutate]);
  const draft=useCallback((id:string,itemId:string,patch:Partial<SessionDraft>)=>update(id,s=>updateSessionDraft(s,itemId,patch)),[update]);
  const submit=useCallback((id:string,itemId:string,response:Answer,confidence:Confidence)=>update(id,s=>submitSessionItem(s,itemId,response,confidence)),[update]);
  const selfScore=useCallback((id:string,itemId:string,score:number)=>update(id,s=>selfScoreSessionItem(s,itemId,score)),[update]);
  const advance=useCallback((id:string,itemId:string)=>update(id,s=>advanceSession(s,itemId)),[update]);
  const pauseAdvance=useCallback((id:string,itemId:string)=>update(id,s=>s.pausedItemIds.includes(itemId)?s:{...s,pausedItemIds:[...s.pausedItemIds,itemId]}),[update]);
  function exportData(raw=false){try{const value=raw?(localStorage.getItem(STORAGE_KEY)||JSON.stringify(data)):JSON.stringify(data,null,2);const url=URL.createObjectURL(new Blob([value],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=raw?'study-progress-raw-backup.json':'study-progress.json';a.click();URL.revokeObjectURL(url);}catch{setNotice('The backup could not be exported. Check browser download permissions.');}}
  const value:Progress={data,ready,error,notice,draft,submit,selfScore,advance,pauseAdvance,
    record:attempts=>mutate(s=>({...s,attempts:[...s.attempts,...attempts.map(a=>({...a,id:crypto.randomUUID(),completedAt:new Date().toISOString()}))]})),
    saveDiagram:diagram=>mutate(s=>({...s,diagrams:[...s.diagrams.filter(d=>d.exerciseId!==diagram.exerciseId),diagram]})),
    startSession:session=>mutate(s=>s.studySessions.some(x=>x.id===session.id)?s:{...s,studySessions:[...s.studySessions,session]}),
    navigate:(id,index)=>update(id,s=>index<0||index>=s.items.length?s:{...s,index}),
    finish:id=>update(id,finishSession),settings:(id,patch)=>update(id,s=>({...s,settings:{...s.settings,...patch}})),
    clear:()=>{try{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LEGACY_BACKUP_KEY);setData(emptyStore());setError('');setNotice('Personal progress cleared.');}catch{setError('Browser storage is unavailable; reset failed.');}},exportData,
    importData:raw=>{try{const next=parseStore(raw);saveStore(localStorage,next);setData(next);setError('');setNotice('Backup imported.');}catch{setNotice('Import rejected: the backup is invalid, references unknown content, or uses an unsupported version. Existing data was preserved.');}}
  };
  return <Context.Provider value={value}>{error&&<div role="alert" className="storage-alert">{error} <a href="/progress">Open recovery controls</a></div>}{children}</Context.Provider>;
}
export function useProgress(){const value=useContext(Context);if(!value)throw new Error('Missing ProgressProvider');return value;}
