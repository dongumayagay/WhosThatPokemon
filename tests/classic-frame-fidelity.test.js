// @ts-nocheck — original-frame visual contracts; browser check covers rendering.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const frame = readFileSync('static/classic-1998-rays.svg', 'utf8');
const css = readFileSync('src/app.css', 'utf8');
const stage = readFileSync('src/lib/components/PokemonImage.svelte', 'utf8');

test('1998 aqua burst has a feathered, hand-painted edge rather than a clean star shape', () => {
  assert.match(frame, /id="painted-feather-edge"/);
  const featherCount = (frame.match(/class="ink-fray"/g) || []).length;
  assert.ok(featherCount >= 55, \`expected at least 55 fine feather rays, got \${featherCount}\`);
});

test('the television frame is the focus on tall phones without constraining scroll', () => {
  assert.match(css, /\.wtp-shell\s*\{[^}]*min-height:\s*100dvh;[^}]*display:\s*flex;[^}]*flex-direction:\s*column;/s);
  assert.match(css, /\.wtp-main\s*\{[^}]*margin-block:\s*auto;/s);
  assert.match(stage, /class="anime-logo"/);
  assert.doesNotMatch(stage, /<Header\s*\/>/);
});
