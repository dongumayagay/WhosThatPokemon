import { pokemonNames } from './pokemonNames.json';
import { gameState, maxPokemonPerGeneration, resetGame } from './state.svelte.js';
import { createChoiceIdsFromPool } from './choice-options.js';
import {
  CHALLENGE_LENGTH,
  chooseEliminatedChoice,
  getEligiblePokemonIds,
  pickUnseenPokemonId,
  resolveAnswer
} from './game-rules.js';

const BEST_SCORE_KEY = 'wtp-challenge-best-v1';

function eligiblePokemon() {
  // The picker requires at least one generation; guard persisted/invalid settings.
  const generations = gameState.selectedGenerations.length ? gameState.selectedGenerations : [1];
  return getEligiblePokemonIds(generations, maxPokemonPerGeneration);
}

export function startGame(mode = 'classic') {
  resetGame();
  gameState.mode = mode === 'challenge' ? 'challenge' : 'classic';
  getRandomPokemon();
}

export function getRandomPokemon() {
  const pool = eligiblePokemon();
  const used = gameState.usedPokemonIds.filter((id) => pool.includes(id));
  const unseenRemain = pool.some((id) => !used.includes(id));
  gameState.usedPokemonIds = unseenRemain ? used : [];
  const id = pickUnseenPokemonId(pool, gameState.usedPokemonIds);
  gameState.usedPokemonIds = [...gameState.usedPokemonIds, id];
  gameState.pokemonId = id;
  gameState.pokemon = { id, name: pokemonNames[id - 1] };
  gameState.choices = createChoiceIdsFromPool(id, pool).map((choiceId) => pokemonNames[choiceId - 1]);
  gameState.hidePokemon = true;
  gameState.lastAnswer = null;
  gameState.lastPoints = 0;
  gameState.hintUsed = false;
  gameState.eliminatedChoice = null;
}

/** @param {string} choice */
export function answerPokemon(choice) {
  const result = resolveAnswer(gameState, choice);
  if (!result) return;
  Object.assign(gameState, result);
  if (gameState.completed && gameState.points > gameState.bestChallengeScore) {
    gameState.bestChallengeScore = gameState.points;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(BEST_SCORE_KEY, String(gameState.points));
      }
    } catch {
      // The game remains playable when browser storage is unavailable.
    }
  }
}

export function useHint() {
  if (!gameState.pokemon || !gameState.hidePokemon || gameState.hintUsed) return;
  const eliminated = chooseEliminatedChoice(gameState.choices, gameState.pokemon.name);
  if (!eliminated) return;
  gameState.eliminatedChoice = eliminated;
  gameState.hintUsed = true;
}

export function nextRound() {
  if (!gameState.pokemon || gameState.hidePokemon) return;
  if (gameState.mode === 'challenge' && gameState.numOfQuestions >= CHALLENGE_LENGTH) {
    endGame();
  } else {
    getRandomPokemon();
  }
}

export function endGame() {
  gameState.pokemon = null;
  gameState.pokemonId = 0;
  gameState.choices = [];
  gameState.hidePokemon = true;
  gameState.lastAnswer = null;
}

export function loadBestChallengeScore() {
  try {
    if (typeof localStorage === 'undefined') return;
    const stored = Number(localStorage.getItem(BEST_SCORE_KEY));
    if (Number.isSafeInteger(stored) && stored > 0) {
      gameState.bestChallengeScore = stored;
    }
  } catch {
    // Private browsing or storage restrictions should not block gameplay.
  }
}
