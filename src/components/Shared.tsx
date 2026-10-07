import { HelpTip } from './HelpTip';
import Link from 'next/link';
import { sourceMap } from '@/lib/contentRepository';
import type { ReactNode } from 'react';
export function PageHeading({eyebrow,title,description,action}:{eyebrow:string;title:string;description:string;action?:ReactNode}){return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;}
export function Sources({ids,provenance}:{ids:string[];provenance?:string}) {
  const unique=[...new Set(ids)];
  return <div className="source-meta"><details className="sources"><summary>Course sources · {unique.length} references {provenance&&<span className="source-tag">{provenance.replaceAll('_',' ').toLowerCase()}</span>}</summary><ul>{unique.map(id=>{const s=sourceMap.get(id);return <li key={id}>{s?<a href={`/sources/${encodeURIComponent(s.file)}#page=${s.page}`} target="_blank" rel="noreferrer">{s.label} <span className="muted">({id})</span></a>:id}</li>;})}</ul></details><HelpTip label="Course sources">Open the original lecture or review PDF at its cited page. Source-derived practice is authored from these materials; textbook links provide supplementary reading and do not expand exam scope.</HelpTip></div>;
}
export function Priority({value}:{value:string}){return <span className={`badge priority-${value.toLowerCase()}`}>{value}</span>;}
export function Empty({text}:{text:string}){return <div className="empty"><h2>No items in this queue yet</h2><p>{text}</p><Link className="button secondary" href="/study">Explore the study guide</Link></div>;}
