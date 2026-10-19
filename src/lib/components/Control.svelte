<script>
  import { gameState } from '../state.svelte.js';
  import { GYMS, getGym, GYM_LENGTH } from '../gym-trials.js';
  import { ACHIEVEMENTS } from '../progression.js';
  import { CHALLENGE_LENGTH, DAILY_LENGTH } from '../game-rules.js';
  import { formatDailyShare, getUtcDateKey, getTrainerRank } from '../daily-challenge.js';
  import { startGame, startGym, answerPokemon, nextRound, endGame, useHint, setDifficulty } from '../pokemon.svelte.js';
  import { playResultTone } from '../sound.js';

  const correctGuess = $derived(!gameState.hidePokemon && gameState.lastAnswer === gameState.pokemon?.name);
  const dailyFinished = $derived(gameState.dailyStatus?.date === getUtcDateKey() && gameState.dailyStatus?.completed);
  const totalRounds = $derived(gameState.mode === 'daily' ? DAILY_LENGTH : gameState.mode === 'gym' ? GYM_LENGTH : gameState.mode === 'challenge' ? CHALLENGE_LENGTH : 0);
  const currentGym = $derived(getGym(gameState.gymId));
  const newlyEarned = $derived(gameState.newAwards.map(id =>
    id.startsWith('badge:') ? getGym(id.slice(6))?.name + ' badge' : ACHIEVEMENTS.find(a => a.id === id)?.name
  ).filter(Boolean));

  let shareStatus = $state('');
  let copyResult = $state('');
  /** @type {HTMLButtonElement | undefined} */
  let menuCloseButton;

  $effect(() => {
    if (gameState.showModes) queueMicrotask(() => menuCloseButton?.focus());
  });

  /** @param {string} choice */
  function guess(choice) {
    const wasHidden = gameState.hidePokemon;
    answerPokemon(choice);
    if (wasHidden && !gameState.hidePokemon && gameState.soundEnabled) {
      playResultTone(choice === gameState.pokemon?.name, gameState.streak);
    }
  }

  /** @param {KeyboardEvent} event */
  function shortcuts(event) {
    if (gameState.showModes) {
      if (event.key === 'Escape') {
        gameState.showModes = false;
        queueMicrotask(() => {
          const opener = document.querySelector('.wtp-menu-button');
          if (opener instanceof HTMLElement) opener.focus();
        });
      } else if (event.key === 'Tab') {
        const panel = menuCloseButton?.closest('.wtp-menu-panel');
        const focusable = Array.from(panel?.querySelectorAll('button:not([disabled]),summary') || []);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (first instanceof HTMLElement && last instanceof HTMLElement) {
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }
      return;
    }
    if (gameState.showSelectGenerations || gameState.showProfessorOak ||
        gameState.showPokedex || gameState.showSettings || event.repeat ||
        event.altKey || event.ctrlKey || event.metaKey) return;

    const target = event.target;
    if (target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT','TEXTAREA','SELECT'].includes(target.tagName))) return;

    if (gameState.pokemon && gameState.hidePokemon && /^[1-4]$/.test(event.key)) {
      const choice = gameState.choices[Number(event.key) - 1];
      if (choice) guess(choice);
    } else if (gameState.pokemon && !gameState.hidePokemon && event.key === 'Enter') {
      if (target instanceof HTMLElement && target.tagName === 'BUTTON') return;
      event.preventDefault();
      nextRound();
    }
  }

  /** @param {'classic'|'daily'|'challenge'} mode */
  function begin(mode) {
    gameState.showModes = false;
    shareStatus = '';
    copyResult = '';
    startGame(mode);
  }

  /** @param {string} id */
  function beginGym(id) {
    gameState.showModes = false;
    shareStatus = '';
    copyResult = '';
    startGym(id);
  }

  function replay() {
    if (gameState.mode === 'gym' && currentGym) beginGym(currentGym.id);
    else if (gameState.mode === 'challenge') begin('challenge');
    else begin('classic');
  }

  async function shareDaily() {
    const result = gameState.dailyStatus;
    if (!result?.completed) return;
    const content = formatDailyShare(result.date, result, 'https://whos-that-pokemon-7iu.pages.dev');
    shareStatus = '';
    copyResult = '';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Daily Dex result', text: content });
        shareStatus = 'Result shared!';
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
        shareStatus = 'Copied! Paste your score anywhere.';
      } else {
        copyResult = content;
        shareStatus = 'Copy your result below.';
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      copyResult = content;
      shareStatus = 'Copy your result below.';
    }
  }
</script>

<svelte:window onkeydown={shortcuts} />

<div class="wtp-controls">
  {#if gameState.pokemon}
    <div class="wtp-scoreline" aria-label="Current round statistics">
      <span>{gameState.mode === 'gym' ? currentGym?.name : gameState.mode === 'daily' ? 'Daily Dex' : gameState.mode === 'challenge' ? 'Challenge' : 'Free Play'}{#if totalRounds} · {gameState.numOfQuestions + (gameState.hidePokemon ? 1 : 0)}/{totalRounds}{/if}</span>
      <span>{gameState.points} pts <span aria-hidden="true">·</span> {gameState.streak} streak</span>
    </div>
    {#if totalRounds}
      <div class="wtp-progress" role="progressbar" aria-label="Challenge progress"
        aria-valuemin="0" aria-valuemax={totalRounds} aria-valuenow={gameState.numOfQuestions}>
        <div style:width={(100 * gameState.numOfQuestions / totalRounds) + '%'}></div>
      </div>
    {/if}
    <div class="answers-grid anime-answers" role="group" aria-label="Choose the Pokémon">
      {#each gameState.choices as choice, i}
        <button
          class="answer-option anime-option"
          class:correct={!gameState.hidePokemon && choice === gameState.pokemon.name}
          class:incorrect={!gameState.hidePokemon && choice === gameState.lastAnswer && !correctGuess}
          class:eliminated={gameState.eliminatedChoices.includes(choice) && gameState.hidePokemon}
          onclick={() => guess(choice)}
          disabled={!gameState.spriteReady || !gameState.hidePokemon || gameState.eliminatedChoices.includes(choice)}
          aria-keyshortcuts={String(i + 1)}
          aria-label={'Answer ' + (i + 1) + ': ' + choice}>
          <span class="wtp-choice-index" aria-hidden="true">{i + 1}</span>
          <span class="wtp-choice-name">{choice}</span>
          {#if !gameState.hidePokemon && choice === gameState.pokemon.name}
            <span class="wtp-choice-mark" aria-hidden="true">✓</span>
          {:else if !gameState.hidePokemon && choice === gameState.lastAnswer && !correctGuess}
            <span class="wtp-choice-mark" aria-hidden="true">✕</span>
          {/if}
        </button>
      {/each}
    </div>

    {#if gameState.hidePokemon}
      <div class="wtp-quiet-actions">
        <button class="wtp-text-action" onclick={useHint}
          disabled={!gameState.spriteReady || gameState.hintUsed}>
          {gameState.hintUsed ? 'Hint used' : '50/50 hint'} <span>−50% points</span>
        </button>
        <button class="wtp-text-action" onclick={endGame}>
          {gameState.mode === 'daily' ? 'Save & exit' : 'End round'}
        </button>
      </div>
    {:else}
      <p class="wtp-result-feedback" class:is-correct={correctGuess} role="status" aria-live="polite">
        <strong>{correctGuess ? '✓ Correct!' : '✕ Not quite.'}</strong>
        {#if correctGuess}
          +{gameState.lastPoints} pts{#if gameState.streak > 1} · {gameState.streak} in a row{/if}
        {:else}
          The answer was {gameState.pokemon.name}.
        {/if}
      </p>
      {#if newlyEarned.length}
        <p class="wtp-unlocked" role="status">Unlocked: {newlyEarned.join(', ')}</p>
      {/if}
      <button class="wtp-primary wtp-next" onclick={nextRound}>
        {gameState.completed ? 'See results' : 'Next Pokémon'} <span aria-hidden="true">→</span>
      </button>
    {/if}
    <p class="wtp-keyboard-note">
      {gameState.hidePokemon ? 'Use 1–' + gameState.choices.length + ' on your keyboard to guess' : 'Press Enter to continue'}
    </p>
  {:else if gameState.numOfQuestions > 0 || gameState.completed}
    <div class="wtp-finish" role="status">
      <p class="wtp-finish-title">{gameState.mode === 'daily' ? 'Daily Dex complete!' : gameState.mode === 'gym' ? (gameState.numOfRightAnswer >= 4 ? 'Gym badge earned!' : 'Gym trial complete') : 'Nice run, Trainer!'}</p>
      <p><strong>{gameState.points}</strong> points <span aria-hidden="true">·</span> {gameState.numOfRightAnswer}/{gameState.numOfQuestions} correct <span aria-hidden="true">·</span> best streak {gameState.bestStreak}</p>
      {#if gameState.mode === 'daily'}
        <p class="wtp-daily-marks" aria-label="Your five daily results">{gameState.dailyStatus?.marks.join('') ?? ''}</p>
        <button class="wtp-text-action" onclick={shareDaily}>Share daily result</button>
      {:else if gameState.mode === 'gym'}
        <p>{gameState.numOfRightAnswer >= 4 ? 'You earned the ' + currentGym?.name + ' emblem!' : 'Get four correct answers to earn the badge.'}</p>
      {:else if gameState.mode === 'challenge'}
        <p>Personal best: {gameState.bestChallengeScore} points</p>
      {/if}
      {#if newlyEarned.length}<p class="wtp-unlocked">Unlocked: {newlyEarned.join(', ')}</p>{/if}
    </div>
    <button class="wtp-primary wtp-play" onclick={replay}>
      Play again <span aria-hidden="true">→</span>
    </button>
    <button class="wtp-under-link" onclick={() => gameState.showModes = true}>Choose another mode</button>
  {:else}
    <button class="wtp-primary wtp-play" onclick={() => begin('classic')}>
      Start guessing <span aria-hidden="true">→</span>
    </button>
    <p class="wtp-small-note">Free Play · No timer <span aria-hidden="true">·</span>
      <button onclick={() => gameState.showModes = true}>More ways to play</button>
    </p>
  {/if}

  {#if shareStatus}
    <div class="wtp-share-feedback" role="status">
      {shareStatus}
      {#if copyResult}<textarea rows="5" readonly aria-label="Copyable Daily Dex result">{copyResult}</textarea>{/if}
    </div>
  {/if}
</div>

{#if gameState.showModes}
  <div class="wtp-menu-overlay">
    <button class="wtp-menu-scrim" tabindex="-1" aria-label="Close game menu"
      onclick={() => gameState.showModes = false}></button>
    <section class="wtp-menu-panel" role="dialog" aria-modal="true" aria-label="Game modes and options">
      <header class="wtp-menu-head">
        <h2>Choose your adventure</h2>
        <button bind:this={menuCloseButton} class="wtp-close-menu" onclick={() => gameState.showModes = false}
          aria-label="Close menu">✕</button>
      </header>
      <div class="wtp-menu-modes">
        <button onclick={() => begin('classic')} class="wtp-menu-mode">
          <strong>Free Play</strong><span>Unlimited silhouettes</span>
        </button>
        <button onclick={() => begin('daily')} class="wtp-menu-mode" disabled={dailyFinished}>
          <strong>Daily Dex</strong><span>{dailyFinished ? 'Completed for today' : gameState.dailyStatus?.guesses.length ? 'Resume your five mysteries' : 'Five shared mysteries today'}</span>
        </button>
        <button onclick={() => begin('challenge')} class="wtp-menu-mode">
          <strong>10-Round Challenge</strong><span>Go for a personal best</span>
        </button>
      </div>
      {#if dailyFinished}
        <button class="wtp-menu-small" onclick={() => {gameState.showModes = false; shareDaily();}}>Share today's Daily Dex result</button>
      {/if}
      <details class="wtp-menu-details">
        <summary>Gym Trials <span>{gameState.profile.badges.length}/8 badges</span></summary>
        <div class="wtp-menu-gyms">
          {#each GYMS as gym}
            <button onclick={() => beginGym(gym.id)}>
              <span aria-hidden="true">{gym.icon}</span>
              <strong>{gym.name}</strong>
              {#if gameState.profile.badges.includes(gym.id)}
                <small>✓ Earned</small>
              {/if}
            </button>
          {/each}
        </div>
      </details>
      <div class="wtp-menu-section">
        <p class="wtp-menu-label">Difficulty <small>(Free Play, Challenge and Gyms)</small></p>
        <div class="wtp-difficulty" role="group" aria-label="Difficulty">
          {#each ['easy','normal','expert'] as level}
            <button aria-pressed={gameState.difficulty === level}
              class:active={gameState.difficulty === level}
              onclick={() => setDifficulty(/** @type {'easy'|'normal'|'expert'} */(level))}>
              {level}
            </button>
          {/each}
        </div>
        <button class="wtp-menu-small" onclick={() => {gameState.showModes = false; gameState.showSelectGenerations = true;}}>
          Selected generations: {gameState.selectedGenerations.join(', ')} · Change
        </button>
      </div>
      <div class="wtp-menu-links">
        <button aria-label="Open personal Pokédex" onclick={() => {gameState.showModes = false; gameState.showPokedex = true;}}>
          Pokédex <small>{gameState.profile.discovered.length}/898 found</small>
        </button>
        <button aria-label="Open game settings" onclick={() => {gameState.showModes = false; gameState.showSettings = true;}}>Settings</button>
        <button aria-label="Ask Professor Oak" onclick={() => {gameState.showModes = false; gameState.showProfessorOak = true;}}>Professor Oak</button>
      </div>
    </section>
  </div>
{/if}
