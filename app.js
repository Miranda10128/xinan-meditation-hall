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
function play(media){const p=media.play();if(p)p.catch(()=>{if(session&&sound!=='silent')$('notice').textContent='声音未能播放，请再点一次声音选项。'});}
function stop(){for(const a of [audio,bed,bell])a.pause();source='';}
function ring(){if(sound!=='silent'){bell.currentTime=0;play(bell);}}
function showQuote(){ $('quote').textContent=config.quotes[quoteIndex%config.quotes.length]; }
showQuote();$('quote').onclick=()=>{quoteIndex=(quoteIndex+1)%config.quotes.length;store.set('quote',quoteIndex);showQuote();};
if(Number.isInteger(config.tonightCount)&&config.tonightCount>=0){$('count').hidden=false;$('count').textContent=`今晚已有 ${config.tonightCount} 位同修坐过`;}
for(let i=1;i<=108;i++){const b=document.createElement('button');b.className='seat'+(i===lastSeat?' favorite':'');b.setAttribute('aria-label',`第 ${i} 席空蒲团`);b.onclick=()=>enter(i,'follow');$('seats').append(b);}
function position(now=Date.now()){return session?Math.max(0,(now-session.start)/1000):0;}
function setMode(mode){if(!session)return;session.mode=mode;session.start=mode==='follow'?hourStart(Date.now()):Date.now();session.duration=mode==='quick'?1200:3600;session.done=false;source='';$('notice').textContent='开始了';ring();tick(true);}
function enter(seat,mode){lastSeat=seat;store.set('seat',seat);session={seat,name:config.names[Math.floor(Math.random()*config.names.length)],start:mode==='follow'?hourStart(Date.now()):Date.now(),duration:mode==='quick'?1200:3600,mode,done:false};$('lobby').hidden=true;$('practice').hidden=false;$('practice').classList.add('bowing');$('nickname').textContent=`合掌 · ${session.name}`;setTimeout(()=>{if(session)$('nickname').textContent=`${session.name} · 第 ${seat} 席`;},700);$('notice').textContent='开始了';ring();tick(true);$('practice').scrollIntoView({behavior:'smooth',block:'start'});}
$('randomSeat').onclick=()=>enter(Number.isInteger(lastSeat)&&lastSeat>=1&&lastSeat<=108?lastSeat:1+Math.floor(Math.random()*108),'follow');
$('quickSit').onclick=()=>enter(lastSeat||1,'quick');$('resume').onclick=()=>enter(lastSeat||1,'follow');
$('leave').onclick=()=>{session=null;stop();$('practice').hidden=true;$('lobby').hidden=false;$('resume').hidden=false;if('mediaSession'in navigator)navigator.mediaSession.playbackState='none';};
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
for(const input of document.querySelectorAll('[name=sound]')){input.checked=input.value===sound;input.addEventListener('change',()=>{sound=input.value;store.set('sound',sound);stop();$('notice').textContent=sound==='silent'?'已切换为无声':'占位音频为静音，真实素材替换后即可听见。';tick(true);});}
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
