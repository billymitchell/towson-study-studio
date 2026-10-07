'use client';
import { useId } from 'react';
import { HelpTip } from './HelpTip';
import type { Confidence } from '@/content/types';
export function ConfidenceInput({value,onChange,disabled=false}:{value:Confidence|null;onChange:(value:Confidence)=>void;disabled?:boolean}){
  const id=useId();
  return <div className="confidence-control"><div className="control-label"><label htmlFor={id}>Confidence <span className="required-label">Required</span></label><HelpTip label="Confidence">Choose how sure you are before seeing the answer. Low confidence raises review priority. Confidence never changes correctness or your score and is locked after submission.</HelpTip></div><select aria-label="Confidence" id={id} value={value??''} onChange={e=>onChange(e.target.value as Confidence)} required disabled={disabled} aria-describedby={id+'-help'}><option value="" disabled>Choose your confidence</option><option value="Low">Low · I am unsure</option><option value="Medium">Medium · Somewhat sure</option><option value="High">High · Very sure</option></select><p id={id+'-help'}>How sure are you before seeing the answer? This guides what to review next and never changes your score.</p></div>;
}
