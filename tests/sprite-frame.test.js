// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';
import { getOpaqueBounds } from '../src/lib/sprite-frame.js';
import * as visualSources from '../src/lib/sprite-frame.js';
test('transparent sprite margins are removed for equal framing',()=>{
  const pixels=new Uint8ClampedArray(10*10*4);
  const on=(x,y)=>pixels[(y*10+x)*4+3]=255;
  on(2,3);on(6,7);on(3,4);
  assert.deepEqual(getOpaqueBounds(pixels,10,10),{x:2,y:3,width:5,height:5});
});
test('fully transparent sprites and invalid dimensions fall back safely',()=>{
  assert.equal(getOpaqueBounds(new Uint8ClampedArray(4*4*4),4,4),null);
  assert.equal(getOpaqueBounds(new Uint8ClampedArray(4),4,4),null);
});
test('low-opacity antialiasing is ignored when finding visible borders',()=>{
  const pixels=new Uint8ClampedArray(4*4*4);
  pixels[3]=1;pixels[(1*4+2)*4+3]=200;
  assert.deepEqual(getOpaqueBounds(pixels,4,4),{x:2,y:1,width:1,height:1});
});

test('television-style artwork is loaded first and the same Pokemon has a sprite fallback',()=>{
  assert.equal(typeof visualSources.getPokemonVisualUrls,'function');
  const urls=visualSources.getPokemonVisualUrls(25);
  assert.deepEqual(urls,[
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
  ]);
});
test('unknown visual IDs do not produce broken asset addresses',()=>{
  assert.equal(typeof visualSources.getPokemonVisualUrls,'function');
  assert.deepEqual(visualSources.getPokemonVisualUrls(0),[]);
  assert.deepEqual(visualSources.getPokemonVisualUrls(899),[]);
});
