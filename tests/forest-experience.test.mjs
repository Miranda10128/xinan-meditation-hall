import test from 'node:test';import assert from 'node:assert/strict';
import {Scene} from '../assets/vendor/three.module.js';
import {createCurtains,createRain,createStream} from '../atmosphere.mjs';
import {createSoundscape} from '../soundscape.mjs';
import {createSeasonController} from '../seasons.mjs';
import {createMeditator} from '../people.mjs';

test('curtains stay attached at the top and sway below; reduced motion is stable',()=>{
 const curtains=createCurtains(new Scene(),null),initial=curtains.panels[0].mesh.geometry.attributes.position.array.slice();curtains.update(3,true);const moving=curtains.panels[0].mesh.geometry.attributes.position.array.slice();let changed=false;
 for(let i=0;i<initial.length;i+=3){if(Math.abs(initial[i+1])<1e-6){for(let k=0;k<3;k++)assert.ok(Math.abs(initial[i+k]-moving[i+k])<1e-6)}else if(Math.abs(initial[i+2]-moving[i+2])>.02)changed=true;}
 assert.ok(changed);curtains.update(10,false);const reduced=curtains.panels[0].mesh.geometry.attributes.position.array.slice();curtains.update(30,false);assert.deepEqual(curtains.panels[0].mesh.geometry.attributes.position.array,reduced);
});
test('rain stays outside the roofs and the stream produces finite gentle waves',()=>{
 const scene=new Scene(),rain=createRain(scene,100),p=rain.mesh.geometry.attributes.position;for(let i=0;i<p.count;i+=2)assert.ok(Math.abs(p.getX(i))>(p.getZ(i)<8?7.5:3));rain.mesh.visible=true;rain.update(0);rain.update(1);for(const value of p.array)assert.ok(Number.isFinite(value));const stream=createStream(scene);stream.update(3);for(const value of stream.water.geometry.attributes.position.array)assert.ok(Number.isFinite(value));
});
class FakeAudio{constructor(src){this.src=src;this.paused=true;this.plays=0;}addEventListener(){}pause(){this.paused=true}play(){this.paused=false;this.plays++;return Promise.resolve()}}
test('nature levels do not autoplay; mute and pause stop every layer, and guidance ducks the mix',()=>{
 const sounds=createSoundscape({makeAudio:src=>new FakeAudio(src)});sounds.setLevel('water',.5);assert.equal(sounds.players.get('water').plays,0);sounds.sync({enabled:true});const normal=sounds.players.get('water').volume;assert.equal(sounds.players.get('water').paused,false);sounds.sync({enabled:true,duck:true});assert.ok(sounds.players.get('water').volume<normal);sounds.sync({enabled:true,paused:true});assert.ok([...sounds.players.values()].every(a=>a.paused));assert.equal(sounds.levels.get('water'),.5);sounds.sync({enabled:true});sounds.stop();sounds.setLevel('birds',.3);assert.ok([...sounds.players.values()].every(a=>a.paused));
});
test('a slow seasonal image cannot overwrite the last chosen season',async()=>{
 const pending=new Map(),applied=[];let disposed=0;const controller=createSeasonController({load:file=>new Promise(resolve=>pending.set(file,resolve)),apply:id=>applied.push(id)});
 const spring=controller.select('spring'),winter=controller.select('winter');pending.get('assets/forest-winter.webp')({dispose(){}});await winter;pending.get('assets/forest-spring.webp')({dispose(){disposed++}});await spring;assert.equal(controller.current,'winter');assert.deepEqual(applied,['winter']);assert.equal(disposed,1);assert.equal(await controller.select('invalid'),false);
});
test('both meditation outfits retain the seated draw budget and a standing idle pose',()=>{
 for(const robe of ['white','blue']){const seated=createMeditator('#eee',true,7,null,{robe}),standing=createMeditator('#eee',false,7,null,{robe});assert.ok(seated.children.length<=8);standing.userData.poseIdle(2);standing.userData.poseWalking(1,1);seated.userData.dispose();standing.userData.dispose();}
});
