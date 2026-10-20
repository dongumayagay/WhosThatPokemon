// @ts-nocheck — CSS integration contracts paired with real viewport screenshots.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('src/lib/styles/anime-unified.css', 'utf8');
const page = readFileSync('src/routes/+page.svelte', 'utf8');
const stage = readFileSync('src/lib/components/PokemonImage.svelte', 'utf8');
const controls = readFileSync('src/lib/components/Control.svelte', 'utf8');
const finish = css.split('/* COHERENT ANIME CANVAS */')[1] || '';
const siteShell = css.match(/\.site-shell\s*\{([^}]+)\}/)?.[1] || '';

test('broadcast artwork is not distorted into arbitrary device aspect ratios', () => {
  assert.ok(finish.length, 'responsive scene correction must exist');
  assert.doesNotMatch(siteShell, /classic-1998-rays\.svg/);
  assert.match(finish, /\.site-shell\s*\{[^}]*repeating-linear-gradient/s);
  assert.match(finish, /\.anime-burst\s*\{\s*display:\s*block;/s);
  assert.match(finish, /classic-1998-rays\.svg/);
  assert.match(finish, /mask-image:\s*radial-gradient/);
});

test('Pokémon, backdrop and answer controls belong to the same full-page scene', () => {
  assert.match(page, /<PokemonImage\s*\/>\s*<Control\s*\/>/);
  assert.match(stage, /class="anime-burst"/);
  assert.match(finish, /\.wtp-main\s*\{[^}]*margin-block:\s*0;/s);
  assert.match(finish, /\.wtp-scoreline\s*\{[^}]*border-radius:\s*8px;/s);
  assert.match(finish, /\.answer-option\.anime-option\s*\{[^}]*border-radius:\s*9px;/s);
  assert.match(controls, /class="col-6 col-md-3 wtp-answer-cell"/);
});

test('mobile layout has deliberate top spacing and leaves room for all silhouettes', () => {
  assert.match(finish, /@media\s*\(max-width:\s*650px\)/);
  assert.match(finish, /\.silhouette-holder\s*\{[^}]*left:\s*6%;/s);
  assert.match(finish, /\.answer-option\.anime-option\s*\{[^}]*min-height:\s*52px;/s);
  assert.match(finish, /prefers-reduced-motion:\s*reduce/);
  assert.match(finish, /\[data-motion='off'\]/);
});

test('four edges of the broadcast dissolve instead of drawing a rectangular card', () => {
  const art = finish.match(/\.anime-burst\s*\{([^}]+)\}/)?.[1] || '';
  assert.match(art, /mask-image:\s*radial-gradient\(ellipse\s+59%\s+59%\s+at\s+45%\s+50%/);
  assert.match(art, /#0008\s+66%,\s*transparent\s+88%/);
});

test('wide-screen answers fit long Pokémon names on one clean line', () => {
  const wide = finish.split('@media (min-width: 850px)')[1] || '';
  assert.ok(wide, 'wide-answer typography rules must exist');
  assert.match(wide, /\.wtp-choice-name\s*\{[^}]*white-space:\s*nowrap;/);
  assert.match(wide, /\.answer-option\.anime-option\s*\{[^}]*font-size:\s*clamp\(12px,\s*1\.1vw,\s*14px\);/);
});
