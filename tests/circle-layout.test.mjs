import test from 'node:test';
import assert from 'node:assert/strict';
import {circularSeats,hallCenter,seatView} from '../circle-layout.mjs';
test('24 distinct seats form three spacious rings facing the central guide',()=>{
 const seats=circularSeats();assert.equal(new Set(seats.map(s=>s.id)).size,24);
 for(const seat of seats){
  const dx=-Math.sin(seat.rotation),dz=-Math.cos(seat.rotation);
  assert.ok(dx*(-seat.x)+dz*(hallCenter.z-seat.z)>0);
  assert.ok(Math.abs(seat.x)<6.4&&seat.z>-9&&seat.z<6);
  for(const other of seats)if(other.id!==seat.id)assert.ok(Math.hypot(seat.x-other.x,seat.z-other.z)>1.8);
  const view=seatView(seat);assert.deepEqual(view.target,[0,1.2,-1.5]);assert.ok(seatView(seat,true).position.every(Number.isFinite));
 }
 for(let ring=1;ring<=3;ring++)assert.equal(seats.filter(s=>s.ring===ring).length,8);
});
