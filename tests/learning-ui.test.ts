import { describe,expect,it } from 'vitest';
import { content } from '@/lib/contentRepository';
import { textbook,validateTextbook,readingHref,readingsForItem,readingsForSubtopics } from '@/lib/textbook';
import { arrowKind,edgeDash,relationshipLabel } from '@/lib/diagramNotation';
import { exampleGraph,gradeDiagram } from '@/lib/diagramGrader';
const clone=<T,>(v:T):T=>JSON.parse(JSON.stringify(v));
describe('precise textbook locators',()=>{
  it('covers every blueprint row, question, case and exercise without page-one placeholders',()=>{
    expect(textbook.readings).toHaveLength(29);
    for(const s of content.subtopics)expect(readingsForSubtopics([s.id]).length).toBeGreaterThan(0);
    for(const item of [...content.questions,...content.cases,...content.diagrams]){
      const readings=readingsForItem(item);expect(readings.length).toBeGreaterThan(0);
      for(const r of readings){expect(r.pdfStart).toBeGreaterThan(1);expect(readingHref(r)).toContain('#page='+r.pdfStart);expect(readingHref(r,true)).toContain('#page='+r.indexPdfPage);}
    }
    expect(content.sources.filter(s=>s.id.startsWith('TB-')).every(s=>s.page>1)).toBe(true);
  });
  it('maps course architecture/modeling to the correct textbook chapters and identifies supplemental terminology',()=>{
    expect(readingsForSubtopics(['views'])[0]).toMatchObject({chapter:6,section:'6.2',printedStart:173,pdfStart:174});
    expect(readingsForSubtopics(['use-template'])[0]).toMatchObject({chapter:4,section:'4.4.3',printedStart:125,pdfStart:126});
    expect(readingsForSubtopics(['four-ps'])[0].note).toContain('lecture');
    expect(readingsForSubtopics(['context']).some(r=>r.chapter===5)).toBe(true);
  });
  it('narrows applicable question references and deduplicates integrated case topics',()=>{
    const q=content.questions.find(q=>q.prompt==='What does refactoring do in XP (Extreme Programming)?')!;
    expect(readingsForItem(q)[0]).toMatchObject({section:'3.2.2',printedStart:80});
    for(const c of content.cases){const r=readingsForItem(c);expect(new Set(r.map(x=>x.id)).size).toBe(r.length);}
  });
  it('rejects unknown topics, duplicate IDs and invalid ranges',()=>{
    const bad=clone(textbook);bad.readings[0].pdfStart=813;expect(()=>validateTextbook(bad)).toThrow('range');
    bad.readings[0]=clone(textbook.readings[0]);bad.readings[0].subtopicId='missing';expect(()=>validateTextbook(bad)).toThrow('mapping');
    bad.readings[0]=clone(textbook.readings[1]);expect(()=>validateTextbook(bad)).toThrow('mapping');
  });
});
describe('semantic direction and comparison',()=>{
  it('uses open include/extend arrows, hollow generalization triangles, and no arrows on undirected links',()=>{
    expect(arrowKind({relation:'include',directed:true})).toBe('open');expect(arrowKind({relation:'extend',directed:true})).toBe('open');
    expect(arrowKind({relation:'generalization',directed:true})).toBe('triangle');expect(arrowKind({relation:'context',directed:true})).toBe('closed');
    for(const relation of ['context','association','include','extend','generalization'] as const)expect(arrowKind({relation,directed:false})).toBe('none');
    expect(edgeDash({relation:'include'})).toBe('7 5');expect(edgeDash({relation:'generalization'})).toBeUndefined();expect(relationshipLabel({relation:'include',label:'include'})).toBe('«include»');
  });
  it('identifies learner errors for highlighting without changing either graph',()=>{
    const ex=content.diagrams[1],learner=exampleGraph(ex);learner.nodes[0].inside=true;const edge=learner.edges[2];[edge.source,edge.target]=[edge.target,edge.source];edge.label='extend';
    const before=clone(learner),key=clone(ex),grade=gradeDiagram(ex,learner);
    expect(grade.nodeIssues[learner.nodes[0].id].join(' ')).toContain('outside');expect(grade.edgeIssues[edge.id].join(' ')).toContain('Point toward Check availability');expect(grade.edgeIssues[edge.id].join(' ')).toContain('Label include');
    expect(learner).toEqual(before);expect(ex).toEqual(key);expect(gradeDiagram(ex,exampleGraph(ex)).score).toBe(1);
  });
  it('marks extras and duplicate connections while tolerating aliases and undirected endpoint order',()=>{
    const ex=content.diagrams[0],g=exampleGraph(ex);g.nodes[0].label='Portal';[g.edges[0].source,g.edges[0].target]=[g.edges[0].target,g.edges[0].source];
    expect(gradeDiagram(ex,g).nodeIssues).toEqual({});expect(gradeDiagram(ex,g).score).toBe(1);
    g.edges.push({...g.edges[0],id:'extra'});expect(gradeDiagram(ex,g).edgeIssues.extra).toContain('Extra or duplicate connection.');
  });
});
