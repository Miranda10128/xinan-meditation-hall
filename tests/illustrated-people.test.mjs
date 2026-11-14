import test from 'node:test';
import assert from 'node:assert/strict';
import {statSync} from 'node:fs';
import {PerspectiveCamera,Texture} from '../assets/vendor/three.module.js';
import {prepareCharacters,createIllustratedPerson,characterAssets,demoIdentities,visitorProfiles} from '../illustrated-people.mjs';

test('painted visitors show the body-facing view and share art across independent visitors',()=>{
 const loaded=[];prepareCharacters({load(file){loaded.push(file);return new Texture()}});
 assert.equal(loaded.length,44);assert.equal(new Set(characterAssets).size,44);
 const camera=new PerspectiveCamera(),person=createIllustratedPerson('white',true),other=createIllustratedPerson('white',true);
 camera.position.set(0,1,4);person.userData.updateFacing(camera);other.userData.updateFacing(camera);
 assert.equal(person.userData.currentView,'back');assert.equal(person.children[0].material.map,other.children[0].material.map);
 person.rotation.y=Math.PI;person.userData.updateFacing(camera);assert.equal(person.userData.currentView,'front');
 person.rotation.y=0;camera.position.set(4,1,0);person.userData.updateFacing(camera);assert.equal(person.userData.currentView,'right');
 camera.position.set(-4,1,0);person.userData.updateFacing(camera);assert.equal(person.userData.currentView,'left');
 let sharedDisposed=false;other.children[0].material.map.addEventListener('dispose',()=>sharedDisposed=true);
 person.userData.dispose();assert.equal(sharedDisposed,false);assert.notEqual(person.children[0].geometry,other.children[0].geometry);
});

test('each demo visitor and guide has a distinct stable face, separate from both personal avatars',()=>{
 const ids=Object.values(demoIdentities);assert.equal(new Set(ids).size,6);assert.ok(!ids.includes('guide'));
 const people=[...ids,'guide'].map(id=>createIllustratedPerson(visitorProfiles[id].robe,true,id));
 for(const person of people){assert.ok(!['white','blue'].includes(person.userData.identity));assert.ok(person.children[0].material.map);}
 assert.equal(new Set(people.map(p=>p.children[0].material.map)).size,7);
 const repeat=createIllustratedPerson('blue',true,demoIdentities[1]);assert.equal(repeat.children[0].material.map,people[0].children[0].material.map);
 for(const robe of ['white','blue']){const self=createIllustratedPerson(robe,true);assert.ok(people.every(p=>p.children[0].material.map!==self.children[0].material.map));}
});

test('every directional artwork needed at runtime exists',()=>{
 for(const file of characterAssets)assert.ok(statSync(new URL('../'+file,import.meta.url)).size>2000,file);
});
