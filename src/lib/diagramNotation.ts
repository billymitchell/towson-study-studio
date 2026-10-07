import type { GraphEdge } from '@/content/types';
export function arrowKind(edge:Pick<GraphEdge,'relation'|'directed'>){return !edge.directed?'none':edge.relation==='generalization'?'triangle':edge.relation==='context'?'closed':'open';}
export function edgeDash(edge:Pick<GraphEdge,'relation'>){return edge.relation==='include'||edge.relation==='extend'?'7 5':undefined;}
export function relationshipLabel(edge:Pick<GraphEdge,'relation'|'label'>){const label=edge.label.replace(/[«»]/g,'').trim();return (edge.relation==='include'||edge.relation==='extend')&&label?'«'+label+'»':label;}
export const relationHints:Record<GraphEdge['relation'],string>={
  context:'A context link shows a relationship to an external entity. Follow the exercise: use no arrow for an undirected relationship; a directed interaction points toward its target.',
  association:'An actor association connects an external role to a user goal. These exercises require a solid undirected line, with no arrowhead.',
  include:'Include represents required reused behavior. Use a dashed line with an open arrow from the including use case toward the included use case.',
  extend:'Extend represents conditional added behavior. Use a dashed line with an open arrow from the extending use case toward the base use case.',
  generalization:'Generalization points from the specialized element toward the general element. Use a solid line with a hollow triangular arrowhead.'
};
