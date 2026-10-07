'use client';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
export function HelpTip({label,children}:{label:string;children:React.ReactNode}){
  const id=useId(),trigger=useRef<HTMLButtonElement>(null),tip=useRef<HTMLDivElement>(null),focused=useRef(false),pinned=useRef(false),hovered=useRef(false);
  const closeTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const [open,setOpen]=useState(false),[position,setPosition]=useState({left:16,top:16,width:300});
  useLayoutEffect(()=>{
    if(!open)return;
    const update=()=>{const rect=trigger.current?.getBoundingClientRect();if(!rect)return;const width=Math.min(320,window.innerWidth-32),height=tip.current?.offsetHeight??120;setPosition({width,left:Math.max(16,Math.min(rect.left,window.innerWidth-width-16)),top:rect.bottom+height+16>window.innerHeight?Math.max(16,rect.top-height-8):rect.bottom+8});};
    update();window.addEventListener('resize',update);window.addEventListener('scroll',update,true);return()=>{window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true);};
  },[open]);
  useEffect(()=>{
    if(!open)return;
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){pinned.current=false;setOpen(false);}};
    const outside=(e:PointerEvent)=>{if(!trigger.current?.contains(e.target as Node)&&!tip.current?.contains(e.target as Node)){pinned.current=false;setOpen(false);}};
    document.addEventListener('keydown',key);document.addEventListener('pointerdown',outside);return()=>{document.removeEventListener('keydown',key);document.removeEventListener('pointerdown',outside);};
  },[open]);
  useEffect(()=>()=>{if(closeTimer.current)clearTimeout(closeTimer.current);},[]);
  function show(){if(closeTimer.current)clearTimeout(closeTimer.current);setOpen(true);}
  function leave(){if(!focused.current&&!pinned.current&&!hovered.current){if(closeTimer.current)clearTimeout(closeTimer.current);closeTimer.current=setTimeout(()=>{if(!focused.current&&!pinned.current&&!hovered.current)setOpen(false);},180);}}
  return <span className="help-control"><button ref={trigger} type="button" className="help-trigger" aria-label={'Help: '+label} aria-describedby={open?id:undefined} aria-expanded={open} aria-controls={open?id:undefined} onMouseEnter={()=>{hovered.current=true;show();}} onMouseLeave={()=>{hovered.current=false;leave();}} onFocus={()=>{focused.current=true;show();}} onBlur={()=>{focused.current=false;pinned.current=false;leave();}} onClick={()=>{pinned.current=!pinned.current;setOpen(pinned.current);}}>?</button>{open&&createPortal(<div ref={tip} id={id} role="tooltip" className="help-popover" style={position} onMouseEnter={()=>{hovered.current=true;show();}} onMouseLeave={()=>{hovered.current=false;leave();}}><strong>{label}</strong><div>{children}</div></div>,document.getElementById('main')??document.body)}</span>;
}
