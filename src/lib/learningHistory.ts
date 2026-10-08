import type { Answer, Confidence, StudyItem } from '@/content/types';
import type { Store } from './storage';
import { content } from './contentRepository';
import { isChoice, exactChoiceCorrect } from './questions';
export type LearningResponse={id:string;itemId:string;item:StudyItem;response:Answer;itemVersion:number|null;topicIds:string[];score:number|null;exactCorrect:boolean|null;confidence:Confidence;submittedAt:string;evaluation:'objective'|'self';policy:'exact'|'partial'|'none';scoringVersion:number|null;mode:string;sessionId?:string;difficulty:string;firstTry:boolean;};
export function learningResponses(store:Pick<Store,'attempts'|'studySessions'>):LearningResponse[]{
  const items=new Map<string,StudyItem>([...content.questions,...content.cases,...content.diagrams].map(i=>[i.id,i]));
  const responses=new Map<string,LearningResponse>(),hidden=new Set(store.studySessions.filter(s=>s.mode==='mock'&&s.status!=='completed').map(s=>s.id));
  for(const session of store.studySessions){
    if(hidden.has(session.id))continue;
    for(const item of session.items){const sub=session.submissions[item.id];if(!sub)continue;
      const choice=isChoice(item),id=`${session.id}:${item.id}`;
      responses.set(id,{id,itemId:item.id,item,response:sub.response,itemVersion:'version' in item?item.version:1,topicIds:'topicIds' in item?item.topicIds:[item.topicId],score:sub.score,exactCorrect:choice&&sub.score!==null?(sub.exactCorrect??exactChoiceCorrect(item,sub.response)):null,confidence:sub.confidence,submittedAt:sub.submittedAt,evaluation:choice||'diagramType' in item?'objective':'self',policy:choice?session.settings.scoringPolicy:'none',scoringVersion:choice?session.settings.scoringVersion:null,mode:session.mode==='mock'?'Mock exam':'Practice',sessionId:session.id,difficulty:'difficulty' in item?item.difficulty:'Diagram',firstTry:false});
    }
  }
  for(const attempt of [...store.attempts].sort((a,b)=>a.completedAt.localeCompare(b.completedAt)||a.id.localeCompare(b.id))){
    if(attempt.sessionId&&hidden.has(attempt.sessionId))continue;
    const item=items.get(attempt.itemId);if(!item)continue;
    // Old case rows attributed to multiple chapters lack a response ID. Group identical
    // answer/confidence rows recorded in the same second; disclose this legacy rule.
    const id=attempt.responseId??(attempt.sessionId?`${attempt.sessionId}:${attempt.itemId}`:attempt.itemType==='case'?`legacy-case:${attempt.itemId}:${attempt.completedAt.slice(0,19)}:${attempt.confidence}:${JSON.stringify(attempt.response)}`:attempt.id);
    const existing=responses.get(id);if(existing){existing.topicIds=[...new Set([...existing.topicIds,attempt.topicId])];continue;}
    const choice=isChoice(item);
    responses.set(id,{id,itemId:attempt.itemId,item,response:attempt.response,itemVersion:attempt.itemVersion??null,topicIds:[attempt.topicId],score:attempt.score,exactCorrect:choice?(attempt.exactCorrect??attempt.score===1):null,confidence:attempt.confidence,submittedAt:attempt.completedAt,evaluation:attempt.evaluation??(choice||attempt.itemType==='diagram'?'objective':'self'),policy:choice?attempt.scoringPolicy??'exact':'none',scoringVersion:choice?attempt.scoringVersion??null:null,mode:attempt.sessionId?'Mock exam':'Legacy / standalone',sessionId:attempt.sessionId,difficulty:attempt.itemVersion===undefined?'Unknown (legacy)':'difficulty' in item?item.difficulty:'Diagram',firstTry:false});
  }
  const result=[...responses.values()].sort((a,b)=>a.submittedAt.localeCompare(b.submittedAt)||a.id.localeCompare(b.id)),seen=new Set<string>();
  for(const response of result){const key=`${response.itemId}:${response.itemVersion??'unknown'}`;response.firstTry=!seen.has(key);seen.add(key);}
  return result;
}
export function comparableItemKey(response:LearningResponse){return JSON.stringify([response.itemId,response.itemVersion,response.evaluation,response.policy,response.scoringVersion,response.mode,response.difficulty]);}
export function responseGroupKey(response:LearningResponse){return JSON.stringify([('diagramType' in response.item?'diagram':'scenario' in response.item?'case':response.item.type),response.itemVersion,response.evaluation,response.policy,response.scoringVersion,response.mode,response.difficulty]);}
export function responseGroupLabel(response:LearningResponse){
  const format='diagramType' in response.item?'Diagram':'scenario' in response.item?'Case':response.item.type==='multiple-answer'?'Select all':response.item.type==='multiple-choice'?'Single answer':'Short answer';
  return `${format} · ${response.evaluation==='self'?'Self-assessed':'Objective'}${response.policy!=='none'?' · '+response.policy+' scoring '+(response.scoringVersion===null?'(legacy version unknown)':'v'+response.scoringVersion):''} · ${response.difficulty} · ${response.itemVersion===null?'unknown version':'content v'+response.itemVersion} · ${response.mode}`;
}
export function responseDay(iso:string){const date=new Date(iso);const year=date.getFullYear(),month=String(date.getMonth()+1).padStart(2,'0'),day=String(date.getDate()).padStart(2,'0');return `${year}-${month}-${day}`;}
export type HistoryFilters={days:0|7|30;topicId:string;evaluation:'all'|'objective'|'self';policy:'all'|'exact'|'partial'};
const mean=(rows:LearningResponse[])=>rows.length?rows.reduce((sum,r)=>sum+r.score!,0)/rows.length:null;
export function learningMetrics(all:LearningResponse[],filters:HistoryFilters,now=new Date()){
  const since=new Date(now);since.setHours(0,0,0,0);if(filters.days)since.setDate(since.getDate()-filters.days+1);
  const selected=all.filter(r=>(!filters.days||new Date(r.submittedAt)>=since)&&new Date(r.submittedAt)<=now&&(filters.topicId==='all'||r.topicIds.includes(filters.topicId))&&(filters.evaluation==='all'||r.evaluation===filters.evaluation)&&(filters.policy==='all'||r.policy===filters.policy));
  const scored=selected.filter(r=>r.score!==null),mcqs=scored.filter(r=>r.exactCorrect!==null),first=mcqs.filter(r=>r.firstTry);
  const groups=new Map<string,{key:string;label:string;responses:LearningResponse[]}>();
  for(const r of scored){const key=responseGroupKey(r),group=groups.get(key)??{key,label:responseGroupLabel(r),responses:[]};group.responses.push(r);groups.set(key,group);}
  const recovery={objective:{count:0,recovered:0,delta:null as number|null},self:{count:0,recovered:0,delta:null as number|null}};
  const repeats=new Map<string,LearningResponse[]>();for(const r of all.filter(r=>r.score!==null)){const key=comparableItemKey(r),list=repeats.get(key)??[];list.push(r);repeats.set(key,list);}
  const selectedIds=new Set(scored.map(r=>r.id)),deltas={objective:[] as number[],self:[] as number[]};
  for(const rows of repeats.values()){const ordered=[...rows].sort((a,b)=>a.submittedAt.localeCompare(b.submittedAt)),baseline=ordered[0],latest=ordered.at(-1)!;if(rows.length<2||!selectedIds.has(latest.id))continue;const stats=recovery[latest.evaluation];stats.count++;if(baseline.score!<2/3&&latest.score!>=2/3)stats.recovered++;deltas[latest.evaluation].push(latest.score!-baseline.score!);}
  for(const method of ['objective','self'] as const){const values=deltas[method];recovery[method].delta=values.length?values.reduce((s,v)=>s+v,0)/values.length:null;}
  const calibration=(['Low','Medium','High'] as const).map(confidence=>{const rows=mcqs.filter(r=>r.confidence===confidence);return {confidence,count:rows.length,correct:rows.filter(r=>r.exactCorrect).length,accuracy:rows.length?rows.filter(r=>r.exactCorrect).length/rows.length:null};});
  const gaps=content.topics.map(topic=>{const rows=scored.filter(r=>r.topicIds.includes(topic.id)),choices=rows.filter(r=>r.exactCorrect!==null),objective=rows.filter(r=>r.evaluation==='objective'),self=rows.filter(r=>r.evaluation==='self');const firstChoices=choices.filter(r=>r.firstTry);return {topic,count:rows.length,firstCount:firstChoices.length,firstAccuracy:firstChoices.length?firstChoices.filter(r=>r.exactCorrect).length/firstChoices.length:null,objectiveCount:objective.length,selfCount:self.length,objectiveMean:mean(objective),selfMean:mean(self),exactCount:choices.length,exactAccuracy:choices.length?choices.filter(r=>r.exactCorrect).length/choices.length:null};});
  const recentErrors=mcqs.filter(r=>r.confidence==='High'&&!r.exactCorrect).reverse();
  return {selected,scored,mcqs,first,firstAccuracy:first.length?first.filter(r=>r.exactCorrect).length/first.length:null,objectiveMean:mean(scored.filter(r=>r.evaluation==='objective')),selfMean:mean(scored.filter(r=>r.evaluation==='self')),groups:[...groups.values()].sort((a,b)=>b.responses.length-a.responses.length||a.label.localeCompare(b.label)),recovery,calibration,gaps,highConfidenceErrors:recentErrors};
}
export function dailyScores(responses:LearningResponse[]){
  const days=new Map<string,LearningResponse[]>();for(const r of responses){const day=responseDay(r.submittedAt),rows=days.get(day)??[];rows.push(r);days.set(day,rows);}
  return [...days].sort(([a],[b])=>a.localeCompare(b)).map(([day,rows])=>({day,count:rows.length,score:mean(rows)!,firstCount:rows.filter(r=>r.firstTry).length}));
}
