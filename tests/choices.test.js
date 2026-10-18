// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';
import { createChoiceIds } from '../src/lib/choice-options.js';

test('three choices are unique even when random repeatedly selects the same index',()=>{
 const options = createChoiceIds(42,898,()=>0);
 assert.equal(options.length,3);
 assert.equal(new Set(options).size,3);
 assert.equal(options.includes(42),true);
});
test('all IDs are valid and include the correct Pokémon at the edge of the dataset',()=>{
 const options=createChoiceIds(898,898,()=>0.999);
 assert.equal(options.length,3);
 assert.equal(new Set(options).size,3);
 assert.ok(options.every(id=>id>=1&&id<=898));
 assert.ok(options.includes(898));
});
