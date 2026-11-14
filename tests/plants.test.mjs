import test from 'node:test';import assert from 'node:assert/strict';
import {Box3,Texture} from '../assets/vendor/three.module.js';
import {createPottedPlant} from '../plants.mjs';

test('nearby plants have finite volume and a bounded material draw budget',()=>{
 for(let variant=0;variant<3;variant++){
  const plant=createPottedPlant(null,variant);const bounds=new Box3().setFromObject(plant);
  assert.equal(plant.children.length,4);assert.ok(bounds.max.y>2&&bounds.max.y<3);assert.ok(bounds.min.x<-.5&&bounds.max.x>.5);assert.ok(bounds.min.z<-.5&&bounds.max.z>.5);
  for(const mesh of plant.children){assert.equal(mesh.isSprite,undefined);assert.ok(mesh.geometry.index.count>0);for(const value of mesh.geometry.attributes.position.array)assert.ok(Number.isFinite(value));assert.ok(mesh.geometry.attributes.normal);assert.ok(mesh.geometry.attributes.uv);}
 }
});
test('repeated plants share GPU resources but can move independently',()=>{
 const texture=new Texture(),a=createPottedPlant(texture,1),b=createPottedPlant(texture,1);a.position.set(5,0,0);
 assert.notEqual(a,b);assert.equal(b.position.x,0);for(let i=0;i<a.children.length;i++){assert.equal(a.children[i].geometry,b.children[i].geometry);assert.equal(a.children[i].material,b.children[i].material)}assert.ok(a.children.some(m=>m.material.map===texture));
});
