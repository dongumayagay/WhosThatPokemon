// @ts-nocheck - layout contracts; validate runtime sizes with browser QA.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync('src/app.css', 'utf8');
const art = readFileSync('static/classic-1998-rays.svg', 'utf8');
const markup = readFileSync('src/lib/components/PokemonImage.svelte', 'utf8');
const controls = readFileSync('src/lib/components/Control.svelte', 'utf8');
const layout = readFileSync('src/routes/+page.svelte','utf8');
const polish = css.split('/* FULL-VIEWPORT CLASSIC POLISH */')[1] || '';

test('orange animated backdrop spans entire page instead of cream letterboxing', () => {
  assert.ok(polish.length, 'expected final full-viewport polish rules');
  assert.match(polish, /\.site-shell\s*\{[^}]*background:\s*[^;]*#f[0-9a-f]{5}[^;]*;/i);
  assert.match(polish, /\.site-shell::before\s*\{[^}]*position:\s*fixed;/s);
  assert.match(polish, /@keyframes fullbleed-rays/);
  assert.match(polish, /\.wtp-shell\s*\{[^}]*min-height:\s*100(?:s|d)vh;/s);
});

test('TV stage stays large and answers align exactly below the original 4:3 scene', () => {
  assert.match(polish, /--frame-width:/);
  assert.match(polish, /\.anime-stage,\s*\.wtp-controls\s*\{\s*width:\s*var\(--frame-width\)/s);
  assert.match(css, /\.anime-stage\s*\{[^}]*aspect-ratio:\s*4\s*\/\s*3;/s);
  assert.match(layout, /<PokemonImage\s*\/>\s*<Control\s*\/>/);
  assert.match(controls, /class="answers-grid anime-answers"/);
});

test('cyan behind the silhouette is gentle instead of a giant hard-edge sawtooth', () => {
  assert.match(art, /id="cyanWash"/);
  assert.match(art, /id="aquaClip"/);
  assert.match(art, /id="painted-feather-edge"/);
  assert.match(art, /stop-opacity="0(?:\.[0-9]+)?"/);
  const rays = (art.match(/class="cyan-ray"/g) || []).length;
  assert.ok(rays >= 55 && rays <= 200, `expected moderate cyan line count, got ${rays}`);
  assert.ok((art.match(/class="ink-fray"/g)||[]).length >= 55);
});

test('the page keeps motion opt-outs and menu accessibility intact', () => {
  assert.match(polish, /prefers-reduced-motion:\s*reduce/);
  assert.match(polish, /\[data-motion=['"]off['"]\]/);
  assert.match(markup, /class="mystery-silhouette"/);
  assert.match(markup, /class="revealed-sprite"/);
  assert.match(controls, /aria-modal="true"/);
});
