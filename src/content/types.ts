import { z } from 'zod';

export const sourceIds = z.array(z.string().min(1)).min(1);
const provenance = z.enum(['PROFESSOR_SOURCE', 'SOURCE_DERIVED', 'AI_GENERATED']);
const priority = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
const skill = z.enum(['KNOW', 'UNDERSTAND', 'APPLY']);
const difficulty = z.enum(['Basic', 'Intermediate', 'Exam-Level', 'Challenge']);
const linked = { id: z.string().min(1), sourceIds };
const authored = { ...linked, provenance };
export const SourceSchema = z.object({ id: z.string(), file: z.string(), label: z.string(), page: z.number().int().positive(), role: z.string() });
export const TopicSchema = z.object({ ...linked, title: z.string(), reviewChapter: z.number().int().min(1).max(6), priority, formats: z.array(z.string()).min(1) });
export const SubtopicSchema = z.object({ ...linked, topicId: z.string(), title: z.string(), priority, formats: z.array(z.string()), objectives: z.array(z.object({ skill, text: z.string().min(1) })).min(1) });
export const ConceptSchema = z.object({ ...authored, subtopicId: z.string(), title: z.string(), definition: z.string().min(1), explanation: z.string().min(1), example: z.string().min(1), commonMistake: z.string().min(1), relatedConceptIds: z.array(z.string()), skills: z.array(skill) });
const question = { ...authored, version: z.number().int().positive().default(1), topicId: z.string(), subtopicId: z.string(), difficulty, prompt: z.string().min(1) };
const choices = { choices: z.array(z.string().min(1)).length(4), choiceIds: z.array(z.string().min(1)).length(4).default(['a','b','c','d']), explanation: z.string().min(1), distractorExplanations: z.array(z.string().min(1)).length(4) };
export const QuestionSchema = z.discriminatedUnion('type', [
  z.object({ ...question, ...choices, type: z.literal('multiple-choice'), answer: z.number().int().min(0).max(3) }),
  z.object({ ...question, ...choices, type: z.literal('multiple-answer'), correctChoiceIds: z.array(z.string().min(1)).min(2).max(3) }),
  z.object({ ...question, type: z.literal('short-answer'), modelAnswer: z.string().min(1), expectedConcepts: z.array(z.string().min(1)).min(1), rubric: z.array(z.string().min(1)).min(1) }),
]);
export const CaseSchema = z.object({ ...authored, title: z.string(), topicIds: z.array(z.string()).min(1), difficulty, scenario: z.string().min(1), prompts: z.array(z.string().min(1)).min(2), modelSolution: z.string().min(1), rubric: z.array(z.string().min(1)).min(1), commonMistakes: z.array(z.string()), conceptIds: z.array(z.string()).min(2), diagramExerciseId: z.string().optional() });
export const nodeKind = z.enum(['system', 'actor', 'external', 'usecase']);
export const relation = z.enum(['context', 'association', 'include', 'extend', 'generalization']);
const diagram = { ...authored, topicId: z.string(), title: z.string(), prompt: z.string().min(1), requiredElements: z.array(z.object({ id: z.string(), label: z.string(), kind: nodeKind, inside: z.boolean(), aliases: z.array(z.string()) })).min(1), requiredConnections: z.array(z.object({ source: z.string(), target: z.string(), label: z.string(), relation, directed: z.boolean() })).min(1), acceptableAlternatives: z.array(z.string()) };
export const DiagramSchema = z.discriminatedUnion('diagramType', [z.object({ ...diagram, diagramType: z.literal('context') }), z.object({ ...diagram, diagramType: z.literal('use-case') })]);
export type Source = z.infer<typeof SourceSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type Subtopic = z.infer<typeof SubtopicSchema>;
export type Concept = z.infer<typeof ConceptSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type CaseStudy = z.infer<typeof CaseSchema>;
export type DiagramExercise = z.infer<typeof DiagramSchema>;
export type Item = Question | CaseStudy;
export type ChoiceQuestion = Extract<Question, {type:'multiple-choice'|'multiple-answer'}>;
export const GraphNodeSchema = z.object({ id: z.string(), label: z.string(), kind: nodeKind, inside: z.boolean(), x: z.number().finite(), y: z.number().finite() });
export const GraphEdgeSchema = z.object({ id: z.string(), source: z.string(), target: z.string(), label: z.string(), relation, directed: z.boolean() });
export const GraphSchema = z.object({ nodes: z.array(GraphNodeSchema), edges: z.array(GraphEdgeSchema) });
export type Graph = z.infer<typeof GraphSchema>;
export type GraphNode = Graph['nodes'][number];
export type GraphEdge = Graph['edges'][number];
export const ConfidenceSchema = z.enum(['Low', 'Medium', 'High']);
export type Confidence = z.infer<typeof ConfidenceSchema>;
export const AnswerSchema = z.union([z.string(), z.number(), z.array(z.string()), GraphSchema]);
export type Answer = z.infer<typeof AnswerSchema>;
export const AttemptSchema = z.object({ id: z.string(), itemId: z.string(), topicId: z.string(), itemType: z.enum(['multiple-choice', 'multiple-answer', 'short-answer', 'case', 'diagram']), response: AnswerSchema, score: z.number().min(0).max(1), confidence: ConfidenceSchema, completedAt: z.string().datetime(), sourceIds, sessionId: z.string().optional(), itemVersion: z.number().int().positive().optional(), evaluation: z.enum(['objective','self']).optional() });
export type Attempt = z.infer<typeof AttemptSchema>;
export const SavedDiagramSchema = z.object({ id: z.string(), exerciseId: z.string(), topicId: z.string(), diagramType: z.enum(['context','use-case']), graph: GraphSchema, updatedAt: z.string().datetime(), sourceIds });
export type SavedDiagram = z.infer<typeof SavedDiagramSchema>;
export const StudyItemSchema = z.union([QuestionSchema, CaseSchema, DiagramSchema]);
export type StudyItem = z.infer<typeof StudyItemSchema>;
export const SessionDraftSchema = z.object({ response: AnswerSchema.default(''), confidence: ConfidenceSchema.nullable().default(null), parts: z.array(z.string()).default([]), selfScore: z.number().int().min(0).max(3).nullable().default(null), checked: z.array(z.string()).default([]) });
export type SessionDraft = z.infer<typeof SessionDraftSchema>;
export const SubmissionSchema = z.object({response:AnswerSchema,confidence:ConfidenceSchema,submittedAt:z.string().datetime(),score:z.number().min(0).max(1).nullable(),selfScore:z.number().int().min(0).max(3).nullable().default(null)});
export type Submission = z.infer<typeof SubmissionSchema>;
export const SessionSettingsSchema = z.object({topicId:z.string().default('all'),subtopicId:z.string().default('all'),filter:z.enum(['mixed','weak','missed']).default('mixed'),style:z.enum(['all','single','multiple']).default('all'),count:z.number().int().min(1).max(100).default(20),autoAdvance:z.boolean().default(true),target:z.number().int().min(0).max(100).default(70)});
export type SessionSettings = z.infer<typeof SessionSettingsSchema>;
export const StudySessionSchema = z.object({id:z.string().min(1),ownerId:z.literal('local'),mode:z.enum(['multiple-choice','short-answer','case','mock']),status:z.enum(['active','completed','abandoned']),items:z.array(StudyItemSchema).min(1).max(100),index:z.number().int().nonnegative(),drafts:z.record(z.string(),SessionDraftSchema),submissions:z.record(z.string(),SubmissionSchema),pausedItemIds:z.array(z.string()),settings:SessionSettingsSchema,createdAt:z.string().datetime(),updatedAt:z.string().datetime(),revision:z.number().int().nonnegative()});
export type StudySession = z.infer<typeof StudySessionSchema>;
