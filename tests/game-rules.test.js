import test from 'node:test';
import assert from 'node:assert/strict';
import { createChoiceIdsFromPool } from '../src/lib/choice-options.js';
import {
  CHALLENGE_LENGTH,
  getEligiblePokemonIds,
  pickUnseenPokemonId,
  calculateAnswerPoints,
  chooseEliminatedChoice,
  resolveAnswer
} from '../src/lib/game-rules.js';

test('the challenge is a short ten-round run', () => {
  assert.equal(CHALLENGE_LENGTH, 10);
});

test('eligible Pokemon IDs include only selected generations with correct offsets', () => {
  assert.deepEqual(getEligiblePokemonIds([1, 3], [2, 3, 2]), [1, 2, 6, 7]);
  assert.deepEqual(getEligiblePokemonIds([], [2, 3, 2]), []);
  assert.deepEqual(getEligiblePokemonIds([2, 2], [2, 3, 2]), [3, 4, 5]);
});

test('unseen Pokemon are preferred and exhausted pools can restart', () => {
  assert.equal(pickUnseenPokemonId([10, 11, 12], [10, 11], () => 0), 12);
  assert.equal(pickUnseenPokemonId([10, 11], [10, 11], () => 0.999), 11);
  assert.throws(() => pickUnseenPokemonId([], []), RangeError);
});

test('choice buttons use only chosen generation IDs and never duplicate', () => {
  const pool = [16, 17, 18, 19];
  const chosen = createChoiceIdsFromPool(16, pool, () => 0);
  assert.equal(chosen.length, 3);
  assert.equal(new Set(chosen).size, 3);
  assert.ok(chosen.includes(16));
  assert.ok(chosen.every(id => pool.includes(id)));
  assert.throws(() => createChoiceIdsFromPool(16, [16, 16, 17]), RangeError);
});

test('streaks award combo points with an upper cap', () => {
  assert.equal(calculateAnswerPoints(0, false), 0);
  assert.equal(calculateAnswerPoints(1, false), 100);
  assert.equal(calculateAnswerPoints(3, false), 150);
  assert.equal(calculateAnswerPoints(5, false), 200);
  assert.equal(calculateAnswerPoints(99, false), 200);
});

test('using a 50/50 hint halves the score for that round', () => {
  assert.equal(calculateAnswerPoints(1, true), 50);
  assert.equal(calculateAnswerPoints(3, true), 75);
});

test('a hint only eliminates one wrong answer', () => {
  assert.equal(chooseEliminatedChoice(['A', 'B', 'C'], 'B', () => 0), 'A');
  assert.equal(chooseEliminatedChoice(['A', 'B', 'C'], 'B', () => 0.999), 'C');
  assert.equal(chooseEliminatedChoice(['B'], 'B'), null);
});

test('a correct answer increments score and streak and completes round ten', () => {
  const result = resolveAnswer({
    pokemon: { id: 1, name: 'Bulbasaur' }, hidePokemon: true,
    choices: ['Bulbasaur', 'Ivysaur', 'Venusaur'], eliminatedChoice: null,
    numOfQuestions: 9, numOfRightAnswer: 6, points: 950,
    streak: 2, bestStreak: 4, hintUsed: false, mode: 'challenge'
  }, 'Bulbasaur');
  assert.deepEqual(result, {
    hidePokemon: false, lastAnswer: 'Bulbasaur', numOfQuestions: 10,
    numOfRightAnswer: 7, streak: 3, bestStreak: 4,
    lastPoints: 150, points: 1100, completed: true
  });
});

test('a wrong answer ends the streak but retains accumulated points', () => {
  const result = resolveAnswer({
    pokemon: { id: 1, name: 'Bulbasaur' }, hidePokemon: true,
    choices: ['Bulbasaur', 'Ivysaur', 'Venusaur'], eliminatedChoice: null,
    numOfQuestions: 0, numOfRightAnswer: 0, points: 150,
    streak: 3, bestStreak: 3, hintUsed: false, mode: 'classic'
  }, 'Ivysaur');
  assert.equal(result?.streak, 0);
  assert.equal(result?.points, 150);
  assert.equal(result?.lastPoints, 0);
  assert.equal(result?.completed, false);
});

test('invalid guesses and repeated submissions have no effect', () => {
  const base = {
    pokemon: { id: 1, name: 'Bulbasaur' }, hidePokemon: true,
    choices: ['Bulbasaur', 'Ivysaur', 'Venusaur'], eliminatedChoice: 'Venusaur',
    numOfQuestions: 0, numOfRightAnswer: 0, points: 0,
    streak: 0, bestStreak: 0, hintUsed: true, mode: 'classic'
  };
  assert.equal(resolveAnswer(base, 'Venusaur'), null);
  assert.equal(resolveAnswer(base, 'NotAPokemon'), null);
  assert.equal(resolveAnswer({ ...base, hidePokemon: false }, 'Bulbasaur'), null);
  assert.equal(resolveAnswer({ ...base, pokemon: null }, 'Bulbasaur'), null);
  assert.equal(resolveAnswer(base, 'Bulbasaur')?.lastPoints, 50);
});
