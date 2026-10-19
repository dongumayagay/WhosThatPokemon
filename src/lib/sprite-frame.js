/** Crop transparent margins of the same front sprite used for both the
 * mystery silhouette and the answer reveal. This keeps all 898 species
 * consistently framed without changing the visual identity of the shape.
 */

/**
 * @param {Uint8ClampedArray | Uint8Array} rgba
 * @param {number} width
 * @param {number} height
 * @param {number} [minAlpha]
 * @returns {{x:number,y:number,width:number,height:number}|null}
 */
export function getOpaqueBounds(rgba, width, height, minAlpha=40) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1
      || width > 4096 || height > 4096 || rgba.length !== width*height*4) return null;
  let x0=width,y0=height,x1=-1,y1=-1;
  for (let y=0; y<height; y++) for(let x=0;x<width;x++){
    if(rgba[(y*width+x)*4+3]>minAlpha){
      x0=Math.min(x0,x);y0=Math.min(y0,y);
      x1=Math.max(x1,x);y1=Math.max(y1,y);
    }
  }
  return x1<0?null:{x:x0,y:y0,width:x1-x0+1,height:y1-y0+1};
}

/** @param {HTMLImageElement} image @returns {string|null} */
export function cropPokemonSprite(image) {
  try {
    if(!image.naturalWidth||!image.naturalHeight) return null;
    const canvas=document.createElement('canvas');
    canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
    const ctx=canvas.getContext('2d',{willReadFrequently:true});
    if(!ctx) return null;
    ctx.drawImage(image,0,0);
    const bounds=getOpaqueBounds(ctx.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height);
    if(!bounds) return null;
    const cropped=document.createElement('canvas');
    cropped.width=bounds.width;cropped.height=bounds.height;
    const output=cropped.getContext('2d');
    if(!output) return null;
    output.drawImage(canvas,bounds.x,bounds.y,bounds.width,bounds.height,0,0,bounds.width,bounds.height);
    return cropped.toDataURL('image/png');
  } catch { return null; /* CORS failures safely retain the original sprite. */ }
}
