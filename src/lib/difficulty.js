/** Hand-curated evolution and visual-family groups; used only to rank decoys. */
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
function generationOf(id,counts) {
  let end=0;
  for(let i=0;i<counts.length;i++) {end+=counts[i];if(id<=end)return i;}
  return -1;
}
/** @param {number[]} items @param {() => number} random */
function shuffle(items,random) {
  for(let i=items.length-1;i>0;i--) {
    const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));
    [items[i],items[j]]=[items[j],items[i]];
  }
  return items;
}
/**
 * Scale from three generous alternatives to four deliberately confusing ones.
 * Expert uses a curated visual-family prior and close Pokédex neighbours as a fallback.
 * @param {number} correctId
 * @param {number[]} availableIds
 * @param {number[]} generationCounts
 * @param {'easy'|'normal'|'expert'} difficulty
 * @param {() => number} [random]
 */
export function createDifficultyChoices(correctId,availableIds,generationCounts,difficulty,random=Math.random) {
  const count=difficulty==='easy'?3:4;
  const pool=[...new Set(availableIds)];
  if(!pool.includes(correctId)||pool.length<count||!['easy','normal','expert'].includes(difficulty))throw new RangeError('Not enough eligible choices');
  const generation=generationOf(correctId,generationCounts);
  const sameFamily=LOOKALIKE_GROUPS.find(g=>g.includes(correctId)) ?? [];
  const eligible=shuffle(pool.filter(x=>x!==correctId),random);
  if(difficulty==='normal') {
    eligible.sort((a,b)=>Number(generationOf(b,generationCounts)===generation)-Number(generationOf(a,generationCounts)===generation));
  } else if(difficulty==='expert') {
    /** @param {number} x */
    const grade=(x)=> (sameFamily.includes(x)?-2000:0) + (generationOf(x,generationCounts)===generation?-500:0) + Math.abs(x-correctId);
    eligible.sort((a,b)=>grade(a)-grade(b));
  }
  return shuffle([correctId,...eligible.slice(0,count-1)],random);
}
