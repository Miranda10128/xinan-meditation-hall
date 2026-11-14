export const breathTiming={inhale:4,exhale:6};
export function breathingFrame(milliseconds,timing=breathTiming){
 const cycle=timing.inhale+timing.exhale,t=((Math.max(0,milliseconds)/1000)%cycle+cycle)%cycle;
 const inhaling=t<timing.inhale,duration=inhaling?timing.inhale:timing.exhale,phaseTime=inhaling?t:t-timing.inhale;
 const progress=phaseTime/duration,eased=.5-.5*Math.cos(Math.PI*progress);
 return {word:inhaling?'吸气':'呼气',phase:inhaling?'inhale':'exhale',duration,remaining:Math.max(1,Math.ceil(duration-phaseTime)),progress,scale:inhaling?.70+.42*eased:1.12-.42*eased};
}
