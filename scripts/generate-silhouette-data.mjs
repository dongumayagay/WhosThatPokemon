import {mkdir,writeFile} from 'node:fs/promises';
import {extractPngAlpha} from './png-mask.mjs';
import {encodeSilhouette} from '../src/lib/silhouette-math.js';

/**
 * One-time, reproducible build of outline-only descriptors from the SAME front
 * sprites displayed by WTP. Pin the upstream commit so a future sprite update
 * can't silently change difficulty. Run manually to regenerate data.
 * Does NOT redistribute source images or require a runtime API call.
 */
const SOURCE_COMMIT='7a7d66b1620e646f69afd48dc1273da9033ede9c';
const SPRITE_URL=`https://raw.githubusercontent.com/PokeAPI/sprites/${SOURCE_COMMIT}/sprites/pokemon/`;
const MAX_ID=Number(process.env.SHAPE_MAX_ID ?? 898);
const CONCURRENCY=12;
if(!Number.isInteger(MAX_ID)||MAX_ID<1||MAX_ID>898)throw new RangeError('SHAPE_MAX_ID must be 1–898');
const rows=Array.from({length:MAX_ID+1},()=>null);
const missing=[];
let cursor=1;
async function one(id) {
  const url=`${SPRITE_URL}${id}.png`;
  for(let attempt=0;attempt<3;attempt++) {
    try {
      const response=await fetch(url,{signal:AbortSignal.timeout(15000)});
      if(response.status===404)throw new Error('missing sprite (404)');
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const bytes=new Uint8Array(await response.arrayBuffer());
      const image=extractPngAlpha(bytes);
      const descriptor=encodeSilhouette(image.alpha,image.width,image.height);
      return descriptor;
    } catch(e) {
      if(attempt===2) {missing.push(`${id}: ${String(e)}`);return null;}
      await new Promise(resolve=>setTimeout(resolve,250*(attempt+1)));
    }
  }
  return null;
}
async function worker() {
  for(;;) {
    const id=cursor++;
    if(id>MAX_ID)return;
    rows[id]=await one(id);
    if(id%100===0)console.log(`Processed ${id}/${MAX_ID}`);
  }
}
await Promise.all(Array.from({length:CONCURRENCY},()=>worker()));
const covered=rows.slice(1).filter(Boolean).length;
if(covered<MAX_ID*.9)throw new Error(`Sprite coverage ${covered}/${MAX_ID} below 90%; ${missing.slice(0,10).join('; ')}`);
if(missing.length)console.warn(`Missing/unreadable ${missing.length} sprites: ${missing.slice(0,50).join('; ')}`);
console.log(`Generated visual silhouettes for ${covered}/${MAX_ID} Pokémon from PokeAPI/sprites@${SOURCE_COMMIT}`);
const json=JSON.stringify(rows);
await mkdir('src/lib',{recursive:true});
await mkdir('static',{recursive:true});
await writeFile('src/lib/silhouette-data.json',json+'\n','utf8');
// One-time staging export. Remove after the versioned data is committed.
await writeFile('static/__silhouette-dataset.json',json+'\n','utf8');
