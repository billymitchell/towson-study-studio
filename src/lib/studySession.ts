import type { Answer, Attempt, Confidence, SessionDraft, SessionSettings, StudyItem, StudySession } from '@/content/types';
import { SessionSettingsSchema, SessionDraftSchema, StudySessionSchema } from '@/content/types';
import { isChoice, responseValid, scoreChoice } from './questions';
import { gradeDiagram } from './diagramGrader';
export const emptyDraft=():SessionDraft=>SessionDraftSchema.parse({});
export function newStudySession(mode:StudySession['mode'],items:StudyItem[],settings:Partial<SessionSettings>={},id=crypto.randomUUID(),now=new Date().toISOString()):StudySession{
  return StudySessionSchema.parse({id,ownerId:'local',mode,status:'active',items,index:0,drafts:{},submissions:{},pausedItemIds:[],settings:SessionSettingsSchema.parse(settings),createdAt:now,updatedAt:now,revision:0});
}
export function sessionStats(session:StudySession){
  const entries=session.items.map(i=>session.submissions[i.id]).filter(Boolean);
  const scored=entries.filter(e=>e.score!==null),earned=scored.reduce((sum,e)=>sum+e.score!,0);
  return {total:session.items.length,submitted:entries.length,scored:scored.length,pending:entries.length-scored.length,correct:scored.filter(e=>e.score===1).length,percent:scored.length?earned/scored.length*100:null,complete:entries.length===session.items.length};
}
export function updateSessionDraft(session:StudySession,itemId:string,patch:Partial<SessionDraft>):StudySession{
  if(!session.items.some(i=>i.id===itemId))throw new Error('Unknown session item');
  // A submitted response and its pre-answer confidence are immutable.
  if(session.submissions[itemId]&&['response','confidence','parts'].some(k=>k in patch))throw new Error('Submitted response is locked');
  return {...session,drafts:{...session.drafts,[itemId]:{...emptyDraft(),...session.drafts[itemId],...patch}}};
}
export function submitSessionItem(session:StudySession,itemId:string,response:Answer,confidence:Confidence):StudySession{
  if(session.submissions[itemId])return session;
  if(session.status!=='active')throw new Error('Session is not active');
  const item=session.items.find(i=>i.id===itemId);if(!item||!responseValid(item,response)||!['Low','Medium','High'].includes(confidence))throw new Error('A complete answer and explicit confidence are required');
  const score=session.mode==='mock'?null:isChoice(item)?scoreChoice(item,response):'diagramType' in item?gradeDiagram(item,response as Extract<Answer,{nodes:unknown}>).score:null;
  return {...session,submissions:{...session.submissions,[itemId]:{response,confidence,score,selfScore:null,submittedAt:new Date().toISOString()}}};
}
export function selfScoreSessionItem(session:StudySession,itemId:string,score:number):StudySession{
  const item=session.items.find(i=>i.id===itemId),submission=session.submissions[itemId];
  if(!item||isChoice(item)||'diagramType' in item||!submission||!Number.isInteger(score)||score<0||score>3)throw new Error('Invalid written self-score');
  if(session.mode==='mock'&&session.status!=='completed')throw new Error('Mock feedback stays hidden until final submission');
  if(submission.score!==null)return session;
  return {...session,submissions:{...session.submissions,[itemId]:{...submission,score:score/3,selfScore:score}}};
}
export function finishSession(session:StudySession):StudySession{
  const stats=sessionStats(session);if(!stats.complete||(session.mode!=='mock'&&stats.scored!==stats.total))throw new Error('Complete all items before finishing');
  if(session.status==='completed')return session;
  const submissions={...session.submissions};
  if(session.mode==='mock')for(const item of session.items){const entry=submissions[item.id];if(isChoice(item))submissions[item.id]={...entry,score:scoreChoice(item,entry.response)};else if('diagramType' in item)submissions[item.id]={...entry,score:gradeDiagram(item,entry.response as Extract<Answer,{nodes:unknown}>).score};}
  return {...session,status:'completed',submissions};
}
export function sessionAttempts(session:StudySession):Attempt[]{
  if(session.mode==='mock'&&session.status!=='completed')return [];
  return session.items.flatMap(item=>{
    const sub=session.submissions[item.id];if(!sub||sub.score===null)return [];
    const topicIds='topicIds' in item?item.topicIds:[item.topicId];
    return topicIds.map(topicId=>({id:`${session.id}:${item.id}:${topicId}`,sessionId:session.id,itemId:item.id,topicId,itemType:'diagramType' in item?'diagram' as const:'scenario' in item?'case' as const:item.type,response:sub.response,score:sub.score!,confidence:sub.confidence,completedAt:sub.submittedAt,sourceIds:item.sourceIds,itemVersion:'version' in item?item.version:1,evaluation:isChoice(item)||'diagramType' in item?'objective' as const:'self' as const}));
  });
}
export function advanceSession(session:StudySession,expectedItemId:string):StudySession{
  if(session.status!=='active'||session.items[session.index].id!==expectedItemId)return session;
  if(session.index<session.items.length-1)return {...session,index:session.index+1};
  const stats=sessionStats(session);
  if(session.mode==='mock')return session; // Final submission is always explicit.
  if(stats.complete&&stats.scored===stats.total)return finishSession(session);
  const index=session.items.findIndex(item=>!session.submissions[item.id]||session.submissions[item.id].score===null);
  return {...session,index:index<0?session.index:index};
}
export function practiceQueue(items:StudyItem[],count:number):StudyItem[]{
  const single=items.filter(i=>!('type' in i)||i.type!=='multiple-answer'),multi=items.filter(i=>'type' in i&&i.type==='multiple-answer');
  if(!multi.length||!single.length)return items.slice(0,count);
  const result:StudyItem[]=[];let a=0,b=0;
  while(result.length<Math.min(items.length,count)){const preferMulti=result.length%5===4;if(preferMulti&&b<multi.length)result.push(multi[b++]);else if(a<single.length)result.push(single[a++]);else result.push(multi[b++]);}
  return result;
}
