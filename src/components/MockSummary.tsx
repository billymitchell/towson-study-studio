'use client';
import { useProgress } from './ProgressProvider';
export function MockSummary({sessionId,itemIds}:{sessionId:string;itemIds:string[]}){
  const {data}=useProgress();const scores=new Map<string,number>();
  data.attempts.filter(a=>a.sessionId===sessionId).forEach(a=>scores.set(a.itemId,a.score));
  const scored=itemIds.filter(id=>scores.has(id));const mean=scored.length?scored.reduce((sum,id)=>sum+scores.get(id)!,0)/scored.length:0;
  return <div className="mock-summary" role="status"><strong>{Math.round(mean*100)}% practice average</strong><span>{scored.length} of {itemIds.length} items scored · {itemIds.length-scored.length} written self-checks pending</span><small>Each item contributes once, including cases that cover multiple chapters. This is a practice average, not an exam grade.</small></div>;
}
