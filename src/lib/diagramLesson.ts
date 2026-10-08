import { z } from 'zod';
import raw from '@/content/diagramLesson.json';
import { sourceMap } from './contentRepository';
const text=z.string().min(1),point=z.tuple([z.number().nonnegative(),z.number().nonnegative()]);
const message=z.object({from:text,to:text,label:text});
export const DiagramLessonSchema=z.object({
  id:text,title:text,intro:text,scopeNote:text,sourceIds:z.array(text).min(1),bridge:text,
  comparison:z.array(z.object({dimension:text,useCase:text,sequence:text})).min(1),
  sequence:z.object({title:text,subtitle:text,participants:z.array(z.object({id:text,label:text,x:z.number().nonnegative()})).length(3),messages:z.array(message.extend({id:text,explanation:text})).min(1),branches:z.array(z.object({id:text,label:text,guard:text,explanation:text,messages:z.array(message.extend({return:z.boolean()})).min(1)})).length(3),notation:z.array(text),sourceId:text,originalImage:text}),
  airline:z.object({title:text,subtitle:text,nodes:z.array(z.object({id:text,label:text,kind:z.enum(['actor','external','usecase']),x:z.number().nonnegative(),y:z.number().nonnegative()})).min(1),edges:z.array(z.object({from:text,to:text,relation:z.enum(['association','generalization','include']),route:z.array(point).min(2).optional(),labelX:z.number().optional(),labelY:z.number().optional()})),explorations:z.array(z.object({id:text,label:text,nodeIds:z.array(text),explanation:text})).min(1),sourceNote:text,sourceId:text,originalImage:text}),
  checks:z.array(z.object({id:text,prompt:text,choices:z.array(text).min(2),answer:z.number().int().nonnegative(),explanation:text})).min(1),
});
export function validateDiagramLesson(input:unknown){
  const lesson=DiagramLessonSchema.parse(input);
  const unique=(ids:string[])=>{if(new Set(ids).size!==ids.length)throw new Error('Duplicate lesson ID');return new Set(ids);};
  const participants=unique(lesson.sequence.participants.map(p=>p.id)),nodes=unique(lesson.airline.nodes.map(n=>n.id));
  for(const id of [...lesson.sourceIds,lesson.sequence.sourceId,lesson.airline.sourceId])if(!sourceMap.has(id))throw new Error('Unknown lesson source');
  unique(lesson.sequence.messages.map(m=>m.id));unique(lesson.sequence.branches.map(b=>b.id));unique(lesson.airline.explorations.map(e=>e.id));unique(lesson.checks.map(c=>c.id));
  for(const m of [...lesson.sequence.messages,...lesson.sequence.branches.flatMap(b=>b.messages)])if(!participants.has(m.from)||!participants.has(m.to))throw new Error('Unknown sequence participant');
  for(const e of lesson.airline.edges){if(!nodes.has(e.from)||!nodes.has(e.to))throw new Error('Unknown airline endpoint');if(e.relation==='include'&&(e.labelX===undefined||e.labelY===undefined))throw new Error('Missing include label position');}
  for(const e of lesson.airline.explorations)if(e.nodeIds.some(id=>!nodes.has(id)))throw new Error('Unknown highlighted node');
  for(const c of lesson.checks)if(c.answer>=c.choices.length)throw new Error('Invalid lesson answer');
  return lesson;
}
export const diagramLesson=validateDiagramLesson(raw);
export type AirlineNode=z.infer<typeof DiagramLessonSchema>['airline']['nodes'][number];
