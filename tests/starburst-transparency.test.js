import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const svg = readFileSync('static/classic-1998-rays.svg','utf8');
const css = readFileSync('src/lib/styles/anime-unified.css','utf8');
const finish = css.split('/* COHERENT ANIME CANVAS */')[1] || '';

test('the starburst is transparent, not a disguised opaque rectangular TV image',()=>{
  assert.doesNotMatch(svg, /<rect width="640" height="480" fill="url\(#heat\)"\/>/);
  assert.doesNotMatch(svg, /<g id="warm-speedlines">/);
  assert.match(svg, /<radialGradient id="edgeFade"/);
  const art = finish.match(/\.anime-burst\s*\{([^}]+)\}/)?.[1] || '';
  assert.match(art, /mask-image:\s*none;/);
  assert.match(art, /opacity:\s*1;/);
});

test('fading cyan vector lives above the uninterrupted red page, not within another card',()=>{
  assert.match(css, /\.site-shell\s*\{[^}]*background:\s*#ec4551;/s);
  assert.match(svg, /<g id="aqua-center"[^>]*mask="url\(#aquaFade\)"/);
  assert.match(svg, /<g id="painted-feather-edge"[^>]*mask="url\(#aquaFade\)"/);
});
