import test from 'node:test';import assert from 'node:assert/strict';import {connectPresence} from '../presence.mjs';
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function harness(){
 const handlers=new Map(),timers=new Map(),beacons=[],streams=[];let serial=0;
 const env={fetch:async url=>({ok:true,status:200,json:async()=>url.endsWith('/join')?{token:`token-${++serial}`,id:`person-${serial}`,roomId:'morning-01',snapshot:{seats:[],seated:0}}:{ok:true}}),setInterval:fn=>{const id=Symbol();timers.set(id,fn);return id},clearInterval:id=>timers.delete(id),addEventListener:(name,fn)=>handlers.set(name,fn),navigator:{sendBeacon:(url,body)=>beacons.push({url,body})},document:{hidden:false,addEventListener:()=>{}},EventSource:class{constructor(url){this.url=url;streams.push(this)}addEventListener(){}close(){this.closed=true}}};
 return {env,handlers,timers,beacons,streams};
}
test('returning through browser back cache reconnects once and releases again on the next leave',async()=>{
 const h=harness();const client=connectPresence({name:()=> '听风',onSnapshot:()=>{},onStatus:()=>{}},h.env);await flush();assert.equal(client.id,'person-1');assert.equal(h.timers.size,1);
 h.handlers.get('pagehide')();assert.equal(h.timers.size,0);assert.equal(h.streams[0].closed,true);assert.equal(h.beacons.length,1);
 h.handlers.get('pageshow')({persisted:true});await flush();assert.equal(client.id,'person-2');assert.equal(h.timers.size,1);assert.equal(h.streams.length,2);
 h.handlers.get('pageshow')({persisted:true});await flush();assert.equal(h.streams.length,2,'duplicate pageshow must not create a second session');
 h.handlers.get('pagehide')();assert.equal(h.timers.size,0);assert.equal(h.beacons.length,2);assert.equal(h.streams[1].closed,true);
});

test('heartbeat recovery reopens the room stream without allocating another visitor',async()=>{
 const h=harness(),statuses=[],snapshots=[];
 const Original=h.env.EventSource;
 h.env.EventSource=class extends Original{addEventListener(name,fn){this[name]=fn}};
 const client=connectPresence({name:()=> '听风',onSnapshot:s=>snapshots.push(s),onStatus:s=>statuses.push(s)},h.env);
 await flush();const id=client.id,token=h.streams[0].url;
 h.streams[0].onerror();assert.equal(client.available,false);
 const fetch=h.env.fetch;h.env.fetch=async()=>{throw new Error('offline')};
 await [...h.timers.values()][0]();assert.equal(statuses.at(-1),'offline');
 h.env.fetch=fetch;await [...h.timers.values()][0]();
 assert.equal(h.streams.length,2);assert.equal(h.streams[0].closed,true);
 assert.equal(h.streams[1].url,token);assert.equal(client.id,id);
 assert.equal(client.available,false,'wait for authoritative room snapshot');
 h.streams[1].room({data:JSON.stringify({seats:[{id:2}],seated:1})});
 assert.equal(client.available,true);assert.equal(statuses.at(-1),'live');assert.equal(snapshots.at(-1).seated,1);
 await [...h.timers.values()][0]();assert.equal(h.streams.length,2);
 client.disconnect();
});
