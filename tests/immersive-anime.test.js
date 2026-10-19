// @ts-nocheck - markup/animation contract; Cloudflare and browser smoke tests cover rendering.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const page=readFileSync('src/routes/+page.svelte','utf8');
const stage=readFileSync('src/lib/components/PokemonImage.svelte','utf8');
const menu=readFileSync('src/lib/components/Control.svelte','utf8');
const state=readFileSync('src/lib/state.svelte.js','utf8');
const styles=readFileSync('src/app.css','utf8');

test('single immersive 4:3 interstitial with animated vector starburst and speed lines',()=>{
  assert.match(stage,/<svg\s+class="anime-burst"/);
  assert.match(stage,/<polygon/);
  assert.match(stage,/class="anime-speedlines"/);
  assert.match(stage,/class="anime-question"/);
  assert.match(styles,/\.anime-stage\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3/s);
  assert.match(styles,/@keyframes\s+anime-rays/);
  assert.match(styles,/@keyframes\s+anime-burst/);
  assert.match(styles,/@keyframes\s+anime-reveal/);
});

test('mystery silhouette transitions to real color sprite only after answering',()=>{
  assert.match(stage,/class="mystery-silhouette"/);
  assert.match(styles,/mask-image:\s*var\(--sprite-mask\)/);
  assert.match(stage,/\{#if gameState\.hidePokemon\}/);
  assert.match(stage,/class="revealed-sprite"/);
  assert.match(stage,/class="reveal-flash"/);
  assert.match(stage,/aria-live="polite"/);
  assert.match(stage,/Retry image/);
});

test('only multiple-choice controls are under the stage, secondary modes live in collapsed menu',()=>{
  assert.match(page,/<PokemonImage\s*\/>(.|\n)*<Control\s*\/>/);
  assert.match(menu,/class="answers-grid anime-answers"/);
  assert.match(menu,/showModes/);
  assert.match(menu,/aria-modal="true"/);
  assert.match(menu,/Daily Dex/);
  assert.match(menu,/Gym Trials/);
  assert.match(menu,/setDifficulty/);
  assert.match(menu,/Open personal Pokédex/);
  assert.match(state,/showModes:\s*false/);
  assert.doesNotMatch(menu,/class="home-intro"/);
  assert.doesNotMatch(menu,/class="round-dashboard"/);
});

test('responsive mobile answer grid, accessible touch targets and motion opt-out',()=>{
  assert.match(styles,/\.anime-answers\s*\{[^}]*grid-template-columns:\s*repeat\(2/);
  assert.match(styles,/@media\s*\(max-width:\s*400px\)/);
  assert.match(styles,/prefers-reduced-motion:\s*reduce/);
  assert.match(styles,/\[data-motion='off'\]/);
  assert.match(styles,/min-height:\s*48px/);
});
