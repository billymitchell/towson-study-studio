import { z } from 'zod';
import { SourceSchema, TopicSchema, SubtopicSchema, ConceptSchema, QuestionSchema, CaseSchema, DiagramSchema } from './types';
export const ContentSchema = z.object({ sources: z.array(SourceSchema), topics: z.array(TopicSchema), subtopics: z.array(SubtopicSchema), concepts: z.array(ConceptSchema), questions: z.array(QuestionSchema), cases: z.array(CaseSchema), diagrams: z.array(DiagramSchema) });
export function validateContent(input: unknown) {
  const data = ContentSchema.parse(input);
  const ids = (records: {id:string}[]) => {
    const set = new Set(records.map(r => r.id));
    if (set.size !== records.length) throw new Error('Duplicate content ID');
    return set;
  };
  const sources = ids(data.sources), topics = ids(data.topics), subs = ids(data.subtopics), concepts = ids(data.concepts), diagrams = ids(data.diagrams);
  ids([...data.questions, ...data.cases, ...data.diagrams]);
  const requireId = (id: string, set: Set<string>) => { if (!set.has(id)) throw new Error(`Unknown reference: ${id}`); };
  for (const record of [...data.topics,...data.subtopics,...data.concepts,...data.questions,...data.cases,...data.diagrams]) {
    record.sourceIds.forEach(id => requireId(id,sources));
    if (!record.sourceIds.includes('MR-P1')) throw new Error(`Missing scope authority: ${record.id}`);
    if ('provenance' in record && !record.sourceIds.some(id=>id.startsWith('L'))) throw new Error(`Missing lecture source: ${record.id}`);
  }
  data.subtopics.forEach(s=>requireId(s.topicId,topics));
  data.concepts.forEach(c=>{ requireId(c.subtopicId,subs); c.relatedConceptIds.forEach(id=>requireId(id,concepts)); });
  data.questions.forEach(q=>{
    requireId(q.topicId,topics); requireId(q.subtopicId,subs);
    if (data.subtopics.find(s=>s.id===q.subtopicId)?.topicId!==q.topicId) throw new Error('Question hierarchy mismatch');
    if(q.type!=='short-answer'){
      if(new Set(q.choices).size!==4 || new Set(q.choiceIds).size!==4) throw new Error('Duplicate MCQ choices or IDs');
      if(q.type==='multiple-answer' && (new Set(q.correctChoiceIds).size!==q.correctChoiceIds.length || q.correctChoiceIds.some(id=>!q.choiceIds.includes(id)))) throw new Error('Invalid multiple-answer key');
    }
  });
  data.cases.forEach(c=>{ c.topicIds.forEach(id=>requireId(id,topics)); c.conceptIds.forEach(id=>requireId(id,concepts)); if(c.diagramExerciseId) requireId(c.diagramExerciseId,diagrams); });
  data.diagrams.forEach(d=>{
    requireId(d.topicId,topics); const nodes=ids(d.requiredElements);
    d.requiredConnections.forEach(e=>{requireId(e.source,nodes);requireId(e.target,nodes);});
    if(d.diagramType==='context' && d.requiredElements.some(n=>n.kind==='usecase')) throw new Error('Context exercise contains use case');
  });
  if (data.topics.length!==6 || data.subtopics.length!==22) throw new Error('Incomplete six-chapter, 22-row blueprint');
  for(const s of data.subtopics) if(!data.concepts.some(c=>c.subtopicId===s.id)||!data.questions.some(q=>q.subtopicId===s.id)) throw new Error(`Missing coverage: ${s.id}`);
  return data;
}
