export function DiagramMarkers({prefix,color='var(--tu-graphite)'}:{prefix:string;color?:string}){
  return <defs>{(['open','closed','triangle'] as const).map(kind=><marker key={kind} id={prefix+'-'+kind} viewBox="0 0 14 14" refX="13" refY="7" markerWidth="17" markerHeight="17" markerUnits="userSpaceOnUse" orient="auto"><path d={'M 1 1 L 13 7 L 1 13'+(kind==='open'?'':' Z')} fill={kind==='triangle'?'var(--tu-white)':kind==='closed'?color:'none'} stroke={color} strokeWidth="1.8" strokeLinejoin="round"/></marker>)}</defs>;
}
