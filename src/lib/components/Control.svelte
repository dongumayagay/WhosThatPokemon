<script>
  import { gameState } from '../state.svelte.js';
  import { CHALLENGE_LENGTH, DAILY_LENGTH } from '../game-rules.js';
  import { formatDailyShare, getUtcDateKey, getTrainerRank } from '../daily-challenge.js';
  import { startGame, answerPokemon, nextRound, endGame, useHint } from '../pokemon.svelte.js';

  const correctGuess = $derived(!gameState.hidePokemon && gameState.lastAnswer === gameState.pokemon?.name);
  const dailyFinished = $derived(gameState.dailyStatus?.date === getUtcDateKey() && gameState.dailyStatus?.completed);
  let shareStatus = $state('');
  let fallbackShareText = $state('');

  /** @param {KeyboardEvent} event */
  function handleShortcut(event) {
    if (gameState.showSelectGenerations || gameState.showProfessorOak || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;

    if (gameState.pokemon && gameState.hidePokemon && /^[1-4]$/.test(event.key)) {
      const choice = gameState.choices[Number(event.key) - 1];
      if (choice) answerPokemon(choice);
    } else if (gameState.pokemon && !gameState.hidePokemon && event.key === 'Enter') {
      if (target instanceof HTMLElement && target.tagName === 'BUTTON') return;
      event.preventDefault();
      nextRound();
    }
  }

  function begin(mode) {
    shareStatus = '';
    fallbackShareText = '';
    startGame(mode);
  }

  async function shareDailyResult() {
    const result = gameState.dailyStatus;
    if (!result?.completed) return;
    const content = formatDailyShare(result.date, result, 'https://whos-that-pokemon-7iu.pages.dev');
    shareStatus = '';
    fallbackShareText = '';
    try {
      if (navigator.share) {
        await navigator.share({title: 'Daily Dex result', text: content});
        shareStatus = 'Shared!';
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
        shareStatus = 'Copied! Paste your score anywhere.';
      } else {
        fallbackShareText = content;
        shareStatus = 'Copy your result below.';
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      fallbackShareText = content;
      shareStatus = 'Copy your result below.';
    }
  }
</script>

<svelte:window onkeydown={handleShortcut} />

<div class="mx-auto w-full max-w-3xl px-3 sm:px-4">
  {#if gameState.pokemon}
    <div class="flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-white sm:gap-3" aria-label="Current game statistics">
      <span class="rounded-full border-2 border-neutral-900 bg-sky-700 px-3 py-2 shadow-[2px_3px_0_#111827]">
        {gameState.mode === 'daily' ? 'Daily ' + (gameState.numOfQuestions + (gameState.hidePokemon ? 1 : 0)) + ' / ' + DAILY_LENGTH : gameState.mode === 'challenge' ? 'Round ' + (gameState.numOfQuestions + (gameState.hidePokemon ? 1 : 0)) + ' / ' + CHALLENGE_LENGTH : 'Free play'}
      </span>
      <span class="rounded-full border-2 border-neutral-900 bg-neutral-800 px-3 py-2 shadow-[2px_3px_0_#111827]">{gameState.points} pts</span>
      <span class="rounded-full border-2 border-neutral-900 bg-amber-600 px-3 py-2 shadow-[2px_3px_0_#111827]">Streak: {gameState.streak}</span>
      <span class="rounded-full border-2 border-neutral-900 bg-emerald-700 px-3 py-2 shadow-[2px_3px_0_#111827]">{gameState.numOfRightAnswer}/{gameState.numOfQuestions} right</span>
    </div>
    {#if gameState.mode !== 'classic'}
      <div
        class="mt-3 h-3 overflow-hidden rounded-full border-2 border-neutral-900 bg-white/60"
        role="progressbar"
        aria-label={gameState.mode === 'daily' ? 'Daily Dex progress' : 'Challenge progress'}
        aria-valuemin="0"
        aria-valuemax={gameState.mode === 'daily' ? DAILY_LENGTH : CHALLENGE_LENGTH}
        aria-valuenow={gameState.numOfQuestions}
      >
        <div class="h-full bg-emerald-500 transition-[width] duration-300" style:width={(gameState.numOfQuestions / (gameState.mode === 'daily' ? DAILY_LENGTH : CHALLENGE_LENGTH)) * 100 + '%'}></div>
      </div>
    {/if}
    {#if gameState.mode === 'daily'}
      <div class="mt-2 flex items-center justify-center gap-2" aria-label={'Daily results: ' + (gameState.dailyStatus?.marks.join(', ') || 'No answers yet')}>
        {#each [0,1,2,3,4] as i}
          <span class="text-xl" aria-hidden="true">{gameState.dailyStatus?.marks[i] ?? '⬜'}</span>
        {/each}
      </div>
    {/if}
  {:else if gameState.mode === 'daily' && gameState.completed}
    <div class="rounded-2xl border-4 border-neutral-900 bg-white/95 px-4 py-4 text-neutral-900 shadow-[4px_5px_0_#111827]" role="status">
      <p class="text-xl font-black">Daily Dex complete!</p>
      <p class="mt-1 text-lg font-bold text-indigo-800">{getTrainerRank(gameState.numOfRightAnswer, DAILY_LENGTH)}</p>
      <p class="mt-2 text-base">{gameState.points} points · {gameState.numOfRightAnswer}/{DAILY_LENGTH} correct</p>
      <p class="mt-2 text-2xl" aria-label="Your five daily results">{gameState.dailyStatus?.marks.join('') ?? ''}</p>
      <p class="mt-2 text-xs">Green = correct, yellow = hinted, dark = missed. Your daily result is saved on this device.</p>
    </div>
  {:else if gameState.numOfQuestions > 0}
    <div class="rounded-2xl border-4 border-neutral-900 bg-white/95 px-4 py-3 text-neutral-900 shadow-[4px_5px_0_#111827]" role="status">
      <p class="text-lg font-black">{gameState.completed ? 'Challenge complete!' : 'Nice run, Trainer!'}</p>
      <p class="mt-1 text-base">{gameState.points} points · {gameState.numOfRightAnswer}/{gameState.numOfQuestions} correct · Best streak {gameState.bestStreak}</p>
      {#if gameState.mode === 'challenge' && !gameState.completed}
        <p class="mt-1 text-sm">Finish all ten rounds to set a personal best.</p>
      {/if}
      {#if gameState.mode === 'challenge'}
        <p class="mt-1 text-sm font-bold">Challenge best: {gameState.bestChallengeScore} pts</p>
      {/if}
    </div>
  {:else}
    <div class="rounded-2xl border-4 border-neutral-900 bg-white/95 px-4 py-3 text-neutral-900 shadow-[4px_5px_0_#111827]">
      <p class="text-lg font-black">Spot the silhouette. Build a streak.</p>
      <p class="mt-1 text-sm sm:text-base">Pick a game mode, discover Pokémon, and earn bonus points as your streak grows. No timer, no pressure.</p>
      {#if gameState.bestChallengeScore > 0}
        <p class="mt-2 text-sm font-bold text-emerald-800">Challenge best: {gameState.bestChallengeScore} pts</p>
      {/if}
    </div>
  {/if}
</div>

<section class="mx-auto grid w-full max-w-3xl grid-cols-2 gap-2 px-3 sm:gap-4 sm:px-4" aria-label="Game controls">
  {#if !gameState.pokemon}
    {#if gameState.completed && gameState.mode === 'daily'}
      <button onclick={shareDailyResult} class="btn col-span-2 min-h-[48px] bg-emerald-500 border-b-emerald-700 text-white">Share Daily Result</button>
    {/if}
    {#if !dailyFinished}
      <button onclick={() => begin('daily')} class="btn col-span-2 min-h-[56px] bg-yellow-300 border-b-amber-600 text-neutral-900">
        Daily Dex · {gameState.dailyStatus?.guesses.length ? 'Resume ' + gameState.dailyStatus.guesses.length + '/5' : '5 fresh mysteries'}
      </button>
    {:else if !(gameState.completed && gameState.mode === 'daily')}
      <div class="col-span-2 rounded-xl border-2 border-neutral-900 bg-emerald-100 px-3 py-3 text-center text-neutral-900">
        <p class="font-black">Today's Daily Dex: Completed</p>
        <p class="mt-1 text-sm">{gameState.dailyStatus?.correct}/5 correct · {gameState.dailyStatus?.points} points</p>
        <button onclick={shareDailyResult} class="btn mt-2 bg-emerald-500 border-b-emerald-700 text-white">Share Result</button>
      </div>
    {/if}
    <button onclick={() => begin('classic')} class="btn min-h-[48px] bg-emerald-500 border-b-emerald-700 text-white">Free Play</button>
    <button onclick={() => begin('challenge')} class="btn min-h-[48px] bg-indigo-500 border-b-indigo-700 text-white">10-Round Challenge</button>
    <button onclick={() => (gameState.showSelectGenerations = true)} class="btn col-span-2 min-h-[48px] bg-pink-500 border-b-pink-700 text-white">
      Choose Generations ({gameState.selectedGenerations.length} selected)
    </button>
    <p class="col-span-2 text-center text-xs font-semibold text-white/90">
      Daily Dex uses the same five Pokémon worldwide (all eight generations). New puzzle at 00:00 UTC.
    </p>
  {:else}
    {#each gameState.choices as choice, i}
      <button
        onclick={() => answerPokemon(choice)}
        disabled={!gameState.hidePokemon || gameState.eliminatedChoices.includes(choice)}
        aria-keyshortcuts={String(i + 1)}
        aria-label={'Answer ' + (i + 1) + ': ' + choice}
        class="btn min-h-[48px] {gameState.eliminatedChoices.includes(choice) && gameState.hidePokemon ? 'line-through' : ''}"
        class:btn-correct={!gameState.hidePokemon && choice === gameState.pokemon.name}
        class:btn-wrong={!gameState.hidePokemon && choice === gameState.lastAnswer && !correctGuess}
        class:btn-disable={gameState.eliminatedChoices.includes(choice)}
      >
        <span class="mr-1 text-[10px] opacity-60 sm:text-xs" aria-hidden="true">{i + 1}.</span>{choice}
      </button>
    {/each}
    {#if gameState.hidePokemon}
      <button onclick={useHint} disabled={gameState.hintUsed} class="btn min-h-[48px] bg-amber-300 border-b-amber-600" class:btn-disable={gameState.hintUsed}>
        {gameState.hintUsed ? 'Hint Used' : '50/50 Hint'}
      </button>
      <button onclick={endGame} class="btn min-h-[48px] bg-sky-500 border-b-sky-700 text-white">{gameState.mode === 'daily' ? 'Save & Exit' : 'End Run'}</button>
    {:else}
      <div class="col-span-2 rounded-xl border-2 border-neutral-900 px-3 py-3 text-sm font-bold shadow-[2px_3px_0_#111827] sm:text-base {correctGuess ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}" role="status" aria-live="polite">
        {#if correctGuess}
          That's right! +{gameState.lastPoints} pts{gameState.streak >= 3 ? ' · ' + gameState.streak + '-answer combo!' : ''}
        {:else}
          Not quite! It was {gameState.pokemon.name}. Give the next one a try!
        {/if}
      </div>
      <button onclick={nextRound} class="btn col-span-2 min-h-[48px] bg-sky-500 border-b-sky-700 text-white">
        {gameState.completed ? 'See Results' : 'Next Pokémon'}
      </button>
    {/if}
  {/if}
</section>

{#if shareStatus}
  <div class="mx-auto w-full max-w-3xl px-3 text-center" role="status" aria-live="polite">
    <p class="rounded-xl bg-white px-3 py-2 text-sm font-bold text-neutral-900">{shareStatus}</p>
    {#if fallbackShareText}
      <textarea readonly aria-label="Copyable Daily Dex result" class="mt-2 w-full rounded-lg border-2 border-neutral-900 bg-white p-3 text-sm text-neutral-900" rows="5">{fallbackShareText}</textarea>
    {/if}
  </div>
{/if}

{#if gameState.pokemon}
  <p class="px-4 text-center text-xs font-semibold text-white/90 sm:text-sm">
    {gameState.hidePokemon ? 'Press 1–' + gameState.choices.length + ' to guess. Hints halve the points for that round.' : 'Press Enter or tap Next to continue.'}
  </p>
{/if}
