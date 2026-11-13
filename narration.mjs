export const narration = {
  "title": "自然呼吸与安住",
  "voice": "AI 配音试听稿",
  "cues": [
    {
      "id": 0,
      "text": "欢迎来到心安禅修堂。接下来，给自己一点时间。不需要完成任何事，先在这里，安静地坐一会儿。",
      "file": "assets/narration/cue-00.mp3",
      "duration": 12.216
    },
    {
      "id": 1,
      "text": "找一个能够坐稳的位置。可以坐在垫子上，也可以坐在椅子上。让身体得到支撑，不必勉强盘腿。",
      "file": "assets/narration/cue-01.mp3",
      "duration": 11.496
    },
    {
      "id": 2,
      "text": "背部自然向上，肩膀轻轻放松。双手放在舒服的地方。眼睛可以轻轻闭上，也可以保留一点柔和的视线。",
      "file": "assets/narration/cue-02.mp3",
      "duration": 14.664
    },
    {
      "id": 3,
      "text": "感觉一下，身体和坐垫接触的地方。让身体的重量，慢慢交给下方的支撑。此刻，你已经在这里了。",
      "file": "assets/narration/cue-03.mp3",
      "duration": 11.496
    },
    {
      "id": 4,
      "text": "现在，留意自己的呼吸。不必吸得更深，也不必刻意放慢。让呼吸保持自然，只是感觉它的进出。",
      "file": "assets/narration/cue-04.mp3",
      "duration": 11.544
    },
    {
      "id": 5,
      "text": "你可以感觉鼻尖附近的气息，也可以感觉腹部轻微的起伏。选择一个感觉清楚的地方，轻轻地陪伴它。",
      "file": "assets/narration/cue-05.mp3",
      "duration": 13.32
    },
    {
      "id": 6,
      "text": "当你发现自己正在想别的事情，不需要责备自己。知道自己走神了，就已经回来了。再感觉一下，这一口呼吸。",
      "file": "assets/narration/cue-06.mp3",
      "duration": 13.44
    },
    {
      "id": 7,
      "text": "如果身体需要调整，可以慢慢动一动，找到更舒服的位置。安稳之后，再把注意力，轻轻放回呼吸上。",
      "file": "assets/narration/cue-07.mp3",
      "duration": 15.168
    },
    {
      "id": 8,
      "text": "接下来，少一些语言。让自己安静地坐着。呼吸来的时候，知道它来了。呼吸离开的时候，知道它离开了。",
      "file": "assets/narration/cue-08.mp3",
      "duration": 13.176
    },
    {
      "id": 9,
      "text": "没有特别的感觉，也没有关系。清楚地知道自己正在坐着，就可以。一次又一次，温和地回来。",
      "file": "assets/narration/cue-09.mp3",
      "duration": 12.72
    },
    {
      "id": 10,
      "text": "这段练习，快要结束了。把注意力慢慢放宽，感觉整个身体，也听一听周围的声音。不必急着起身。",
      "file": "assets/narration/cue-10.mp3",
      "duration": 12.672
    },
    {
      "id": 11,
      "text": "轻轻动一动手指和脚趾。如果闭着眼睛，可以慢慢睁开。按自己的节奏，结束这次练习。愿你带着一点安稳，回到接下来的生活。",
      "file": "assets/narration/cue-11.mp3",
      "duration": 16.272
    }
  ]
};

// Place real spoken clips between periods of silence; never speed up the audio.
export function planNarration(cues,totalSeconds){
  if(!Number.isFinite(totalSeconds)||totalSeconds<=0)return [];
  let chosen=totalSeconds>=210?cues:totalSeconds>=120?cues.filter(c=>[0,1,4,6,10,11].includes(c.id)):totalSeconds>=65?cues.filter(c=>[0,4,11].includes(c.id)):cues.filter(c=>c.id===11);
  const spoken=chosen.reduce((n,c)=>n+c.duration,0);
  if(spoken+3>totalSeconds)return [];
  const weights=[2,3,4,5,10,14,14,14,14,9,5];
  const available=totalSeconds-spoken-3,weightTotal=chosen.slice(0,-1).reduce((n,c)=>n+(weights[c.id]||5),0);
  let at=0;
  return chosen.map((cue,i)=>{const item={...cue,at,end:at+cue.duration};at=item.end+(i<chosen.length-1?available*(weights[cue.id]||5)/weightTotal:0);return item});
}
