// @ts-nocheck — synthetic Node test fixtures.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SHAPE_SIZE, encodeSilhouette, silhouetteDistance } from '../src/lib/silhouette-math.js';
import { createDifficultyChoices } from '../src/lib/difficulty.js';

function shape(rows, width=rows[0].length) {
  const alpha = rows.join('').split('').map(char => char === '#' ? 255 : 0);
  return encodeSilhouette(alpha, width, rows.length);
}
const square = shape(['..........','..######..','..######..','..######..','..######..','..........']);
const squareTwin = shape(['..........','..######..','..######..','..######..','..######..','..........']);
const thin = shape(['..........','....##....','....##....','....##....','....##....','..........']);
const wings = shape(['##......##','####..####','..######..','....##....','....##....','..........']);
const mirroredWing = shape(['##......##','####..####','..######..','....##....','....##....','..........']);
const rightFacing = shape(['##........','####......','.#####....','..####....','...##.....','..........']);
const leftFacing = shape(['........##','......####','....#####.','....####..','.....##...','..........']);
const tall = shape(['...#...','...#...','...#...','...#...','...#...','...#...','...#...','...#...']);
const bar = shape(['........','..####..','..####..','........']);

test('shape encoding normalizes an outline to 24x24 packed bits', () => {
  assert.equal(SHAPE_SIZE,24);
  assert.equal(Array.from(atob(square[0]), c => c.charCodeAt(0)).length,72);
  assert.ok(square[1]>0);
  assert.throws(() => encodeSilhouette(new Uint8Array([255]),3,5),RangeError);
  assert.throws(() => encodeSilhouette(new Uint8Array(4),2,2),RangeError);
});
test('shape distance compares pixels, not Pokédex IDs', () => {
  assert.equal(silhouetteDistance(square,squareTwin),0);
  assert.ok(silhouetteDistance(square,thin)>0.05);
  assert.ok(silhouetteDistance(square,wings)>0.05);
  assert.ok(silhouetteDistance(square,squareTwin)<silhouetteDistance(square,wings));
});
test('shape matching allows flipped poses but still respects aspect ratio', () => {
  assert.ok(silhouetteDistance(wings,mirroredWing)<0.02);
  assert.ok(silhouetteDistance(rightFacing,leftFacing)<0.08,'flipped silhouettes should match');
  assert.ok(silhouetteDistance(tall,bar)>silhouetteDistance(square,squareTwin));
});
test('three difficulty tiers pick harder-looking distractors from same pool', () => {
  const index=[];
  index[25]=square;
  index[172]=squareTwin;
  index[31]=thin;
  index[33]=wings;
  index[89]=tall;
  index[99]=bar;
  const pool=[25,172,31,33,89,99];
  const counts=[151,100,135,107,156,72,88,89];
  const easy=createDifficultyChoices(25,pool,counts,'easy',()=>0,index);
  const normal=createDifficultyChoices(25,pool,counts,'normal',()=>0,index);
  const expert=createDifficultyChoices(25,pool,counts,'expert',()=>0,index);
  assert.equal(easy.length,3);
  assert.equal(normal.length,4);
  assert.equal(expert.length,4);
  for(const result of [easy,normal,expert]){
    assert.equal(new Set(result).size,result.length);
    assert.ok(result.includes(25));
    assert.ok(result.every(id=>pool.includes(id)));
  }
  assert.ok(expert.includes(172),'expert should select visually identical decoy');
  assert.ok(!easy.includes(172),'easy should avoid identical decoy');
  assert.deepEqual(createDifficultyChoices(25,pool,counts,'expert',()=>0,index),expert);
});
test('missing shapes produce safe same-generation fallback, not incorrect data', () => {
  const ids=[25,26,172,201,202,203];
  const result=createDifficultyChoices(25,ids,[151,100,135,107,156,72,88,89],'expert',()=>0,[]);
  assert.equal(result.length,4);
  assert.ok(result.includes(25));
  assert.equal(new Set(result).size,4);
  assert.throws(()=>createDifficultyChoices(25,[25,26],[], 'expert',Math.random,[]),RangeError);
});

import realShapes from '../src/lib/silhouette-data.json' with {type:'json'};

test('the shipped similarity index covers all 898 supported Pokémon',()=>{
  assert.equal(realShapes.length,899);
  for(let id=1;id<=898;id++){
    assert.equal(typeof realShapes[id]?.[0],'string',`missing shape for #${id}`);
    assert.equal(realShapes[id][0].length,96);
    assert.ok(realShapes[id][1]>0);
  }
});
test('on real sprites, Expert decoys have closer shapes than Normal and Easy',()=>{
  const all=Array.from({length:898},(_,i)=>i+1);
  const counts=[151,100,135,107,156,72,88,89];
  for(const target of [1,25,94,150,259,384,650,898]){
    const rank={};
    for(const tier of ['easy','normal','expert']){
      const choices=createDifficultyChoices(target,all,counts,tier,()=>0.48,realShapes);
      rank[tier]=choices.filter(id=>id!==target).reduce((sum,id)=>sum+silhouetteDistance(realShapes[target],realShapes[id]),0)/(choices.length-1);
    }
    assert.ok(rank.expert<rank.normal,`${target} expert must be closer than normal`);
    assert.ok(rank.normal<rank.easy,`${target} normal must be closer than easy`);
  }
});
