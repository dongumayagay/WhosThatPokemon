import { pokemonNames } from './pokemonNames.json';
import { gameState, maxPokemonPerGeneration, resetGame } from './state.svelte.js';
import { createDifficultyChoices } from './difficulty.js';
import { createGymDeck, getGym, GYM_LENGTH } from './gym-trials.js';
import { PROFILE_KEY, sanitizeProfile, recordGuess, awardGymBadge, awardPerfectChallenge } from './progression.js';
import { CHALLENGE_LENGTH, DAILY_LENGTH, chooseEliminatedChoices, getEligiblePokemonIds, pickUnseenPokemonId, resolveAnswer } from './game-rules.js';
import { createDailyDeck, getUtcDateKey, summarizeDailyGuesses } from './daily-challenge.js';

const BEST_SCORE_KEY = 'wtp-challenge-best-v1';
const DAILY_KEY = 'wtp-daily-v1';
const SETTINGS_KEY = 'wtp-preferences-v2';

function eligiblePokemon() {
  const generations = gameState.selectedGenerations.length ? gameState.selectedGenerations : [1];
  return getEligiblePokemonIds(generations, maxPokemonPerGeneration);
}

/** @param {string} date @param {Array<{id:number,choices:number[]}>} deck */
function readDailyStatus(date, deck) {
  /** @type {Array<{choice:string,hintUsed:boolean}>} */
  let guesses = [];
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = JSON.parse(localStorage.getItem(DAILY_KEY) || 'null');
      if (raw?.date === date && Array.isArray(raw.guesses)) guesses = raw.guesses;
    }
  } catch { /* Private mode does not block play. */ }
  return { ...summarizeDailyGuesses(guesses, deck, pokemonNames), date };
}

function saveDailyStatus() {
  if (gameState.mode !== 'daily') return;
  const status = { ...summarizeDailyGuesses(gameState.dailyGuesses, gameState.dailyDeck, pokemonNames), date: gameState.dailyDate };
  gameState.dailyStatus = status;
  try { if(typeof localStorage !== 'undefined') localStorage.setItem(DAILY_KEY, JSON.stringify({date:status.date,guesses:status.guesses})); }
  catch { /* Keep progress in memory. */ }
}

function saveProfile() {
  try { if(typeof localStorage !== 'undefined') localStorage.setItem(PROFILE_KEY,JSON.stringify(gameState.profile)); }
  catch { /* Keep progress in memory. */ }
}

export function loadGamePreferences() {
  try {
    if (typeof localStorage !== 'undefined') {
      const best = Number(localStorage.getItem(BEST_SCORE_KEY));
      if(Number.isSafeInteger(best)&&best>0)gameState.bestChallengeScore=best;
      gameState.profile=sanitizeProfile(JSON.parse(localStorage.getItem(PROFILE_KEY)||'null'));
      const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY)||'null');
      if(['easy','normal','expert'].includes(settings?.difficulty))gameState.difficulty=settings.difficulty;
      if(typeof settings?.soundEnabled==='boolean')gameState.soundEnabled=settings.soundEnabled;
      if(typeof settings?.animationEnabled==='boolean')gameState.animationEnabled=settings.animationEnabled;
    }
  } catch { /* Invalid storage safely falls back to defaults. */ }
  const date=getUtcDateKey();
  gameState.dailyStatus=readDailyStatus(date,createDailyDeck(date,maxPokemonPerGeneration));
}

/** @param {'easy'|'normal'|'expert'} difficulty */
export function setDifficulty(difficulty) {
  if(!['easy','normal','expert'].includes(difficulty)) return;
  gameState.difficulty=difficulty;
  saveSettings();
}
/** @param {boolean} value */
export function setSound(value) {gameState.soundEnabled=value;saveSettings();}
/** @param {boolean} value */
export function setAnimations(value) {gameState.animationEnabled=value;saveSettings();}
function saveSettings() {
  try { if(typeof localStorage!=='undefined') localStorage.setItem(SETTINGS_KEY,JSON.stringify({difficulty:gameState.difficulty,soundEnabled:gameState.soundEnabled,animationEnabled:gameState.animationEnabled})); }
  catch { /* Unavailable storage is OK. */ }
}

/** @param {'classic'|'challenge'|'daily'} [mode] */
export function startGame(mode='classic') {
  resetGame();
  gameState.mode=mode==='daily'?'daily':mode==='challenge'?'challenge':'classic';
  if (gameState.mode==='daily') {
    gameState.dailyDate=getUtcDateKey();
    gameState.dailyDeck=createDailyDeck(gameState.dailyDate,maxPokemonPerGeneration);
    const saved=readDailyStatus(gameState.dailyDate,gameState.dailyDeck);
    gameState.dailyStatus=saved;
    gameState.dailyGuesses=[...saved.guesses];
    gameState.numOfQuestions=saved.guesses.length;
    gameState.numOfRightAnswer=saved.correct;
    gameState.points=saved.points;
    gameState.streak=saved.streak;
    gameState.bestStreak=saved.bestStreak;
    gameState.completed=saved.completed;
    if(saved.completed)return;
  }
  getRandomPokemon();
}

/** @param {string} gymId */
export function startGym(gymId) {
  if(!getGym(gymId))return;
  resetGame();
  gameState.mode='gym';
  gameState.gymId=gymId;
  gameState.gymDeck=createGymDeck(gymId);
  getRandomPokemon();
}

export function getRandomPokemon() {
  /** @type {number | undefined} */
  let id;
  /** @type {number[]} */
  let choiceIds=[];
  if(gameState.mode==='daily') {
    const question=gameState.dailyDeck[gameState.dailyGuesses.length];
    if(!question)return;
    id=question.id;
    choiceIds=question.choices;
  } else if(gameState.mode==='gym') {
    id=gameState.gymDeck[gameState.numOfQuestions];
    const gym=getGym(gameState.gymId);
    if(!id||!gym)return;
    choiceIds=createDifficultyChoices(id,gym.roster,maxPokemonPerGeneration,gameState.difficulty);
  } else {
    const pool=eligiblePokemon();
    const used=gameState.usedPokemonIds.filter(item=>pool.includes(item));
    gameState.usedPokemonIds=pool.some(item=>!used.includes(item))?used:[];
    id=pickUnseenPokemonId(pool,gameState.usedPokemonIds);
    gameState.usedPokemonIds=[...gameState.usedPokemonIds,id];
    choiceIds=createDifficultyChoices(id,pool,maxPokemonPerGeneration,gameState.difficulty);
  }
  gameState.pokemonId=id;
  gameState.pokemon={id,name:pokemonNames[id-1]};
  gameState.choices=choiceIds.map(item=>pokemonNames[item-1]);
  gameState.hidePokemon=true;
  gameState.spriteReady=false;
  gameState.lastAnswer=null;
  gameState.lastPoints=0;
  gameState.hintUsed=false;
  gameState.eliminatedChoice=null;
  gameState.eliminatedChoices=[];
  gameState.newAwards=[];
}

/** @param {string} choice */
export function answerPokemon(choice) {
  if(!gameState.spriteReady)return;
  const result=resolveAnswer(gameState,choice);
  if(!result)return;
  const hintUsed=gameState.hintUsed;
  const previousAchievements=new Set(gameState.profile.achievements);
  const previousBadges=new Set(gameState.profile.badges);
  Object.assign(gameState,result);
  gameState.profile=recordGuess(gameState.profile,gameState.pokemonId,choice===gameState.pokemon?.name,gameState.streak);
  if(gameState.mode==='daily') {
    gameState.dailyGuesses=[...gameState.dailyGuesses,{choice,hintUsed}];
    saveDailyStatus();
  }
  if(gameState.mode==='challenge'&&gameState.completed) {
    gameState.profile=awardPerfectChallenge(gameState.profile,gameState.numOfRightAnswer,gameState.numOfQuestions);
    if(gameState.points>gameState.bestChallengeScore) {
      gameState.bestChallengeScore=gameState.points;
      try {if(typeof localStorage!=='undefined')localStorage.setItem(BEST_SCORE_KEY,String(gameState.points));}catch{}
    }
  }
  if(gameState.mode==='gym'&&gameState.completed) {
    gameState.profile=awardGymBadge(gameState.profile,gameState.gymId,gameState.numOfRightAnswer);
  }
  gameState.newAwards=[...gameState.profile.achievements.filter(id=>!previousAchievements.has(id)),...gameState.profile.badges.filter(id=>!previousBadges.has(id)).map(id=>'badge:'+id)];
  saveProfile();
}

export function useHint() {
  if(!gameState.pokemon||!gameState.hidePokemon||gameState.hintUsed||!gameState.spriteReady)return;
  const disabled=chooseEliminatedChoices(gameState.choices,gameState.pokemon.name);
  if(!disabled.length)return;
  gameState.eliminatedChoices=disabled;
  gameState.eliminatedChoice=disabled[0];
  gameState.hintUsed=true;
}

export function nextRound() {
  if(!gameState.pokemon||gameState.hidePokemon)return;
  if(gameState.completed||(gameState.mode==='challenge'&&gameState.numOfQuestions>=CHALLENGE_LENGTH)||
     (gameState.mode==='gym'&&gameState.numOfQuestions>=GYM_LENGTH)||(gameState.mode==='daily'&&gameState.numOfQuestions>=DAILY_LENGTH))endGame();
  else getRandomPokemon();
}

export function endGame() {
  const unfinishedDaily=gameState.mode==='daily'&&!gameState.completed;
  gameState.pokemon=null;
  gameState.pokemonId=0;
  gameState.choices=[];
  gameState.hidePokemon=true;
  gameState.lastAnswer=null;
  gameState.spriteReady=false;
  if(unfinishedDaily) {
    resetGame();
    gameState.mode='classic';
  }
}
// Keep the old entry point for existing integrations.
export const loadBestChallengeScore=loadGamePreferences;
