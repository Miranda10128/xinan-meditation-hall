export const meditationTracks=[
 {id:'meditation',title:'静心即兴',original:'Meditation Impromptu 01',file:'assets/music/meditation.mp3'},
 {id:'fresh-air',title:'清风',original:'Fresh Air',file:'assets/music/fresh-air.mp3'},
 {id:'clean-soul',title:'澄澈',original:'Clean Soul',file:'assets/music/clean-soul.mp3'},
 {id:'fluidscape',title:'流动的风景',original:'Fluidscape',file:'assets/music/fluidscape.mp3'}
];
export function createMusicPlaylist({audio,tracks=meditationTracks,random=Math.random,getLast=()=>null,remember=()=>{},getStart=()=>null,rememberStart=()=>{},onTrack=()=>{},shouldPlay=()=>false,onPlayRequested=()=>{}}){
 let queue=[],current=null,previousStart=getStart();
 function refill(last,first=null){queue=[...tracks];for(let i=queue.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[queue[i],queue[j]]=[queue[j],queue[i]]}let pick=queue.findIndex(track=>track.id!==last&&track.id!==first);if(pick<0)pick=queue.findIndex(track=>track.id!==first);if(pick>0)[queue[0],queue[pick]]=[queue[pick],queue[0]];}
 function next(){if(!queue.length)refill(current?.id||getLast());current=queue.shift();audio.pause();audio.src=current.file;remember(current.id);onTrack(current);return current;}
 audio.loop=false;
 audio.addEventListener('ended',()=>{next();if(shouldPlay())onPlayRequested()});
 return {get current(){return current},beginVisit(){refill(current?.id||getLast(),getStart()||previousStart);const track=next();previousStart=track.id;rememberStart(track.id);return track},next};
}
