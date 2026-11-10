// 素材替换后递增 VERSION，以刷新已安装设备缓存。
const VERSION='xinan-v1-3';
const CORE=['./','index.html','style.css','app.js','config.js','engine.mjs','manifest.webmanifest','assets/hall.jpg','assets/icon-192.png','assets/icon-512.png',...Array.from({length:4},(_,i)=>`assets/stretch_${i+1}.png`)];
self.addEventListener('install',event=>event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(CORE))));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('xinan-')&&key!==VERSION)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(VERSION),plain=new Request(request.url),cached=await cache.match(plain);
  // 缓存完整音频，再响应 Safari 的字节范围请求；不缓存不完整的 206。
  if(url.pathname.endsWith('.mp3')){
   let response=cached;
   if(!response){try{response=await fetch(plain);if(response.status===200)await cache.put(plain,response.clone());}catch{return new Response('音频尚未缓存',{status:503});}}
   const range=request.headers.get('range');
   if(range&&response.status===200){const bytes=await response.arrayBuffer(),m=/^bytes=(\d*)-(\d*)$/.exec(range);if(!m)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});const start=m[1]?Number(m[1]):Math.max(0,bytes.byteLength-Number(m[2]));const end=m[1]&&m[2]?Math.min(Number(m[2]),bytes.byteLength-1):bytes.byteLength-1;if(start>end||start>=bytes.byteLength)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${bytes.byteLength}`}});return new Response(bytes.slice(start,end+1),{status:206,headers:{'Content-Type':'audio/mpeg','Accept-Ranges':'bytes','Content-Length':String(end-start+1),'Content-Range':`bytes ${start}-${end}/${bytes.byteLength}`}});}
   return response;
  }
  if(cached)return cached;
  try{return await fetch(request);}catch{return new Response('暂时离线，请首次联网打开禅修堂。',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});}
 })());
});
