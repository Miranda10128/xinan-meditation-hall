import {Vector3} from './assets/vendor/three.module.js';

// Camera transforms can change between render frames. Project from the current
// transform before revealing labels, so the first selectable frame is stable.
export function projectSeats(camera,seats,width,height){
 camera.updateMatrixWorld(true);
 const point=new Vector3();
 return seats.map(seat=>{point.set(seat.x,.4,seat.z).project(camera);return {seat,left:(point.x*.5+.5)*width,top:(-point.y*.5+.5)*height,visible:point.z<1&&point.x>-.95&&point.x<.95&&point.y>-.8&&point.y<.75};});
}
