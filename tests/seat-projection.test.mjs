import test from 'node:test';import assert from 'node:assert/strict';
import {PerspectiveCamera,Vector3} from '../assets/vendor/three.module.js';
import {projectSeats} from '../seat-projection.mjs';

test('seat labels use the completed camera transition before the next render',()=>{
 const camera=new PerspectiveCamera(56,1,.3,90),seat={id:19,x:2.1,z:2.7};
 camera.position.set(0,2.6,15);camera.lookAt(0,2,-6);camera.updateMatrixWorld(true);
 camera.position.set(0,4.1,10.5);camera.lookAt(0,0,-1.2);
 const stale=new Vector3(seat.x,.4,seat.z).project(camera);
 const [label]=projectSeats(camera,[seat],900,900);
 const current=new Vector3(seat.x,.4,seat.z).project(camera);
 assert.ok(Math.abs(stale.y-current.y)>.05,'fixture must reproduce an unrendered camera movement');
 assert.ok(Math.abs(label.left-(current.x*.5+.5)*900)<1e-8);
 assert.ok(Math.abs(label.top-(-current.y*.5+.5)*900)<1e-8);
 const [next]=projectSeats(camera,[seat],900,900);assert.equal(next.left,label.left);assert.equal(next.top,label.top);
});
test('projected positions adapt to a narrow viewport and retain seat identity',()=>{
 const camera=new PerspectiveCamera(66,390/844,.3,90);camera.position.set(0,4.1,10.5);camera.lookAt(0,0,-1.2);
 const seats=[{id:18,x:-2.1,z:2.7},{id:19,x:2.1,z:2.7}];const labels=projectSeats(camera,seats,390,844);
 assert.equal(labels[0].seat,seats[0]);assert.equal(labels[1].seat,seats[1]);assert.ok(labels.every(l=>l.visible));assert.ok(labels[0].left<195&&labels[1].left>195);
});
