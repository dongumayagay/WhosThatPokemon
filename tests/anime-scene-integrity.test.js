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
