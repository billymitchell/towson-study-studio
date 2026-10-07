import { content } from './contentRepository';
import { isChoice } from './questions';
export type MockMix={mcq:number;shortAnswer:number;cases:number;diagrams:number};
export function createMockItems(mix:MockMix,random= Math.random){
  const choose=<T,>(bank:T[],count:number)=>{if(count>bank.length)throw new Error('Not enough items for this format');const shuffled=[...bank];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}return shuffled.slice(0,count);};
  if(Object.values(mix).some(v=>!Number.isInteger(v)||v<1))throw new Error('Each format requires at least one item');
  return [...choose(content.questions.filter(isChoice),mix.mcq),...choose(content.questions.filter(q=>q.type==='short-answer'),mix.shortAnswer),...choose(content.cases,mix.cases),...choose(content.diagrams,mix.diagrams)];
}
