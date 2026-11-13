import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3} from '../assets/vendor/three.module.js';
import {createMeditator} from '../people.mjs';

test('all seated variants retain finite indexed surfaces with a bounded draw budget',()=>{
 for(let variant=0;variant<24;variant++){
  const visitor=createMeditator('#eee6d9',true,variant);let surfaces=0;
  visitor.traverse(mesh=>{if(!mesh.isMesh)return;surfaces++;const p=mesh.geometry.attributes.position;assert.ok(p.count>0);assert.ok(mesh.geometry.index.count>0);for(const value of p.array)assert.ok(Number.isFinite(value));});
  assert.ok(surfaces<=8,'one visitor must not expand into dozens of draw calls');
  const bounds=new Box3().setFromObject(visitor);assert.ok(bounds.max.y>1&&bounds.max.y<2);assert.ok(bounds.min.y>=0);visitor.userData.dispose();
 }
});

test('disposing another visitor leaves the standing walking rig usable',()=>{
 const first=createMeditator('#eee6d9',true,1),standing=createMeditator('#eee6d9',false,2);const bounds=new Box3().setFromObject(standing);let sharedDisposals=0;
 const geometries=new Set();standing.traverse(m=>{if(m.isMesh)geometries.add(m.geometry)});for(const g of geometries)g.addEventListener('dispose',()=>sharedDisposals++);
 first.userData.dispose();assert.equal(sharedDisposals,0);
 standing.userData.poseWalking(Math.PI/2,1);const walking=new Box3().setFromObject(standing);assert.ok(walking.max.z!==bounds.max.z||walking.min.z!==bounds.min.z);for(const v of [...walking.min.toArray(),...walking.max.toArray()])assert.ok(Number.isFinite(v));standing.userData.dispose();
});
