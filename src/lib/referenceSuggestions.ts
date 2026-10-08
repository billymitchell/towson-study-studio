import type { Graph } from '@/content/types';
import type { Store } from './storage';
import { learningResponses, type LearningResponse } from './learningHistory';
import { gradeDiagram } from './diagramGrader';
import type { ReferenceNote } from './referenceSheet';
export type ReferenceSuggestion={conceptKey:string;text:string;title:string;topicIds:string[];sourceIds:string[];responseIds:string[];itemId:string;itemVersion?:number;highConfidence:boolean;misses:number;latestAt:string;existingNote?:ReferenceNote};
export function suggestionForResponse(response:LearningResponse){
  const item=response.item;
  if(response.score===null||response.score>=2/3)return null;
  const conceptKey='subtopicId' in item?`concept:${item.subtopicId}`:`${'diagramType' in item?'diagram':'case'}:${item.id}`;
  const text='diagramType' in item?(gradeDiagram(item,response.response as Graph).feedback.find(f=>/^(Missing|Wrong|Boundary)/.test(f))??item.acceptableAlternatives[0]??item.prompt):'scenario' in item?item.modelSolution:item.type==='short-answer'?item.modelAnswer:item.explanation;
  const title='title' in item?item.title:item.prompt;
  return {conceptKey,text,title,topicIds:response.topicIds,sourceIds:item.sourceIds,responseIds:[response.id],itemId:item.id,...(response.itemVersion===null?{}:{itemVersion:response.itemVersion}),highConfidence:response.confidence==='High',misses:1,latestAt:response.submittedAt};
}
export function referenceSuggestions(store:Pick<Store,'attempts'|'studySessions'|'referenceSheet'|'suggestionDecisions'>):ReferenceSuggestion[]{
  const decided=new Set(store.suggestionDecisions.map(d=>`${d.responseId}:${d.conceptKey}`)),groups=new Map<string,ReferenceSuggestion>();
  for(const response of learningResponses(store)){
    const suggestion=suggestionForResponse(response);if(!suggestion||decided.has(`${response.id}:${suggestion.conceptKey}`))continue;
    const old=groups.get(suggestion.conceptKey);
    groups.set(suggestion.conceptKey,{...suggestion,responseIds:[...(old?.responseIds??[]),response.id],sourceIds:[...new Set([...(old?.sourceIds??[]),...suggestion.sourceIds])],topicIds:[...new Set([...(old?.topicIds??[]),...suggestion.topicIds])],misses:(old?.misses??0)+1,highConfidence:suggestion.highConfidence||!!old?.highConfidence,existingNote:store.referenceSheet.notes.find(n=>n.conceptKey===suggestion.conceptKey)});
  }
  return [...groups.values()].sort((a,b)=>Number(b.highConfidence)-Number(a.highConfidence)||b.misses-a.misses||b.latestAt.localeCompare(a.latestAt));
}
