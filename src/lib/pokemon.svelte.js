import { pokemonNames } from './pokemonNames.json';
import { gameState, maxPokemonPerGeneration, resetGame } from './state.svelte.js';
import { createChoiceIdsFromPool } from './choice-options.js';
import {
  CHALLENGE_LENGTH,
  chooseEliminatedChoices,
  getEligiblePokemonIds,
  pickUnseenPokemonId,
  resolveAnswer
} from './game-rules.js';
import {createDailyDeck, getUtcDateKey, summarizeDailyGuesses} from './daily-challenge.js';

const BEST_SCORE_KEY = 'wtp-challenge-best-v1';
const DAILY_KEY = 'wtp-daily-v1';

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
  } catch {
    // Storage disabled or corrupted: the game remains playable.
  }
  return {...summarizeDailyGuesses(guesses, deck, pokemonNames), date};
}

function saveDailyStatus() {
  if (gameState.mode !== 'daily') return;
  const status = {
    ...summarizeDailyGuesses(gameState.dailyGuesses, gameState.dailyDeck, pokemonNames),
    date: gameState.dailyDate
  };
  gameState.dailyStatus = status;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DAILY_KEY, JSON.stringify({date: status.date, guesses: status.guesses}));
    }
  } catch {
    // Local progress is best effort; no backend service is needed.
  }
}

export function startGame(mode = 'classic') {
  resetGame();
  gameState.mode = mode === 'daily' ? 'daily' : mode === 'challenge' ? 'challenge' : 'classic';
  if (gameState.mode === 'daily') {
    gameState.dailyDate = getUtcDateKey();
    gameState.dailyDeck = createDailyDeck(gameState.dailyDate, maxPokemonPerGeneration);
    const saved = readDailyStatus(gameState.dailyDate, gameState.dailyDeck);
    gameState.dailyStatus = saved;
    gameState.dailyGuesses = [...saved.guesses];
    gameState.numOfQuestions = saved.guesses.length;
    gameState.numOfRightAnswer = saved.correct;
    gameState.points = saved.points;
    gameState.streak = saved.streak;
    gameState.bestStreak = saved.bestStreak;
    gameState.completed = saved.completed;
    if (saved.completed) return; // A completed daily puzzle cannot restart today.
  }
  getRandomPokemon();
}

export function getRandomPokemon() {
  let id;
  /** @type {number[]} */
  let choices;
  if (gameState.mode === 'daily') {
    const question = gameState.dailyDeck[gameState.dailyGuesses.length];
    if (!question) return;
    id = question.id;
    choices = question.choices;
  } else {
    const pool = eligiblePokemon();
    const used = gameState.usedPokemonIds.filter((item) => pool.includes(item));
    const unseenRemain = pool.some((item) => !used.includes(item));
    gameState.usedPokemonIds = unseenRemain ? used : [];
    id = pickUnseenPokemonId(pool, gameState.usedPokemonIds);
    gameState.usedPokemonIds = [...gameState.usedPokemonIds, id];
    choices = createChoiceIdsFromPool(id, pool);
  }
  gameState.pokemonId = id;
  gameState.pokemon = {id, name: pokemonNames[id - 1]};
  gameState.choices = choices.map((choiceId) => pokemonNames[choiceId - 1]);
  gameState.hidePokemon = true;
  gameState.lastAnswer = null;
  gameState.lastPoints = 0;
  gameState.hintUsed = false;
  gameState.eliminatedChoice = null;
  gameState.eliminatedChoices = [];
}

/** @param {string} choice */
export function answerPokemon(choice) {
  const result = resolveAnswer(gameState, choice);
  if (!result) return;
  const hintUsed = gameState.hintUsed;
  Object.assign(gameState, result);
  if (gameState.mode === 'daily') {
    gameState.dailyGuesses = [...gameState.dailyGuesses, {choice, hintUsed}];
    saveDailyStatus();
  }
  if (gameState.mode === 'challenge' && gameState.completed && gameState.points > gameState.bestChallengeScore) {
    gameState.bestChallengeScore = gameState.points;
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem(BEST_SCORE_KEY, String(gameState.points));
    } catch {
      // Browser storage is optional.
    }
  }
}

export function useHint() {
  if (!gameState.pokemon || !gameState.hidePokemon || gameState.hintUsed) return;
  const disabled = chooseEliminatedChoices(gameState.choices, gameState.pokemon.name);
  if (disabled.length === 0) return;
  gameState.eliminatedChoices = disabled;
  gameState.eliminatedChoice = disabled[0];
  gameState.hintUsed = true;
}

export function nextRound() {
  if (!gameState.pokemon || gameState.hidePokemon) return;
  if (gameState.completed || (gameState.mode === 'challenge' && gameState.numOfQuestions >= CHALLENGE_LENGTH)) {
    endGame();
  } else {
    getRandomPokemon();
  }
}

export function endGame() {
  const leaveUnfinishedDaily = gameState.mode === 'daily' && !gameState.completed;
  gameState.pokemon = null;
  gameState.pokemonId = 0;
  gameState.choices = [];
  gameState.hidePokemon = true;
  gameState.lastAnswer = null;
  if (leaveUnfinishedDaily) {
    resetGame();
    gameState.mode = 'classic';
  }
}

export function loadBestChallengeScore() {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = Number(localStorage.getItem(BEST_SCORE_KEY));
      if (Number.isSafeInteger(stored) && stored > 0) gameState.bestChallengeScore = stored;
    }
  } catch {
    // Private browsing or storage restrictions should not block gameplay.
  }
  const date = getUtcDateKey();
  const deck = createDailyDeck(date, maxPokemonPerGeneration);
  gameState.dailyStatus = readDailyStatus(date, deck);
}
