import * as THREE from './assets/vendor/three.module.js';

export const characterViews=['front','back','left','right'];
export const visitorProfiles={mei:{robe:'white'},lan:{robe:'white'},yun:{robe:'white'},song:{robe:'blue'},shan:{robe:'blue'},he:{robe:'blue'},guide:{robe:'white'}};
export const demoIdentities={1:'song',4:'mei',6:'lan',12:'shan',16:'yun',21:'he'};
export const characterAssets=[...['white','blue'].flatMap(robe=>['standing','seated'].flatMap(pose=>characterViews.map(view=>`assets/people/${robe}-${pose}-${view}.webp`))),...Object.keys(visitorProfiles).flatMap(id=>characterViews.map(view=>`assets/people/${id}-seated-${view}.webp`))];
const textures=new Map();
export function prepareCharacters(loader){
 for(const file of characterAssets)if(!textures.has(file)){
  const map=loader.load(file);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;textures.set(file,map);
 }
}
export function directionFor(x,z){
 const angle=Math.atan2(x,-z);
 return Math.abs(angle)<Math.PI/4?'front':Math.abs(angle)>Math.PI*3/4?'back':angle>0?'right':'left';
}

// Four painted views preserve human proportions without the old primitive doll rig.
// Each visitor owns only one quad; all visitors share the loaded artwork.
export function createIllustratedPerson(robe='white',seated=true,identity=null){
 const root=new THREE.Group(),pose=seated?'seated':'standing';
 const profile=seated&&visitorProfiles[identity]?identity:robe;
 const artwork=view=>textures.get(`assets/people/${profile}-${pose}-${view}.webp`);
 const height=seated?1.05:1.78,width=seated?1.20:.89;
 const material=new THREE.MeshBasicMaterial({map:artwork('back'),transparent:true,alphaTest:.06,depthWrite:true,side:THREE.DoubleSide,toneMapped:false});
 const figure=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);
 figure.position.y=height/2+.04;figure.userData.aoSkip=true;root.add(figure);
 const localCamera=new THREE.Vector3();
 root.userData.updateFacing=camera=>{
  root.updateWorldMatrix(true,false);camera.getWorldPosition(localCamera);root.worldToLocal(localCamera);
  const view=directionFor(localCamera.x,localCamera.z);
  material.map=artwork(view);
  figure.rotation.y=Math.atan2(localCamera.x,localCamera.z);
  root.userData.currentView=view;figure.updateMatrixWorld(true);
 };
 root.userData.poseIdle=time=>{figure.scale.y=1+Math.sin(time*.7)*.0015};
 root.userData.dispose=()=>{figure.geometry.dispose();material.dispose()};
 root.userData.artwork='painted-adult';root.userData.robe=visitorProfiles[profile]?.robe||robe;root.userData.identity=profile;
 return root;
}
