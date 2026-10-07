import type { Answer, ChoiceQuestion, StudyItem } from '@/content/types';
export function isChoice(item:StudyItem):item is ChoiceQuestion{return 'type' in item && item.type!=='short-answer';}
export function selectedIds(item:ChoiceQuestion,response:Answer):string[]{
  return typeof response==='number'?(item.choiceIds[response]?[item.choiceIds[response]]:[]):Array.isArray(response)?response:[];
}
export function correctIds(item:ChoiceQuestion){return item.type==='multiple-choice'?[item.choiceIds[item.answer]]:item.correctChoiceIds;}
export function scoreChoice(item:ChoiceQuestion,response:Answer){
  const selected=selectedIds(item,response),correct=correctIds(item);
  return selected.length===new Set(selected).size&&selected.length===correct.length&&selected.every(id=>correct.includes(id))?1:0;
}
export function responseValid(item:StudyItem,response:Answer):boolean{
  if(isChoice(item)){const selected=selectedIds(item,response);return selected.length>0&&(item.type==='multiple-answer'||selected.length===1)&&new Set(selected).size===selected.length&&selected.every(id=>item.choiceIds.includes(id));}
  if('diagramType' in item){if(typeof response!=='object'||response===null||Array.isArray(response)||!('nodes' in response))return false;const ids=new Set(response.nodes.map(n=>n.id));return response.nodes.length>0&&ids.size===response.nodes.length&&response.nodes.every(n=>n.label.trim())&&response.edges.every(e=>ids.has(e.source)&&ids.has(e.target));}
  return typeof response==='string'&&response.trim().length>0;
}
