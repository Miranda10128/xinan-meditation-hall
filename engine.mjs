export const segments = [
  [0,1200,'压腿热身','seg01_yatui.mp3','压腿热身，量力而行；随时可以跳过。'],
  [1200,1260,'七支座','seg02_qizhi.mp3','七支座：盘腿、脊直、肩张、手结定印、头正微倾、舌抵上腭、目视下垂。'],
  [1260,1500,'开场发心','seg03_faxin.mp3','接下来这段时间，只属于自己。'],
  [1500,1680,'清除旧息','seg04_qingxi.mp3','有力呼气七次，把紧张呼出去。'],
  [1680,2100,'安顿','music_anton.mp3','什么都不用做，就坐着，听一会儿音乐。'],
  [2100,3180,'主修','seg05_zhuxiu.mp3','深呼吸，不憋气；走神了就回来，回到呼吸上。'],
  [3180,3480,'收尾音乐','music_shouwei.mp3','练习做完了，把呼吸还给它自己，坐一会儿，听听音乐。'],
  [3480,3540,'收束','seg06_shoushu.mp3','把这份安静收好，带走。'],
  [3540,3600,'静候起身',null,'把这份安静收好，带走。'],
];
export function hourStart(now) { const d = new Date(now); d.setMinutes(0,0,0); return d.getTime(); }
export function locate(seconds) {
  const index = segments.findIndex(s => seconds >= s[0] && seconds < s[1]);
  if(index < 0) return null;
  const s=segments[index], bridge=index<7 && seconds>=s[1]-10;
  return {index,title:s[2],subtitle:s[4],file:bridge?'music_bridge.mp3':s[3],offset:bridge?seconds-(s[1]-10):seconds-s[0],bridge};
}
export function lampStrength(created, now=Date.now()) { return Math.max(0, Math.min(1, 1-(now-created)/(3*86400000))); }
export function formatTime(seconds) { const n=Math.max(0,Math.ceil(seconds)); return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`; }
export function lightAt(hour) { return hour>=5&&hour<9?'dawn':hour>=9&&hour<17?'day':hour>=17&&hour<20?'dusk':'night'; }
