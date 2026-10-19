/** A short run with a clear finish line; free play is still unlimited. */
export const CHALLENGE_LENGTH = 10;
export const DAILY_LENGTH = 5;
export const GYM_LENGTH = 5;

/**
 * Return the national Pokédex IDs for the selected generations.
 * @param {number[]} generations
 * @param {number[]} counts
 * @returns {number[]}
 */
export function getEligiblePokemonIds(generations, counts) {
  const selected = new Set(generations);
  /** @type {number[]} */
  const ids = [];
  let offset = 0;
  counts.forEach((count, index) => {
    if (selected.has(index + 1)) {
      for (let id = 1; id <= count; id++) ids.push(offset + id);
    }
    offset += count;
  });
  return ids;
}

/**
 * Avoid repeated encounters until every eligible Pokémon has appeared.
 * @param {number[]} eligibleIds
 * @param {number[]} usedIds
 * @param {() => number} [random]
 */
export function pickUnseenPokemonId(eligibleIds, usedIds, random = Math.random) {
  if (eligibleIds.length === 0) throw new RangeError('Select at least one generation.');
  const used = new Set(usedIds);
  const unseen = eligibleIds.filter((id) => !used.has(id));
  const pool = unseen.length > 0 ? unseen : eligibleIds;
  return pool[Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)))];
}

/** @param {number} streak @param {boolean} usedHint */
export function calculateAnswerPoints(streak, usedHint) {
  if (streak <= 0) return 0;
  const base = 100 + Math.min(streak - 1, 4) * 25;
  return Math.round(base * (usedHint ? 0.5 : 1));
}

/** @param {string[]} choices @param {string} correctName @param {() => number} [random] */
export function chooseEliminatedChoice(choices, correctName, random = Math.random) {
  const wrong = choices.filter((choice) => choice !== correctName);
  if (wrong.length === 0) return null;
  return wrong[Math.min(wrong.length - 1, Math.max(0, Math.floor(random() * wrong.length)))];
}

/** @param {string[]} choices @param {string} correctName @param {() => number} [random] */
export function chooseEliminatedChoices(choices, correctName, random = Math.random) {
  const wrong = [...new Set(choices.filter((choice) => choice !== correctName))];
  const disabled = [];
  while (wrong.length > 1) {
    const j = Math.min(wrong.length - 1, Math.max(0, Math.floor(random() * wrong.length)));
    disabled.push(wrong.splice(j, 1)[0]);
  }
  return disabled;
}

/**
 * Resolve a single guess without mutating the input state.
 * Returning null makes double-submission and disabled hints harmless.
 * @param {{pokemon: {id:number,name:string} | null, hidePokemon:boolean, choices:string[], eliminatedChoice:string | null, eliminatedChoices?:string[], numOfQuestions:number, numOfRightAnswer:number, points:number, streak:number, bestStreak:number, hintUsed:boolean, mode:string}} state
 * @param {string} answer
 */
export function resolveAnswer(state, answer) {
  if (
    !state.pokemon || !state.hidePokemon || !state.choices.includes(answer) ||
    state.eliminatedChoice === answer || state.eliminatedChoices?.includes(answer)
  ) return null;
  const correct = answer === state.pokemon.name;
  const streak = correct ? state.streak + 1 : 0;
  const lastPoints = correct ? calculateAnswerPoints(streak, state.hintUsed) : 0;
  const numOfQuestions = state.numOfQuestions + 1;
  return {
    hidePokemon: false,
    lastAnswer: answer,
    numOfQuestions,
    numOfRightAnswer: state.numOfRightAnswer + (correct ? 1 : 0),
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    lastPoints,
    points: state.points + lastPoints,
    completed: (state.mode === 'challenge' && numOfQuestions >= CHALLENGE_LENGTH) ||
      (state.mode === 'daily' && numOfQuestions >= DAILY_LENGTH) ||
      (state.mode === 'gym' && numOfQuestions >= GYM_LENGTH)
  };
}
