// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const control=readFileSync('src/lib/components/Control.svelte','utf8');
const state=readFileSync('src/lib/state.svelte.js','utf8');
const oak=readFileSync('src/lib/components/ProfessorOak.svelte','utf8');

test('current and best streak stay visible in compact game feedback',()=>{
 assert.match(state,/bestStreak:/);
 assert.match(state,/streak:/);
 assert.match(control,/Streak/);
 assert.match(control,/role="status"/);
 assert.match(control,/Correct!|Nice try/);
});
test('Oak example questions are one tap, not a new chat thread',()=>{
 assert.match(oak,/\{#each quickQuestions as prompt\}/);
 assert.match(oak,/onclick=\{\(\) => askQuestion\(prompt\)\}/);
 assert.match(oak,/disabled=\{loading\}/);
 assert.match(oak,/aria-live="polite"/);
});
