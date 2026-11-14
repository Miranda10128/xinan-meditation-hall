export const hallCenter={x:0,z:-1.5};
export function circularSeats(){
 return [2.6,4.45,6.3].flatMap((radius,ring)=>Array.from({length:8},(_,index)=>{
  const angle=(index+.5)*Math.PI/4,x=Math.sin(angle)*radius,z=hallCenter.z+Math.cos(angle)*radius;
  return {id:ring*8+index+1,x,z,ring:ring+1,rotation:Math.atan2(x,z-hallCenter.z)};
 }));
}
export function seatView(seat,third=false){
 const radius=Math.hypot(seat.x,seat.z-hallCenter.z),dx=seat.x/radius,dz=(seat.z-hallCenter.z)/radius;
 return third?{position:[seat.x-dx*2.3,2.1,seat.z-dz*2.3],target:[seat.x,.75,seat.z]}:{position:[seat.x+dx*.20,1.35,seat.z+dz*.20],target:[hallCenter.x,1.2,hallCenter.z]};
}
