/** Five silhouettes per gym; four correct answers earn its emblem. */
export const GYM_LENGTH = 5;
/** @type {Array<{id:string,name:string,type:string,icon:string,description:string,roster:number[]}>} */
export const GYMS = [
  {id:'grass',name:'Verdant Gym',type:'Grass',icon:'🌿',description:'Follow the wild roots',roster:[1,2,3,43,44,45,69,70,71,102,103,114,152,153,154,187,188,189]},
  {id:'fire',name:'Ember Gym',type:'Fire',icon:'🔥',description:'Walk through the flames',roster:[4,5,6,37,38,58,59,77,78,126,136,155,156,157,218,219,240,244,255,256,257]},
  {id:'water',name:'Tidal Gym',type:'Water',icon:'💧',description:'Dive into the deep',roster:[7,8,9,54,55,60,61,62,72,73,90,91,98,99,116,117,118,119,120,121,129,130,131,134,158,159,160]},
  {id:'electric',name:'Voltage Gym',type:'Electric',icon:'⚡',description:'Ride the lightning',roster:[25,26,81,82,100,101,125,135,145,170,171,172,179,180,181,239,243,309,310]},
  {id:'rock',name:'Granite Gym',type:'Rock',icon:'🪨',description:'Stand firm as stone',roster:[74,75,76,95,111,112,138,139,140,141,142,185,246,247,248,299,304,305,306]},
  {id:'psychic',name:'Mindwave Gym',type:'Psychic',icon:'🔮',description:'See beyond the veil',roster:[63,64,65,79,80,96,97,102,103,121,122,124,150,151,177,178,196,201,202,203,249,251]},
  {id:'ghost',name:'Phantom Gym',type:'Ghost',icon:'👻',description:'Embrace the mysterious',roster:[92,93,94,200,292,302,353,354,355,356,425,426,429,442,477,478,487,562,563]},
  {id:'dragon',name:'Skyfang Gym',type:'Dragon',icon:'🐉',description:'Face a legendary challenge',roster:[147,148,149,230,329,330,334,371,372,373,380,381,384,443,444,445,646,704,705,706]}
];
/** @param {string} id */
export function getGym(id) {return GYMS.find(g => g.id === id) ?? null;}
/** @param {string} id @param {() => number} [random] */
export function createGymDeck(id, random=Math.random) {
  const gym=getGym(id);
  if(!gym) throw new RangeError('Unknown gym');
  const remaining=[...new Set(gym.roster)];
  const picked=[];
  for(let i=0;i<GYM_LENGTH;i++) {
    const j=Math.min(remaining.length-1,Math.max(0,Math.floor(random()*remaining.length)));
    picked.push(remaining.splice(j,1)[0]);
  }
  return picked;
}
