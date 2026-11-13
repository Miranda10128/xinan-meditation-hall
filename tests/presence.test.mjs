import test from 'node:test';import assert from 'node:assert/strict';import {RoomStore} from '../server/rooms.mjs';import {createHallServer} from '../server.mjs';
test('one seat cannot be occupied by two visitors',()=>{const r=new RoomStore(),a=r.join('听风'),b=r.join('看云');assert.equal(r.claim(a.token,8).status,200);assert.equal(r.claim(b.token,8).status,409);assert.equal(r.snapshot(b.token).seats[0].person.name,'听风');});
test('moving and standing release only the visitor’s own seat',()=>{const r=new RoomStore(),a=r.join('听风'),b=r.join('看云');r.claim(a.token,2);r.claim(b.token,3);r.claim(a.token,4);assert.deepEqual(r.snapshot(a.token).seats.map(s=>s.seat),[3,4]);r.stand(a.token);assert.deepEqual(r.snapshot(b.token).seats.map(s=>s.seat),[3]);assert.equal(r.claim(a.id,3).status,401);});
test('expired visitors release their seats',()=>{let now=0;const r=new RoomStore({ttlMs:1000,now:()=>now}),a=r.join('听风');r.claim(a.token,2);now=1001;r.sweep();const b=r.join('看云');assert.equal(r.claim(b.token,2).status,200);assert.equal(r.heartbeat(a.token),false);});
test('rooms open at the finite capacity and snapshots never expose capability tokens',()=>{const r=new RoomStore({capacity:2}),a=r.join('一'),b=r.join('二'),c=r.join('三');assert.equal(a.roomId,b.roomId);assert.notEqual(a.roomId,c.roomId);const payload=JSON.stringify(r.snapshot(a.token));assert.ok(!payload.includes(a.token));assert.ok(!payload.includes(b.token));assert.equal(r.claim(a.token,3).status,400);assert.equal(r.claim(a.token,'1').status,400);});
test('subscribers see atomic room updates and can unsubscribe',()=>{const r=new RoomStore(),a=r.join('听风');let seen=0;const off=r.subscribe(a.token,s=>{seen=s.seated});r.claim(a.token,1);assert.equal(seen,1);off();r.stand(a.token);assert.equal(seen,1);});

test('HTTP presence, SSE, conflicts and protected static files',async()=>{const server=createHallServer();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}`;let controller;
 const post=async(action,data={},token='')=>{const r=await fetch(base+'/api/presence/'+action,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(data)});return {status:r.status,data:await r.json()}};
 try{const a=(await post('join',{name:'听风'})).data,b=(await post('join',{name:'看云'})).data;assert.equal(a.roomId,b.roomId);
  controller=new AbortController();const eventResponse=await fetch(base+'/api/presence/events?token='+a.token,{signal:controller.signal});assert.equal(eventResponse.status,200);const reader=eventResponse.body.getReader();const first=new TextDecoder().decode((await reader.read()).value);assert.match(first,/event: room/);
  assert.equal((await post('seat',{seat:7},b.token)).status,200);const change=new TextDecoder().decode((await reader.read()).value);assert.match(change,/看云/);assert.ok(!change.includes(b.token));
  assert.equal((await post('seat',{seat:7},a.token)).status,409);assert.equal((await post('seat',{seat:6},'wrong')).status,401);
  controller.abort();await reader.cancel().catch(()=>{});
  for(const p of ['/.git/config','/scripts/voice_test.py','/server.mjs','/assets/narration/build/voice-preview-90s.txt'])assert.equal((await fetch(base+p)).status,404);
  const page=await(await fetch(base+'/')).text();assert.match(page,/data-server-presence="true"/);
  const bytes=await fetch(base+'/assets/music_bed.mp3',{headers:{Range:'bytes=0-99'}});assert.equal(bytes.status,206);assert.equal((await bytes.arrayBuffer()).byteLength,100);
  const crossOrigin=await fetch(base+'/api/presence/join',{method:'POST',headers:{Origin:'https://unrelated.example','Content-Type':'application/json'},body:'{}'});assert.equal(crossOrigin.status,403);
  assert.equal((await post('leave',{},b.token)).data.ok,true);
 }finally{controller?.abort();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
