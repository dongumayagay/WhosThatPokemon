// @ts-nocheck - visual integration contracts verified further with browser screenshots.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const svg = readFileSync('static/classic-1998-rays.svg', 'utf8');
const theme = readFileSync('src/lib/styles/anime-unified.css', 'utf8');
const layout = readFileSync('src/routes/+page.svelte', 'utf8');
const stage = readFileSync('src/lib/components/PokemonImage.svelte', 'utf8');

test('cyan watercolor rays fade naturally without the old zigzag hard clip', () => {
  const clip = svg.match(/<clipPath id="aquaClip">([\s\S]*?)<\/clipPath>/)?.[1] || '';
  assert.match(clip, /<rect\s+x="0"\s+y="0"\s+width="640"\s+height="480"/);
  assert.doesNotMatch(clip, /<path/);
  assert.match(svg, /<g id="painted-feather-edge"[^>]*mask="url\(#aquaFade\)"/);
});

test('one broadcast scene continues through the 4:3 stage, scores and all four answer buttons', () => {
  assert.match(layout, /<PokemonImage\s*\/>\s*<Control\s*\/>/);
  assert.match(theme, /\.site-shell\s*\{[^}]*classic-1998-rays\.svg/s);
  assert.match(theme, /\.anime-stage\s*\{[^}]*overflow:\s*visible/s);
  assert.match(theme, /\.anime-burst,\s*\.anime-speedlines,\s*\.anime-grain\s*\{\s*display:\s*none;/s);
  assert.match(theme, /\/\* SEAMLESS BROADCAST FINISH \*\//);
  assert.match(theme, /\.wtp-controls::before\s*\{[^}]*radial-gradient/s);
  assert.match(theme, /\.answer-option\.anime-option\s*\{[^}]*linear-gradient\(11[0-9]deg,[^}]*#d[0-9a-f]{5}/is);
  assert.match(stage, /class="mystery-silhouette"/);
});

test('broadcast answer design stays readable, accessible and responsive', () => {
  assert.match(theme, /@media\s*\(max-width:\s*400px\)/);
  assert.match(theme, /min-height:\s*52px/);
  assert.match(theme, /prefers-reduced-motion/);
  assert.match(theme, /\[data-motion='off'\]/);
  assert.match(theme, /\.answer-option\.anime-option:focus-visible/);
});

test('the pale cyan burst is centered behind the Pokémon on both phone and desktop', () => {
  const paint = svg.match(/<radialGradient id="cyanWash"[^>]*>/)?.[0] || '';
  assert.match(paint, /cx="230" cy="185" fx="230" fy="180"/);
  const feather = svg.match(/<linearGradient id="edgeFade"[^>]*>/)?.[0] || '';
  assert.match(feather, /x2="515"/);
  assert.match(svg, /<g id="burst" transform="translate\(108 -45\)">/);
  assert.match(svg, /<g id="painted-feather-edge"[^>]*transform="translate\(108 -45\)"/);
});
