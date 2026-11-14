import * as T from './assets/vendor/three.module.js';

export function forestGroundHeight(x,z){
 return -.60+.085*Math.sin(x*.57+z*.22)+.045*Math.cos(z*.71-x*.17);
}
export function createForestGround(scene,material){
 const geometry=new T.PlaneGeometry(65,70,48,52);geometry.rotateX(-Math.PI/2);
 const positions=geometry.attributes.position;
 for(let i=0;i<positions.count;i++)positions.setY(i,forestGroundHeight(positions.getX(i),positions.getZ(i)));
 geometry.computeVertexNormals();
 const ground=new T.Mesh(geometry,material);ground.receiveShadow=true;scene.add(ground);
 const stones=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),new T.MeshStandardMaterial({color:'#8d9283',roughness:1}),48);
 const transform=new T.Object3D();
 for(let i=0;i<48;i++){
  const x=(i%2?1:-1)*(8.7+(i*1.31)%8),z=-13+(i*2.47)%40;
  transform.position.set(x,forestGroundHeight(x,z)-.025,z);transform.rotation.set(i*.3,i*.91,i*.23);
  transform.scale.set(.12+(i%5)*.055,.08+(i%3)*.035,.16+(i%4)*.05);transform.updateMatrix();stones.setMatrixAt(i,transform.matrix);
 }
 stones.receiveShadow=true;stones.castShadow=true;scene.add(stones);
 return {ground,stones};
}

export function createCurtains(scene,clothMap){
 const material=new T.MeshPhysicalMaterial({color:'#fffef8',map:clothMap,side:T.DoubleSide,transparent:true,opacity:.62,depthWrite:false,roughness:1,metalness:0,emissive:'#f6f2e7',emissiveIntensity:.22,sheen:.35,sheenColor:new T.Color('#fffdf4'),sheenRoughness:1});
 const hemMaterial=material.clone();hemMaterial.opacity=.79;hemMaterial.sheen=.15;
 const panels=[],width=2.65,height=4.15,columns=56,rows=64;
 const locations=[...[-1,1].flatMap(side=>[-7.8,-2.3,3.3].map(z=>({x:side*6.72,z,rotation:side*Math.PI/2}))),...[-1,1].map(side=>({x:side*5.25,z:7.35,rotation:0}))];
 for(const location of locations){
  const geometry=new T.PlaneGeometry(width,height,columns,rows);geometry.translate(0,-height/2,0);const rest=geometry.attributes.position.array.slice();
  const mesh=new T.Mesh(geometry,material);mesh.position.set(location.x,4.42,location.z);mesh.rotation.y=location.rotation;mesh.receiveShadow=true;mesh.renderOrder=3;scene.add(mesh);
  // Doubled fabric at the gathered heading and sewn bottom hem makes the cloth edge readable.
  const hemGeometry=new T.BufferGeometry();hemGeometry.setAttribute('position',geometry.attributes.position);hemGeometry.setAttribute('normal',geometry.attributes.normal);hemGeometry.setAttribute('uv',geometry.attributes.uv);
  const index=geometry.index.array,indices=[];for(const row of [0,rows-1])for(let i=row*columns*6;i<(row+1)*columns*6;i++)indices.push(index[i]);hemGeometry.setIndex(indices);
  const hems=new T.Mesh(hemGeometry,hemMaterial);hems.renderOrder=4;mesh.add(hems);
  panels.push({mesh,rest,phase:location.z*.37+location.x*.21});
 }
 let frame=0;
 function update(time,moving=true){
  for(const {mesh,rest,phase}of panels){const positions=mesh.geometry.attributes.position;
   for(let i=0;i<positions.count;i++){
    const x=rest[i*3],y=rest[i*3+1],v=Math.max(0,-y/height),u=x/width+.5;
    const gust=moving?Math.sin(time*.43+phase)*.24:0;
    const ripple=moving?Math.sin(time*1.1+u*7-v*3+phase)*.045*v*v:0;
    const fold=.085*Math.sin(u*Math.PI*8+.8*v+.12*Math.sin(phase+u*2))+.025*Math.sin(u*Math.PI*13+phase+v*1.5)*v+.035*v*Math.sin(u*Math.PI*4+phase);
    positions.setXYZ(i,x+gust*.45*v*v+.04*Math.sin(u*Math.PI*3+phase)*v,y+.075*Math.sin(u*Math.PI*1.4+phase)*v*v+(moving?.065*Math.sin(time*.6+phase+u*2)*v*v:0),fold+gust*Math.sin(v*Math.PI/2)+ripple);
   }
   positions.needsUpdate=true;if(frame%2===0)mesh.geometry.computeVertexNormals();
  }frame++;
 }
 update(0,false);return {panels,update};
}

export function buildCorridor(scene,wood,woodDark){
 const pieces=[];function box(w,h,d,x,y,z,mat=wood){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);pieces.push(m);return m;}
 for(const z of [9,13,17,21,25]){for(const x of [-2.65,2.65]){box(.19,4.05,.19,x,2,z);box(.28,.85,.28,x,-.38,z,woodDark);}box(5.6,.18,.2,0,4.02,z,woodDark);}
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
