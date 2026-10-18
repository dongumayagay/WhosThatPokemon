// @ts-nocheck - Node regression checks, not browser-side code.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync('src/routes/+page.svelte','utf8');
const header = readFileSync('src/lib/components/Header.svelte','utf8');
const image = readFileSync('src/lib/components/PokemonImage.svelte','utf8');
const control = readFileSync('src/lib/components/Control.svelte','utf8');
const styles = readFileSync('src/app.css','utf8');
const gen = readFileSync('src/lib/components/SelectGenerations.svelte','utf8');
const oak = readFileSync('src/lib/components/ProfessorOak.svelte','utf8');

test('game content can grow taller than the viewport and scroll naturally',()=>{
 assert.match(page,/min-h-dvh/);
 assert.doesNotMatch(page,/class="h-screen[^"]*overflow-y-auto"/);
 assert.doesNotMatch(page,/container h-screen/);
 assert.doesNotMatch(page,/scrollTo\(0,\s*1\)/);
});
test('answers are in a compact two-column mobile grid with usable hit areas',()=>{
 assert.match(control,/grid-cols-2/);
 assert.match(control,/min-h-\[48px\]/);
});
test('hidden Pokémon is drawn as a mask, never as a previewable color image',()=>{
 assert.match(image,/class="pokemon-silhouette\b/);
 assert.match(image,/mask-image/);
 assert.match(image,/\{#if gameState.hidePokemon\}/);
 assert.match(image,/-webkit-touch-callout:\s*none/);
});
test('header height is controlled by its responsive element, not an overriding class',()=>{
 assert.match(header,/h-20/);
 assert.doesNotMatch(styles,/\.header\s*\{[^}]*@apply h-full/);
});
test('generation picker and Oak dialog can scroll on short mobile screens',()=>{
 assert.match(gen,/max-h-\[calc\(100dvh-2rem\)\]/);
 assert.match(gen,/overflow-y-auto/);
 assert.match(oak,/overflow-y-auto/);
});

test('start-screen question mark cannot exceed the mobile image stage height',()=>{
 assert.match(image,/text-\[clamp\(80px,20dvh,160px\)\]/);
 assert.match(image,/leading-none/);
});
