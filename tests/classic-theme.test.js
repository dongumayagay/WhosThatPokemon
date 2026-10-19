// @ts-nocheck - visual-design contracts; end-to-end flow covered by Playwright.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const stage = readFileSync('src/lib/components/PokemonImage.svelte','utf8');
const header = readFileSync('src/lib/components/Header.svelte','utf8');
const page = readFileSync('src/routes/+page.svelte','utf8');
const control = readFileSync('src/lib/components/Control.svelte','utf8');
const css = readFileSync('src/app.css','utf8');

test('anime eyecatch becomes the hero instead of a generic arcade orb',()=>{
  assert.match(page,/data-visual="classic-eyecatch"/);
  assert.match(stage,/class="classic-speedlines"/);
  assert.match(stage,/class="classic-burst"/);
  assert.match(stage,/class="mystery-mark"/);
  assert.match(header,/Who's That/);
});

test('mystery uses a masked silhouette and anime-style spoken reveal after guessing',()=>{
  assert.match(stage,/class="mystery-silhouette"/);
  assert.match(stage,/mask-image:\s*var\(--sprite-mask\)/);
  assert.match(stage,/\{#if gameState\.hidePokemon\}/);
  assert.match(stage,/class="reveal-callout"/);
  assert.match(stage,/It's/);
  assert.match(stage,/imageStatus==='error'/);
});

test('classic design is responsive, accessible and motion optional',()=>{
  assert.match(css,/CLASSIC EYECATCH THEME/);
  assert.match(css,/\.site-shell/);
  assert.match(css,/@media\s*\(max-width:\s*400px\)/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(stage,/prefers-reduced-motion:reduce/);
  assert.match(control,/class="answers-grid"/);
  assert.match(control,/Daily Dex/);
  assert.match(control,/Gym Trials/);
  assert.match(page,/Pokedex/);
});
