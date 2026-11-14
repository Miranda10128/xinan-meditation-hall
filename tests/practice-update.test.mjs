import test from 'node:test';import assert from 'node:assert/strict';
import {breathingFrame} from '../breathing.mjs';
import {createMusicPlaylist,meditationTracks,bridgeMediaPause} from '../music-playlist.mjs';
import {RoomStore} from '../server/rooms.mjs';
import {declutterSeatLabels} from '../seat-projection.mjs';
import {createCurtains} from '../atmosphere.mjs';
import {Scene} from '../assets/vendor/three.module.js';
import {createHallServer} from '../server.mjs';

test('breath word, countdown and expansion share the same four-in six-out clock',()=>{
 const start=breathingFrame(0),middle=breathingFrame(2000),out=breathingFrame(4000),end=breathingFrame(9999),next=breathingFrame(10000);
 assert.equal(start.word,'吸气');assert.equal(start.remaining,4);assert.equal(middle.remaining,2);assert.ok(middle.scale>start.scale);
 assert.equal(out.word,'呼气');assert.equal(out.remaining,6);assert.equal(out.scale,1.12);assert.equal(end.remaining,1);assert.ok(end.scale<out.scale);assert.deepEqual(next,start);
 assert.deepEqual(breathingFrame(2371),breathingFrame(2371));assert.equal(breathingFrame(-1).remaining,4);
});
class FakeAudio{constructor(){this.events={};this.src='';this.loop=true;}pause(){}addEventListener(name,fn){this.events[name]=fn}}
class EventAudio extends FakeAudio{constructor(){super();this.paused=false}pause(){if(this.paused)return;this.paused=true;queueMicrotask(()=>this.events.pause?.())}}
test('external audio pauses notify the practice, while application pauses do not',async()=>{
 const audio=new EventAudio();let interruptions=0;const pause=bridgeMediaPause(audio,()=>interruptions++);
 pause();await Promise.resolve();assert.equal(interruptions,0);
 pause();audio.paused=false;audio.pause();await Promise.resolve();assert.equal(interruptions,1);
 audio.paused=false;audio.pause();await Promise.resolve();assert.equal(interruptions,2);
});
test('playlist track changes use the guarded pause instead of appearing as interruptions',async()=>{
 const audio=new EventAudio();let interruptions=0;const pause=bridgeMediaPause(audio,()=>interruptions++);
 const playlist=createMusicPlaylist({audio,pauseAudio:pause});playlist.beginVisit();await Promise.resolve();audio.paused=false;playlist.next();await Promise.resolve();assert.equal(interruptions,0);
 audio.paused=false;audio.pause();await Promise.resolve();assert.equal(interruptions,1);
});
test('music changes between visits and finishes each shuffled set before repeating',()=>{
 const audio=new FakeAudio();let last='fresh-air';const playlist=createMusicPlaylist({audio,random:()=>.2,getLast:()=>last,remember:id=>last=id});
 const first=playlist.beginVisit();assert.notEqual(first.id,'fresh-air');assert.equal(audio.loop,false);
 const ids=[first.id,...Array.from({length:3},()=>playlist.next().id)];assert.equal(new Set(ids).size,meditationTracks.length);
 const previous=playlist.current.id;assert.notEqual(playlist.next().id,previous);
 const old=playlist.current.id,newStart=playlist.beginVisit().id;assert.notEqual(newStart,old);assert.notEqual(newStart,first.id);
});
test('ended advances the playlist but only requests playback while the practice is audible and active',()=>{
 const audio=new FakeAudio();let active=false,plays=0;const playlist=createMusicPlaylist({audio,shouldPlay:()=>active,onPlayRequested:()=>plays++});
 const first=playlist.beginVisit().id;audio.events.ended();assert.notEqual(playlist.current.id,first);assert.equal(plays,0);active=true;audio.events.ended();assert.equal(plays,1);
});
test('one hall holds 36 participants before opening a separate peaceful room',()=>{
 const store=new RoomStore();const people=Array.from({length:36},(_,i)=>store.join('同修'+i));
 assert.equal(new Set(people.map(p=>p.roomId)).size,1);
 for(let i=0;i<people.length;i++)assert.equal(store.claim(people[i].token,i+1).status,200);
 const snapshot=store.snapshot(people[0].token);assert.equal(snapshot.capacity,36);assert.equal(snapshot.seated,36);assert.equal(new Set(snapshot.seats.map(s=>s.seat)).size,36);
 assert.equal(store.claim(people[0].token,37).status,400);assert.notEqual(store.join('下一堂').roomId,people[0].roomId);
});

test('dense projected seat labels never overlap and preserve the selected seat identity',()=>{
 const points=Array.from({length:108},(_,i)=>({seat:{id:i+1},left:25+(i%12)*13,top:100+Math.floor(i/12)*15,visible:true}));
 const visible=declutterSeatLabels(points).filter(p=>p.visible);assert.ok(visible.length<points.length&&visible.length>1);
 for(let i=0;i<visible.length;i++)for(let j=i+1;j<visible.length;j++)assert.ok(Math.abs(visible[i].left-visible[j].left)>=44||Math.abs(visible[i].top-visible[j].top)>=39);
 assert.ok(visible.every(p=>points.find(original=>original.seat.id===p.seat.id).left===p.left));
});
test('sheer curtains have readable folded cloth and doubled fabric hems',()=>{
 const {panels}=createCurtains(new Scene(),null);assert.equal(panels.length,8);
 for(const {mesh} of panels){assert.ok(mesh.material.transparent&&mesh.material.opacity>0&&mesh.material.opacity<1);assert.equal(mesh.material.depthWrite,false);assert.equal(mesh.children.length,1);assert.ok(mesh.children[0].material.opacity>mesh.material.opacity);assert.equal(mesh.geometry.attributes.position,mesh.children[0].geometry.attributes.position);}
});

test('108 concurrent HTTP participants are distributed across three 36-seat rooms',async()=>{
 const server=createHallServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;
 const post=async(action,data,token='')=>{const response=await fetch(base+'/api/presence/'+action,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(data)});return {status:response.status,data:await response.json()}};
 try{const joins=await Promise.all(Array.from({length:108},(_,i)=>post('join',{name:'并发'+i})));assert.ok(joins.every(r=>r.status===200));assert.equal(new Set(joins.map(r=>r.data.roomId)).size,3);
  const counts=new Map();const claims=await Promise.all(joins.map(join=>{const room=join.data.roomId,seat=(counts.get(room)||0)+1;counts.set(room,seat);return post('seat',{seat},join.data.token)}));
  assert.ok([...counts.values()].every(n=>n===36));assert.ok(claims.every(r=>r.status===200));assert.equal(Math.max(...claims.map(r=>r.data.seated)),36);assert.ok(claims.every(r=>r.data.capacity===36));
  const conflict=await post('seat',{seat:36},joins[0].data.token);assert.equal(conflict.status,409);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
