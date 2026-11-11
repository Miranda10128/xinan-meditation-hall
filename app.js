import {config} from './config.js';
import {hourStart,locate,lampStrength,formatTime,lightAt} from './engine.mjs';
const $=id=>document.getElementById(id);
const store={get(key,fallback){try{return JSON.parse(localStorage.getItem('xinan.'+key))??fallback}catch{return fallback}},set(key,value){try{localStorage.setItem('xinan.'+key,JSON.stringify(value))}catch{}}};
const words={
  "zh": {
    "brand": "心安禅修堂",
    "menu": "打开菜单",
    "close": "关闭",
    "welcome": "坐下来，给心一点安静。",
    "intro": "这是心安禅修堂，每小时整点一场，也可以随时静坐 20 分钟。",
    "start": "随便坐，开始",
    "choose": "我想自己选个蒲团",
    "sitBack": "坐回去",
    "changeSeat": "换个地方坐",
    "sitHere": "点这里坐下",
    "reminder": "深呼吸，不憋气；走神了就回来",
    "guide": "温和的动作示范",
    "openSound": "开声音",
    "expand": "展开练习设置",
    "collapse": "收起练习设置",
    "skip": "跳过压腿，直接打坐 →",
    "entryTitle": "怎么坐这一场",
    "follow": "跟当前场",
    "followHelp": "加入正在进行的一场，到整点结束。",
    "restart": "从头开始",
    "restartHelp": "从压腿起完整走一遍。",
    "quick": "独自静坐 20 分钟",
    "quickHelp": "不跟场，自己坐 20 分钟。",
    "soundTitle": "画面与声音",
    "breathOnly": "只要呼吸圈",
    "musicOnly": "只要音乐",
    "silent": "完全无声",
    "volume": "音量",
    "leave": "起身",
    "helpTitle": "进堂说明",
    "postureHelp": "看看七支座坐姿",
    "lampTitle": "供灯龛",
    "lampHeading": "留一盏灯，安放一个愿。",
    "lampHelp": "只亮在你的设备里，三日渐暗。",
    "disclaimer": "这里是静心空间，不做诊断、不做治疗。",
    "help1": "选蒲团、确认名字，就能坐下。默认无声，想听音乐时点“开声音”。",
    "help2": "跟当前整点场、从头开始，或自己坐 20 分钟。压腿量力而行，随时可跳过、起身。",
    "help3": "自然呼吸，不必追赶圆环或屏息。名字、座位和灯愿只留在本机。",
    "enter": "知道了，进堂",
    "nameTitle": "选一个安静的名字",
    "shuffle": "换一个 ↻",
    "customName": "自己的名字（最多 4 字）",
    "namePlaceholder": "也可以自己起一个",
    "confirmName": "就用这个名字",
    "seatTitle": "选一席，坐下来",
    "seatAlt": "水彩禅堂俯瞰，前景中央有一席空蒲团",
    "seats": "可选蒲团",
    "seatHint": "轻点蒲团选席；前景中央是为你留的空位。",
    "qizhiAlt": "七支座：盘腿坐稳，脊背挺直，双肩放松，双手轻放腿上",
    "wishLabel": "写一句愿（最多 20 字）",
    "wishPlaceholder": "愿你我，平安自在",
    "lightLamp": "点亮这盏灯",
    "seeYou": "好，明天再来",
    "quoteTitle": "点一下，换一句",
    "inhale": "吸气…",
    "exhale": "呼气…",
    "rest": "放松，照常呼吸",
    "deepRhythm": "吸 5 · 放松 2 · 呼 7 · 放松 2 秒",
    "softRhythm": "吸 5 秒 · 呼 7 秒",
    "soundEnded": "这一场的声音已结束",
    "soundSilent": "声音已关闭",
    "soundPlaying": "正在播放：禅修音乐",
    "soundBell": "声音已开启：开始与结束时各一声磬",
    "soundLoading": "音乐正在准备，请稍候…",
    "soundError": "音乐暂时未能播放，请再点一次“开声音”。",
    "soundVolumeZero": "音量为 0，可拖动滑块调高",
    "ended": "这一段安静结束了，可以慢慢起身。",
    "skipped": "已跳过压腿，接下来调整坐姿。",
    "offlineReady": "页面已准备离线使用 · 个人记录只在本地",
    "offlineError": "首次请保持联网，稍后可再试离线打开",
    "lampLit": "灯愿尚温",
    "lampDim": "点一盏灯",
    "lampMessage": "愿望只留在这里，可以改写或重新点亮。",
    "lampEmpty": "写不写愿，都可以点灯。",
    "panoramaAlt": "水彩禅堂，左右拖动看景",
    "second": "秒",
    "welcomeBack": "欢迎回来，{name}",
    "backQuestion": "坐回第 {seat} 席？",
    "nickname": "{name} · 第 {seat} 席",
    "seatLabel": "第 {seat} 席",
    "bow": "合掌 · {name}",
    "followTimer": "跟本场到 {end} · 还剩 {time}",
    "restartTimer": "本场 {end} 结束 · 还剩 {time}",
    "quickTimer": "静坐到 {end} · 还剩 {time}",
    "goodbye": "今天坐了 {minutes} 分钟，辛苦了。明天再来。",
    "nextSession": "下一场 {time} 开始",
    "stageStretch": "轻轻活动双腿，为久坐做准备。",
    "stagePosture": "坐稳、放松，让脊背自然挺直。",
    "stageSettle": "把手头的事放下，给自己一点安静。",
    "stageBreathe": "把注意力轻轻放回呼吸。",
    "stageClose": "把这份安静收好，带回生活里。",
    "bodyStretch": "拉到微微发紧就停；不舒服时，随时跳过。",
    "bodyPosture": "盘腿坐稳，双肩放松，双手轻放腿上。",
    "bodyRest": "什么都不用赶，安静坐一会儿。"
  },
  "en": {
    "brand": "Xinan Meditation Hall",
    "menu": "Open menu",
    "close": "Close",
    "welcome": "Sit down. Let your mind settle.",
    "intro": "A quiet meditation hall. Sessions begin every hour, or you can sit for 20 minutes whenever you like.",
    "start": "Take a seat and begin",
    "choose": "I would like to choose a cushion",
    "sitBack": "Return to my seat",
    "changeSeat": "Choose another seat",
    "sitHere": "Sit here",
    "reminder": "Breathe deeply, without holding. When your mind wanders, gently return.",
    "guide": "Gentle movement demonstration",
    "openSound": "Turn sound on",
    "expand": "Open practice settings",
    "collapse": "Close practice settings",
    "skip": "Skip stretching and sit →",
    "entryTitle": "How would you like to sit?",
    "follow": "Join this session",
    "followHelp": "Join the session in progress. It ends on the hour.",
    "restart": "Start from the beginning",
    "restartHelp": "A full session, beginning with stretching.",
    "quick": "Sit on your own for 20 minutes",
    "quickHelp": "Your own 20-minute timer, separate from the hourly session.",
    "soundTitle": "View and sound",
    "breathOnly": "Breathing circle only",
    "musicOnly": "Music only",
    "silent": "Keep it silent",
    "volume": "Volume",
    "leave": "Leave my seat",
    "helpTitle": "A gentle introduction",
    "postureHelp": "See the seated posture",
    "lampTitle": "A small lamp",
    "lampHeading": "Leave a light and a quiet wish.",
    "lampHelp": "It stays on this device, fading over three days.",
    "disclaimer": "A space for quiet reflection, not diagnosis or treatment.",
    "help1": "Choose a cushion and confirm your name to sit down. Sound starts off; choose “Turn sound on” when you want music.",
    "help2": "Join the hourly session, start at the beginning, or sit for 20 minutes. Stretch gently. You can skip it or leave at any time.",
    "help3": "Breathe comfortably; you need not keep up with the circle or hold your breath during a pause. Your name, seat and wishes stay on this device.",
    "enter": "Come into the hall",
    "nameTitle": "Choose a quiet name",
    "shuffle": "Another name ↻",
    "customName": "Your own name (up to 4 characters)",
    "namePlaceholder": "Or choose your own",
    "confirmName": "Use this name",
    "seatTitle": "Choose a cushion",
    "seatAlt": "A watercolor view of the hall; an empty cushion is waiting in the foreground",
    "seats": "Available cushion choices",
    "seatHint": "Tap a cushion. The empty one in the center foreground is waiting for you.",
    "qizhiAlt": "Sit steadily with an upright back, relaxed shoulders and hands resting on your lap",
    "wishLabel": "A short wish (up to 20 characters)",
    "wishPlaceholder": "May we be safe and at ease",
    "lightLamp": "Light this lamp",
    "seeYou": "Until tomorrow",
    "quoteTitle": "Tap for another thought",
    "inhale": "Breathe in…",
    "exhale": "Breathe out…",
    "rest": "Relax; breathe naturally",
    "deepRhythm": "In 5 · ease 2 · out 7 · ease 2 seconds",
    "softRhythm": "Breathe in 5 · out 7 seconds",
    "soundEnded": "This session’s sound has ended.",
    "soundSilent": "Sound is off",
    "soundPlaying": "Playing: meditation music",
    "soundBell": "Sound is on: one bell at the start and end",
    "soundLoading": "Preparing the music…",
    "soundError": "The music could not play. Please try “Turn sound on” again.",
    "soundVolumeZero": "Volume is 0; move the slider to hear sound",
    "ended": "Your quiet time is complete. Take your time getting up.",
    "skipped": "Stretching skipped. Settle into a comfortable seat.",
    "offlineReady": "Ready for offline use · Your details stay on this device",
    "offlineError": "Please stay connected for the first visit; try offline again later",
    "lampLit": "Your lamp is glowing",
    "lampDim": "Light a lamp",
    "lampMessage": "Your wish stays here. You may change it or light the lamp again.",
    "lampEmpty": "A wish is optional. You can simply light a lamp.",
    "panoramaAlt": "Watercolor meditation hall; drag sideways to look around",
    "second": "sec",
    "welcomeBack": "Welcome back, {name}",
    "backQuestion": "Return to seat {seat}?",
    "nickname": "{name} · Seat {seat}",
    "seatLabel": "Seat {seat}",
    "bow": "A quiet greeting · {name}",
    "followTimer": "Together until {end} · {time} left",
    "restartTimer": "Your session ends {end} · {time} left",
    "quickTimer": "Your sit ends {end} · {time} left",
    "goodbye": "You sat for {minutes} minutes. Thank you. Come back tomorrow.",
    "nextSession": "The next session begins at {time}",
    "stageStretch": "Gently loosen your legs and prepare to sit.",
    "stagePosture": "Sit steadily and let your back rise naturally.",
    "stageSettle": "Set your tasks aside. Give yourself a quiet moment.",
    "stageBreathe": "Gently return your attention to the breath.",
    "stageClose": "Carry a little of this quiet into your day.",
    "bodyStretch": "Stop at a gentle stretch. Skip it whenever you need.",
    "bodyPosture": "Sit steadily, relax your shoulders and rest your hands on your lap.",
    "bodyRest": "There is no hurry. Simply sit for a while."
  }
};
const quoteEn=['Home is where the mind is at ease.','It is all right to slow down.','Sit down, and let the world grow quiet.','While the breath is here, you are home.','No hurry. This hour is yours.','Let your shoulders soften; let your mind settle.','Quiet has room for everything.','Rest a while, then begin again.','The wind passes; the tree remains.','You have done enough today. Sit for a while.'];
let lang=store.get('language',navigator.language.toLowerCase().startsWith('zh')?'zh':'en');if(!words[lang])lang='zh';
const t=(key,values={})=>Object.entries(values).reduce((text,[k,v])=>text.replaceAll('{'+k+'}',String(v)),words[lang][key]??words.zh[key]??key);
let session=null,selectedSeat=108,suggestedName='',quoteIndex=Number(store.get('quote',new Date().getDate()%10)),lastSeat=store.get('seat',null),lamp=store.get('lamp',null),pan=0,videoSource='',qizhiSeen=false,qizhiOrigin='',previousQizhi=false,noticeKey='',lastAudioTick=0,offlineKey='';
const savedName=()=>{const name=store.get('name','');return typeof name==='string'?Array.from(name.trim()).slice(0,4).join(''):'';};
if(!Number.isInteger(lastSeat)||lastSeat<1||lastSeat>108)lastSeat=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const audio=new Audio(),bell=new Audio('assets/qing.mp3');audio.preload='none';bell.preload='auto';
let sound='silent',presentation='all',source='',audioLoading=false,audioFailed=false,volume=Number(store.get('volume',55));if(!Number.isFinite(volume))volume=55;volume=Math.max(0,Math.min(100,volume));
$('volume').value=String(volume);$('volumeOutput').value=volume+'%';
function play(media){const promise=media.play();if(promise)promise.catch(error=>{if(error.name==='AbortError')return;audioFailed=true;updateSoundStatus();});}
function stop(){audio.pause();bell.pause();source='';audioLoading=false;}
function ring(){if(sound==='music'&&volume>0){bell.volume=volume/100;bell.currentTime=0;play(bell);}}
function updateSoundStatus(){let key=session?.done&&sound==='music'?'soundEnded':sound==='silent'?'soundSilent':audioFailed?'soundError':volume===0?'soundVolumeZero':audioLoading?'soundLoading':'soundPlaying';$('soundStatus').textContent=t(key)+(sound==='music'&&!audioFailed?' · '+volume+'%':'');$('openSound').hidden=!session||session.done;$('openSound').textContent=sound==='silent'||audioFailed?t('openSound'):volume===0?t('soundVolumeZero'):audioLoading?t('soundLoading'):t('soundPlaying')+' · '+volume+'%';$('openSound').classList.toggle('is-playing',sound==='music');$('openSound').setAttribute('aria-label',$('openSound').textContent+' · '+$('soundStatus').textContent);for(const [id,preset]of [['breathOnly','breath'],['musicOnly','music'],['silentMode','all']])$(id).setAttribute('aria-pressed',String(presentation===preset&&(id==='musicOnly'?sound==='music':sound==='silent')));}
audio.addEventListener('playing',()=>{audioLoading=false;audioFailed=false;updateSoundStatus();});audio.addEventListener('waiting',()=>{audioLoading=true;updateSoundStatus();});audio.addEventListener('error',()=>{audioFailed=true;audioLoading=false;updateSoundStatus();});
function setSound(mode,preset='all'){sound=mode;presentation=preset;audioFailed=false;stop();updatePresentation();tick(true);}
$('openSound').onclick=()=>{if(sound==='music'&&!audioFailed)setPracticeCollapsed(false);else setSound('music');};$('breathOnly').onclick=()=>setSound('silent','breath');$('musicOnly').onclick=()=>setSound('music','music');$('silentMode').onclick=()=>setSound('silent','all');
$('volume').oninput=()=>{volume=Number($('volume').value);audio.volume=volume/100;bell.volume=volume/100;store.set('volume',volume);$('volumeOutput').value=volume+'%';updateSoundStatus();};
function updatePresentation(){$('practiceVisual').hidden=!session||presentation==='music';$('guideFrame').hidden=!session||presentation!=='all';if($('guideFrame').hidden)$('guideVideo').pause();else updateGuide(position());updateSoundStatus();}
function syncAudio(p,force=false){if(!session||session.done||sound==='silent'){audio.pause();source='';return;}const point=session.mode==='quick'?null:locate(Math.min(p,3599.99));let file='music_bed.mp3',offset=p,loop=true;
  if(point?.bridge){file='music_bridge.mp3';offset=point.offset;}
  else if(point?.file==='music_anton.mp3'||point?.file==='music_shouwei.mp3'){file=point.file;offset=point.offset;}
  const changed=source!==file;if(changed){source=file;audio.src='assets/'+file;audio.loop=loop;audioLoading=true;}
  audio.volume=(volume/100)*(point?.bridge?Math.max(.08,1-point.offset/10):1);
  const seek=()=>{if(!session||source!==file)return;const target=Number.isFinite(audio.duration)&&audio.duration>0?offset%audio.duration:offset;if(force||changed||Math.abs(audio.currentTime-target)>2)try{audio.currentTime=target}catch{}};
  if(audio.readyState>=1)seek();else audio.onloadedmetadata=seek;if(audio.paused||changed)play(audio);updateSoundStatus();
}
audio.addEventListener('ended',()=>{if(session&&!session.done)tick(true);});
function renderQuote(){$('quote').textContent=(lang==='en'?quoteEn:config.quotes)[quoteIndex%config.quotes.length];$('quote').title=t('quoteTitle');}
$('quote').onclick=()=>{quoteIndex=(quoteIndex+1)%config.quotes.length;store.set('quote',quoteIndex);renderQuote();};
function renderWelcome(){const returning=!!(lastSeat&&savedName());$('newActions').hidden=returning;$('returnActions').hidden=!returning;$('welcomeTitle').textContent=returning?t('welcomeBack',{name:savedName()}):t('welcome');$('welcomeText').textContent=returning?t('backQuestion',{seat:lastSeat}):t('intro');}
function translate(){document.documentElement.lang=lang==='zh'?'zh-CN':'en';document.title=t('brand');for(const e of document.querySelectorAll('[data-i18n]'))e.textContent=t(e.dataset.i18n);for(const [attr,data]of [['aria-label','i18nAria'],['placeholder','i18nPlaceholder'],['alt','i18nAlt']])for(const e of document.querySelectorAll(`[data-${data.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}]`))e.setAttribute(attr,t(e.dataset[data]));$('language').textContent=lang==='zh'?'English':'中文';if(offlineKey)$('offlineStatus').textContent=t(offlineKey);$('panorama').setAttribute('aria-label',t('panoramaAlt'));$('panoramaImage').alt=t('panoramaAlt');for(const b of document.querySelectorAll('.seat'))b.setAttribute('aria-label',t('seatLabel',{seat:b.dataset.seat}));renderQuote();renderWelcome();renderLamp();updateSoundStatus();setPracticeCollapsed($('practice').classList.contains('collapsed'));if(session)$('nickname').textContent=t('nickname',{name:session.name,seat:session.seat});tick(true);}
$('language').onclick=()=>{lang=lang==='zh'?'en':'zh';store.set('language',lang);translate();};
// These hit areas follow cushions visible in the supplied painting, rather than an invented grid.
const seatPoints=[[108,50,88],[1,25,72],[2,50,73],[3,80,73],[4,12,60],[5,33,60],[6,69,60],[7,85,60],[8,3,50],[9,20,50],[10,35,50],[11,65,50],[12,80,50],[13,98,50],[14,15,44],[15,25,44],[16,39,43],[17,63,43],[18,73,44],[19,88,44],[20,96,44],[21,3,38],[22,12,39],[23,25,39],[24,36,40],[25,61,40],[26,73,40],[27,83,39],[28,94,39],[29,18,35],[30,27,35],[31,65,33],[32,72,35],[33,83,35]];
for(const [id,x,y]of seatPoints){const button=document.createElement('button');button.className='seat'+(id===108?' recommended':'')+(id===lastSeat?' favorite':'');button.dataset.seat=String(id);button.style.left=x+'%';button.style.top=y+'%';const label=document.createElement('span');label.textContent=String(id);button.append(label);button.onclick=()=>{$('seatDialog').close();chooseName(id);};$('seats').append(button);}
function openSeats(){closeCorner();setPracticeCollapsed();$('seatDialog').showModal();}
$('chooseSeat').onclick=openSeats;$('changeSeat').onclick=openSeats;
function randomName(exclude){const choices=config.names.filter(name=>name!==exclude);return choices[Math.floor(Math.random()*choices.length)];}
function chooseName(seat){closeCorner();setPracticeCollapsed();selectedSeat=seat;suggestedName=savedName()||randomName('');$('suggestedName').textContent=suggestedName;$('customName').value='';$('nameDialog').dataset.seat=String(seat);$('nameDialog').showModal();}
$('randomSeat').onclick=()=>chooseName(lastSeat||108);$('sceneSeat').onclick=()=>chooseName(lastSeat||108);$('sitBack').onclick=()=>enter(lastSeat||108,savedName());
$('shuffleName').onclick=()=>{suggestedName=randomName(suggestedName);$('suggestedName').textContent=suggestedName;$('customName').value='';};
function limitName(){$('customName').value=Array.from($('customName').value).slice(0,4).join('');}
$('customName').addEventListener('input',event=>{if(!event.isComposing)limitName();});$('customName').addEventListener('compositionend',limitName);
$('nameForm').onsubmit=event=>{event.preventDefault();const name=Array.from($('customName').value.trim()).slice(0,4).join('')||suggestedName;store.set('name',name);$('nameDialog').close();enter(selectedSeat,name);};
function position(now=Date.now()){return session?Math.max(0,(now-session.start)/1000):0;}
function resetPosture(){qizhiSeen=false;previousQizhi=false;qizhiOrigin='';if($('qizhiDialog').open)$('qizhiDialog').close();}
function enter(seat,name){const now=Date.now();lastSeat=seat;store.set('seat',seat);session={seat,name:name||savedName()||randomName(''),mode:'follow',start:hourStart(now),duration:3600,entered:now,done:false};resetPosture();sound='silent';presentation='all';stop();noticeKey='';$('welcome').hidden=true;$('practice').hidden=false;$('nickname').hidden=false;$('nickname').textContent=t('bow',{name:session.name});$('nickname').classList.add('bowing');setTimeout(()=>{if(session){$('nickname').textContent=t('nickname',{name:session.name,seat:session.seat});$('nickname').classList.remove('bowing');}},700);$('cornerLeave').hidden=false;document.body.classList.add('is-seated');closeCorner();setPracticeCollapsed();for(const r of document.querySelectorAll('[name=entry]'))r.checked=r.value==='follow';for(const b of document.querySelectorAll('.seat'))b.classList.toggle('favorite',Number(b.dataset.seat)===seat);updatePresentation();tick(true);}
function setMode(mode){if(!session)return;session.mode=mode;session.start=mode==='follow'?hourStart(Date.now()):Date.now();session.duration=mode==='quick'?1200:3600;session.done=false;source='';noticeKey='';resetPosture();ring();tick(true);}
for(const radio of document.querySelectorAll('[name=entry]'))radio.onchange=()=>setMode(radio.value);
$('skip').onclick=()=>{if(!session)return;session.start=Date.now()-1200000;session.mode='restart';session.done=false;source='';noticeKey='skipped';for(const r of document.querySelectorAll('[name=entry]'))r.checked=r.value==='restart';resetPosture();tick(true);};
function clockLabel(timestamp){return new Intl.DateTimeFormat(lang==='zh'?'zh-CN':'en-GB',{hour:'2-digit',minute:'2-digit',hour12:false}).format(timestamp);}
function leave(){if(!session)return;const minutes=Math.max(0,Math.floor((Date.now()-session.entered)/60000));session=null;stop();resetPosture();$('guideVideo').pause();videoSource='';$('guideFrame').hidden=true;$('practiceVisual').hidden=true;$('openSound').hidden=true;$('practice').hidden=true;$('nickname').hidden=true;$('cornerLeave').hidden=true;$('welcome').hidden=false;document.body.classList.remove('is-seated');$('stage').textContent='';$('subtitle').textContent='';$('notice').textContent='';$('remaining').textContent='';setPracticeCollapsed();closeCorner();renderWelcome();$('goodbyeTitle').textContent=t('goodbye',{minutes});$('nextSession').textContent=t('nextSession',{time:clockLabel(hourStart(Date.now())+3600000)});$('goodbye').showModal();if('mediaSession'in navigator)navigator.mediaSession.playbackState='none';}
$('leave').onclick=leave;$('cornerLeave').onclick=leave;
function setPracticeCollapsed(collapsed=true){document.body.classList.toggle('settings-open',!collapsed);$('practice').classList.toggle('collapsed',collapsed);$('practiceDetails').hidden=collapsed;$('collapsePractice').setAttribute('aria-expanded',String(!collapsed));$('collapsePractice').setAttribute('aria-label',t(collapsed?'expand':'collapse'));$('collapsePractice').textContent=collapsed?'⌃':'⌄';if(!collapsed)closeCorner();}
$('collapsePractice').onclick=()=>setPracticeCollapsed(!$('practice').classList.contains('collapsed'));
function closeCorner(){document.body.classList.remove('menu-open');$('cornerPanel').hidden=true;$('cornerToggle').setAttribute('aria-expanded','false');}
$('cornerToggle').onclick=()=>{const open=$('cornerPanel').hidden;if(open)setPracticeCollapsed();$('cornerPanel').hidden=!open;document.body.classList.toggle('menu-open',open);$('cornerToggle').setAttribute('aria-expanded',String(open));};
function updateGuide(p){if(!session||$('guideFrame').hidden)return;const file=session.mode==='quick'?'guide_still.mp4':p<1200?'guide_stretch.mp4':p<1260?'guide_qizhi.mp4':'guide_still.mp4';const video=$('guideVideo');if(file!==videoSource){videoSource=file;video.src='assets/'+file;video.muted=true;video.volume=0;video.loop=true;video.playsInline=true;}if(!document.hidden&&!reduced.matches&&video.paused){const promise=video.play();if(promise)promise.catch(()=>{});}else if(document.hidden||reduced.matches){video.pause();}}
function updatePosture(p){const inPosture=session&&session.mode!=='quick'&&!session.done&&p>=1200&&p<1260;if(inPosture&&!qizhiSeen&&!document.querySelector('dialog[open]')){qizhiSeen=true;qizhiOrigin='auto';$('qizhiDialog').showModal();}if(previousQizhi&&!inPosture&&$('qizhiDialog').open){$('qizhiDialog').close();qizhiOrigin='';}previousQizhi=!!inPosture;}
$('closeQizhi').onclick=()=>{$('qizhiDialog').close();qizhiOrigin='';};$('qizhiDialog').addEventListener('cancel',()=>{qizhiOrigin='';});
$('postureHelp').onclick=()=>{closeCorner();qizhiOrigin='manual';$('qizhiDialog').showModal();};
function breathState(p){const deep=session?.mode!=='quick'&&p>=2100&&p<2400;let phase=(deep?p-2100:p)%(deep?16:12),scale,key,seconds;if(phase<5){scale=.82+.38*phase/5;key='inhale';seconds=5-phase;}else if(deep&&phase<7){scale=1.2;key='rest';seconds=7-phase;}else if(phase<(deep?14:12)){const elapsed=phase-(deep?7:5);scale=1.2-.38*elapsed/7;key='exhale';seconds=7-elapsed;}else{scale=.82;key='rest';seconds=16-phase;}return{scale,key,seconds:Math.ceil(seconds),deep};}
function tick(force=false){const now=Date.now();document.querySelector('.light').className='light '+lightAt(new Date(now).getHours());if(!session)return;const p=position(now),remaining=session.duration-p;
  if(remaining<=0&&!session.done){session.done=true;stop();ring();noticeKey='ended';$('openSound').hidden=true;if('mediaSession'in navigator)navigator.mediaSession.playbackState='paused';}
  const point=locate(Math.min(p,3599.99));const stageKey=session.done?'stageClose':session.mode==='quick'?'stageBreathe':p<1200?'stageStretch':p<1260?'stagePosture':p<1500?'stageSettle':p<3480?'stageBreathe':'stageClose';
  $('stage').textContent=t(stageKey);$('subtitle').textContent=t(p<1200&&session.mode!=='quick'?'bodyStretch':p<1260&&session.mode!=='quick'?'bodyPosture':'bodyRest');$('notice').textContent=noticeKey?t(noticeKey):'';
  $('remaining').textContent=session.done?t('ended'):t(session.mode==='follow'?'followTimer':session.mode==='quick'?'quickTimer':'restartTimer',{end:clockLabel(session.start+session.duration*1000),time:formatTime(remaining)});$('skip').hidden=session.done||session.mode==='quick'||p>=1200;
  const breath=breathState(p);$('breathing').style.setProperty('--breath-scale',session.done?'1':breath.scale);$('breathText').textContent=t(session.done?'rest':breath.key);$('breathTiming').textContent=breath.seconds+' '+t('second')+' · '+t(breath.deep?'deepRhythm':'softRhythm');
  updateGuide(p);updatePosture(p);if(force||now-lastAudioTick>=1000){syncAudio(p,force);updateSoundStatus();lastAudioTick=now;}
  if('mediaSession'in navigator&&'MediaMetadata'in window&&force)navigator.mediaSession.metadata=new MediaMetadata({title:t('brand'),artist:t('reminder'),artwork:[{src:new URL('assets/icon-192.png',location.href).href,sizes:'192x192',type:'image/png'}]});
}
setInterval(()=>tick(),200);document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('motion-paused',document.hidden);if(document.hidden)$('guideVideo').pause();else{tick(true);renderLamp();}});window.addEventListener('pageshow',()=>tick(true));reduced.addEventListener('change',()=>tick(true));
if('mediaSession'in navigator){navigator.mediaSession.setActionHandler('play',()=>{if(session&&sound==='music')tick(true);});navigator.mediaSession.setActionHandler('pause',()=>setSound('silent',presentation));}
function renderLamp(){const strength=lamp&&Number.isFinite(lamp.created)?lampStrength(lamp.created):0;$('lampButton').style.setProperty('--lamp-opacity',.15+.85*strength);$('lampText').textContent=t(strength>0?'lampLit':'lampDim');}
setInterval(renderLamp,60000);$('lampButton').onclick=()=>{closeCorner();$('wish').value=lamp?.wish||'';$('wishCount').textContent=Array.from($('wish').value).length+' / 20';$('lampMessage').textContent=t(lamp?'lampMessage':'lampEmpty');$('lampDialog').showModal();};$('wish').oninput=()=>{$('wish').value=Array.from($('wish').value).slice(0,20).join('');$('wishCount').textContent=Array.from($('wish').value).length+' / 20';};$('lampForm').onsubmit=event=>{event.preventDefault();lamp={wish:Array.from($('wish').value.trim()).slice(0,20).join(''),created:Date.now()};store.set('lamp',lamp);renderLamp();$('lampDialog').close();};
$('helpButton').onclick=()=>{closeCorner();$('help').showModal();};for(const button of document.querySelectorAll('[data-close]'))button.onclick=()=>$(button.dataset.close).close();
$('help').addEventListener('close',()=>store.set('welcomed',true));$('help').addEventListener('cancel',()=>store.set('welcomed',true));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeCorner();});
let drag=null;function setPan(value){const max=Math.max(0,($('panoramaPlane').getBoundingClientRect().width-innerWidth)/2);pan=Math.max(-max,Math.min(max,value));$('panoramaPlane').style.setProperty('--pan',pan+'px');}
$('panorama').addEventListener('pointerdown',event=>{if(event.target.closest('button'))return;drag={x:event.clientX,pan};$('panorama').setPointerCapture(event.pointerId);});$('panorama').addEventListener('pointermove',event=>{if(drag)setPan(drag.pan+event.clientX-drag.x);});for(const type of ['pointerup','pointercancel'])$('panorama').addEventListener(type,()=>{drag=null;});$('panorama').addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();setPan(pan+(event.key==='ArrowLeft'?40:-40));}});window.addEventListener('resize',()=>setPan(pan));
for(let i=0;i<16;i++){const particle=document.createElement('i');particle.style.left=(15+(i*37)%70)+'%';particle.style.top=(20+(i*23)%60)+'%';particle.style.animationDelay=(-i*1.9)+'s';particle.style.animationDuration=(18+i%6*3)+'s';$('dust').append(particle);}
translate();renderLamp();updateSoundStatus();if(!store.get('welcomed',false))$('help').showModal();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').then(()=>{$('offlineStatus').textContent=t(offlineKey='offlineReady');}).catch(()=>{$('offlineStatus').textContent=t(offlineKey='offlineError');});
