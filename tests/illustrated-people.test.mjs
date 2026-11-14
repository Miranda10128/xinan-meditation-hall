import test from 'node:test';
import assert from 'node:assert/strict';
import {PerspectiveCamera,Texture} from '../assets/vendor/three.module.js';
import {prepareCharacters,createIllustratedPerson,characterAssets} from '../illustrated-people.mjs';

test('painted visitors show the body-facing view and share art across independent visitors',()=>{
 const loaded=[];prepareCharacters({load(file){loaded.push(file);return new Texture()}});
 assert.equal(loaded.length,16);assert.equal(new Set(characterAssets).size,16);
 const camera=new PerspectiveCamera(),person=createIllustratedPerson('white',true),other=createIllustratedPerson('white',true);
 camera.position.set(0,1,4);person.userData.updateFacing(camera);other.userData.updateFacing(camera);
 assert.equal(person.userData.currentView,'back');assert.equal(person.children[0].material.map,other.children[0].material.map);
 person.rotation.y=Math.PI;person.userData.updateFacing(camera);assert.equal(person.userData.currentView,'front');
 person.rotation.y=0;camera.position.set(4,1,0);person.userData.updateFacing(camera);assert.equal(person.userData.currentView,'right');
 camera.position.set(-4,1,0);person.userData.updateFacing(camera);assert.equal(person.userData.currentView,'left');
 let sharedDisposed=false;other.children[0].material.map.addEventListener('dispose',()=>sharedDisposed=true);
 person.userData.dispose();assert.equal(sharedDisposed,false);assert.notEqual(person.children[0].geometry,other.children[0].geometry);
});
