'use client';
import { useId, useState } from 'react';
import Link from 'next/link';
import { diagramLesson as lesson, type AirlineNode } from '@/lib/diagramLesson';
import { PageHeading, Sources } from './Shared';

function lines(label:string,max=24){
  const result:string[]=[];let line='';
  for(const word of label.split(' ')){if(line&&`${line} ${word}`.length>max){result.push(line);line=word;}else line=line?`${line} ${word}`:word;}
  if(line)result.push(line);return result;
}
function SvgLabel({label,x,y,max=24}:{label:string;x:number;y:number;max?:number}){
  const wrapped=lines(label,max);
  return <text x={x} y={y-(wrapped.length-1)*12} textAnchor="middle">{wrapped.map((line,i)=><tspan x={x} dy={i?24:0} key={i}>{i?' '+line:line}</tspan>)}</text>;
}
function OriginalSolution({image,title,sourceId}:{image:string;title:string;sourceId:string}){
  return <details className="lesson-original"><summary>View original {title} class solution</summary><p>This is the supplied instructor image. The walkthrough above is an annotated, app-authored redraw.</p><img src={image} alt={`Original ${title} class solution; the walkthrough provides an accessible text description.`} loading="lazy"/><Sources ids={[sourceId]} provenance="PROFESSOR_SOURCE"/></details>;
}
function SequenceWalkthrough(){
  const data=lesson.sequence,[step,setStep]=useState(0),[branchId,setBranchId]=useState(data.branches[0].id),[zoom,setZoom]=useState(false),id=useId().replaceAll(':','');
  const branch=data.branches.find(b=>b.id===branchId)!,current=data.messages[step];
  const positions=new Map(data.participants.map(p=>[p.id,p.x]));
  function arrow(from:string,to:string,label:string,y:number,active:boolean,returned=false){
    const x1=positions.get(from)!,x2=positions.get(to)!,self=from===to;
    const path=self?`M ${x1+9} ${y} H ${x1+65} V ${y+28} H ${x1+9}`:`M ${x1+(x1<x2?9:-9)} ${y} H ${x2+(x1<x2?-9:9)}`;
    return <g className={active?'lesson-message active':'lesson-message'}><path d={path} fill="none" stroke="currentColor" strokeWidth={active?3:2} strokeDasharray={returned?'8 6':undefined} markerEnd={`url(#${id}-${returned?'return':'message'})`}/><SvgLabel label={label} x={self?x1+170:(x1+x2)/2} y={y-17} max={self?20:32}/></g>;
  }
  return <section className="panel lesson-section" aria-labelledby="atm-title"><h2 id="atm-title">{data.title}</h2><p>{data.subtitle}</p>
    <div className="lesson-controls"><div className="button-row"><button className="button secondary" disabled={step===0} onClick={()=>setStep(s=>s-1)}>Previous ATM step</button><button className="button primary" disabled={step===data.messages.length-1} onClick={()=>setStep(s=>s+1)}>Next ATM step</button></div><label className="checkbox-label"><input type="checkbox" checked={zoom} onChange={e=>setZoom(e.target.checked)}/>Enlarge ATM diagram</label></div>
    <p className="lesson-step" role="status"><strong>Step {step+1}/{data.messages.length}: {current.label}.</strong> {current.explanation}</p>
    <div className={`lesson-diagram-scroll${zoom?' enlarged':''}`} tabIndex={0} role="region" aria-label="ATM diagram; scroll horizontally when enlarged">
      <svg viewBox="0 0 970 1040" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>ATM withdrawal sequence diagram</title><desc id={`${id}-desc`}>Messages read top to bottom. Step {step+1}: {current.explanation} Alternative shown: {branch.label}. {branch.explanation} The ordered messages and all alternative paths are listed below.</desc>
        <defs><marker id={`${id}-message`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="currentColor"/></marker><marker id={`${id}-return`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10" fill="none" stroke="currentColor"/></marker></defs>
        {data.participants.map(p=><g key={p.id}><rect x={p.x-100} y={20} width={200} height={72} rx={5} fill="var(--surface-gold)" stroke="currentColor"/><SvgLabel label={p.label} x={p.x} y={60} max={20}/><path d={`M ${p.x} 92 V 1015`} stroke="currentColor" strokeDasharray="9 9"/><rect x={p.x-9} y={p.id==='bank'?565:130} width={18} height={p.id==='bank'?440:875} fill="white" stroke="currentColor"/></g>)}
        {data.messages.map((m,i)=><g key={m.id}>{i===step&&<rect x={20} y={115+i*85} width={930} height={80} rx={5} fill="var(--tu-gold)" opacity={0.18}/>} {arrow(m.from,m.to,`${i+1}. ${m.label}`,155+i*85,i===step)}</g>)}
        <rect x={20} y={690} width={930} height={305} rx={4} fill="var(--surface-gold)" fillOpacity={0.7} stroke="currentColor"/><text x={40} y={723}>alt · {branch.guard}</text>
        {branch.messages.map((m,i)=><g key={`${branch.id}-${i}`}>{arrow(m.from,m.to,m.label,790+i*80,true,m.return)}</g>)}
      </svg>
    </div>
    <fieldset className="lesson-branches"><legend>Explore an alternative outcome</legend><div className="button-row">{data.branches.map(b=><button key={b.id} className={`button ${branchId===b.id?'primary':'secondary'}`} aria-pressed={branchId===b.id} onClick={()=>setBranchId(b.id)}>{b.label}</button>)}</div></fieldset><p role="status">{branch.explanation}</p>
    <details className="lesson-text"><summary>Read the sequence and notation as text</summary><ol>{data.messages.map(m=><li key={m.id}><strong>{data.participants.find(p=>p.id===m.from)!.label} → {data.participants.find(p=>p.id===m.to)!.label}: {m.label}.</strong> {m.explanation}</li>)}</ol><h3>Alternative paths</h3><ul>{data.branches.map(b=><li key={b.id}><strong>{b.guard}</strong> {b.explanation}</li>)}</ul><h3>How to read the notation</h3><ul>{data.notation.map(n=><li key={n}>{n}</li>)}</ul></details>
    <Sources ids={[data.sourceId]} provenance="SOURCE_DERIVED"/><OriginalSolution image={data.originalImage} title="ATM sequence" sourceId={data.sourceId}/>
  </section>;
}
function endpoint(node:AirlineNode,toward:AirlineNode){
  const dx=toward.x-node.x,dy=toward.y-node.y;
  if(node.kind==='usecase'){const scale=1/Math.sqrt(dx*dx/(105*105)+dy*dy/(32*32));return [node.x+dx*scale,node.y+dy*scale];}
  if(node.kind==='actor')return [node.x+(dx>=0?24:-24),node.y-5];
  const scale=Math.min(80/Math.max(Math.abs(dx),1),45/Math.max(Math.abs(dy),1));return [node.x+dx*scale,node.y+dy*scale];
}
function AirlineWalkthrough(){
  const data=lesson.airline,[focusId,setFocusId]=useState(data.explorations[0].id),[zoom,setZoom]=useState(false),id=useId().replaceAll(':','');
  const focus=data.explorations.find(e=>e.id===focusId)!,highlight=new Set(focus.nodeIds),nodes=new Map(data.nodes.map(n=>[n.id,n]));
  return <section className="panel lesson-section" aria-labelledby="airline-title"><h2 id="airline-title">{data.title}</h2><p>{data.subtitle}</p><div className="lesson-controls"><label>Explore airline use case<select value={focusId} onChange={e=>setFocusId(e.target.value)}>{data.explorations.map(e=><option key={e.id} value={e.id}>{e.label}</option>)}</select></label><label className="checkbox-label"><input type="checkbox" checked={zoom} onChange={e=>setZoom(e.target.checked)}/>Enlarge airline diagram</label></div><p className="lesson-step" role="status">{focus.explanation}</p>
    <div className={`lesson-diagram-scroll airline-diagram${zoom?' enlarged':''}`} tabIndex={0} role="region" aria-label="Airline diagram; scroll horizontally when enlarged">
      <svg viewBox="0 0 1210 845" role="img" aria-labelledby={`${id}-title ${id}-desc`}><title id={`${id}-title`}>Airline Support System use-case diagram — requested model</title><desc id={`${id}-desc`}>{focus.explanation} Actor associations are undirected; dashed include arrows point to included behavior; hollow generalization triangles point to Check in. The relationships are listed below.</desc>
        <defs><marker id={`${id}-include`} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="9" markerHeight="9" orient="auto"><path d="M 1 1 L 11 6 L 1 11" fill="none" stroke="var(--tu-black)" strokeWidth="1.5"/></marker><marker id={`${id}-generalization`} viewBox="0 0 12 12" refX="11" refY="6" markerWidth="10" markerHeight="10" orient="auto"><path d="M 1 1 L 11 6 L 1 11 Z" fill="white" stroke="var(--tu-black)" strokeWidth="1.5"/></marker></defs>
        <rect x={245} y={25} width={720} height={790} fill="white" stroke="currentColor" strokeWidth={2}/><text x={605} y={63} textAnchor="middle" fontWeight={700}>Airline Support System</text>
        {data.edges.map((edge,i)=>{const from=nodes.get(edge.from)!,to=nodes.get(edge.to)!,active=highlight.has(edge.from)&&highlight.has(edge.to),points=edge.route??[endpoint(from,to),endpoint(to,from)];const path=points.map((p,j)=>`${j?'L':'M'} ${p[0]} ${p[1]}`).join(' ');return <g key={i} opacity={active?1:0.28} className={`lesson-relation ${edge.relation}`} data-from={edge.from} data-to={edge.to}><path d={path} fill="none" stroke="currentColor" strokeWidth={active?2.5:1.4} strokeDasharray={edge.relation==='include'?'8 6':undefined} markerEnd={edge.relation==='association'?undefined:`url(#${id}-${edge.relation})`}/>{edge.relation==='include'&&<g><rect x={edge.labelX!-62} y={edge.labelY!-20} width={124} height={27} fill="white"/><text x={edge.labelX} y={edge.labelY} textAnchor="middle">«include»</text></g>}</g>;})}
        {data.nodes.map(node=>{const active=highlight.has(node.id);return <g key={node.id} className={active?'lesson-node active':'lesson-node'}>{node.kind==='usecase'?<><ellipse cx={node.x} cy={node.y} rx={105} ry={32} fill={active?'var(--surface-gold)':'white'} stroke="currentColor" strokeWidth={active?2.5:1.5}/><SvgLabel label={node.label} x={node.x} y={node.y+7} max={22}/></>:node.kind==='external'?<><rect x={node.x-80} y={node.y-44} width={160} height={110} rx={4} fill={active?'var(--surface-gold)':'var(--surface-tint)'} stroke="currentColor"/><text x={node.x} y={node.y-19} textAnchor="middle" fontSize={16}>external system actor</text><SvgLabel label={node.label} x={node.x} y={node.y+24} max={16}/></>:<><circle cx={node.x} cy={node.y-32} r={13} fill={active?'var(--tu-gold)':'white'} stroke="currentColor"/><path d={`M ${node.x} ${node.y-19} V ${node.y+15} M ${node.x-24} ${node.y-5} H ${node.x+24} M ${node.x} ${node.y+15} L ${node.x-23} ${node.y+42} M ${node.x} ${node.y+15} L ${node.x+23} ${node.y+42}`} stroke="currentColor" fill="none" strokeWidth={2}/><SvgLabel label={node.label} x={node.x} y={node.y+72} max={20}/></>}</g>;})}
      </svg>
    </div>
    <div className="note lesson-source-note"><strong>Original solution and requested model</strong><p>{data.sourceNote}</p></div>
    <details className="lesson-text"><summary>Read all airline actors and relationships as text</summary><h3>Actors and goals</h3><ul>{data.explorations.map(e=><li key={e.id}><strong>{e.label}.</strong> {e.explanation}</li>)}</ul><h3>Connections</h3><ul>{data.edges.map((e,i)=><li key={i}>{nodes.get(e.from)!.label} {e.relation==='association'?'—':'→'} {nodes.get(e.to)!.label} · {e.relation}</li>)}</ul></details>
    <Sources ids={[data.sourceId]} provenance="SOURCE_DERIVED"/><OriginalSolution image={data.originalImage} title="airline use-case" sourceId={data.sourceId}/>
  </section>;
}
function ComprehensionChecks(){
  const [answers,setAnswers]=useState<Record<string,number>>({}),[submitted,setSubmitted]=useState<Record<string,boolean>>({});
  return <section className="panel lesson-section"><h2>Check your understanding</h2><p>These lesson checks are unscored exercises. They do not change your saved practice progress.</p><div className="lesson-checks">{lesson.checks.map(check=><form key={check.id} onSubmit={e=>{e.preventDefault();if(answers[check.id]!==undefined)setSubmitted(s=>({...s,[check.id]:true}));}}><fieldset><legend>{check.prompt}</legend>{check.choices.map((choice,i)=><label key={choice}><input type="radio" name={`lesson-${check.id}`} checked={answers[check.id]===i} onChange={()=>{setAnswers(a=>({...a,[check.id]:i}));setSubmitted(s=>({...s,[check.id]:false}));}}/>{choice}</label>)}</fieldset><button className="button secondary" disabled={answers[check.id]===undefined} type="submit">Check answer</button>{submitted[check.id]&&<p role="status" className={answers[check.id]===check.answer?'lesson-check-correct':'lesson-check-review'}><strong>{answers[check.id]===check.answer?'Correct.':'Review this one.'}</strong> {check.explanation}</p>}</form>)}</div></section>;
}
export function DiagramLesson(){
  return <><PageHeading eyebrow="UNDERSTAND THE DIAGRAMS" title={lesson.title} description={lesson.intro}/><p className="note">{lesson.scopeNote}</p><section className="panel lesson-section"><h2>Goals versus messages</h2><div className="table-scroll"><table className="lesson-comparison"><caption>Use-case and sequence diagrams answer different questions</caption><thead><tr><th scope="col">Compare</th><th scope="col">Use-case diagram</th><th scope="col">Sequence diagram</th></tr></thead><tbody>{lesson.comparison.map(row=><tr key={row.dimension}><th scope="row">{row.dimension}</th><td>{row.useCase}</td><td>{row.sequence}</td></tr>)}</tbody></table></div><p className="lesson-bridge">{lesson.bridge}</p></section><SequenceWalkthrough/><AirlineWalkthrough/><ComprehensionChecks/><Sources ids={lesson.sourceIds} provenance="SOURCE_DERIVED"/><div className="button-row"><Link className="button secondary" href="/study?topic=modeling">Back to modeling topics</Link><Link className="button primary" href="/practice/diagrams">Practice a diagram →</Link></div></>;
}
