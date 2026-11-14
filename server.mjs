import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';import {RoomStore} from './server/rooms.mjs';
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.mp3':'audio/mpeg','.mp4':'video/mp4','.webm':'video/webm','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json'};
function json(res,status,body){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(body));}
async function body(req){let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>4096)throw Object.assign(new Error('body_too_large'),{status:413})}try{const parsed=text?JSON.parse(text):{};if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))throw new Error('invalid_body');return parsed}catch{throw Object.assign(new Error('invalid_json'),{status:400})}}
const bearer=req=>/^Bearer ([a-f0-9-]{36})$/i.exec(req.headers.authorization||'')?.[1]||'';
export function createHallServer({store=new RoomStore(),root=ROOT}={}){
 const streams=new Set();const timer=setInterval(()=>store.sweep(),20000);timer.unref();
 const server=http.createServer(async(req,res)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','SAMEORIGIN');
 try{const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/presence/')){
   if(req.headers.origin){const origin=new URL(req.headers.origin);if(origin.host!==req.headers.host){json(res,403,{error:'origin_not_allowed'});return}}
   const action=url.pathname.slice('/api/presence/'.length);
   if(action==='events'&&req.method==='GET'){
    const token=url.searchParams.get('token')||'';if(!store.get(token)){json(res,401,{error:'session_expired'});return}
    res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});res.flushHeaders();
    const send=s=>{if(!res.destroyed)res.write(`event: room\ndata: ${JSON.stringify(s)}\n\n`)};send(store.snapshot(token));const unsubscribe=store.subscribe(token,send);streams.add(res);const ping=setInterval(()=>{if(!res.destroyed)res.write(': keepalive\n\n')},20000);ping.unref();req.on('close',()=>{clearInterval(ping);unsubscribe?.();streams.delete(res)});return;
   }
   if(req.method!=='POST'){json(res,405,{error:'method_not_allowed'});return}
   const input=await body(req);
   if(action==='join'){json(res,200,store.join(input.name));return}
   const token=bearer(req)||(action==='leave'?input.token:'');
   if(action==='heartbeat'){json(res,store.heartbeat(token)?200:401,{ok:!!store.get(token)});return}
   if(action==='seat'){const result=store.claim(token,input.seat,input.name);json(res,result.status,result.snapshot||{error:result.error});return}
   if(action==='stand'){const ok=store.stand(token);json(res,ok?200:401,{ok});return}
   if(action==='leave'){const ok=store.leave(token);json(res,200,{ok});return}
   json(res,404,{error:'not_found'});return;
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return}
  const decoded=decodeURIComponent(url.pathname);if(decoded.includes('\0')||decoded.split(/[\\/]/).some(s=>s.startsWith('.'))){res.writeHead(404).end();return}
  let file=path.resolve(root,'.'+decoded);if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end();return}
  // Only the application and its runtime assets are served, never build scripts or private files.
  const relative=path.relative(root,file).replaceAll('\\','/');if(relative&&relative.includes('/')&&!relative.startsWith('assets/')){res.writeHead(404).end();return}
  const allowed=new Set(['','index.html','style.css','app.js','config.js','engine.mjs','narration.mjs','people.mjs','plants.mjs','presence.mjs','seat-projection.mjs','sw.js','manifest.webmanifest']);if(!relative.startsWith('assets/')&&!allowed.has(relative)){res.writeHead(404).end();return}
  if(file===root)file=path.join(root,'index.html');let stat;try{stat=fs.statSync(file)}catch{res.writeHead(404).end();return}if(!stat.isFile()){res.writeHead(404).end();return}
  if(!MIME[path.extname(file)]||relative.includes('/build/')){res.writeHead(404).end();return}res.setHeader('Content-Type',MIME[path.extname(file)]);res.setHeader('Cache-Control','no-cache');
  if(path.basename(file)==='index.html'){const html=fs.readFileSync(file,'utf8').replace('data-server-presence="false"','data-server-presence="true"');res.writeHead(200);res.end(req.method==='HEAD'?'':html);return}
  const range=req.headers.range;if(range){const match=/^bytes=(\d+)-(\d*)$/.exec(range);if(!match){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return}const start=Number(match[1]),end=match[2]?Math.min(Number(match[2]),stat.size-1):stat.size-1;if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return}res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});if(req.method==='HEAD')res.end();else fs.createReadStream(file,{start,end}).pipe(res);return}
  res.writeHead(200,{'Content-Length':stat.size,'Accept-Ranges':'bytes'});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
 }catch(e){if(!res.headersSent)json(res,e.status||500,{error:e.status?e.message:'server_error'});else res.end()}});
 server.on('close',()=>{clearInterval(timer);for(const res of streams)res.end()});
 return server;
}
if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url){const server=createHallServer();const port=Number(process.env.PORT||4193);server.listen(port,process.env.HOST||'127.0.0.1',()=>console.log(`Xinan shared hall ready on port ${port}`));}
