import { z } from 'zod';
import { AnswerSchema, AttemptSchema, SavedDiagramSchema, GraphSchema, ConfidenceSchema, StudySessionSchema, type StudyItem, type Answer } from '@/content/types';
import { content } from './contentRepository';
import { isChoice, selectedIds, responseValid } from './questions';
export const STORAGE_KEY='ait624-study-progress';
export const LEGACY_BACKUP_KEY=STORAGE_KEY+'-before-v2';
export const MockSessionSchema=z.object({id:z.string(),itemIds:z.array(z.string()),responses:z.record(z.string(),AnswerSchema),confidence:z.record(z.string(),ConfidenceSchema).default({}),completedAt:z.string().datetime()});
export const StoreSchema=z.object({version:z.literal(2),attempts:z.array(AttemptSchema),diagrams:z.array(SavedDiagramSchema),sessions:z.array(MockSessionSchema),studySessions:z.array(StudySessionSchema)});
export type Store=z.infer<typeof StoreSchema>;
export const emptyStore=():Store=>({version:2,attempts:[],diagrams:[],sessions:[],studySessions:[]});
const items=new Map<string,StudyItem>([...content.questions,...content.cases,...content.diagrams].map(i=>[i.id,i]));
const topicIds=new Set(content.topics.map(t=>t.id)),sourceIds=new Set(content.sources.map(s=>s.id));
function validGraph(response:Answer,allowEmpty=true){
  const graph=GraphSchema.parse(response),ids=new Set(graph.nodes.map(n=>n.id));
  if(ids.size!==graph.nodes.length||new Set(graph.edges.map(e=>e.id)).size!==graph.edges.length||graph.edges.some(e=>!ids.has(e.source)||!ids.has(e.target))||(!allowEmpty&&!graph.nodes.length))throw new Error('Invalid graph references');
}
export function parseStore(raw:string):Store {
  const value=JSON.parse(raw);
  if(value?.version===0){value.version=1;value.sessions=[];}
  if(value?.version===1){value.version=2;value.studySessions=[];}
  const data=StoreSchema.parse(value);
  const snapshots=new Map(data.studySessions.flatMap(s=>s.items.map(i=>[s.id+':'+i.id,i] as const)));
  for(const a of data.attempts){
    const item=(a.sessionId?snapshots.get(a.sessionId+':'+a.itemId):undefined)??items.get(a.itemId);
    if(!item||!topicIds.has(a.topicId)||a.sourceIds.some(id=>!sourceIds.has(id)))throw new Error('Unknown stored content reference');
    const expected='diagramType' in item?'diagram':'scenario' in item?'case':item.type;
    const topics='topicIds' in item?item.topicIds:[item.topicId];
    if(a.itemType!==expected||!topics.includes(a.topicId)||!responseValid(item,a.response))throw new Error('Invalid stored attempt response, type, or topic');
    if(a.itemType==='diagram')validGraph(a.response,false);
  }
  for(const d of data.diagrams){
    const ex=content.diagrams.find(e=>e.id===d.exerciseId);
    if(!ex||ex.topicId!==d.topicId||ex.diagramType!==d.diagramType||d.sourceIds.some(id=>!sourceIds.has(id)))throw new Error('Invalid saved diagram reference');
    validGraph(d.graph);if(d.graph.nodes.some(n=>!n.label.trim()))throw new Error('Invalid saved node label');
  }
  for(const s of data.sessions){
    if(new Set(s.itemIds).size!==s.itemIds.length||s.itemIds.some(id=>!items.has(id)||!(id in s.responses))||Object.keys(s.responses).some(id=>!s.itemIds.includes(id)))throw new Error('Invalid mock-session reference');
    for(const id of s.itemIds){const item=snapshots.get(s.id+':'+id)??items.get(id)!;if(!responseValid(item,s.responses[id]))throw new Error('Invalid session response');if('diagramType' in item)validGraph(s.responses[id],false);}
  }
  if(new Set(data.studySessions.map(s=>s.id)).size!==data.studySessions.length)throw new Error('Duplicate study session');
  for(const s of data.studySessions){
    const ids=new Set(s.items.map(i=>i.id));
    if(ids.size!==s.items.length||s.index>=s.items.length||Object.keys({...s.drafts,...s.submissions}).some(id=>!ids.has(id))||s.pausedItemIds.some(id=>!ids.has(id)))throw new Error('Invalid study-session queue');
    if((s.settings.topicId!=='all'&&!topicIds.has(s.settings.topicId))||(s.settings.subtopicId!=='all'&&!content.subtopics.some(t=>t.id===s.settings.subtopicId)))throw new Error('Unknown study filters');
    for(const item of s.items){
      if(!items.has(item.id)||!item.sourceIds.includes('MR-P1')||!item.sourceIds.some(id=>id.startsWith('L'))||item.sourceIds.some(id=>!sourceIds.has(id)))throw new Error('Unknown session snapshot source');
      if(s.mode!=='mock'&&((s.mode==='multiple-choice'&&!isChoice(item))||(s.mode==='short-answer'&&(!('type' in item)||item.type!=='short-answer'))||(s.mode==='case'&&!('scenario' in item))))throw new Error('Wrong item in session mode');
      if(isChoice(item)){if(new Set(item.choiceIds).size!==4||new Set(item.choices).size!==4)throw new Error('Duplicate snapshot choices');if(item.type==='multiple-answer'&&(new Set(item.correctChoiceIds).size!==item.correctChoiceIds.length||item.correctChoiceIds.some(id=>!item.choiceIds.includes(id))))throw new Error('Invalid snapshot answer key');}
      const draft=s.drafts[item.id],sub=s.submissions[item.id];
      if(draft){
        if(isChoice(item)&&draft.response!==''){const selected=selectedIds(item,draft.response);if((!Array.isArray(draft.response)&&typeof draft.response!=='number')||new Set(selected).size!==selected.length||selected.some(id=>!item.choiceIds.includes(id)))throw new Error('Invalid draft choices');}
        if('diagramType' in item&&draft.response!=='')validGraph(draft.response);
        if('scenario' in item&&draft.parts.length&&draft.parts.length!==item.prompts.length)throw new Error('Invalid case draft');
      }
      if(sub&&!responseValid(item,sub.response))throw new Error('Invalid submitted answer');
      if(sub&&'diagramType' in item)validGraph(sub.response,false);
      if(s.mode==='mock'&&s.status==='active'&&sub?.score!==null&&sub?.score!==undefined)throw new Error('Mock score exposed before final submission');
    }
    if(s.status==='completed'&&s.items.some(i=>!s.submissions[i.id]))throw new Error('Incomplete finished session');
  }
  return data;
}
export interface StorageAdapter { getItem(key:string):string|null; setItem(key:string,value:string):void; removeItem(key:string):void; }
export function loadStore(adapter:StorageAdapter){const raw=adapter.getItem(STORAGE_KEY);return raw?parseStore(raw):emptyStore();}
export function saveStore(adapter:StorageAdapter,data:Store){
  const serialized=JSON.stringify(parseStore(JSON.stringify(data))),raw=adapter.getItem(STORAGE_KEY);
  let legacy=false;if(raw){try{const old=JSON.parse(raw);legacy=old.version===0||old.version===1;}catch{/* A valid import may replace corrupt storage. */}}
  if(raw&&legacy&&!adapter.getItem(LEGACY_BACKUP_KEY))adapter.setItem(LEGACY_BACKUP_KEY,raw);
  adapter.setItem(STORAGE_KEY,serialized);
}
