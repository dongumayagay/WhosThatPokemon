import { inflateSync } from 'node:zlib';

/** Decode just the alpha channel of a normal (non-animated, non-interlaced) PNG. No external dependencies. */
/** @param {Uint8Array | Buffer} data */
export function extractPngAlpha(data) {
  const bytes = Buffer.from(data);
  if (bytes.length < 33 || !bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
    throw new Error('Not a PNG');
  }
  let w=0,h=0,depth=0,type=0,interlace=0;
  /** @type {Buffer[]} */
  const idat=[];
  /** @type {Buffer | null} */
  let trns=null;
  let pos=8;
  while (pos + 12 <= bytes.length) {
    const length=bytes.readUInt32BE(pos);
    if (length > bytes.length-pos-12) throw new Error('Truncated PNG chunk');
    const kind=bytes.toString('ascii',pos+4,pos+8);
    const chunk=bytes.subarray(pos+8,pos+8+length);
    if (kind==='IHDR') {
      if (length !== 13) throw new Error('Invalid PNG header');
      w=chunk.readUInt32BE(0);h=chunk.readUInt32BE(4);depth=chunk[8];type=chunk[9];interlace=chunk[12];
      if (chunk[10]!==0 || chunk[11]!==0) throw new Error('Unsupported PNG compression');
    } else if (kind==='tRNS') trns=chunk;
    else if (kind==='IDAT') idat.push(chunk);
    else if (kind==='IEND') break;
    pos+=length+12;
  }
  const channels=({0:1,2:3,3:1,4:2,6:4})[type];
  if (!channels || ![1,2,4,8,16].includes(depth) || (type!==0 && type!==3 && depth<8) ||
      (type===3 && depth===16) || interlace!==0 || !w || !h || w>1024 || h>1024 || !idat.length) {
    throw new Error(`Unsupported PNG ${w}x${h} type=${type} depth=${depth} interlace=${interlace}`);
  }
  const bits=depth*channels;
  const stride=Math.ceil(w*bits/8);
  const bpp=Math.max(1,Math.ceil(bits/8));
  const source=inflateSync(Buffer.concat(idat));
  if (source.length!==(stride+1)*h) throw new Error('Unexpected PNG scanline length');
  const alpha=new Uint8Array(w*h);
  let previous=new Uint8Array(stride);
  let offset=0;
  for (let y=0;y<h;y++) {
    const filter=source[offset++];
    const row=new Uint8Array(stride);
    for (let x=0;x<stride;x++) {
      const raw=source[offset++],a=x>=bpp?row[x-bpp]:0,b=previous[x],c=x>=bpp?previous[x-bpp]:0;
      let predictor=0;
      if (filter===1) predictor=a;
      else if (filter===2) predictor=b;
      else if (filter===3) predictor=Math.floor((a+b)/2);
      else if (filter===4) {
        const p=a+b-c;
        const da=Math.abs(p-a), db=Math.abs(p-b), dc=Math.abs(p-c);
        predictor=da<=db&&da<=dc?a:db<=dc?b:c;
      } else if (filter!==0) throw new Error('Unknown PNG scanline filter');
      row[x]=(raw+predictor)&255;
    }
    for (let x=0;x<w;x++) {
      let opacity=255;
      if (type===6) opacity=row[x*4*(depth/8)+3*(depth/8)];
      else if (type===4) opacity=row[x*2*(depth/8)+(depth/8)];
      else if (type===3) {
        const shift=8-depth-(x*depth)%8;
        const index=(row[Math.floor(x*depth/8)]>>shift)&((1<<depth)-1);
        opacity=trns?.[index]??255;
      } else if (type===0 && trns) {
        const gray=depth===16?row[x*2]*256+row[x*2+1]:depth===8?row[x]:((row[Math.floor(x*depth/8)]>>(8-depth-(x*depth)%8))&((1<<depth)-1));
        opacity=gray===trns.readUInt16BE(0)?0:255;
      } else if (type===2 && trns) {
        const step=depth/8;
        const r=depth===16?row[x*6]*256+row[x*6+1]:row[x*3];
        const g=depth===16?row[x*6+2]*256+row[x*6+3]:row[x*3+1];
        const b=depth===16?row[x*6+4]*256+row[x*6+5]:row[x*3+2];
        const tr=trns[0]*256+trns[1],tg=trns[2]*256+trns[3],tb=trns[4]*256+trns[5];
        opacity=(r===tr&&g===tg&&b===tb)?0:255;
      }
      alpha[y*w+x]=opacity;
    }
    previous=row;
  }
  return {width:w,height:h,alpha};
}
