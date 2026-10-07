import type { DiagramExercise, Graph } from '@/content/types';
const normalize = (label: string) => label.toLowerCase().replace(/[<>«»]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
export function gradeDiagram(exercise: DiagramExercise, graph: Graph) {
  const feedback: string[] = []; let earned=0;
  const nodeIssues:Record<string,string[]>={},edgeIssues:Record<string,string[]>={};
  const flag=(issues:Record<string,string[]>,id:string,message:string)=>{(issues[id]??=[]).push(message);};
  const matches = new Map<string,string>();
  const used = new Set<string>();
  for(const required of exercise.requiredElements) {
    const labels=[required.label,...required.aliases].map(normalize);
    const actual=graph.nodes.find(n=>!used.has(n.id)&&labels.includes(normalize(n.label)));
    if(!actual) { feedback.push(`Missing element: ${required.label}.`); continue; }
    used.add(actual.id); matches.set(required.id,actual.id); earned++;
    if(actual.kind!==required.kind){feedback.push(`Wrong type for ${required.label}: use ${required.kind}.`);flag(nodeIssues,actual.id,`Use ${required.kind}.`);}else earned++;
    if(actual.inside!==required.inside){feedback.push(`Boundary: ${required.label} belongs ${required.inside?'inside':'outside'} the system.`);flag(nodeIssues,actual.id,`Move ${required.inside?'inside':'outside'} the boundary.`);}else earned++;
  }
  const usedEdges = new Set<string>();
  for(const required of exercise.requiredConnections) {
    const from=matches.get(required.source), to=matches.get(required.target);
    const actual=graph.edges.find(e=>!usedEdges.has(e.id)&&from&&to&&((e.source===from&&e.target===to)||(e.source===to&&e.target===from)));
    const name=`${exercise.requiredElements.find(n=>n.id===required.source)?.label} ${required.directed?'→':'—'} ${exercise.requiredElements.find(n=>n.id===required.target)?.label}`;
    if(!actual){feedback.push(`Missing connection: ${name}.`);continue;}
    usedEdges.add(actual.id);earned++;
    if(actual.relation!==required.relation){feedback.push(`Wrong relation for ${name}: use ${required.relation}.`);flag(edgeIssues,actual.id,`Use ${required.relation}.`);}else earned++;
    if(actual.directed!==required.directed || (required.directed&&actual.source!==from)){feedback.push(`Wrong direction for ${name}: ${required.directed?'point toward the target':'use an undirected link'}.`);flag(edgeIssues,actual.id,required.directed?'Point toward '+exercise.requiredElements.find(n=>n.id===required.target)?.label+'.':'Use an undirected link.');}else earned++;
    if(normalize(actual.label)!==normalize(required.label)){feedback.push(`Wrong label for ${name}: use ${required.label}.`);flag(edgeIssues,actual.id,`Label ${required.label}.`);}else earned++;
  }
  graph.nodes.filter(n=>!used.has(n.id)).forEach(n=>{feedback.push(`Extra element outside this exercise: ${n.label}.`);flag(nodeIssues,n.id,'Extra element.');});
  graph.edges.filter(e=>!usedEdges.has(e.id)).forEach(e=>{feedback.push(`Extra or duplicate connection: ${e.label||e.id}.`);flag(edgeIssues,e.id,'Extra or duplicate connection.');});
  const total=exercise.requiredElements.length*3+exercise.requiredConnections.length*4;
  const penalty=(graph.nodes.length-used.size)+(graph.edges.length-usedEdges.size);
  const score=Math.max(0,(earned-penalty)/total);
  return {score,nodeIssues,edgeIssues,feedback:feedback.length?feedback:['All authored semantic criteria met. Layout does not affect the score.']};
}
export function exampleGraph(exercise: DiagramExercise): Graph {
  return { nodes: exercise.requiredElements.map((n,i)=>({id:n.id,label:n.label,kind:n.kind,inside:n.inside,x:n.inside?340:50,y:65+i*95})), edges: exercise.requiredConnections.map((e,i)=>({...e,id:`example-${i}`})) };
}
