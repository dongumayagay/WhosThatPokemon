// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const oak=readFileSync('src/lib/components/ProfessorOak.svelte','utf8');

test('Oak question form appears before the answer bubble and character art',()=>{
 const form=oak.indexOf('onsubmit={ask}');
 const bubble=oak.indexOf('aria-live="polite"');
 const art=oak.indexOf('src={sprite}');
 assert.ok(form>0&&bubble>form&&art>bubble,'On mobile, input then answer then art must appear in that order');
});

test('new answer is announced and scrolled into view, not hidden above the form',()=>{
 assert.match(oak,/bind:this=\{speechElement\}/);
 assert.match(oak,/speechElement\?\.focus\(/);
 assert.match(oak,/speechElement\?\.scrollIntoView\(/);
 assert.match(oak,/ANSWER READY/);
});

test('dialog can be dismissed by keyboard and its input has a safe mobile tap size',()=>{
 assert.match(oak,/svelte:window onkeydown/);
 assert.match(oak,/min-h-\[48px\]/);
 assert.match(oak,/text-base/);
});
