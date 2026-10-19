import { createChoiceIdsFromPool } from './choice-options.js';
import { DAILY_LENGTH, calculateAnswerPoints, getEligiblePokemonIds } from './game-rules.js';

export { DAILY_LENGTH };

/** A global daily puzzle changes at 00:00 UTC, for comparable scores. */
export function getUtcDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

/** Portable date-seeded PRNG; no network or user tracking required. */
function seededRandom(label) {
  let hash = 2166136261;
  for (const character of label) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return () => {
    hash = (hash + 0x6d2b79f5) | 0;
    let value = Math.imul(hash ^ (hash >>> 15), 1 | hash);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Everyone sees the same five unique silhouettes and same-generation options.
 * @param {string} date YYYY-MM-DD in UTC
 * @param {number[]} generationCounts
 */
export function createDailyDeck(date, generationCounts) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date + 'T00:00:00Z'))) {
    throw new RangeError('Daily challenge requires a valid UTC date.');
  }
  const all = getEligiblePokemonIds(generationCounts.map((_, i) => i + 1), generationCounts);
  if (all.length < DAILY_LENGTH || generationCounts.some((count) => count < 4)) {
    throw new RangeError('Daily challenge requires at least five Pokémon and four per generation.');
  }
  const random = seededRandom(`WTP-daily-v1:${date}`);
  const candidates = [...all];
  const deck = [];
  let available = candidates.length;
  for (let round = 0; round < DAILY_LENGTH; round++) {
    const index = Math.min(available - 1, Math.floor(random() * available));
    const id = candidates[index];
    [candidates[index], candidates[available - 1]] = [candidates[available - 1], candidates[index]];
    available--;
    let offset = 0;
    let genPool = all;
    for (const count of generationCounts) {
      if (id > offset && id <= offset + count) {
        genPool = Array.from({length: count}, (_, n) => offset + n + 1);
        break;
      }
      offset += count;
    }
    deck.push({ id, choices: createChoiceIdsFromPool(id, genPool, random, 4) });
  }
  return deck;
}

/**
 * Reconstruct all stats from valid saved answer choices, never trusting cached points.
 * @param {Array<{choice:string,hintUsed:boolean}>} guesses
 * @param {Array<{id:number,choices:number[]}>} deck
 * @param {string[]} names
 */
export function summarizeDailyGuesses(guesses, deck, names) {
  const accepted = [];
  const marks = [];
  let correct = 0;
  let streak = 0;
  let bestStreak = 0;
  let points = 0;
  if (!Array.isArray(guesses)) guesses = [];
  for (let i = 0; i < Math.min(guesses.length, deck.length); i++) {
    const guess = guesses[i];
    if (!guess || typeof guess.choice !== 'string' || typeof guess.hintUsed !== 'boolean' ||
        !deck[i].choices.some(id => names[id - 1] === guess.choice)) break;
    accepted.push({choice: guess.choice, hintUsed: guess.hintUsed});
    if (guess.choice === names[deck[i].id - 1]) {
      correct++;
      streak++;
      bestStreak = Math.max(bestStreak, streak);
      points += calculateAnswerPoints(streak, guess.hintUsed);
      marks.push(guess.hintUsed ? '🟨' : '🟩');
    } else {
      streak = 0;
      marks.push('⬛');
    }
  }
  return {guesses: accepted, marks, correct, streak, bestStreak, points,
    completed: accepted.length === deck.length && deck.length === DAILY_LENGTH};
}

/** Positive, readable rank for accuracy, not game time. */
export function getTrainerRank(correct, total = DAILY_LENGTH) {
  if (correct === total && total > 0) return 'Pokédex Master';
  if (correct >= total * 0.8) return 'Ace Trainer';
  if (correct >= total * 0.6) return 'Gym Challenger';
  return 'Rising Trainer';
}

/** Spoiler-free, opt-in sharing. Never includes Pokémon names or silhouettes. */
export function formatDailyShare(date, summary, url) {
  const rank = getTrainerRank(summary.correct, DAILY_LENGTH);
  return `Who's That Pokémon? - Daily Dex ${date}\n${summary.marks.join('')}\n${summary.correct}/${DAILY_LENGTH} correct - ${summary.points} pts\n${rank}\n${url}`;
}
