import test from 'node:test';
import assert from 'node:assert/strict';
import { GYMS, GYM_LENGTH, createGymDeck, getGym } from '../src/lib/gym-trials.js';
import { createDifficultyChoices } from '../src/lib/difficulty.js';
import { sanitizeProfile, recordGuess, awardGymBadge, awardPerfectChallenge, generationProgress, ACHIEVEMENTS } from '../src/lib/progression.js';
const counts = [151,100,135,107,156,72,88,89];

test('Eight themed Gym Trials each contain five unique valid opponents', () => {
  assert.equal(GYMS.length, 8);
  assert.equal(GYM_LENGTH, 5);
  for (const gym of GYMS) {
    const deck = createGymDeck(gym.id, () => 0.42);
    assert.equal(deck.length, GYM_LENGTH);
    assert.equal(new Set(deck).size, GYM_LENGTH);
    assert.ok(deck.every(id => gym.roster.includes(id) && id >= 1 && id <= 898));
    assert.deepEqual(deck, createGymDeck(gym.id, () => 0.42));
  }
  assert.equal(getGym('fire')?.name, 'Ember Gym');
  assert.throws(() => createGymDeck('fake'), RangeError);
});

test('Difficulty scales answer count and never leaks Pokémon from outside the pool', () => {
  const pool = [22,25,26,30,34,35,37,38,39,40,133,134,135,136];
  for (const level of /** @type {Array<'easy'|'normal'|'expert'>} */(['easy','normal','expert'])) {
    const selected = createDifficultyChoices(25, pool, counts, level, () => 0.42);
    assert.equal(selected.length, level === 'easy' ? 3 : 4);
    assert.equal(new Set(selected).size, selected.length);
    assert.ok(selected.includes(25));
    assert.ok(selected.every(x => pool.includes(x)));
  }
  assert.deepEqual(createDifficultyChoices(25, pool, counts, 'expert', () => 0.42),createDifficultyChoices(25, pool, counts, 'expert', () => 0.42));
  assert.throws(() => createDifficultyChoices(25, [10,11,12], counts, 'expert'), RangeError);
});

test('Expert mode prioritizes known lookalike Pikachu-family distractors', () => {
  const pool = [10,22,25,26,172,311,312,417,600,700];
  const chosen = createDifficultyChoices(25, pool, counts, 'expert', () => 0.5);
  assert.equal(chosen.length, 4);
  assert.ok(chosen.some(x => [26,172,311,312,417].includes(x)));
});

test('Malformed browser profile is sanitized rather than trusted', () => {
  assert.deepEqual(sanitizeProfile(null), {discovered:[],totalAnswered:0,totalCorrect:0,badges:[],achievements:[]});
  assert.deepEqual(sanitizeProfile({discovered:[1,1,900,-1,'1',25],totalAnswered:-1,totalCorrect:999,badges:['fire','bad','fire'],achievements:['first','random']}),
    {discovered:[1,25],totalAnswered:0,totalCorrect:0,badges:['fire'],achievements:['first']});
});

test('Correct guesses collect unique Pokémon and grant milestones only once', () => {
  let p = sanitizeProfile(null);
  p = recordGuess(p, 25, true, 1);
  assert.deepEqual(p.discovered,[25]);
  assert.equal(p.totalAnswered,1);
  assert.equal(p.totalCorrect,1);
  assert.ok(p.achievements.includes('first'));
  p = recordGuess(p,25,true,3);
  assert.deepEqual(p.discovered,[25]);
  assert.equal(p.totalCorrect,2);
  assert.ok(p.achievements.includes('combo3'));
  p = recordGuess(p,26,false,0);
  assert.deepEqual(p.discovered,[25]);
  assert.equal(p.totalAnswered,3);
  assert.equal(new Set(p.achievements).size,p.achievements.length);
});

test('Gym badges need 4/5 correct and a perfect ten-round challenge awards a title', () => {
  let p=sanitizeProfile(null);
  assert.deepEqual(awardGymBadge(p,'fire',3).badges,[]);
  p=awardGymBadge(p,'fire',4);
  assert.deepEqual(p.badges,['fire']);
  assert.deepEqual(awardGymBadge(p,'fire',5).badges,['fire']);
  p=awardPerfectChallenge(p,10,10);
  assert.ok(p.achievements.includes('perfect10'));
  assert.ok(p.achievements.includes('firstbadge'));
  assert.equal(ACHIEVEMENTS.length>=8,true);
});

test('Collection progress is per generation, not per game attempt', () => {
  const result=generationProgress([1,2,151,152,898],counts);
  assert.equal(result.length,8);
  assert.equal(result[0].found,3);
  assert.equal(result[0].total,151);
  assert.equal(result[1].found,1);
  assert.equal(result[7].found,1);
  assert.ok(result.every(x=>x.found<=x.total));
});
