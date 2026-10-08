/* Study Studio offline shell. No third-party requests are cached. */
const CACHE='study-studio-reference-trends-v5';
const ROUTES=['/','/blueprint','/study','/study/diagrams','/practice/multiple-choice','/practice/short-answer','/practice/cases','/practice/diagrams','/progress','/mock-midterm','/cheat-sheet'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  for(const route of ROUTES){const response=await fetch(route,{cache:'reload'});if(!response.ok)throw new Error('Offline cache failed');await cache.put(route,response.clone());const html=await response.text();const urls=[...html.matchAll(/(?:src|href)="([^" ]*\/_next\/static\/[^" ]+)"/g)].map(m=>m[1].replaceAll('&amp;','&'));for(const url of new Set(urls)){if(!await cache.match(url)){const asset=await fetch(url);if(asset.ok)await cache.put(url,asset);}}}
  const font=await fetch('/fonts/Geist-Regular.ttf',{cache:'reload'});if(!font.ok)throw new Error('Offline font cache failed');await cache.put('/fonts/Geist-Regular.ttf',font);
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys()){if(key.startsWith('study-studio-')&&key!==CACHE)await caches.delete(key);}await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin)return;
  event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(request);if(response.ok&&(url.pathname.startsWith('/_next/static/')||url.pathname.startsWith('/sources/')||url.pathname.startsWith('/lessons/')||url.pathname.startsWith('/fonts/')))await cache.put(request,response.clone());return response;}catch{
    if(request.mode==='navigate'){const document=await cache.match(url.pathname);if(document)return document;}
    const cached=await cache.match(request);if(cached)return cached;return new Response('Unavailable offline. Open this resource while online first.',{status:503,headers:{'Content-Type':'text/plain'}});
  }})());
});
