import * as T from './assets/vendor/three.module.js';

export function createCurtains(scene,clothMap){
 const material=new T.MeshStandardMaterial({color:'#fffdf5',map:clothMap,side:T.DoubleSide,transparent:true,opacity:.43,depthWrite:false,roughness:.9,emissive:'#fff9ee',emissiveIntensity:.04});
 const panels=[];
 for(const side of [-1,1])for(const z of [-6.5,.2,6.4]){
  const geometry=new T.PlaneGeometry(1.85,3.35,16,24);geometry.translate(0,-3.35/2,0);const rest=geometry.attributes.position.array.slice();
  const mesh=new T.Mesh(geometry,material);mesh.position.set(side*6.72,4.32,z);mesh.rotation.y=side*Math.PI/2;mesh.receiveShadow=true;mesh.renderOrder=3;scene.add(mesh);panels.push({mesh,rest,phase:z*.37+side});
 }
 let frame=0;
 function update(time,moving=true){for(const {mesh,rest,phase}of panels){const positions=mesh.geometry.attributes.position;for(let i=0;i<positions.count;i++){const x=rest[i*3],y=rest[i*3+1],v=Math.max(0,-y/3.35),u=x/1.85+.5;const sway=moving?Math.sin(time*.65+phase+v*2.5)*.13*v*v:0;positions.setXYZ(i,x+(moving?.08*Math.sin(time*.5+phase)*v*v:0),y+(moving?.025*Math.sin(time*.7+u*4)*v*v:0),.075*Math.sin(u*Math.PI*8)+sway)}positions.needsUpdate=true;if(frame%3===0)mesh.geometry.computeVertexNormals();}frame++;}
 update(0,false);return {panels,update};
}

export function buildCorridor(scene,wood,woodDark){
 const pieces=[];function box(w,h,d,x,y,z,mat=wood){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);pieces.push(m);return m;}
 for(const z of [9,13,17,21,25]){for(const x of [-2.65,2.65])box(.19,4.05,.19,x,2,z);box(5.6,.18,.2,0,4.02,z,woodDark);}
 for(const x of [-2.65,2.65])box(.16,.18,18,x,4.02,17,woodDark);
 box(5.8,.10,18.5,0,4.15,17,woodDark);
 for(let z=8.5;z<26;z+=.52)box(5.55,.065,.08,0,3.94,z);
 return pieces;
}

export function createStream(scene){
 const geometry=new T.PlaneGeometry(2.4,23,12,60);geometry.rotateX(-Math.PI/2);const rest=geometry.attributes.position.array.slice();
 const material=new T.MeshStandardMaterial({color:'#6b9993',metalness:.18,roughness:.24,transparent:true,opacity:.8});const water=new T.Mesh(geometry,material);water.position.set(-5.0,-.47,17);water.receiveShadow=true;scene.add(water);
 const stoneMat=new T.MeshStandardMaterial({color:'#7f8777',roughness:.96});const stoneGeometry=new T.SphereGeometry(1,12,8);
 for(let i=0;i<28;i++){const side=i%2?1:-1,m=new T.Mesh(stoneGeometry,stoneMat);m.position.set(-5+side*(1.25+(i%3)*.07),-.43,6+i*.81);m.scale.set(.28+(i%4)*.04,.16,.24+(i%3)*.05);m.castShadow=true;m.receiveShadow=true;scene.add(m);}
 let count=0;function update(time,moving=true){if(!moving)return;const p=geometry.attributes.position;for(let i=0;i<p.count;i++){const x=rest[i*3],z=rest[i*3+2];p.setY(i,Math.sin(z*2.3+time*.8+x)*.012+Math.sin(z*4-time*1.1)*.006)}p.needsUpdate=true;if(count++%4===0)geometry.computeVertexNormals();}
 return {water,update};
}

export function createRain(scene,count=700){
 const positions=new Float32Array(count*6),speeds=[];for(let i=0;i<count;i++){const z=-16+(i*1.137)%45,min=Math.max(3.3,z<8?7.8:3.3),x=(i%2?1:-1)*(min+(i*.731)%12),y=(i*.531)%13;positions.set([x,y,z,x+.025,y+.22,z],i*6);speeds.push(1.9+(i%7)*.13)}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(positions,3));const mesh=new T.LineSegments(geometry,new T.LineBasicMaterial({color:'#d8e6df',transparent:true,opacity:.23,depthWrite:false}));mesh.visible=false;scene.add(mesh);let last=null;
 function update(time,moving=true){if(!mesh.visible||!moving){last=time;return}const delta=last===null?0:Math.min(.1,time-last);last=time;const p=geometry.attributes.position;for(let i=0;i<count;i++){let y=p.getY(i*2)-speeds[i]*delta;if(y<-.6)y=12;p.setY(i*2,y);p.setY(i*2+1,y+.22)}p.needsUpdate=true;}
 return {mesh,update};
}
