// @ts-nocheck - visual regression contract complemented by screenshot checks.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css=readFileSync('src/app.css','utf8');
const svg=readFileSync('static/classic-1998-rays.svg','utf8');
const polish=css.split('/* FULL-VIEWPORT CLASSIC POLISH */')[1]||'';
test('desktop keeps four guess choices in a single compact row',()=>{
  assert.match(polish,/@media\s*\(min-width:\s*850px\)/);
  assert.match(polish,/\.anime-answers\s*\{\s*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
});
test('cyan burst fades out before the frame edge instead of drawing a hard wedge',()=>{
  const gradient=svg.match(/<linearGradient id="edgeFade"[^>]*>([\s\S]*?)<\/linearGradient>/)?.[1]||'';
  assert.match(gradient,/<stop offset="\.65" stop-color="#666666"\/>/);
  assert.match(gradient,/<stop offset="\.85" stop-color="#000000"\/>/);
});
