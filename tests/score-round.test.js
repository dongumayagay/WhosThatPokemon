// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';
import { recordGuess } from '../src/lib/score-round.js';
const initial={numOfQuestions:0,numOfRightAnswer:0,streak:0,bestStreak:0};

test('a correct guess raises score and streak',()=>{
 assert.deepEqual(recordGuess(initial,true),{numOfQuestions:1,numOfRightAnswer:1,streak:1,bestStreak:1});
});
test('consecutive guesses build a best streak',()=>{
 let score=initial;
 score=recordGuess(score,true);score=recordGuess(score,true);score=recordGuess(score,true);
 assert.equal(score.streak,3);
 assert.equal(score.bestStreak,3);
 assert.equal(score.numOfRightAnswer,3);
});
test('a miss resets current streak but keeps best and accurate counts',()=>{
 const before={numOfQuestions:3,numOfRightAnswer:3,streak:3,bestStreak:3};
 assert.deepEqual(recordGuess(before,false),{numOfQuestions:4,numOfRightAnswer:3,streak:0,bestStreak:3});
});
test('score calculations do not mutate previous state',()=>{
 const source={...initial};recordGuess(source,true);assert.deepEqual(source,initial);
});
