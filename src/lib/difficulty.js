import silhouettes from './silhouette-data.json' with { type: 'json' };
import { silhouetteDistance } from './silhouette-math.js';

/** @type {Array<[string, number] | null>} */
const spriteShapes = /** @type {Array<[string, number] | null>} */(/** @type {unknown} */(silhouettes));

// Fallback only for sprites not represented in the generated silhouette dataset.
export const LOOKALIKE_GROUPS = [
  [25,26,172,311,312,417,587,702,777],
  [133,134,135,136,196,197,470,471,700],
  [10,13,265,540,543,588],
  [16,17,18,21,22,163,164,396,397,398],
  [19,20,161,162,263,264,399,400,504,505],
  [23,24,206,336,449,450],
  [29,30,31,32,33,34],
  [43,44,45,69,70,71,182,187,188,189],
  [74,75,76,524,525,526],
  [92,93,94,200,353,354,355,356],
  [129,130,147,148,149,349,350],
  [152,153,154,252,253,254,387,388,389,495,496,497],
  [155,156,157,255,256,257,390,391,392,498,499,500],
  [158,159,160,258,259,260,393,394,395,501,502,503]
];
/** @param {number} id @param {number[]} counts */
function generationOf(id, counts) {
  let end = 0;
  for (let i = 0; i < counts.length; i++) { end += counts[i]; if (id <= end) return i; }
  return -1;
}
/** @param {number[]} items @param {() => number} random */
function shuffle(items, random) {
  for (let i = items.length - 1; i > 0; i--) {
    const value = random();
    const j = Math.min(i, Math.max(0, Math.floor((Number.isFinite(value) ? value : 0) * (i + 1))));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
/**
 * Rank the allowed pool by actual outline similarity; closer silhouettes are harder.
 * A fallback is kept for missing sprites, but no Pokédex distance is used as a visual proxy.
 * @param {number} target
 * @param {number[]} pool
 * @param {number[]} counts
 * @param {Array<[string, number] | null>} shapes
 */
export function rankSilhouetteDecoys(target, pool, counts, shapes = spriteShapes) {
  const group = LOOKALIKE_GROUPS.find(g => g.includes(target)) || [];
  const g = generationOf(target, counts);
  const targetShape = shapes[target];
  return pool.filter(id => id !== target).map(id => {
    const entry = shapes[id];
    let distance = Infinity;
    if (targetShape && entry) {
      try { distance = silhouetteDistance(targetShape, entry); } catch { /* Invalid shape falls back. */ }
    }
    const fallback = (group.includes(id) ? 0 : 2) + (generationOf(id, counts) === g ? 0 : 1);
    return { id, score: Number.isFinite(distance) ? distance : 5 + fallback };
  }).sort((a,b) => a.score - b.score || a.id - b.id);
}
/** @param {Array<{id:number,score:number}>} sorted @param {'easy'|'normal'|'expert'} mode @param {number} count @param {() => number} random */
function chooseWindow(sorted, mode, count, random) {
  const n = sorted.length;
  if (n <= count) return sorted.map(x=>x.id);
  // Explicitly tier the decoy distribution by outline similarity, not ID proximity.
  let start, end;
  if (mode === 'expert') { start = 0; end = Math.max(count, Math.ceil(n * .12)); }
  else if (mode === 'normal') { start = Math.floor(n * .20); end = Math.max(start + count, Math.ceil(n * .58)); }
  else { start = Math.floor(n * .65); end = n; }
  start = Math.max(0, Math.min(start, n - count));
  end = Math.max(start + count, Math.min(end, n));
  return shuffle(sorted.slice(start, end).map(x => x.id), random).slice(0,count);
}
/**
 * @param {number} correctId
 * @param {number[]} availableIds
 * @param {number[]} generationCounts
 * @param {'easy'|'normal'|'expert'} difficulty
 * @param {() => number} [random]
 * @param {Array<[string, number] | null>} [shapes]
 */
export function createDifficultyChoices(correctId, availableIds, generationCounts, difficulty, random = Math.random, shapes = spriteShapes) {
  const count = difficulty === 'easy' ? 3 : 4;
  const pool = [...new Set(availableIds)];
  if (!pool.includes(correctId) || pool.length < count || !['easy','normal','expert'].includes(difficulty)) throw new RangeError('Not enough eligible choices');
  const candidates = rankSilhouetteDecoys(correctId, pool, generationCounts, shapes);
  return shuffle([correctId, ...chooseWindow(candidates, difficulty, count - 1, random)], random);
}
