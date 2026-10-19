import { GYMS } from './gym-trials.js';
export const PROFILE_KEY='wtp-trainer-v2';
export const ACHIEVEMENTS=[
  {id:'first',name:'First Discovery',detail:'Identify your first Pokémon',icon:'✦'},
  {id:'discover10',name:'Rookie Collector',detail:'Discover 10 unique Pokémon',icon:'◈'},
  {id:'discover50',name:'Pokédex Explorer',detail:'Discover 50 unique Pokémon',icon:'◇'},
  {id:'discover151',name:'Original 151',detail:'Discover 151 unique Pokémon',icon:'★'},
  {id:'combo3',name:'On a Roll',detail:'Get 3 right in a row',icon:'⚡'},
  {id:'combo5',name:'Unstoppable',detail:'Get 5 right in a row',icon:'✷'},
  {id:'combo10',name:'Perfect Rhythm',detail:'Get 10 right in a row',icon:'♛'},
  {id:'firstbadge',name:'Gym Challenger',detail:'Earn your first Gym Badge',icon:'⬡'},
  {id:'allbadges',name:'League Champion',detail:'Earn all 8 Gym Badges',icon:'🏆'},
  {id:'perfect10',name:'Flawless Ten',detail:'Get all 10 right in Challenge',icon:'♕'}
];
/** @type {string[]} */
const achievementIds=ACHIEVEMENTS.map(a=>a.id);
const gymIds=GYMS.map(x=>x.id);
/** @returns {{discovered:number[],totalAnswered:number,totalCorrect:number,badges:string[],achievements:string[]}} */
export function sanitizeProfile(data) {
  const x=data && typeof data==='object' && !Array.isArray(data)?data:{};
  const v=/** @type {Record<string,any>} */(x);
  const discovered=Array.isArray(v.discovered)?[...new Set(v.discovered.filter((n)=>Number.isInteger(n)&&n>=1&&n<=898))].sort((a,b)=>a-b):[];
  const totalAnswered=Number.isSafeInteger(v.totalAnswered)&&v.totalAnswered>=0?v.totalAnswered:0;
  const totalCorrect=Number.isSafeInteger(v.totalCorrect)&&v.totalCorrect>=0&&v.totalCorrect<=totalAnswered?v.totalCorrect:0;
  const badges=Array.isArray(v.badges)?[...new Set(v.badges.filter((b)=>gymIds.includes(b)))]:[];
  const achievements=Array.isArray(v.achievements)?[...new Set(v.achievements.filter((a)=>achievementIds.includes(a)))]:[];
  return {discovered,totalAnswered,totalCorrect,badges,achievements};
}
/** @param {ReturnType<typeof sanitizeProfile>} raw @param {number} id @param {boolean} correct @param {number} streak */
export function recordGuess(raw,id,correct,streak) {
  const p=sanitizeProfile(raw);
  p.totalAnswered++;
  if(correct) {
    p.totalCorrect++;
    if(Number.isInteger(id)&&id>=1&&id<=898&&!p.discovered.includes(id)) {
      p.discovered.push(id); p.discovered.sort((a,b)=>a-b);
    }
  }
  const award=(id)=>{if(!p.achievements.includes(id))p.achievements.push(id);};
  if(p.discovered.length>=1)award('first');
  if(p.discovered.length>=10)award('discover10');
  if(p.discovered.length>=50)award('discover50');
  if(p.discovered.length>=151)award('discover151');
  if(streak>=3)award('combo3');
  if(streak>=5)award('combo5');
  if(streak>=10)award('combo10');
  return p;
}
/** @param {ReturnType<typeof sanitizeProfile>} raw @param {string} gymId @param {number} correctCount */
export function awardGymBadge(raw,gymId,correctCount) {
  const p=sanitizeProfile(raw);
  if(correctCount>=4&&gymIds.includes(gymId)&&!p.badges.includes(gymId))p.badges.push(gymId);
  if(p.badges.length>=1&&!p.achievements.includes('firstbadge'))p.achievements.push('firstbadge');
  if(p.badges.length===GYMS.length&&!p.achievements.includes('allbadges'))p.achievements.push('allbadges');
  return p;
}
/** @param {ReturnType<typeof sanitizeProfile>} raw @param {number} correctCount @param {number} total */
export function awardPerfectChallenge(raw,correctCount,total) {
  const p=sanitizeProfile(raw);
  if(correctCount===10 && total===10 && !p.achievements.includes('perfect10'))p.achievements.push('perfect10');
  return p;
}
/** @param {number[]} discovered @param {number[]} counts */
export function generationProgress(discovered,counts) {
  const found=new Set(discovered);
  let offset=0;
  return counts.map((total,index)=>{
    let n=0;
    for(let id=offset+1;id<=offset+total;id++)if(found.has(id))n++;
    offset+=total;
    return {generation:index+1,found:n,total};
  });
}
