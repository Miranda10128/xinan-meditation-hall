import test from 'node:test';
import assert from 'node:assert/strict';
import {Scene,MeshStandardMaterial} from '../assets/vendor/three.module.js';
import {createForestGround,forestGroundHeight} from '../atmosphere.mjs';
import {seasons,loadSeasonAssets,createSeasonController} from '../seasons.mjs';

test('forest terrain is softly uneven, below the pavilion, with shared instanced stones',()=>{
 const {ground,stones}=createForestGround(new Scene(),new MeshStandardMaterial());
 const positions=ground.geometry.attributes.position;let min=0,max=-1;
 for(let i=0;i<positions.count;i++){const y=positions.getY(i);assert.ok(Number.isFinite(y));min=Math.min(min,y);max=Math.max(max,y);assert.ok(y<-.46&&y>-.74);}
 assert.ok(max-min>.18);assert.equal(stones.count,48);assert.ok(forestGroundHeight(10,10)<-.46);
});

test('a seasonal horizon and forest floor load as one disposable pair',async()=>{
 const loaded=[],disposed=[];
 const bundle=await loadSeasonAssets(seasons.winter,async file=>{loaded.push(file);return {dispose(){disposed.push(file)}}});
 assert.deepEqual(loaded,[seasons.winter.file,seasons.winter.floorFile]);bundle.dispose();assert.equal(disposed.length,2);
});

test('a missing seasonal floor leaves the old season and disposes the newly loaded horizon',async()=>{
 let disposed=0,applied=0,errors=0;
 const controller=createSeasonController({initial:'summer',load:(_file,palette)=>loadSeasonAssets(palette,async file=>{
  if(file===palette.floorFile)throw new Error('offline floor');return {dispose(){disposed++}};
 }),apply(){applied++},onError(){errors++}});
 assert.equal(await controller.select('winter'),false);assert.equal(controller.current,'summer');assert.equal(applied,0);assert.equal(disposed,1);assert.equal(errors,1);
});
