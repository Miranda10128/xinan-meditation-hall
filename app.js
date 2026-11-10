import * as THREE from './assets/vendor/three.module.js';
import {config} from './config.js';
import {hourStart,locate,lampStrength,formatTime,lightAt} from './engine.mjs';
const $=id=>document.getElementById(id);
const store={get(key,fallback){try{return JSON.parse(localStorage.getItem('xinan.'+key))??fallback}catch{return fallback}},set(key,value){try{localStorage.setItem('xinan.'+key,JSON.stringify(value))}catch{$('notice').textContent='本地存储不可用，本次仍可静坐。'}}};
const audio=new Audio(),bed=new Audio(),bell=new Audio('assets/qing.mp3');
audio.preload='auto';bed.preload='auto';bed.src='assets/music_bed.mp3';bed.loop=true;bed.volume=.22;
let session=null,source='',sound=store.get('sound','silent'),quoteIndex=Number(store.get('quote',new Date().getDate()%config.quotes.length)),lastTick=0;
if(!['silent','music','breath','guided'].includes(sound))sound='silent';
let lastSeat=store.get('seat',null), lamp=store.get('lamp',null);
$('resume').hidden=!lastSeat;
function play(media){const p=media.play();if(p)p.catch(error=>{if(error.name==='AbortError')return;if(session&&sound!=='silent')$('notice').textContent='声音未能播放，请再点一次声音选项。'});}
function stop(){for(const a of [audio,bed,bell])a.pause();source='';}
function ring(){if(sound!=='silent'){bell.currentTime=0;play(bell);}}
function showQuote(){ $('quote').textContent=config.quotes[quoteIndex%config.quotes.length]; }
showQuote();$('quote').onclick=()=>{quoteIndex=(quoteIndex+1)%config.quotes.length;store.set('quote',quoteIndex);showQuote();};
// Coordinates are percentages of the uncropped 1920×1080 painting, back to front.
const seatRows = [
  {y:65.3,left:23,right:77,width:3.2},
  {y:69.3,left:21,right:79,width:3.6},
  {y:73.3,left:18,right:82,width:4.0},
  {y:77.3,left:15,right:85,width:4.5},
  {y:81.3,left:11.5,right:88.5,width:5.0},
  {y:85.3,left:8,right:92,width:5.6},
  {y:89.3,left:6,right:94,width:6.2},
  {y:93.3,left:5.5,right:94.5,width:6.8},
  {y:97.3,left:5,right:95,width:7.4},
];
const seats=[];
for(let i=1;i<=108;i++){
  const row=seatRows[Math.floor((i-1)/12)],col=(i-1)%12;
  const b=document.createElement('button');b.className='seat'+(i===lastSeat?' favorite':'');
  b.setAttribute('aria-label',`第 ${i} 席`);b.title=`第 ${i} 席`;
  b.style.left=`${row.left+(row.right-row.left)*col/11}%`;b.style.top=`${row.y}%`;
  b.style.setProperty('--seat-width',`${row.width}%`);
  b.onclick=()=>chooseName(i,'follow');$('seats').append(b);seats.push(b);
}
let pendingEntry=null,suggestedName='';
function randomName(exclude){const options=config.names.filter(name=>name!==exclude);return options[Math.floor(Math.random()*options.length)];}
function savedName(){const value=store.get('name','');return typeof value==='string'?Array.from(value.trim()).slice(0,4).join(''):'';}
function chooseName(seat,mode,random=false){
  pendingEntry={seat,mode};$('nameDialog').dataset.seat=String(seat);suggestedName=(!random&&savedName())||randomName('');
  $('suggestedName').textContent=suggestedName;$('customName').value='';$('nameDialog').showModal();
}
$('shuffleName').onclick=()=>{suggestedName=randomName(suggestedName);$('suggestedName').textContent=suggestedName;$('customName').value='';};
function limitName(){ $('customName').value=Array.from($('customName').value).slice(0,4).join(''); }
$('customName').addEventListener('input',event=>{if(!event.isComposing)limitName();});
$('customName').addEventListener('compositionend',limitName);
$('nameForm').onsubmit=event=>{
  event.preventDefault();if(!pendingEntry)return;
  const name=Array.from($('customName').value.trim()).slice(0,4).join('')||suggestedName;
  const {seat,mode}=pendingEntry;pendingEntry=null;store.set('name',name);$('nameDialog').close();enter(seat,mode,name);
};
function showSeatMarker(seat,name){
  const b=seats[seat-1];if(!b||!name)return;
  for(const item of seats)item.classList.remove('favorite','selected');
  b.classList.add('favorite','selected');
  $('seatMarker').style.left=b.style.left;$('seatMarker').style.top=b.style.top;
  $('seatMarker').style.setProperty('--marker-scale',.6+(Math.floor((seat-1)/12)/8)*.4);
  $('seatNameplate').textContent=name;$('seatMarker').hidden=false;
}
showSeatMarker(lastSeat,savedName());
const hall3D=createHall3D(id=>chooseName(id,'follow'));
hall3D?.remember(lastSeat);
function centerScene(){if(document.body.classList.contains('webgl-ready'))return;const viewport=$('sceneScroll');viewport.scrollLeft=(viewport.scrollWidth-viewport.clientWidth)/2;}
requestAnimationFrame(centerScene);window.addEventListener('resize',centerScene);
function setPracticeCollapsed(collapsed=true){$('practice').classList.toggle('collapsed',collapsed);$('practiceDetails').hidden=collapsed;$('collapsePractice').setAttribute('aria-expanded',String(!collapsed));$('collapsePractice').setAttribute('aria-label',collapsed?'展开练习面板':'收起练习面板');$('collapsePractice').textContent=collapsed?'⌃':'⌄';}
$('collapsePractice').onclick=()=>setPracticeCollapsed(!$('practice').classList.contains('collapsed'));
$('cornerToggle').onclick=()=>{const open=$('cornerPanel').hidden;$('cornerPanel').hidden=!open;$('cornerToggle').setAttribute('aria-expanded',String(open));};
$('cornerLeave').onclick=()=>$('leave').click();
document.addEventListener('keydown',event=>{if(event.key==='Escape'){$('cornerPanel').hidden=true;$('cornerToggle').setAttribute('aria-expanded','false');}});

function position(now=Date.now()){return session?Math.max(0,(now-session.start)/1000):0;}
function setMode(mode){if(!session)return;session.mode=mode;session.start=mode==='follow'?hourStart(Date.now()):Date.now();session.duration=mode==='quick'?1200:3600;session.done=false;source='';$('notice').textContent='开始了';ring();tick(true);}
function enter(seat,mode,name=savedName()){lastSeat=seat;store.set('seat',seat);session={seat,name:name||randomName(''),start:mode==='follow'?hourStart(Date.now()):Date.now(),duration:mode==='quick'?1200:3600,mode,done:false};$('lobby').hidden=true;document.body.classList.add('is-seated');hall3D?.enter(seat);setPracticeCollapsed();$('nickname').hidden=false;$('leave').hidden=false;$('cornerLeave').hidden=false;$('cornerPanel').hidden=true;$('cornerToggle').setAttribute('aria-expanded','false');showSeatMarker(seat,session.name);centerScene();$('practice').hidden=false;$('practice').classList.add('bowing');$('nickname').textContent=`合掌 · ${session.name}`;setTimeout(()=>{if(session)$('nickname').textContent=`${session.name} · 第 ${seat} 席`;},700);$('notice').textContent='开始了';ring();tick(true);$('sceneShell').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
$('randomSeat').onclick=()=>chooseName(1+Math.floor(Math.random()*108),'follow',true);
$('quickSit').onclick=()=>chooseName(lastSeat||1,'quick');$('resume').onclick=()=>{if(savedName())enter(lastSeat||1,'follow');else chooseName(lastSeat||1,'follow');};
$('leave').onclick=()=>{session=null;stop();document.body.classList.remove('is-seated');hall3D?.leave();setPracticeCollapsed();$('nickname').hidden=true;$('leave').hidden=true;$('cornerLeave').hidden=true;$('remaining').textContent='未入座';$('breathText').textContent='静';$('practice').hidden=false;$('lobby').hidden=false;$('resume').hidden=false;if('mediaSession'in navigator)navigator.mediaSession.playbackState='none';};
$('follow').onclick=()=>setMode('follow');$('restart').onclick=()=>setMode('restart');$('changeQuick').onclick=()=>setMode('quick');
$('skip').onclick=()=>{if(!session)return;session.start=Date.now()-1200000;session.mode='restart';source='';$('notice').textContent='已跳过压腿，从七支座开始。';tick(true);};
function syncAudio(p,force=false){
  if(!session||session.done||sound==='silent'){audio.pause();bed.pause();source='';return;}
  let file,offset=0,loop=false;
  if(session.mode==='quick'){audio.pause();bed.pause();source='';return;}
  const point=locate(p);
  if(sound==='music'){file='music_bed.mp3';offset=p;loop=true;}
  else if(sound==='breath'){file='breath_loop.mp3';offset=p%60;loop=true;}
  else {file=point?.file;offset=point?.offset||0;loop=!!point?.bridge;}
  if(sound==='breath'){if(bed.paused)play(bed);}else bed.pause();
  if(!file){audio.pause();source='';return;}
  const changed=source!==file;
  if(changed){source=file;audio.src='assets/'+file;audio.loop=loop;audio.volume=1;}
  const seek=()=>{if(!session||source!==file)return;let target=offset;if(Number.isFinite(audio.duration)&&audio.duration>0)target=loop?offset%audio.duration:Math.min(offset,Math.max(0,audio.duration-.05));if(force||changed||Math.abs(audio.currentTime-target)>2)try{audio.currentTime=target}catch{}};
  if(audio.readyState>=1)seek();else audio.onloadedmetadata=seek;
  if(audio.paused||changed)play(audio);
  if(point?.bridge&&sound==='guided')audio.volume=Math.max(.08,1-point.offset/10);
}
audio.addEventListener('ended',()=>{if(session&&!session.done)tick(true);});
for(const input of document.querySelectorAll('[name=sound]')){input.checked=input.value===sound;input.addEventListener('change',()=>{sound=input.value;store.set('sound',sound);stop();$('notice').textContent=sound==='silent'?'已切换为无声':'音乐与磬声已接入；分段禅修引导语仍为静音占位。';tick(true);});}
function tick(force=false){const now=Date.now();document.querySelector('.light').className='light '+lightAt(new Date(now).getHours());if(!session)return;
  const p=position(now),remaining=session.duration-p;
  if(remaining<=0&&!session.done){session.done=true;stop();ring();$('notice').textContent='时间到了，请慢慢起身。';if('mediaSession'in navigator)navigator.mediaSession.playbackState='paused';}
  const point=locate(Math.min(p,3599.9));
  $('stage').textContent=session.done?'本次静坐已结束':session.mode==='quick'?'独自静坐':`${point.title}${point.bridge?' · 音乐桥':''}`;
  $('remaining').textContent=formatTime(remaining);$('skip').hidden=session.done||session.mode==='quick'||p>=1200;
  const stretch=!session.done&&session.mode!=='quick'&&p<1200;
  $('stretch').hidden=!stretch;$('posture').hidden=session.done||session.mode==='quick'||p<1200||p>=1260;
  if(stretch){const i=p<360?0:p<600?1:p<900?2:3;$('stretchImage').src=`assets/stretch_${i+1}.png`;$('stretchLabel').textContent=['单腿压腿','双脚掌相对','转体压腿与晃海','换腿与跪姿'][i];}
  $('subtitle').textContent=session.done?'把这份安静收好，带走。':session.mode==='quick'?'什么都不用做，安静坐一会儿。':point.subtitle;
  const phase=p%10,scale=phase<4?.82+.38*(phase/4):1.2-.38*((phase-4)/6);
  $('breathing').style.setProperty('--breath-scale',session.done?'1':scale);$('breathText').textContent=session.done?'心安':phase<4?'吸气':'呼气';
  $('follow').setAttribute('aria-pressed',String(session.mode==='follow'));$('restart').setAttribute('aria-pressed',String(session.mode==='restart'));$('changeQuick').setAttribute('aria-pressed',String(session.mode==='quick'));
  if(force||now-lastTick>=1000){syncAudio(p,force);lastTick=now;}
  if('mediaSession'in navigator&&'MediaMetadata'in window){if(!navigator.mediaSession.metadata||force)navigator.mediaSession.metadata=new MediaMetadata({title:'心安禅修堂',artist:session.mode==='quick'?'静坐 20 分钟':point.title,artwork:[{src:new URL('assets/icon-192.png',location.href).href,sizes:'192x192',type:'image/png'}]});}
}
setInterval(()=>tick(),200);document.addEventListener('visibilitychange',()=>{if(!document.hidden){tick(true);renderLamp();}});window.addEventListener('pageshow',()=>tick(true));
if('mediaSession'in navigator){navigator.mediaSession.setActionHandler('play',()=>tick(true));navigator.mediaSession.setActionHandler('pause',()=>{audio.pause();bed.pause();});}
function renderLamp(){const strength=lamp&&Number.isFinite(lamp.created)?lampStrength(lamp.created):0;$('lampButton').style.setProperty('--lamp-opacity',.15+.85*strength);$('lampText').textContent=strength>0?'灯愿尚温':'点一盏灯';}
renderLamp();setInterval(renderLamp,60000);
$('lampButton').onclick=()=>{$('wish').value=lamp?.wish||'';$('wishCount').textContent=`${Array.from($('wish').value).length} / 20`;$('lampMessage').textContent=lamp?'愿望只留在这里，可以改写或重新点亮。':'写不写愿，都可以点灯。';$('lampDialog').showModal();};
$('wish').oninput=()=>{$('wish').value=Array.from($('wish').value).slice(0,20).join('');$('wishCount').textContent=`${Array.from($('wish').value).length} / 20`;};
$('lampForm').onsubmit=e=>{e.preventDefault();lamp={wish:Array.from($('wish').value.trim()).slice(0,20).join(''),created:Date.now()};store.set('lamp',lamp);renderLamp();$('lampDialog').close();};
$('helpButton').onclick=()=>$('help').showModal();for(const b of document.querySelectorAll('[data-close]'))b.onclick=()=>$(b.dataset.close).close();
if('serviceWorker'in navigator){navigator.serviceWorker.register('./sw.js').then(()=>{$('offlineStatus').textContent='页面已准备离线缓存 · 数据只在本地';}).catch(()=>{$('offlineStatus').textContent='离线缓存不可用，请保持联网';});}
tick();

/** Low-poly hall, in metres. All geometry and materials are local. */
function createHall3D(onSelect) {
  const bootStart=performance.now(),host=$('webglHall'), reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let renderer,contextLost=false;
  try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'}); }
  catch { document.querySelector('.hall-art').src='assets/hall.jpg';host.hidden=true;return null; }
  const canvas=renderer.domElement;host.append(canvas);canvas.setAttribute('aria-label','禅堂场景，俯瞰时点选蒲团，落座后拖动看景');
  canvas.tabIndex=0;renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setClearColor(0xd4d9ca);document.body.classList.add('webgl-ready');
  const scene=new THREE.Scene();scene.background=new THREE.Color(0xd4d9ca);scene.fog=new THREE.Fog(0xd4d9ca,30,100);
  const camera=new THREE.PerspectiveCamera(52,1,.1,180);
  const sky=new THREE.HemisphereLight(0xe9e7cc,0x626e59,2.0);scene.add(sky);
  const sun=new THREE.DirectionalLight(0xffe0ab,2.1);sun.position.set(-8,14,-16);scene.add(sun);
  const warm=new THREE.PointLight(0xffcf89,12,24,2);warm.position.set(0,5,-11);scene.add(warm);
  const mat=(color)=>new THREE.MeshStandardMaterial({color,roughness:1,metalness:0,flatShading:true});
  const wood=mat(0x8e7758),darkWood=mat(0x5d5c48),floorColors=[0xb4aa8d,0xafa68a,0xb8ae92,0xada58d];
  const floorMat=floorColors.map(mat),mats=[mat(0xaaa28d),mat(0x9a9d88),mat(0xa8977e)];
  function mesh(geometry,material,x,y,z,parent=scene){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;}
  const box=(w,h,d,material,x,y,z,parent)=>mesh(new THREE.BoxGeometry(w,h,d),material,x,y,z,parent);
  const cylinder=(rt,rb,h,material,x,y,z,parent,segments=16)=>mesh(new THREE.CylinderGeometry(rt,rb,h,segments),material,x,y,z,parent);
  // Visible seams give a wood-grain rhythm without large textures.
  box(38,.18,36,wood,0,-.13,-1);
  for(let i=0;i<38;i++)box(.975,.025,35.8,floorMat[i%4],i-18.5,-.025,-1);
  const grainMat=new THREE.LineBasicMaterial({color:0x908974,transparent:true,opacity:.32});
  const grain=[];for(let i=0;i<100;i++){const x=-18+(i*1.731)%36,z=-17+(i*2.39)%33;grain.push(x,.002,z,x+.04,.002,z+1.4+(i%4));}
  const grainGeo=new THREE.BufferGeometry();grainGeo.setAttribute('position',new THREE.Float32BufferAttribute(grain,3));scene.add(new THREE.LineSegments(grainGeo,grainMat));
  for(const x of [-18,18])for(const z of [-16,-8,0,8,16]){
    cylinder(.21,.29,7.3,wood,x,3.65,z);cylinder(.36,.4,.25,darkWood,x,.125,z);
    box(.65,.6,33,darkWood,x,7.15,0);
  }
  for(const x of [-8,8]){cylinder(.23,.28,7.3,wood,x,3.65,-16);box(.9,.22,.9,darkWood,x,6.85,-16);}
  // A downward-facing ceiling is visible from the seat, not from the cutaway overview.
  const ceiling=mesh(new THREE.PlaneGeometry(38,36),mat(0x99927a),0,7.65,-1);ceiling.rotation.x=Math.PI/2;
  box(36.5,.65,.55,darkWood,0,7.2,-16);
  box(16,.25,.3,darkWood,0,7.1,-11);
  cylinder(.018,.018,1.6,darkWood,0,6.15,-11);
  const lantern=mesh(new THREE.SphereGeometry(.46,14,8),new THREE.MeshStandardMaterial({color:0xdfca9b,emissive:0xb98b46,emissiveIntensity:.45,roughness:1}),0,5.05,-11);lantern.scale.y=1.12;
  // Low side rails; the overhead view has no roof to obscure the 108 seats.
  for(const x of [-18.2,18.2]){box(.18,.16,35,wood,x,1.05,0);for(let z=-16;z<=16;z+=2)box(.12,.9,.12,wood,x,.48,z);}
  for(const x of [-12,12])box(7.5,6.5,.2,mat(0xa9a68c),x,3.25,-17);
  for(const x of [-7.8,7.8]){box(.23,6.5,.4,wood,x,3.25,-17);for(let y=1;y<6.5;y+=.7)box(.12,.045,2,wood,x,y,-16.2);}
  // Open central doorway, low offering table and a plain, faceless silhouette.
  box(4.7,.55,1.3,darkWood,0,.4,-12.8);box(5,.12,1.5,wood,0,.73,-12.8);
  const offering=mat(0x6f7660),gold=mat(0xbdb081);
  cylinder(.32,.46,.18,gold,0,.9,-12.8);
  const figure=new THREE.Group();figure.position.set(0,.96,-12.8);scene.add(figure);
  const lap=mesh(new THREE.SphereGeometry(.35,10,6),offering,0,.13,0,figure);lap.scale.set(1.5,.5,.7);
  cylinder(.14,.3,.54,offering,0,.43,0,figure,10);mesh(new THREE.SphereGeometry(.14,10,6),offering,0,.83,0,figure);
  for(const x of [-1.35,1.35])cylinder(.18,.11,.18,gold,x,.88,-12.8);
  // Layered ink-wash mountain silhouettes beyond the open door.
  const mountainColors=[0x6f8b7e,0x8da395,0xa9b8a7];
  for(let layer=2;layer>=0;layer--){const shape=new THREE.Shape();shape.moveTo(-55,-2);
    for(let i=0;i<=60;i++){const x=-55+i*110/60;let y=1;for(let peak=0;peak<5;peak++){const center=-42+peak*21+layer*4,spread=6+(peak%3)*2;y+=(4+(peak%3)*2)*Math.exp(-Math.pow((x-center)/spread,2));}shape.lineTo(x,y+layer*1.6);}
    shape.lineTo(55,-2);shape.closePath();const m=mesh(new THREE.ShapeGeometry(shape),new THREE.MeshBasicMaterial({color:mountainColors[layer],side:THREE.DoubleSide}),0,0,-25-layer*9);m.name='mountain-layer';}
  // 1.1 m cushions; lateral gap 1.4 m and fore/aft gap 1.5 m.
  const cushions=[],coords=[],shadowGeo=new THREE.CircleGeometry(.68,20),shadowMat=new THREE.MeshBasicMaterial({color:0x4e5542,transparent:true,opacity:.12,depthWrite:false});
  const cushionGeo=new THREE.CylinderGeometry(.53,.55,.15,24);
  const shadows=new THREE.InstancedMesh(shadowGeo,shadowMat,108),rims=new THREE.InstancedMesh(new THREE.TorusGeometry(.48,.012,4,24),mats[1],108),instance=new THREE.Object3D();scene.add(shadows,rims);
  for(let i=0;i<108;i++){
    const x=((i%12)-5.5)*2.5,z=-8+Math.floor(i/12)*2.6;coords.push(new THREE.Vector3(x,.13,z));
    const cushion=mesh(cushionGeo,mats[i%3],x,.105,z);cushion.userData.seat=i+1;cushions.push(cushion);
    instance.position.set(x,.005,z);instance.rotation.x=-Math.PI/2;instance.updateMatrix();shadows.setMatrixAt(i,instance.matrix);instance.position.y=.18;instance.updateMatrix();rims.setMatrixAt(i,instance.matrix);
  }
  // Fixed set of 22 decorative figures. These are scenery, never participants.
  const decorativeSeats=[3,10,14,21,28,35,39,46,51,58,64,71,75,82,88,95,99,106,6,18,54,90];
  const people=new Map(),robes=[mat(0x727c70),mat(0x8e816e),mat(0x697b78)];
  const headGeo=new THREE.SphereGeometry(.13,8,6),bodyGeo=new THREE.ConeGeometry(.29,.64,10),kneeGeo=new THREE.SphereGeometry(.28,10,6);
  for(const [index,id]of decorativeSeats.entries()){
    const g=new THREE.Group(),p=coords[id-1],robe=robes[index%3];g.position.set(p.x,.18,p.z);scene.add(g);
    mesh(bodyGeo,robe,0,.4,0,g);mesh(headGeo,mat(0xa39c83),0,.87,0,g);
    for(const x of [-.22,.22]){const knee=mesh(kneeGeo,robe,x,.16,.04,g);knee.scale.set(1.3,.5,.85);}
    const hands=mesh(new THREE.SphereGeometry(.12,8,6),robe,0,.3,-.2,g);hands.scale.set(1.8,.55,1);people.set(id,g);
  }
  const ringMat=new THREE.MeshBasicMaterial({color:0xcfbb80,transparent:true,opacity:.42,depthWrite:false});
  const marker=mesh(new THREE.RingGeometry(.58,.62,32),ringMat,0,.19,0);marker.rotation.x=-Math.PI/2;marker.visible=false;
  const halo=mesh(new THREE.CircleGeometry(.53,24),new THREE.MeshBasicMaterial({color:0xe3cf95,transparent:true,opacity:.10,depthWrite:false}),0,.195,0);halo.rotation.x=-Math.PI/2;halo.visible=false;
  let selected=null,seated=false,motion=null,yaw=0,pitch=0,raf=0,lastRender=0,frames=0,slowFrames=0,lightClass='';
  const aim=new THREE.Vector3(),overview=new THREE.Vector3(),overviewAim=new THREE.Vector3(0,0,-1),eye=new THREE.Vector3(),viewAim=new THREE.Vector3();
  function fitOverview(){const aspect=camera.aspect,v=Math.tan(THREE.MathUtils.degToRad(camera.fov/2)),distance=Math.max(43,19.5/(v*aspect));overview.set(0,distance*.79,distance*.64);}
  function resize(){const r=host.getBoundingClientRect();camera.aspect=r.width/r.height;camera.updateProjectionMatrix();renderer.setSize(r.width,r.height,false);delete host.dataset.projected;fitOverview();if(!seated&&!motion){camera.position.copy(overview);aim.copy(overviewAim);camera.lookAt(aim);}}
  function lookingTarget(){const forward=new THREE.Vector3(-eye.x,0,-16-eye.z).normalize(),base=Math.atan2(forward.x,-forward.z),angle=base+yaw;viewAim.set(eye.x+Math.sin(angle)*12,eye.y+Math.tan(pitch)*12,eye.z-Math.cos(angle)*12);return viewAim;}
  function move(toSeat){seated=toSeat;yaw=0;pitch=0;
    if(toSeat){const p=coords[selected-1];eye.set(p.x,1.05,p.z+.24);}
    const end=toSeat?eye:overview,target=toSeat?lookingTarget():overviewAim;
    if(reduced.matches){camera.position.copy(end);aim.copy(target);camera.lookAt(aim);motion=null;}
    else motion={start:performance.now(),from:camera.position.clone(),aim:aim.clone(),to:end.clone(),target:target.clone()};
    host.dataset.view=toSeat?'seated':'overview';delete host.dataset.projected;
  }
  function select(id,active=false){selected=id;const p=coords[id-1];if(!p)return;marker.position.set(p.x,.19,p.z);marker.visible=true;halo.position.set(p.x,.195,p.z);halo.visible=active;for(const [seat,g]of people)g.visible=seat!==id;}
  function syncLight(){const kind=document.querySelector('.light').className;if(kind===lightClass)return;lightClass=kind;
    const settings=kind.includes('night')?[0xabbdd0,.8,0xeacb91,.65,0x91a2a1]:kind.includes('dawn')?[0xc3dcda,1.6,0xf4dcb2,1.3,0xcbd9ce]:kind.includes('dusk')?[0xe9c9b8,1.4,0xf1bd8c,1.6,0xd5c8b4]:[0xe9e7cc,2,0xffe0ab,2.1,0xd4d9ca];
    sky.color.setHex(settings[0]);sky.intensity=settings[1];sun.color.setHex(settings[2]);sun.intensity=settings[3];scene.background.setHex(settings[4]);scene.fog.color.setHex(settings[4]);host.dataset.light=kind.split(' ').pop();
  }
  function render(now){raf=0;if(document.hidden||contextLost)return;raf=requestAnimationFrame(render);if(now-lastRender<32)return;
    const dt=now-lastRender;lastRender=now;syncLight();
    if(motion){const t=Math.min(1,(now-motion.start)/1800),ease=t*t*(3-2*t);camera.position.lerpVectors(motion.from,motion.to,ease);aim.lerpVectors(motion.aim,motion.target,ease);if(t===1)motion=null;}
    else if(seated){camera.position.copy(eye);if(!reduced.matches)camera.position.y+=Math.sin(now/10000*Math.PI*2)*.006;aim.copy(lookingTarget());}
    camera.lookAt(aim);renderer.render(scene,camera);if(!seated&&!motion&&!host.dataset.projected)updateProjections();
    // Reduce resolution on sustained slow devices, never below device ratio 1.
    if(++frames>15){if(dt>65)slowFrames++;if(frames>=75){if(slowFrames>30&&renderer.getPixelRatio()>1)renderer.setPixelRatio(Math.max(1,renderer.getPixelRatio()-.25));frames=0;slowFrames=0;}}
    host.dataset.frames=String(Number(host.dataset.frames||0)+1);host.dataset.eyeHeight=camera.position.y.toFixed(3);host.dataset.yaw=String(yaw);host.dataset.pitch=String(pitch);host.dataset.pixelRatio=String(renderer.getPixelRatio());host.dataset.transition=String(!!motion);
  }
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  function projectedSeat(id){const p=coords[id-1].clone().project(camera),r=canvas.getBoundingClientRect();return{x:(p.x+1)*r.width/2+r.left,y:(1-p.y)*r.height/2+r.top};}
  function updateProjections(){for(let id=1;id<=108;id++){const p=projectedSeat(id);seats[id-1].dataset.screenX=p.x.toFixed(2);seats[id-1].dataset.screenY=p.y.toFixed(2);}host.dataset.projected='true';}
  function pick(x,y){const r=canvas.getBoundingClientRect();pointer.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(cushions,false);if(hits[0])return hits[0].object.userData.seat;
    // Small touch tolerance, with nearest seat winning; never picks a figure.
    let closest=0,distance=10;for(let id=1;id<=108;id++){const p=projectedSeat(id),d=Math.hypot(x-p.x,y-p.y);if(d<distance){distance=d;closest=id;}}return closest;
  }
  let drag=null;
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;if(seated&&!motion){yaw=THREE.MathUtils.clamp(yaw-(e.clientX-drag.x)*.004,-Math.PI*2/9,Math.PI*2/9);pitch=THREE.MathUtils.clamp(pitch+(e.clientY-drag.y)*.003,-Math.PI/12,Math.PI/12);}drag.x=e.clientX;drag.y=e.clientY;});
  canvas.addEventListener('pointerup',e=>{if(drag&&!seated&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<12){const id=pick(e.clientX,e.clientY);if(id)onSelect(id);}drag=null;});canvas.addEventListener('pointercancel',()=>{drag=null;});
  canvas.addEventListener('keydown',e=>{if(!seated)return;const delta=.06;if(e.key==='ArrowLeft')yaw=Math.max(-Math.PI*2/9,yaw-delta);else if(e.key==='ArrowRight')yaw=Math.min(Math.PI*2/9,yaw+delta);else if(e.key==='ArrowUp')pitch=Math.min(Math.PI/12,pitch+delta);else if(e.key==='ArrowDown')pitch=Math.max(-Math.PI/12,pitch-delta);else return;e.preventDefault();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else if(!raf&&!contextLost){lastRender=0;raf=requestAnimationFrame(render);}});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;cancelAnimationFrame(raf);document.body.classList.remove('webgl-ready');document.querySelector('.hall-art').src='assets/hall.jpg';host.hidden=true;});
  window.addEventListener('resize',resize);reduced.addEventListener('change',()=>{if(reduced.matches&&motion){camera.position.copy(motion.to);aim.copy(motion.target);motion=null;}});
  resize();camera.position.copy(overview);aim.copy(overviewAim);camera.lookAt(aim);renderer.render(scene,camera);if(!seated&&!motion&&!host.dataset.projected)updateProjections();raf=requestAnimationFrame(render);host.dataset.view='overview';host.dataset.readyAt=performance.now().toFixed(0);host.dataset.initMs=(performance.now()-bootStart).toFixed(0);host.dataset.ready='true';
  // Projection metadata also makes every semantic seat keyboard reachable and testable.
  for(const [i,button]of seats.entries())button.addEventListener('focus',()=>{button.textContent=`第 ${i+1} 席`;});
  return {enter(id){select(id,true);move(true);},leave(){halo.visible=false;move(false);},remember(id){if(Number.isInteger(id)&&id>=1&&id<=108)select(id);},projectedSeat,decorativeSeats};
}
