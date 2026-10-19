import test from 'node:test';
import assert from 'node:assert/strict';
import {deflateSync} from 'node:zlib';
import {extractPngAlpha} from '../scripts/png-mask.mjs';
const chunk=(name, data)=>{const b=Buffer.alloc(data.length+12);b.writeUInt32BE(data.length);b.write(name,4,4,'ascii');data.copy(b,8);return b;};
const head=Buffer.from([137,80,78,71,13,10,26,10]);
function png(type, width, height, depth, raster, transparent) {
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width);ihdr.writeUInt32BE(height,4);ihdr[8]=depth;ihdr[9]=type;
 return Buffer.concat([head,chunk('IHDR',ihdr),...(transparent?[chunk('tRNS',Buffer.from(transparent))]:[]),chunk('IDAT',deflateSync(Buffer.from(raster))),chunk('IEND',Buffer.alloc(0))]);
}
test('RGBA PNG decoder reads sprite alpha and transparency',()=>{
 const file=png(6,2,1,8,[0,222,0,0,255,0,0,0,0]);
 assert.deepEqual([...extractPngAlpha(file).alpha],[255,0]);
});
test('indexed transparent PNG decoding respects palette tRNS',()=>{
 const file=png(3,4,1,2,[0,0b01000100],[0,255]);
 assert.deepEqual([...extractPngAlpha(file).alpha],[255,0,255,0]);
});
test('PNG decoder rejects non-image data',()=>{
 assert.throws(()=>extractPngAlpha(Buffer.from('not png')));
});
