import { randomUUID } from 'node:crypto';

export class RoomStore {
 constructor({capacity=24,ttlMs=120000,now=Date.now}={}){this.capacity=capacity;this.ttlMs=ttlMs;this.now=now;this.sessions=new Map();this.rooms=new Map();this.revision=0;this.listeners=new Map();}
 join(name){this.sweep();if(this.sessions.size>=2400)throw Object.assign(new Error('room_capacity_reached'),{status:429});let room=[...this.rooms.values()].find(r=>r.members.size<this.capacity);if(!room){const id=`morning-${String(this.rooms.size+1).padStart(2,'0')}`;room={id,members:new Set()};this.rooms.set(id,room)}const token=randomUUID(),id=randomUUID();const session={token,id,roomId:room.id,name:[...String(name||'听风').trim()].slice(0,12).join('')||'听风',seat:null,lastSeen:this.now()};this.sessions.set(token,session);room.members.add(token);this.emit(room.id);return {token,id,roomId:room.id,snapshot:this.snapshot(token)}}
 get(token){const s=this.sessions.get(token);if(!s||this.now()-s.lastSeen>this.ttlMs){if(s)this.leave(token);return null}return s;}
 heartbeat(token){const s=this.get(token);if(!s)return false;s.lastSeen=this.now();return true;}
 claim(token,seat,name){this.sweep();const s=this.get(token);if(!s)return {status:401,error:'session_expired'};if(!Number.isInteger(seat)||seat<1||seat>this.capacity)return {status:400,error:'invalid_seat'};for(const member of this.rooms.get(s.roomId).members){const other=this.sessions.get(member);if(other&&other.token!==token&&other.seat===seat)return {status:409,error:'seat_occupied'}}s.seat=seat;s.lastSeen=this.now();if(typeof name==='string')s.name=[...name.trim()].slice(0,12).join('')||s.name;this.emit(s.roomId);return {status:200,snapshot:this.snapshot(token)};}
 stand(token){const s=this.get(token);if(!s)return false;s.seat=null;s.lastSeen=this.now();this.emit(s.roomId);return true;}
 leave(token){const s=this.sessions.get(token);if(!s)return false;this.sessions.delete(token);this.rooms.get(s.roomId)?.members.delete(token);this.emit(s.roomId);return true;}
 snapshot(token){const s=this.sessions.get(token);return s?this.roomSnapshot(s.roomId):null;}
 roomSnapshot(roomId){const room=this.rooms.get(roomId);if(!room)return null;const seats=[];for(const token of room.members){const s=this.sessions.get(token);if(s?.seat)seats.push({seat:s.seat,person:{id:s.id,name:s.name}})}return {roomId,capacity:this.capacity,seated:seats.length,revision:this.revision,serverTime:this.now(),seats:seats.sort((a,b)=>a.seat-b.seat)};}
 subscribe(token,fn){const s=this.get(token);if(!s)return null;const set=this.listeners.get(s.roomId)||new Set();set.add(fn);this.listeners.set(s.roomId,set);return()=>{set.delete(fn);if(!set.size)this.listeners.delete(s.roomId)};}
 emit(roomId){this.revision++;const snapshot=this.roomSnapshot(roomId);for(const fn of this.listeners.get(roomId)||[])fn(snapshot);}
 sweep(){for(const [token,s]of this.sessions)if(this.now()-s.lastSeen>this.ttlMs)this.leave(token);}
}
