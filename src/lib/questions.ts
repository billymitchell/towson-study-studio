import type { Answer, ChoiceQuestion, StudyItem, ScoringPolicy } from '@/content/types';
export function isChoice(item:StudyItem):item is ChoiceQuestion{return 'type' in item && item.type!=='short-answer';}
export function selectedIds(item:ChoiceQuestion,response:Answer):string[]{
  return typeof response==='number'?(item.choiceIds[response]?[item.choiceIds[response]]:[]):Array.isArray(response)?response:[];
}
export function correctIds(item:ChoiceQuestion){return item.type==='multiple-choice'?[item.choiceIds[item.answer]]:item.correctChoiceIds;}
export function exactChoiceCorrect(item:ChoiceQuestion,response:Answer){
  const selected=selectedIds(item,response),correct=correctIds(item);
  return selected.length===new Set(selected).size&&selected.length===correct.length&&selected.every(id=>correct.includes(id));
}
export function scoreChoice(item:ChoiceQuestion,response:Answer,policy:ScoringPolicy='exact'){
  if(!responseValid(item,response))return 0;
  if(exactChoiceCorrect(item,response))return 1;
  if(policy==='exact')return 0;
  const selected=selectedIds(item,response),correct=correctIds(item);
  if(item.type==='multiple-choice')return item.partialCredits?.[selected[0]]?.score??0;
  const right=selected.filter(id=>correct.includes(id)).length,wrong=selected.length-right;
  return Math.max(0,Math.min(1,right/correct.length-wrong/(item.choiceIds.length-correct.length)));
}
export function choiceScoreExplanation(item:ChoiceQuestion,response:Answer,policy:ScoringPolicy){
  if(policy==='exact')return 'Exact scoring awards full credit only for the complete correct answer.';
  if(item.type==='multiple-choice')return exactChoiceCorrect(item,response)?'The correct answer earns full credit.':item.partialCredits?.[selectedIds(item,response)[0]]?.explanation??'This choice has no authored partial-credit rationale and earns zero points.';
  const selected=selectedIds(item,response),correct=correctIds(item),right=selected.filter(id=>correct.includes(id)).length,wrong=selected.length-right;
  return `${right}/${correct.length} correct options selected minus ${wrong}/${item.choiceIds.length-correct.length} incorrect options selected. Points are bounded at 0–100%; selecting every option earns zero.`;
}
export function responseValid(item:StudyItem,response:Answer):boolean{
  if(isChoice(item)){const selected=selectedIds(item,response);return selected.length>0&&(item.type==='multiple-answer'||selected.length===1)&&new Set(selected).size===selected.length&&selected.every(id=>item.choiceIds.includes(id));}
  if('diagramType' in item){if(typeof response!=='object'||response===null||Array.isArray(response)||!('nodes' in response))return false;const ids=new Set(response.nodes.map(n=>n.id));return response.nodes.length>0&&ids.size===response.nodes.length&&response.nodes.every(n=>n.label.trim())&&response.edges.every(e=>ids.has(e.source)&&ids.has(e.target));}
  return typeof response==='string'&&response.trim().length>0;
}
