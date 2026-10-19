<script>
  import { gameState } from '../state.svelte.js';
  import { CHALLENGE_LENGTH } from '../game-rules.js';
  import { startGame, answerPokemon, nextRound, endGame, useHint } from '../pokemon.svelte.js';

  const correctGuess = $derived(
    !gameState.hidePokemon && gameState.lastAnswer === gameState.pokemon?.name
  );

  /** @param {KeyboardEvent} event */
  function handleShortcut(event) {
    if (gameState.showSelectGenerations || gameState.showProfessorOak || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;

    if (gameState.pokemon && gameState.hidePokemon && /^[1-3]$/.test(event.key)) {
      const choice = gameState.choices[Number(event.key) - 1];
      if (choice) answerPokemon(choice);
    } else if (gameState.pokemon && !gameState.hidePokemon && event.key === 'Enter') {
      // Enter on a focused button is already handled by that button's click.
      if (target instanceof HTMLElement && target.tagName === 'BUTTON') return;
      event.preventDefault();
      nextRound();
    }
  }
</script>

<svelte:window onkeydown={handleShortcut} />

<div class="mx-auto w-full max-w-3xl px-3 sm:px-4">
  {#if gameState.pokemon}
    <div class="flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-white sm:gap-3">
      <span class="rounded-full border-2 border-neutral-900 bg-sky-700 px-3 py-2 shadow-[2px_3px_0_#111827]">
        {gameState.mode === 'challenge' ? 'Round ' + (gameState.numOfQuestions + (gameState.hidePokemon ? 1 : 0)) + ' / ' + CHALLENGE_LENGTH : 'Free play'}
      </span>
      <span class="rounded-full border-2 border-neutral-900 bg-neutral-800 px-3 py-2 shadow-[2px_3px_0_#111827]">{gameState.points} pts</span>
      <span class="rounded-full border-2 border-neutral-900 bg-amber-600 px-3 py-2 shadow-[2px_3px_0_#111827]">Streak: {gameState.streak}</span>
      <span class="rounded-full border-2 border-neutral-900 bg-emerald-700 px-3 py-2 shadow-[2px_3px_0_#111827]">{gameState.numOfRightAnswer}/{gameState.numOfQuestions} right</span>
    </div>
    {#if gameState.mode === 'challenge'}
      <div
        class="mt-3 h-3 overflow-hidden rounded-full border-2 border-neutral-900 bg-white/60"
        role="progressbar"
        aria-label="Challenge progress"
        aria-valuemin="0"
        aria-valuemax={CHALLENGE_LENGTH}
        aria-valuenow={gameState.numOfQuestions}
      >
        <div class="h-full bg-emerald-500 transition-[width] duration-300" style:width={(gameState.numOfQuestions / CHALLENGE_LENGTH) * 100 + '%'}></div>
      </div>
    {/if}
  {:else if gameState.numOfQuestions > 0}
    <div class="rounded-2xl border-4 border-neutral-900 bg-white/95 px-4 py-3 text-neutral-900 shadow-[4px_5px_0_#111827]" role="status">
      <p class="text-lg font-black">
        {gameState.completed ? 'Challenge complete!' : 'Nice run, Trainer!'}
      </p>
      <p class="mt-1 text-base">{gameState.points} points · {gameState.numOfRightAnswer}/{gameState.numOfQuestions} correct · Best streak {gameState.bestStreak}</p>
      {#if gameState.mode === 'challenge' && !gameState.completed}
        <p class="mt-1 text-sm">You ended your challenge early. Finish all ten rounds to set a best score.</p>
      {/if}
      {#if gameState.mode === 'challenge'}
        <p class="mt-1 text-sm font-bold">Personal best: {gameState.bestChallengeScore} points</p>
      {/if}
    </div>
  {:else}
    <div class="rounded-2xl border-4 border-neutral-900 bg-white/95 px-4 py-3 text-neutral-900 shadow-[4px_5px_0_#111827]">
      <p class="text-lg font-black">Spot the silhouette. Build a streak.</p>
      <p class="mt-1 text-sm sm:text-base">Play endlessly, or tackle ten rounds for a personal best. Use a 50/50 hint whenever you get stuck.</p>
      {#if gameState.bestChallengeScore > 0}
        <p class="mt-2 text-sm font-bold text-emerald-800">Challenge best: {gameState.bestChallengeScore} pts</p>
      {/if}
    </div>
  {/if}
</div>

<section class="mx-auto grid w-full max-w-3xl grid-cols-2 gap-2 px-3 sm:gap-4 sm:px-4">
  {#if !gameState.pokemon}
    <button onclick={() => startGame('classic')} class="btn min-h-[48px] bg-emerald-500 border-b-emerald-700 text-white">
      Free Play
    </button>
    <button onclick={() => startGame('challenge')} class="btn min-h-[48px] bg-indigo-500 border-b-indigo-700 text-white">
      10-Round Challenge
    </button>
    <button
      onclick={() => (gameState.showSelectGenerations = true)}
      class="btn col-span-2 min-h-[48px] bg-pink-500 border-b-pink-700 text-white"
    >
      Choose Generations ({gameState.selectedGenerations.length} selected)
    </button>
  {:else}
    {#each gameState.choices as choice, i}
      <button
        onclick={() => answerPokemon(choice)}
        disabled={!gameState.hidePokemon || choice === gameState.eliminatedChoice}
        aria-keyshortcuts={String(i + 1)}
        aria-label={'Answer ' + (i + 1) + ': ' + choice}
        class="btn min-h-[48px] {choice === gameState.eliminatedChoice && gameState.hidePokemon ? 'line-through' : ''}"
        class:btn-correct={!gameState.hidePokemon && choice === gameState.pokemon.name}
        class:btn-wrong={!gameState.hidePokemon && choice === gameState.lastAnswer && !correctGuess}
        class:btn-disable={choice === gameState.eliminatedChoice}
      >
        <span class="mr-1 text-[10px] opacity-60 sm:text-xs" aria-hidden="true">{i + 1}.</span>{choice}
      </button>
    {/each}
    {#if gameState.hidePokemon}
      <button onclick={useHint} disabled={gameState.hintUsed} class="btn min-h-[48px] bg-amber-300 border-b-amber-600" class:btn-disable={gameState.hintUsed}>
        {gameState.hintUsed ? 'Hint Used' : '50/50 Hint'}
      </button>
      <button onclick={endGame} class="btn min-h-[48px] bg-sky-500 border-b-sky-700 text-white">End Run</button>
    {:else}
      <div class="col-span-2 rounded-xl border-2 border-neutral-900 px-3 py-3 text-sm font-bold shadow-[2px_3px_0_#111827] sm:text-base {correctGuess ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'}" role="status" aria-live="polite">
        {#if correctGuess}
          That's right! +{gameState.lastPoints} points{gameState.streak >= 3 ? ' / ' + gameState.streak + '-answer combo!' : ''}
        {:else}
          Not quite! It was {gameState.pokemon.name}. Your next round is a fresh start.
        {/if}
      </div>
      <button onclick={nextRound} class="btn col-span-2 min-h-[48px] bg-sky-500 border-b-sky-700 text-white">
        {gameState.completed ? 'See Results' : 'Next Pokemon'}
      </button>
    {/if}
  {/if}
</section>

{#if gameState.pokemon}
  <p class="px-4 text-center text-xs font-semibold text-white/90 sm:text-sm">
    {gameState.hidePokemon ? 'Press 1, 2 or 3 to guess. Hints halve the points for that round.' : 'Press Enter for the next round.'}
  </p>
{/if}
