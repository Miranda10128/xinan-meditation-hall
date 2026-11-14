import * as T from './assets/vendor/three.module.js';
import {mergeGeometries} from './assets/vendor/three-addons/utils/BufferGeometryUtils.js';

const UP=new T.Vector3(0,1,0),SPHERE=new T.SphereGeometry(1,24,18);const geometryCache=new Map(),sharedGeometry=new Set([SPHERE]);function cached(key,make){if(!geometryCache.has(key)){const g=make();geometryCache.set(key,g);sharedGeometry.add(g)}return geometryCache.get(key)}
export function createMeditator(color,seated,variant,clothMap,appearance={}){
 const robe=appearance.robe||'casual';if(robe==='white')color='#f3f1e9';if(robe==='blue')color='#718f94';
 const root=new T.Group();
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.86,...extra});
 const skin=mat('#d9b595'),hair=mat(variant%3===0?'#65513e':'#43372d');
 const shirt=mat(color,{map:clothMap||null,bumpMap:clothMap||null,bumpScale:.007});
 const trouser=mat(robe==='white'?'#d5d4c8':robe==='blue'?'#9aadaa':'#aca18c'),seam=mat(robe==='blue'?'#5b7377':'#d5c8b2'),features=mat('#725548'),lip=mat('#a87967');
 function add(geometry,material,position=[0,0,0],scale=null,parent=root){const m=new T.Mesh(geometry,material);m.position.set(...position);if(scale)m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 function ball(material,p,s,parent=root){return add(SPHERE,material,p,s,parent)}
 function line(points,radius,material,parent=root){const c=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));return add(new T.TubeGeometry(c,Math.max(8,points.length*4),radius,8,false),material,[0,0,0],null,parent)}
 function limb(a,b,radius,material,parent=root){const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av);const m=add(cached(`capsule-${radius}-${delta.length().toFixed(4)}`,()=>new T.CapsuleGeometry(radius,delta.length(),6,16)),material,[0,0,0],null,parent);m.position.copy(av.add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(UP,delta.normalize());return m}
 const base=seated?.2:.7;
 const profile=[[0,0],[.245,0],[.28,.065],[.294,.25],[.273,.53],[.233,.70],[.16,.79],[.10,.81],[0,.81]].map(([x,y])=>new T.Vector2(x,y));
 const tunicGeometry=new T.LatheGeometry(profile,40),tunicPositions=tunicGeometry.attributes.position;
 for(let i=0;i<tunicPositions.count;i++){const x=tunicPositions.getX(i),y=tunicPositions.getY(i),z=tunicPositions.getZ(i),angle=Math.atan2(z,x),fold=1+.022*Math.sin(angle*8+y*5)*Math.sin(Math.PI*y/.81)**2;tunicPositions.setXYZ(i,x*fold,y,z*fold)}
 tunicGeometry.computeVertexNormals();
 const torso=add(tunicGeometry,shirt,[0,base+.1,0],[1,1,.77]);
 // A soft hem and crossed collar give the clothing a readable construction.
 line([[-.11,base+.87,-.11],[.025,base+.64,-.205],[.15,base+.37,-.20]],.008,seam);
 if(robe!=='casual'&&!seated){const skirtProfile=(robe==='white'?[[0,.16],[.37,.16],[.40,.23],[.35,.53],[.27,.82],[.23,.97]]:[[0,.16],[.29,.16],[.32,.23],[.29,.55],[.25,.82],[.23,.97]]).map(([r,y])=>new T.Vector2(r,y));const skirt=new T.LatheGeometry(skirtProfile,48),vertices=skirt.attributes.position;for(let i=0;i<vertices.count;i++){const x=vertices.getX(i),y=vertices.getY(i),z=vertices.getZ(i),fold=1+.045*Math.sin(Math.atan2(z,x)*12)*Math.max(0,1-y);vertices.setXYZ(i,x*fold,y,z*fold)}skirt.computeVertexNormals();add(skirt,shirt,[0,0,0],[1,1,.88]);}
 if(seated){
  if(robe!=='casual')ball(shirt,[0,.235,-.15],[robe==='white'?.47:.43,.145,.36]);
  line([[-.03,.24,.03],[-.27,.23,-.08],[-.43,.20,-.25],[-.23,.15,-.41],[.18,.155,-.36]],.115,trouser);
  line([[.03,.25,.03],[.29,.23,-.10],[.45,.20,-.28],[.25,.17,-.43],[-.17,.18,-.37]],.115,trouser);
  ball(skin,[.18,.16,-.39],[.13,.055,.075]);ball(skin,[-.17,.18,-.40],[.13,.055,.075]);
  for(const side of [-1,1]){
   limb([side*.25,base+.80,0],[side*.34,base+.43,-.09],.105,shirt);
   limb([side*.34,base+.43,-.09],[side*.11,base+.25,-.30],.08,shirt);
   ball(skin,[side*.085,base+.25,-.31],[.105,.046,.075]);
   for(let f=0;f<3;f++)ball(skin,[side*(.035+f*.027),base+.25,-.369],[.022,.020,.036]);
  }
 }else{
  ball(trouser,[0,.77,0],[.23,.16,.17]);
  const legs=[],knees=[],arms=[];
  for(const side of [-1,1]){
   const leg=new T.Group();leg.position.set(side*.13,.78,0);root.add(leg);legs.push(leg);
   limb([0,-.03,0],[0,-.36,0],.105,trouser,leg);
   const knee=new T.Group();knee.position.y=-.37;leg.add(knee);knees.push(knee);
   limb([0,0,0],[0,-.32,0],.09,trouser,knee);ball(trouser,[0,-.33,-.075],[.105,.075,.19],knee);
   const arm=new T.Group();arm.position.set(side*.27,base+.79,0);root.add(arm);arms.push(arm);
   limb([side*.03,0,0],[side*.07,-.36,-.02],.10,shirt,arm);limb([side*.07,-.32,-.02],[side*.06,-.60,-.055],.08,shirt,arm);
   ball(skin,[side*.06,-.64,-.055],[.066,.095,.068],arm);
  }
  root.userData.poseIdle=time=>{arms[0].rotation.z=.045+Math.sin(time*.6)*.008;arms[1].rotation.z=-.04-Math.sin(time*.6)*.008;torso.rotation.z=.012;torso.scale.y=1+Math.sin(time*.6)*.004;};
  root.userData.poseWalking=(phase,strength)=>{legs[0].rotation.x=Math.sin(phase)*.36*strength;legs[1].rotation.x=-Math.sin(phase)*.36*strength;knees[0].rotation.x=Math.max(0,-Math.sin(phase))*.48*strength;knees[1].rotation.x=Math.max(0,Math.sin(phase))*.48*strength;arms[0].rotation.x=-Math.sin(phase)*.22*strength;arms[1].rotation.x=Math.sin(phase)*.22*strength;};
  // The visitor's small linen bag makes their avatar easy to recognise.
  if(robe==='casual'){line([[-.23,base+.81,.115],[.0,base+.49,.235],[.23,base+.15,.16]],.025,mat('#d8c59f'));
  ball(mat('#d8c59f',{map:clothMap||null}),[.23,base+.12,.17],[.15,.19,.08]);}
 }
 const headY=base+1.16;const headStart=root.children.length;
 add(new T.CylinderGeometry(.075,.09,.17,20),skin,[0,base+.95,0]);
 const faceGeometry=SPHERE.clone(),facePositions=faceGeometry.attributes.position,faceColors=[];
 const baseTone=new T.Color('#d9b595'),cheekTone=new T.Color('#d69a83');
 for(let i=0;i<facePositions.count;i++){const x=facePositions.getX(i),y=facePositions.getY(i),z=facePositions.getZ(i),cheek=Math.exp(-((Math.abs(x)-.46)**2+(y+.15)**2+(z+.83)**2)/.06)*.32;const tone=baseTone.clone().lerp(cheekTone,cheek);faceColors.push(tone.r,tone.g,tone.b)}
 faceGeometry.setAttribute('color',new T.Float32BufferAttribute(faceColors,3));
 add(faceGeometry,mat('#ffffff',{vertexColors:true,roughness:.74}),[0,headY,-.015],[.235,.275,.23]);
 const cap=add(new T.SphereGeometry(1,32,24,0,Math.PI*2,0,1.43),hair,[0,headY+.012,-.005],[.242,.278,.237]);
 ball(hair,[0,headY+.08,.13],[.22,.215,.115]);
 if(robe==='white'||(robe==='casual'&&variant%2===0))ball(hair,[0,headY+.30,.12],[.105,.11,.105]);
 else ball(hair,[-.07,headY+.11,-.17],[.18,.08,.075]);
 for(const side of [-1,1]){
  ball(skin,[side*.236,headY-.025,0],[.035,.055,.033]);
  const x=side*.085;
  if(seated)line([[x-.033,headY-.035,-.225],[x,headY-.047,-.239],[x+.033,headY-.035,-.225]],.006,features);else{ball(mat('#f3e9dc'),[x,headY-.038,-.232],[.031,.017,.010]);ball(features,[x,headY-.04,-.242],[.012,.013,.007]);line([[x-.03,headY+.012,-.222],[x,headY+.019,-.234],[x+.03,headY+.01,-.222]],.0045,hair);}
 }
 ball(skin,[0,headY-.09,-.246],[.025,.031,.029]);
 line([[-.028,headY-.145,-.213],[0,headY-.152,-.222],[.028,headY-.145,-.213]],.005,lip);
 const headParts=root.children.slice(headStart+1);const headGroup=new T.Group();headGroup.position.y=headY;for(const part of headParts){root.remove(part);part.position.y-=headY;headGroup.add(part)}headGroup.scale.set(.80,.88,.82);root.add(headGroup);
 // Seated visitors have no articulated limbs: batch their surfaces by material.
 // Keep the standing rig intact so walking remains independently articulated.
 if(seated){
  root.updateMatrixWorld(true);const groups=new Map(),originals=[];
  root.traverse(m=>{if(!m.isMesh)return;originals.push(m);if(!groups.has(m.material))groups.set(m.material,[]);groups.get(m.material).push(m.geometry.clone().applyMatrix4(m.matrixWorld));});
  root.clear();
  for(const [material,parts] of groups){const geometry=mergeGeometries(parts,false);for(const part of parts)part.dispose();const surface=new T.Mesh(geometry,material);surface.castShadow=true;surface.receiveShadow=true;root.add(surface);}
  for(const m of originals)if(!sharedGeometry.has(m.geometry))m.geometry.dispose();
 }
 root.userData.dispose=()=>{const materials=new Set();root.traverse(m=>{if(!m.isMesh)return;if(!sharedGeometry.has(m.geometry))m.geometry.dispose();for(const mat of Array.isArray(m.material)?m.material:[m.material])materials.add(mat)});for(const m of materials)m.dispose()};
 return root;
}
