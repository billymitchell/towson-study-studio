import { z } from 'zod';
import library from '@/content/textbookReadings.json';
import { content } from './contentRepository';
import type { StudyItem } from '@/content/types';
const page=z.number().int().positive();
export const ReadingSchema=z.object({id:z.string().min(1),subtopicId:z.string(),topicId:z.string(),chapter:page,section:z.string().min(1),title:z.string().min(1),printedStart:page,printedEnd:page,pdfStart:page,pdfEnd:page,indexTerm:z.string().min(1),indexPdfPage:page,indexPrintedPage:page,note:z.string()});
export const TextbookSchema=z.object({book:z.object({file:z.string(),title:z.string(),author:z.string(),edition:z.string(),pdfPages:page,sha256:z.string().regex(/^[a-f0-9]{64}$/)}),readings:z.array(ReadingSchema).min(22)});
export function validateTextbook(input:unknown){
  const data=TextbookSchema.parse(input),ids=new Set<string>();
  for(const r of data.readings){
    const sub=content.subtopics.find(s=>s.id===r.subtopicId);
    if(ids.has(r.id)||!sub||sub.topicId!==r.topicId)throw Error('Invalid textbook mapping');ids.add(r.id);
    if(r.pdfStart>r.pdfEnd||r.printedStart>r.printedEnd||r.pdfEnd>data.book.pdfPages||r.indexPdfPage>data.book.pdfPages||r.pdfEnd-r.pdfStart!==r.printedEnd-r.printedStart)throw Error('Invalid textbook page range');
  }
  for(const s of content.subtopics)if(!data.readings.some(r=>r.subtopicId===s.id))throw Error('Missing textbook coverage: '+s.id);
  return data;
}
export const textbook=validateTextbook(library);
export type Reading=z.infer<typeof ReadingSchema>;
export const readingHref=(r:Reading,index=false)=>'/sources/'+encodeURIComponent(textbook.book.file)+'#page='+(index?r.indexPdfPage:r.pdfStart);
export function readingsForSubtopics(ids:string[]){
  const defaults=new Set(ids.map(id=>'read-'+id));
  if(ids.includes('decomposition'))defaults.add('read-decomposition-flow');
  if(ids.includes('context'))defaults.add('read-context-perspectives');
  if(ids.includes('use-template'))defaults.add('read-use-diagrams');
  return textbook.readings.filter(r=>defaults.has(r.id));
}
export function readingsForItem(item:StudyItem){
  if('scenario' in item){const ids=item.conceptIds.flatMap(id=>content.concepts.find(c=>c.id===id)?.subtopicId??[]);return readingsForSubtopics([...new Set(ids)]);}
  if('diagramType' in item)return readingsForSubtopics([item.diagramType==='context'?'context':'use-diagrams']);
  const text=(item.prompt+' '+(item.type==='short-answer'?item.modelAnswer:item.explanation)).toLowerCase();
  const focus=item.subtopicId==='xp'?(text.includes('refactor')&&!text.includes('pair')?'read-xp-refactoring':text.includes('pair programming')&&!text.includes('test-first')?'read-xp-pair':text.includes('test-first')&&!text.includes('pair')?'read-xp-testing':null):item.subtopicId==='applications'?(text.includes('compiler')||text.includes('language processing')?'read-applications-language':text.includes('transaction')&&!text.includes('payroll')?'read-applications-transactions':null):null;
  return focus?textbook.readings.filter(r=>r.id===focus):readingsForSubtopics([item.subtopicId]);
}
