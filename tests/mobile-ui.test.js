// @ts-nocheck - focused markup regressions; full interactions in mobile_playwright.py
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const page=readFileSync('src/routes/+page.svelte','utf8');
const image=readFileSync('src/lib/components/PokemonImage.svelte','utf8');
const control=readFileSync('src/lib/components/Control.svelte','utf8');
const styles=readFileSync('src/app.css','utf8');
const gen=readFileSync('src/lib/components/SelectGenerations.svelte','utf8');
const oak=readFileSync('src/lib/components/ProfessorOak.svelte','utf8');

test('arcade layout scrolls normally instead of trapping content in the viewport',()=>{
  assert.match(page,/class="site-shell"/);
  assert.doesNotMatch(page,/overflow-hidden\s+h-screen/);
  assert.match(styles,/min-height:100dvh/);
  assert.match(styles,/overflow-x:hidden/);
});
test('mobile answers use a two-column grid and a usable tap size',()=>{
  assert.match(control,/class="answers-grid"/);
  assert.match(styles,/\.answers-grid\{display:grid;grid-template-columns:1fr 1fr/);
  assert.match(styles,/\.answer-option\{min-height:72px/);
});
test('mystery is a CSS mask and revealed color art is gated by answer state',()=>{
  assert.match(image,/mystery-silhouette/);
  assert.match(image,/mask-image:\s*var\(--sprite-mask\)/);
  assert.match(image,/\{#if gameState.hidePokemon\}/);
  assert.match(image,/\{:else\}\s*<div class="reveal-rings"/);
  assert.match(image,/role="img"\s+aria-label="Mystery Pokémon silhouette"/);
});
test('daily, gym, collection and settings are reachable from home',()=>{
  assert.match(control,/Daily Dex/);
  assert.match(control,/Gym Trials/);
  assert.match(page,/Pokedex/);
  assert.match(page,/GameSettings/);
  assert.match(control,/getGym/);
});
test('user settings and system reduced-motion are respected',()=>{
  assert.match(styles,/prefers-reduced-motion:reduce/);
  assert.match(page,/data-motion=/);
  assert.match(page,/Open game settings/);
});
test('existing generation picker and Professor Oak still scroll on short phones',()=>{
  assert.match(gen,/max-h-\[calc\(100dvh-2rem\)\]/);
  assert.match(gen,/overflow-y-auto/);
  assert.match(oak,/overflow-y-auto/);
});
