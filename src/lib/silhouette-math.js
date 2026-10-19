/**
 * Compare the actual *alpha silhouette* of the same front sprites used by the quiz.
 * Each entry is [24x24 packed mask in base64, original bounding-box aspect * 100].
 * No sprite colors, art assets, player data or network calls are included.
 */
export const SHAPE_SIZE = 24;
const BYTE_COUNT = SHAPE_SIZE * SHAPE_SIZE / 8;
const popcount = Uint8Array.from({ length: 256 }, (_, i) => {
  let n = i, count = 0;
  while (n) { n &= n - 1; count++; }
  return count;
});
/** @type {Map<string, Uint8Array>} */
const decoded = new Map();
/** @type {Map<string, Uint8Array>} */
const reflected = new Map();
/** @type {Map<string, Uint8Array[]>} */
const translated = new Map();
/** @param {Uint8Array | number[]} bitmap @param {number} width @param {number} height */
export function encodeSilhouette(bitmap, width, height) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 ||
      width * height !== bitmap.length || width > 4096 || height > 4096) throw new RangeError('Invalid sprite dimensions');
  let left = width, right = -1, top = height, bottom = -1;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (bitmap[y * width + x] > 40) {
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  if (right < left || bottom < top) throw new RangeError('Sprite has no visible pixels');
  const w = right - left + 1, h = bottom - top + 1;
  const scale = Math.min(21 / w, 21 / h);
  const drawW = w * scale, drawH = h * scale;
  const offsetX = (SHAPE_SIZE - drawW) / 2, offsetY = (SHAPE_SIZE - drawH) / 2;
  const bits = new Uint8Array(BYTE_COUNT);
  for (let y = 0; y < SHAPE_SIZE; y++) for (let x = 0; x < SHAPE_SIZE; x++) {
    const sx = Math.floor(left + (x + .5 - offsetX) / scale);
    const sy = Math.floor(top + (y + .5 - offsetY) / scale);
    if (x + .5 < offsetX || x + .5 >= offsetX + drawW ||
        y + .5 < offsetY || y + .5 >= offsetY + drawH ||
        sx < left || sx > right || sy < top || sy > bottom) continue;
    if (bitmap[sy * width + sx] > 40) bits[(y * SHAPE_SIZE + x) >> 3] |= 1 << (7 - x % 8);
  }
  // Empty low-resolution representations are not useful for matching.
  if (!bits.some(byte => byte !== 0)) throw new RangeError('Sprite is too small to describe');
  let binary = '';
  for (const byte of bits) binary += String.fromCharCode(byte);
  return [btoa(binary), Math.round(w / h * 100)];
}
/** @param {[string, number]} entry */
function bytes(entry) {
  const key = entry[0];
  let result = decoded.get(key);
  if (!result) {
    const raw = atob(key);
    if (raw.length !== BYTE_COUNT) throw new RangeError('Invalid silhouette mask');
    result = Uint8Array.from(raw, c => c.charCodeAt(0));
    decoded.set(key, result);
  }
  return result;
}
/** @param {[string, number]} entry */
function mirroredBytes(entry) {
  const key = entry[0];
  let result = reflected.get(key);
  if (!result) {
    const src = bytes(entry);
    result = new Uint8Array(BYTE_COUNT);
    for (let y = 0; y < SHAPE_SIZE; y++) for (let x = 0; x < SHAPE_SIZE; x++) {
      const pos = y * SHAPE_SIZE + x;
      if (src[pos >> 3] & (1 << (7 - pos % 8))) {
        const dest = y * SHAPE_SIZE + (SHAPE_SIZE - x - 1);
        result[dest >> 3] |= 1 << (7 - dest % 8);
      }
    }
    reflected.set(key, result);
  }
  return result;
}
/**
 * A one-pixel translation tolerance prevents nearest-neighbor sampling from
 * penalizing two essentially identical outlines for rounding offsets.
 * @param {[string,number]} entry
 * @param {boolean} mirror
 */
function nearAlignments(entry, mirror) {
  const key = (mirror ? 'M' : 'N') + entry[0];
  let variants = translated.get(key);
  if (variants) return variants;
  const source = mirror ? mirroredBytes(entry) : bytes(entry);
  variants = [];
  for (let dy=-1;dy<=1;dy++) for (let dx=-1;dx<=1;dx++) {
    const shifted = new Uint8Array(BYTE_COUNT);
    for (let y=0;y<SHAPE_SIZE;y++) for (let x=0;x<SHAPE_SIZE;x++) {
      const destinationX = x+dx, destinationY = y+dy;
      if(destinationX<0||destinationX>=SHAPE_SIZE||destinationY<0||destinationY>=SHAPE_SIZE) continue;
      const position = y*SHAPE_SIZE+x;
      if(source[position>>3] & (1 << (7-position%8))) {
        const destination = destinationY*SHAPE_SIZE+destinationX;
        shifted[destination>>3] |= 1 << (7-destination%8);
      }
    }
    variants.push(shifted);
  }
  translated.set(key, variants);
  return variants;
}
/** @param {Uint8Array} first @param {Uint8Array} second */
function pixelDifference(first, second) {
  let union = 0, difference = 0;
  for (let i = 0; i < first.length; i++) {
    union += popcount[first[i] | second[i]];
    difference += popcount[first[i] ^ second[i]];
  }
  return union ? difference / union : 1;
}
/** Lower is more similar. Mirror tolerance handles sprites facing in opposite directions. */
/** @param {[string, number]} a @param {[string, number]} b */
export function silhouetteDistance(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) ||
      !Number.isFinite(a[1]) || !Number.isFinite(b[1]) || a[1] <= 0 || b[1] <= 0) return Infinity;
  const target=bytes(b);
  const direct = Math.min(...nearAlignments(a,false).map(variant=>pixelDifference(variant,target)));
  const mirrored = Math.min(...nearAlignments(a,true).map(variant=>pixelDifference(variant,target))) + .015;
  const aspect = Math.min(1, Math.abs(Math.log(a[1] / b[1])));
  return Math.min(direct, mirrored) + .15 * aspect;
}
