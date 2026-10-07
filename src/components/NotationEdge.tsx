'use client';
import { useId } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps, type Edge } from '@xyflow/react';
import type { GraphEdge } from '@/content/types';
import { arrowKind, edgeDash, relationshipLabel } from '@/lib/diagramNotation';
import { DiagramMarkers } from './DiagramMarkers';
type SemanticEdge=Edge<{relation:GraphEdge['relation'];directed:boolean;rawLabel:string}>;
export function NotationEdge(props:EdgeProps<SemanticEdge>){
  const prefix='edge-'+useId().replace(/[^a-zA-Z0-9_-]/g,''),data=props.data??{relation:'association',directed:false,rawLabel:''};
  const edge={relation:data.relation,directed:data.directed,label:data.rawLabel},kind=arrowKind(edge),[path,x,y]=getBezierPath(props);
  return <><DiagramMarkers prefix={prefix}/><BaseEdge id={props.id} path={path} markerEnd={kind==='none'?undefined:'url(#'+prefix+'-'+kind+')'} label={relationshipLabel(edge)} labelX={x} labelY={y} labelStyle={{fill:'var(--tu-black)',fontSize:12,fontWeight:600}} labelBgStyle={{fill:'var(--tu-white)'}} labelBgPadding={[6,4]} style={{stroke:'var(--tu-graphite)',strokeWidth:props.selected?3:2,strokeDasharray:edgeDash(edge)}}/></>;
}
