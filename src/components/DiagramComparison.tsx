import type { DiagramExercise, Graph } from '@/content/types';
import { exampleGraph, gradeDiagram } from '@/lib/diagramGrader';
import { GraphPreview } from './GraphPreview';
export function DiagramComparison({exercise,learner}:{exercise:DiagramExercise;learner:Graph}){
  const grade=gradeDiagram(exercise,learner);
  return <section className="diagram-comparison" aria-label="Diagram solution comparison"><h3>Compare with the correct diagram</h3><p>The authored solution meets this exercise’s criteria. Red outlines and ✕ notes identify issues in your submitted work; missing elements and connections are listed below.</p><div className="diagram-comparison-grid"><GraphPreview title="Your submitted diagram" graph={learner} nodeIssues={grade.nodeIssues} edgeIssues={grade.edgeIssues}/><GraphPreview title="Correct diagram" graph={exampleGraph(exercise)}/></div><div className="diagram-comparison-feedback"><h4>What to review</h4><ul>{grade.feedback.map(f=><li key={f}>{f}</li>)}</ul></div><p className="muted">Equivalent labels and different layouts are accepted. Compare elements, boundaries, and relationships rather than exact positions.</p></section>;
}
