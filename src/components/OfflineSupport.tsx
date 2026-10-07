'use client';
import { useEffect, useState } from 'react';
export function OfflineSupport(){
  const [offline,setOffline]=useState(false);
  useEffect(()=>{
    const sync=()=>setOffline(!navigator.onLine);sync();window.addEventListener('online',sync);window.addEventListener('offline',sync);
    // Offline navigation uses complete cached documents instead of a fresh RSC request.
    const navigate=(e:MouseEvent)=>{if(navigator.onLine||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const a=(e.target as HTMLElement).closest('a');if(a&&a.origin===location.origin&&!a.target&&a.pathname!==location.pathname){e.preventDefault();e.stopPropagation();location.assign(a.href);}};
    document.addEventListener('click',navigate,true);
    if(process.env.NODE_ENV==='production'&&'serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});
    return()=>{window.removeEventListener('online',sync);window.removeEventListener('offline',sync);document.removeEventListener('click',navigate,true);};
  },[]);
  return offline?<div className="offline-banner" role="status">Offline · study and practice remain available from the cached app. Source PDFs are available offline only after opening them online.</div>:null;
}
