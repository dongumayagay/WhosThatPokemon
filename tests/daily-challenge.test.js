import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DAILY_LENGTH,
  getUtcDateKey,
  createDailyDeck,
  summarizeDailyGuesses,
  formatDailyShare,
  getTrainerRank
} from '../src/lib/daily-challenge.js';
import { createChoiceIdsFromPool } from '../src/lib/choice-options.js';
import { chooseEliminatedChoices, resolveAnswer } from '../src/lib/game-rules.js';

const counts = [151, 100, 135, 107, 156, 72, 88, 89];
const names = Array.from({ length: 898 }, (_, i) => `Pokemon-${i + 1}`);

function genOf(id) {
  let offset = 0;
  for (let i = 0; i < counts.length; i++) {
    if (id <= offset + counts[i]) return i + 1;
    offset += counts[i];
  }
  return -1;
}

test('Daily Dex always contains five unique questions for the same date', () => {
  assert.equal(DAILY_LENGTH, 5);
  const a = createDailyDeck('2026-10-19', counts);
  const b = createDailyDeck('2026-10-19', counts);
  assert.deepEqual(a, b);
  assert.equal(a.length, 5);
  assert.equal(new Set(a.map(x => x.id)).size, 5);
  assert.notDeepEqual(a, createDailyDeck('2026-10-20', counts));
});

test('Daily choices are four distinct same-generation Pokémon and include the answer', () => {
  const deck = createDailyDeck('2026-10-19', counts);
  for (const { id, choices } of deck) {
    assert.equal(choices.length, 4);
    assert.equal(new Set(choices).size, 4);
    assert.ok(choices.includes(id));
    assert.ok(choices.every(x => x >= 1 && x <= 898 && genOf(x) === genOf(id)));
  }
  assert.equal(createChoiceIdsFromPool(6, [6,7,8,9,10], () => 0, 4).length, 4);
  assert.throws(() => createChoiceIdsFromPool(6, [6,7,8], () => 0, 4), RangeError);
});

test('Daily date is UTC, not the local clock, for global comparable rounds', () => {
  assert.equal(getUtcDateKey(new Date('2026-10-19T23:59:59-04:00')), '2026-10-20');
  assert.throws(() => createDailyDeck('not-a-date', counts), RangeError);
});

test('A 50/50 hint leaves two options even with four buttons', () => {
  const options = ['A', 'B', 'C', 'D'];
  const disabled = chooseEliminatedChoices(options, 'C', () => 0);
  assert.equal(disabled.length, 2);
  assert.ok(disabled.every(x => x !== 'C'));
  assert.equal(new Set(disabled).size, 2);
  assert.equal(chooseEliminatedChoices(['A', 'B', 'C'], 'B', () => 0).length, 1);
});

test('Daily correct guess on round five ends the daily run', () => {
  const state = {
    pokemon: {id: 1, name:'Bulbasaur'}, hidePokemon:true,
    choices:['Bulbasaur','Ivysaur','Venusaur','Charmander'],
    eliminatedChoice:null, eliminatedChoices:['Ivysaur','Venusaur'],
    numOfQuestions:4, numOfRightAnswer:3, points:400, streak:1,
    bestStreak:2, hintUsed:true, mode:'daily'
  };
  assert.equal(resolveAnswer(state,'Ivysaur'), null);
  const answered = resolveAnswer(state,'Bulbasaur');
  assert.equal(answered?.completed, true);
  assert.equal(answered?.lastPoints, 63); // 125/2 rounded
  assert.equal(answered?.points, 463);
});

test('Resuming daily progress reconstructs score, streak and outcomes from valid answers', () => {
  const deck = createDailyDeck('2026-10-19', counts);
  const first = names[deck[0].id - 1];
  const secondWrongId = deck[1].choices.find(id => id !== deck[1].id);
  const third = names[deck[2].id - 1];
  const guesses = [
    { choice:first, hintUsed:false },
    { choice:names[secondWrongId - 1], hintUsed:false },
    { choice:third, hintUsed:true },
    { choice:'forged answer', hintUsed:false }
  ];
  const state = summarizeDailyGuesses(guesses, deck, names);
  assert.equal(state.guesses.length, 3);
  assert.equal(state.correct, 2);
  assert.equal(state.points, 150);
  assert.equal(state.streak, 1);
  assert.equal(state.bestStreak, 1);
  assert.deepEqual(state.marks, ['🟩', '⬛', '🟨']);
  assert.equal(state.completed, false);
});

test('Completed daily progress generates a spoiler-free share card', () => {
  const deck = createDailyDeck('2026-10-19', counts);
  const guesses = deck.map((round, i) => ({choice:names[round.id - 1], hintUsed:i === 2}));
  const state = summarizeDailyGuesses(guesses, deck, names);
  const share = formatDailyShare('2026-10-19', state, 'https://whos-that-pokemon-7iu.pages.dev');
  assert.equal(state.completed, true);
  assert.equal(state.correct, 5);
  assert.equal(getTrainerRank(5, 5), 'Pokédex Master');
  assert.match(share, /Daily Dex 2026-10-19/);
  assert.match(share, /🟩🟩🟨🟩🟩/u);
  assert.match(share, /5\/5/);
  assert.match(share, /https:\/\/whos-that-pokemon-7iu\.pages\.dev/);
  assert.doesNotMatch(share, /Pokemon-|Bulbasaur/);
});
