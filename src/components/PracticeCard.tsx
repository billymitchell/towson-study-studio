'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Answer, Confidence, Item, SessionDraft, StudySession } from '@/content/types';
import { content } from '@/lib/contentRepository';
import { isChoice, selectedIds, correctIds, scoreChoice, choiceScoreExplanation } from '@/lib/questions';
import { emptyDraft } from '@/lib/studySession';
import { exampleGraph } from '@/lib/diagramGrader';
import { useProgress } from './ProgressProvider';
import { Sources } from './Shared';
import { GraphPreview } from './GraphPreview';
import { FurtherReading } from './FurtherReading';
import { HelpTip } from './HelpTip';
import { ConfidenceInput } from './ConfidenceInput';
import { ReferenceSuggestionPanel } from './ReferenceSheetTools';
export type WrittenResponse=Answer;
type Props={item:Item;session?:StudySession;reviewResponse?:Answer;reviewConfidence?:Confidence;sessionId?:string};
export function PracticeCard({item,session,reviewResponse,reviewConfidence,sessionId}:Props){
  const progress=useProgress();
  const isCase='scenario' in item,isMCQ=isChoice(item),multiple=isMCQ&&item.type==='multiple-answer';
  const previous=sessionId?progress.data.attempts.find(a=>a.itemId===item.id&&a.sessionId===sessionId):undefined;
  const [legacyDraft,setLegacyDraft]=useState<SessionDraft>({...emptyDraft(),response:reviewResponse??'',confidence:reviewConfidence??null,selfScore:previous?Math.round(previous.score*3):null});
  const [legacySaved,setLegacySaved]=useState(!!previous),[status,setStatus]=useState('');
  const entry=session?.drafts[item.id]??legacyDraft,submission=session?.submissions[item.id];
  const submitted=!!submission||reviewResponse!==undefined;
  const response=submission?.response??reviewResponse??entry.response;
  const confidence=submission?.confidence??entry.confidence;
  const parts=entry.parts.length?entry.parts:isCase?item.prompts.map(()=> ''):[];
  const policy=session?.settings.scoringPolicy??previous?.scoringPolicy??'exact';
  const score=submission?submission.score:(previous?.score??(isMCQ&&submitted?scoreChoice(item,response,policy):null));
  const saved=submission?submission.score!==null:legacySaved;
  const hidden=session?.mode==='mock'&&session.status!=='completed';
  const rubric='rubric' in item?item.rubric:[];
  const model=isCase?item.modelSolution:!isMCQ&&item.type==='short-answer'?item.modelAnswer:'';
  const selected=isMCQ?selectedIds(item,response):[];
  const answerReady=isMCQ?selected.length>0:isCase?parts.every(p=>p.trim()):typeof response==='string'&&!!response.trim();
  function draft(patch:Partial<SessionDraft>){if(session)progress.draft(session.id,item.id,patch);else setLegacyDraft(d=>({...d,...patch}));}
  function submit(){
    if(!session||!confidence||!answerReady)return;
    const answer=isCase?item.prompts.map((p,i)=>p+'\n'+parts[i]).join('\n\n'):response;
    if(progress.submit(session.id,item.id,answer,confidence))setStatus(isMCQ&&!hidden?'Attempt recorded.':'Response saved.');
  }
  function saveSelfScore(){
    if(entry.selfScore===null||!confidence)return;
    const ok=session?progress.selfScore(session.id,item.id,entry.selfScore):progress.record((isCase?item.topicIds:[item.topicId]).map(topicId=>({itemId:item.id,topicId,itemType:isCase?'case':'short-answer',response,score:entry.selfScore!/3,confidence,sourceIds:item.sourceIds,...(sessionId?{sessionId}:{})})));
    if(ok){setLegacySaved(true);setStatus('Attempt recorded.');}
  }
  const diagram=isCase&&item.diagramExerciseId?content.diagrams.find(d=>d.id===item.diagramExerciseId):undefined;
  const pauseReview=()=>{if(session&&session.status==='active'&&saved&&!hidden)progress.pauseAdvance(session.id,item.id);};
  return <article className="practice-card" onFocusCapture={pauseReview} onMouseOver={e=>{if((e.target as HTMLElement).closest('.help-trigger')&&session&&!session.pausedItemIds.includes(item.id))pauseReview();}}>
    <div className="card-top"><span className="eyebrow">{isCase?'CASE STUDY':multiple?'SELECT ALL THAT APPLY':isMCQ?'MULTIPLE-CHOICE QUESTION (MCQ)':'SHORT ANSWER'}</span><span className="badge">{item.difficulty} · app-authored</span></div>
    <h2 tabIndex={-1} className="question-heading">{isCase?item.title:item.prompt}</h2>
    {isCase&&<p className="scenario">{item.scenario}</p>}
    {!submitted&&<form onSubmit={e=>{e.preventDefault();submit();}}>
      {isMCQ?<fieldset className="choice-list"><legend>{multiple?(policy==='partial'?'Select all that apply. Correct selections earn points; incorrect selections deduct points.':'Select all that apply. An exact match is required; there is no partial credit.'):'Choose one answer.'} <HelpTip label="Question scoring">{policy==='partial'?(multiple?'Points = correct selections divided by all correct options, minus incorrect selections divided by all incorrect options, bounded at 0–100%. Selecting every option earns zero.':'The correct answer earns full credit. Only choices with an authored explanation of partial understanding earn fractional credit; other choices earn zero.'):'Exact scoring awards full credit for the complete correct answer and zero otherwise.'} Your answer and pre-answer confidence lock when submitted.</HelpTip></legend>
        {item.choices.map((choice,i)=><label className={selected.includes(item.choiceIds[i])?'choice selected':'choice'} key={item.choiceIds[i]}>
          <input type={multiple?'checkbox':'radio'} name={item.id} value={item.choiceIds[i]} checked={selected.includes(item.choiceIds[i])} onChange={e=>draft({response:multiple?(e.target.checked?[...selected,item.choiceIds[i]]:selected.filter(id=>id!==item.choiceIds[i])):[item.choiceIds[i]]})}/>
          <span className="choice-letter">{'ABCD'[i]}</span>{choice}
        </label>)}
      </fieldset>:isCase?<div className="case-fields">{item.prompts.map((prompt,i)=><label key={prompt}>{i+1}. {prompt}<textarea rows={4} value={parts[i]} required onChange={e=>draft({parts:parts.map((p,n)=>n===i?e.target.value:p)})}/></label>)}</div>:<label>Your response<textarea rows={7} value={typeof response==='string'?response:''} onChange={e=>draft({response:e.target.value})} placeholder="Explain it in your own words…" required/></label>}
      <div className="submit-row"><ConfidenceInput value={confidence} onChange={value=>draft({confidence:value})}/><button className="button primary" disabled={!answerReady||!confidence||!progress.ready||!!progress.error||!session} type="submit">{hidden?'Save exam response':'Submit answer'} →</button></div>
    </form>}
    {submitted&&hidden&&<p role="status" className="note">Response saved. Correctness and explanations stay hidden until final mock submission.</p>}
    {submitted&&!hidden&&<div className={'feedback '+(isMCQ?(score===1?'feedback-correct':score!==null&&score>0?'feedback-partial':'feedback-incorrect'):'')} aria-live="polite">
      <h3>{isMCQ?(score===1?'✓ Correct':score!==null&&score>0?`◐ Partially correct — ${Math.round(score*100)}% credit`:'✕ Incorrect — review this one'):'Compare and self-assess'}</h3>
      <div className="response-review"><strong>Your response</strong><p>{isMCQ?item.choices.filter((_,i)=>selected.includes(item.choiceIds[i])).join(' · '):String(response)}</p><small>Pre-answer confidence: {confidence??'Not recorded in this legacy attempt'}</small></div>
      {isMCQ?<>
        <p className="definition">{item.explanation}</p>
        <p className="score-explanation">{Math.round((score??0)*100)}% earned points · {policy==='partial'?'Partial credit':'Exact scoring'} (policy v1). {choiceScoreExplanation(item,response,policy)}</p>
        <ul className="distractor-list">{item.choices.map((c,i)=>{
          const correct=correctIds(item).includes(item.choiceIds[i]),chosen=selected.includes(item.choiceIds[i]);
          const credit=item.type==='multiple-choice'&&policy==='partial'?item.partialCredits?.[item.choiceIds[i]]:undefined;
          return <li key={item.choiceIds[i]} className={correct?'option-correct':credit?'option-partial':chosen?'option-incorrect':''}><strong>{'ABCD'[i]}. {c}</strong><span className="option-label">{correct?(chosen?'✓ Correct option · selected':'✓ Correct option · missed'):credit?(chosen?'◐ Partial-credit option · selected':'Partial-credit option · not selected'):chosen?'✕ Incorrect option · selected':'Incorrect option · not selected'}</span><p>{item.distractorExplanations[i]}</p>{credit&&<p>Partial-credit rationale ({Math.round(credit.score*100)}%): {credit.explanation}</p>}</li>;
        })}</ul>
      </>:<>
        <h4>Model response</h4><p>{model}</p><h4>Required concepts · self-check <HelpTip label="Written self-check">Check the concepts you explained accurately, then choose a separate 0–3 rubric score. Written scores are self-assessed and count toward accuracy only after recording.</HelpTip></h4><p>Check each concept you explained correctly. Unchecked items are gaps to revisit.</p>
        <div className="rubric-list">{rubric.map(r=><label key={r}><input type="checkbox" checked={entry.checked.includes(r)} onChange={e=>draft({checked:e.target.checked?[...entry.checked,r]:entry.checked.filter(x=>x!==r)})}/>{r}</label>)}</div>
        <p className="muted">{entry.checked.length} of {rubric.length} concepts checked. Your rubric score is a separate self-assessment.</p>
        {isCase&&<><h4>Common mistakes</h4><ul>{item.commonMistakes.map(m=><li key={m}>{m}</li>)}</ul><p>Relevant concepts: {item.conceptIds.map(id=><Link className="related-item" href={'/study?topic='+content.subtopics.find(s=>s.id===content.concepts.find(c=>c.id===id)?.subtopicId)?.topicId} key={id}>{content.concepts.find(c=>c.id===id)?.title}</Link>)}</p></>}
        {diagram&&<details><summary>Example diagram for the linked exercise</summary><p>{diagram.prompt}</p><GraphPreview graph={exampleGraph(diagram)}/><Sources ids={diagram.sourceIds}/></details>}
        <div className="self-score"><label>Self-check score<select aria-label="Self-check score" value={submission?.selfScore??entry.selfScore??''} onChange={e=>draft({selfScore:e.target.value===''?null:Number(e.target.value)})} disabled={saved}><option value="">Choose a 0–3 score</option><option value="0">0 · Incorrect or off-topic</option><option value="1">1 · Partial, major concepts missing</option><option value="2">2 · Mostly correct, minor gaps</option><option value="3">3 · Complete, accurate, well justified</option></select></label>{!confidence&&<ConfidenceInput value={confidence} onChange={value=>draft({confidence:value})}/>}<button className="button primary" disabled={entry.selfScore===null||!confidence||saved||!!progress.error||!progress.ready} onClick={saveSelfScore}>{saved?'Score recorded':'Record self-check score'}</button></div>
        <small>Written scores are self-assessed; no automatic semantic grading is performed.</small>
      </>}
      <p role="status">{status|| (saved?'Attempt recorded.':'Response saved. Record a self-check score to include it in accuracy.')}</p>
      {saved&&<ReferenceSuggestionPanel itemId={item.id} sessionId={session?.id??sessionId} onOpen={session?()=>progress.pauseAdvance(session.id,item.id):undefined}/>}

    </div>}
    <Sources ids={item.sourceIds} provenance={item.provenance}/><FurtherReading item={item}/>
  </article>;
}
