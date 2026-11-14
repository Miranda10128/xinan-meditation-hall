export const seasons={
 spring:{label:'春 · 新芽',file:'assets/forest-spring.webp',fog:'#9da994',ground:'#71815a',sky:'#eef1db',water:'#789d94'},
 summer:{label:'夏 · 林深',file:'assets/forest-summer.webp',fog:'#819180',ground:'#67744f',sky:'#e1ebdc',water:'#6b9993'},
 autumn:{label:'秋 · 落叶',file:'assets/forest-autumn.webp',fog:'#a49b7e',ground:'#897552',sky:'#f1e3c8',water:'#8a9880'},
 winter:{label:'冬 · 薄雪',file:'assets/forest-winter.webp',fog:'#bdc6c4',ground:'#cdd2ca',sky:'#e1e9eb',water:'#839ba2'}
};
export function createSeasonController({initial='summer',load,apply,onError=()=>{}}){
 let current=seasons[initial]?initial:'summer',request=0;
 return {get current(){return current},async select(id){if(!seasons[id])return false;const token=++request;if(id===current)return true;try{const texture=await load(seasons[id].file);if(token!==request){texture.dispose?.();return false}apply(id,seasons[id],texture);current=id;return true}catch(error){if(token===request)onError(error);return false}}};
}
