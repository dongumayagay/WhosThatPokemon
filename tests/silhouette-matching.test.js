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
