export const natureTracks=[{id:'water',label:'潺潺流水',icon:'waves'},{id:'birds',label:'林间鸟鸣',icon:'bird'},{id:'leaves',label:'树叶沙沙',icon:'leaf'},{id:'wind',label:'山林微风',icon:'wind'},{id:'rain',label:'细雨',icon:'cloud-rain'}];
export function createSoundscape({makeAudio=src=>new Audio(src),onError=()=>{}}={}){
 const players=new Map(),levels=new Map(natureTracks.map(t=>[t.id,0]));let enabled=false,paused=false,duck=false;
 for(const track of natureTracks){const audio=makeAudio(`assets/ambience/${track.id}.mp3`);audio.preload='none';audio.loop=true;audio.volume=0;audio.id=`nature-${track.id}`;audio.addEventListener('error',()=>onError(track.label));players.set(track.id,audio);}
 function apply(){for(const [id,audio]of players){const level=levels.get(id);audio.volume=level*.30*(duck?.48:1);if(!enabled||paused||!level){audio.pause();continue}if(audio.paused)audio.play().catch(error=>{if(error.name!=='AbortError'&&enabled&&!paused&&levels.get(id)>0)onError(natureTracks.find(t=>t.id===id).label)});}}
 return {players,levels,setLevel(id,level){if(!levels.has(id))return;levels.set(id,Math.max(0,Math.min(1,Number(level)||0)));apply()},sync(options){enabled=!!options.enabled;paused=!!options.paused;duck=!!options.duck;apply()},stop(){enabled=false;for(const audio of players.values())audio.pause();}};
}
