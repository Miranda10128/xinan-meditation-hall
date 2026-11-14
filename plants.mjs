import * as T from './assets/vendor/three.module.js';
import {mergeGeometries} from './assets/vendor/three-addons/utils/BufferGeometryUtils.js';

const templates=new WeakMap(),untextured=[];
// Nearby foliage is actual curved geometry: turning the camera reveals leaf
// undersides and the pot's volume instead of rotating a flat photograph.
export function createPottedPlant(leafMap=null,variant=0){
 const type=Math.abs(variant)%3;const bank=leafMap?(templates.get(leafMap)||[]):untextured;
 if(leafMap&&!templates.has(leafMap))templates.set(leafMap,bank);
 if(!bank[type])bank[type]=buildPlant(leafMap,type);
 return bank[type].clone(true);
}
function buildPlant(leafMap,type){
 const root=new T.Group(),leafMat=new T.MeshStandardMaterial({color:'#ffffff',map:leafMap,emissiveMap:leafMap,emissive:'#ffffff',emissiveIntensity:.10,side:T.DoubleSide,roughness:.78}),stemMat=new T.MeshStandardMaterial({color:'#718450',roughness:.84}),clayMat=new T.MeshStandardMaterial({color:'#d8c9ae',roughness:.94}),soilMat=new T.MeshStandardMaterial({color:'#504735',roughness:1});
 const parts=new Map();
 function piece(g,m,matrix=new T.Matrix4()){const p=g.clone().applyMatrix4(matrix);g.dispose();if(!parts.has(m))parts.set(m,[]);parts.get(m).push(p);}
 const profile=[[.18,0],[.23,.02],[.29,.16],[.32,.36],[.31,.48],[.27,.61],[.265,.64],[.235,.64],[.235,.58]].map(([x,y])=>new T.Vector2(x,y));
 piece(new T.LatheGeometry(profile,40),clayMat);
 const soil=new T.CircleGeometry(.235,32);soil.rotateX(-Math.PI/2);soil.translate(0,.585,0);piece(soil,soilMat);
 for(let i=0;i<8;i++){
  const angle=i*2.399+type*.55,baseY=1.05+(i%3)*.24,length=.72+(i%4)*.14,width=.19+(i%3)*.035,tilt=i<3?.85:-.10;
  const rotation=new T.Matrix4().makeRotationY(angle);
  const stem=new T.CatmullRomCurve3([new T.Vector3(0,.59,0),new T.Vector3(.03,baseY*.78,0),new T.Vector3(.12,baseY,0)]);
  piece(new T.TubeGeometry(stem,12,.015,6,false),stemMat,rotation);
  const positions=[],uv=[],indices=[],rows=20,columns=8;
  for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++){
   const t=y/rows,w=x/columns*2-1,halfWidth=width*Math.sin(Math.PI*t)**.7;
   positions.push(.12+length*t,baseY+.30*Math.sin(Math.PI*t)+tilt*t+.035*(1-Math.abs(w))+.012*Math.sin(t*24+i)*Math.abs(w),w*halfWidth);
   uv.push((w+1)/2,t);
  }
  for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){const a=y*(columns+1)+x,b=a+columns+1;indices.push(a,a+1,b,b,a+1,b+1)}
  const leaf=new T.BufferGeometry();leaf.setAttribute('position',new T.Float32BufferAttribute(positions,3));leaf.setAttribute('uv',new T.Float32BufferAttribute(uv,2));leaf.setIndex(indices);leaf.computeVertexNormals();piece(leaf,leafMat,rotation);
 }
 for(const [material,geometries]of parts){const geometry=mergeGeometries(geometries,false);for(const g of geometries)g.dispose();const mesh=new T.Mesh(geometry,material);mesh.userData.surface=material===clayMat?'pot':material===soilMat?'soil':material===stemMat?'stem':'leaf';mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);}
 return root;
}

export function createUnderstory(leafMap,variant=0){const plant=createPottedPlant(leafMap,variant);for(const mesh of [...plant.children])if(['pot','soil'].includes(mesh.userData.surface))plant.remove(mesh);plant.position.y=-.59;const root=new T.Group();root.add(plant);return root;}
