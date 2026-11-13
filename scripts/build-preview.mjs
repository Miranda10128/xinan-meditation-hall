import {mkdir,copyFile,cp,readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const dest=path.resolve('_site');await mkdir(dest,{recursive:true});
const files=['index.html','style.css','app.js','config.js','engine.mjs','narration.mjs','people.mjs','presence.mjs','seat-projection.mjs','manifest.webmanifest','sw.js'];
const assets=['assets/vendor','assets/icon-192.png','assets/icon-512.png','assets/README.md','assets/music_bed.mp3','assets/qing.mp3',...['garden','wood-v2','linen','plant','plaster','rattan'].map(n=>`assets/morning-${n}.webp`),...Array.from({length:12},(_,i)=>`assets/narration/cue-${String(i).padStart(2,'0')}.mp3`),...[5,10,20,30].map(m=>`assets/narration/guided-practice-${m}min.mp3`),'assets/narration/voice-preview-90s.mp3'];
for(const file of [...files,...assets]){const target=path.join(dest,file);await mkdir(path.dirname(target),{recursive:true});await cp(file,target,{recursive:true});}
const id=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),updatedAt=new Date().toISOString();
await writeFile(path.join(dest,'version.json'),JSON.stringify({id,updatedAt}));
const html=await readFile(path.join(dest,'index.html'),'utf8');await writeFile(path.join(dest,'index.html'),html.replace('content="local" name="preview-release"',`content="${id}" name="preview-release"`));
console.log('Built phone preview with runtime files only.');
