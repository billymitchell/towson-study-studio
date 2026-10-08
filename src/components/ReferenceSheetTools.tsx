'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useProgress } from './ProgressProvider';
import { Sources } from './Shared';
import { loadSheetFont, measureReferenceSheet, ReferenceDraftSchema, revisedSheet, type ReferenceNote, type ReferenceSheet } from '@/lib/referenceSheet';
import { learningResponses } from '@/lib/learningHistory';
import { referenceSuggestions, type ReferenceSuggestion } from '@/lib/referenceSuggestions';

export function useReferenceCapacity(sheet:Pick<ReferenceSheet,'title'|'notes'>){
  const [ready,setReady]=useState(false),[error,setError]=useState(''),[retry,setRetry]=useState(0),[capacity,setCapacity]=useState<ReturnType<typeof measureReferenceSheet>|null>(null);
  useEffect(()=>{let active=true;setReady(false);setError('');loadSheetFont().then(()=>{if(active)setReady(true);}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Could not load the sheet font.');});return()=>{active=false;};},[retry]);
  useEffect(()=>{if(!ready)return;try{setCapacity(measureReferenceSheet(sheet));}catch(e){setError(e instanceof Error?e.message:'Capacity could not be checked.');}},[ready,sheet.title,sheet.notes]);
  return {ready,error,capacity,retry:useCallback(()=>setRetry(n=>n+1),[])};
}
export function ReferencePage({sheet}:{sheet:Pick<ReferenceSheet,'title'|'notes'>}){
  return <div className="reference-page"><div className="reference-content">{sheet.title.trim()&&<div className="reference-block reference-heading">{sheet.title}</div>}{sheet.notes.map(note=><div className={`reference-block reference-${note.kind}`} key={note.id}>{note.kind==='bullet'?'• '+note.text:note.text}</div>)}</div></div>;
}
export function NoteComposer({suggestion,title,onClose,onCandidate,persistDraft=false}:{suggestion?:ReferenceSuggestion;title?:string;onClose?:()=>void;onCandidate?:(sheet:ReferenceSheet|null)=>void;persistDraft?:boolean}){
  const progress=useProgress(),sheet=progress.data.referenceSheet;
  const initial=persistDraft?sheet.draft:ReferenceDraftSchema.parse({text:suggestion?.existingNote?.text??suggestion?.text??'',kind:suggestion?.existingNote?.kind??'text',noteId:suggestion?.existingNote?.id??null,suggestionKey:suggestion?.conceptKey??null});
  const [text,setText]=useState(initial.text),[kind,setKind]=useState(initial.kind),[message,setMessage]=useState('');
  const old=sheet.notes.find(n=>n.id===initial.noteId||(suggestion&&n.conceptKey===suggestion.conceptKey));
  const candidate=useMemo(()=>{
    const proposed:ReferenceNote={id:old?.id??'proposed-note',kind,text,origin:suggestion?(text===suggestion.text?'authored':'edited'):old?.origin==='authored'||old?.origin==='edited'?'edited':'personal',topicIds:[...new Set([...(old?.topicIds??[]),...(suggestion?.topicIds??[])])],sourceIds:[...new Set([...(old?.sourceIds??[]),...(suggestion?.sourceIds??[])])],responseIds:[...new Set([...(old?.responseIds??[]),...(suggestion?.responseIds??[])])],updatedAt:old?.updatedAt??'2000-01-01T00:00:00.000Z',...(old?.conceptKey?{conceptKey:old.conceptKey}:{}),...(suggestion?{conceptKey:suggestion.conceptKey,itemId:suggestion.itemId,...(suggestion.itemVersion?{itemVersion:suggestion.itemVersion}:{})}:old?.itemId?{itemId:old.itemId,...(old.itemVersion?{itemVersion:old.itemVersion}:{})}:{})};
    return {...sheet,title:title??sheet.title,notes:!text.trim()?sheet.notes:old?sheet.notes.map(n=>n.id===old.id?proposed:n):[...sheet.notes,proposed]};
  },[sheet,title,text,kind,old,suggestion]);
  const {ready,error,capacity,retry}=useReferenceCapacity(candidate);
  useEffect(()=>{onCandidate?.(text.trim()?candidate:null);},[candidate,onCandidate,text]);
  function updateDraft(patch:Partial<typeof initial>){if(persistDraft)progress.referenceDraft(patch);}
  function save(){
    if(!text.trim()||!ready)return;
    const now=new Date().toISOString(),notes=candidate.notes.map(n=>n.id===(old?.id??'proposed-note')?{...n,id:old?.id??crypto.randomUUID(),updatedAt:now}:n);
    const next=revisedSheet(sheet,{title:candidate.title,notes,...(persistDraft?{draft:ReferenceDraftSchema.parse({})}:{})});
    const decisions=suggestion?.responseIds.map(responseId=>({responseId,conceptKey:suggestion.conceptKey,decision:'added' as const,updatedAt:now}))??[];
    if(progress.saveReferenceSheet(next,decisions)){setText('');setKind('text');setMessage(old?'Reference note updated.':'Reference note added.');onCandidate?.(null);onClose?.();}
    else setMessage(capacity&&!capacity.fit?'The proposed note exceeds the page. Shorten it or remove another note. Your text is preserved.':'The note was not saved. Your proposed text is preserved; check the save message.');
  }
  return <form className="reference-composer" onSubmit={e=>{e.preventDefault();save();}}>
    <label>Note style<select value={kind} onChange={e=>{const value=e.target.value as typeof kind;setKind(value);updateDraft({kind:value});}}><option value="text">Text note</option><option value="heading">Heading</option><option value="bullet">Bullet</option></select></label>
    <label>{suggestion?'Suggested note text':'Reference note text'}<textarea rows={5} value={text} onChange={e=>{setText(e.target.value);setMessage('');updateDraft({text:e.target.value});}} placeholder="Write a concise reminder in your own words…" required/></label>
    <p role="status" className="reference-capacity">{error?error:!ready?'Loading the fixed print font…':capacity?`${Math.round(capacity.usedPercent)}% of the page used with this change · ${capacity.fit?'fits on one page':'exceeds one page; shorten before saving'}`:''}</p>
    {error&&<button className="button secondary" type="button" onClick={retry}>Retry font loading</button>}
    <div className="button-row"><button className="button primary" type="submit" disabled={!text.trim()||!ready||!progress.ready||!!progress.error}>{old?'Save note changes':suggestion?'Add suggestion to sheet':'Add note to sheet'}</button>{(old||onClose)&&<button className="button secondary" type="button" onClick={()=>{if(persistDraft)progress.referenceDraft(ReferenceDraftSchema.parse({}));onClose?.();}}>Cancel note edit</button>}</div>
    <p role="status">{message}</p>
  </form>;
}
export function SuggestionCard({suggestion,onOpen,headingLevel=4}:{suggestion:ReferenceSuggestion;onOpen?:()=>void;headingLevel?:3|4}){
  const progress=useProgress(),[editing,setEditing]=useState(false),Heading=headingLevel===3?'h3':'h4';
  return <div className="reference-suggestion"><Heading>{suggestion.existingNote?'Review your existing reference note':'Suggested reference note'}</Heading><p>{suggestion.text}</p><small>{suggestion.misses} saved {suggestion.misses===1?'score':'scores'} below ⅔{suggestion.highConfidence?' · includes a high-confidence mistake':''}. {suggestion.existingNote?'This concept is already on your sheet. Review or update it instead of adding a duplicate.':'Choose whether this reminder deserves space on your sheet.'}</small>
    {editing?<NoteComposer suggestion={suggestion} onClose={()=>setEditing(false)}/>:<div className="button-row"><button className="button secondary" onClick={()=>{onOpen?.();setEditing(true);}}>{suggestion.existingNote?'Review and update note':'Edit and add'}</button><button className="button secondary" onClick={()=>{onOpen?.();progress.dismissSuggestion(suggestion);}}>Dismiss suggestion</button><Link className="text-link" href="/cheat-sheet" onClick={onOpen}>Open cheat sheet →</Link></div>}
    <Sources ids={suggestion.sourceIds} provenance="SOURCE_DERIVED"/>
  </div>;
}
export function ReferenceSuggestionPanel({itemId,sessionId,onOpen}:{itemId:string;sessionId?:string;onOpen?:()=>void}){
  const {data}=useProgress(),responses=learningResponses(data),response=[...responses].reverse().find(r=>r.itemId===itemId&&(!sessionId||r.sessionId===sessionId));
  if(!response||response.score===null)return null;
  const suggestion=referenceSuggestions(data).find(s=>s.responseIds.includes(response.id));
  return suggestion?<SuggestionCard suggestion={suggestion} onOpen={onOpen}/>:null;
}
