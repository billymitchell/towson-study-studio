'use client';
import { useState } from 'react';
import Link from 'next/link';
import { content } from '@/lib/contentRepository';
import { PageHeading } from './Shared';
import { DiagramEditor } from './DiagramEditor';
export function DiagramWorkspace(){const [id,setId]=useState(content.diagrams[0].id);return <><PageHeading eyebrow="MAKE THE RELATIONSHIPS VISIBLE" title="Think in diagrams." description="Practice the two assessed diagram types. Build your model, save it, and compare its meaning to an authored key."/><p><Link className="text-link" href="/study/diagrams">Learn with the ATM sequence and airline use-case examples →</Link></p><div className="filters"><label>Exercise<select value={id} onChange={e=>setId(e.target.value)}>{content.diagrams.map(d=><option key={d.id} value={d.id}>{d.title} · {d.diagramType}</option>)}</select></label><p>Changes are kept only when you save. Select an exercise to load its saved diagram.</p></div><DiagramEditor key={id} exercise={content.diagrams.find(d=>d.id===id)!}/></>;}
