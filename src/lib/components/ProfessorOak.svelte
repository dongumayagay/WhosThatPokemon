<script>
  import { tick } from 'svelte';
  import { gameState } from '../state.svelte.js';
  import { fade, scale } from 'svelte/transition';

  const sprite = 'https://archives.bulbagarden.net/media/upload/thumb/3/3e/Lets_Go_Pikachu_Eevee_Professor_Oak.png/200px-Lets_Go_Pikachu_Eevee_Professor_Oak.png';
  const endpoint = 'https://pokemo.pages.dev/api/oak';

  let question = $state('');
  let answer = $state("Ah! Welcome, Trainer! Ask me a Pokémon question.");
  let lastQuestion = $state('');
  let hasAsked = $state(false);
  let loading = $state(false);
  /** @type {HTMLDivElement | undefined} */
  let speechElement = $state();

  /** @param {SubmitEvent} event */
  async function ask(event) {
    event.preventDefault();
    const current = question.trim();
    if (loading || current.length < 3 || current.length > 240) return;
    lastQuestion = current;
    hasAsked = true;
    loading = true;
    answer = 'Let me check the Pokédex, Trainer...';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: current })
      });
      const result = await response.json();
      answer = response.ok ? result.answer : (result.error || 'I am not sure, Trainer.');
    } catch {
      answer = 'I cannot reach my Pokédex right now, Trainer. Try again later.';
    } finally {
      loading = false;
      await tick();
      // Move focus out of the keyboard and reveal the new answer in the dialog.
      speechElement?.focus({ preventScroll: true });
      speechElement?.scrollIntoView({
        block: 'nearest',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    }
  }

  function close() { gameState.showProfessorOak = false; }

  /** @param {KeyboardEvent} event */
  function handleKeyboard(event) {
    if (event.key === 'Escape') close();
  }
</script>

<svelte:window onkeydown={handleKeyboard}/>

<div class="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-black/70 p-3 sm:items-center sm:p-4" transition:fade={{ duration:180 }}>
  <button type="button" class="absolute inset-0 h-full w-full bg-transparent" onclick={close} aria-label="Close Professor Oak backdrop"></button>

  <div
    role="dialog"
    tabindex="-1"
    aria-modal="true"
    aria-label="Ask Professor Oak"
    class="relative z-10 w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-xl bg-neutral-800 shadow-2xl"
    transition:scale={{ duration:200, start:0.95 }}
  >
    <div class="sticky top-0 z-20 flex items-center justify-between bg-neutral-800 px-3 py-2">
      <span class="font-pixel text-[11px] text-white">ASK PROFESSOR OAK</span>
      <button type="button" class="min-h-[44px] min-w-[44px] rounded-full border-2 border-red-900 bg-red-500 font-bold text-white" onclick={close} aria-label="Close">×</button>
    </div>

    <form onsubmit={ask} class="rounded-xl border-4 border-neutral-900 bg-neutral-800 p-3">
      <label for="oak-question" class="mb-2 block font-pixel text-[11px] leading-relaxed text-white">ONE POKéMON QUESTION</label>
      <div class="flex gap-2">
        <input
          id="oak-question"
          type="text"
          bind:value={question}
          maxlength="240"
          minlength="3"
          placeholder="What comes after Charmander?"
          required
          autocomplete="off"
          disabled={loading}
          class="min-h-[48px] min-w-0 flex-1 rounded-md border-2 border-neutral-400 bg-white px-3 py-2 text-base text-neutral-900 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || question.trim().length < 3}
          class="min-h-[48px] rounded-md bg-green-500 px-3 font-pixel text-[11px] leading-snug text-white focus-visible:outline-4 focus-visible:outline-yellow-400 disabled:opacity-60 sm:px-4"
        >{loading ? 'WAIT' : 'ASK'}</button>
      </div>
      <p class="mt-2 text-[12px] text-neutral-200">One answer at a time. Nothing is saved.</p>
    </form>

    <div
      class:answered={hasAsked && !loading}
      bind:this={speechElement}
      tabindex="-1"
      role="status"
      aria-live="polite"
      aria-busy={loading}
      class="relative mx-3 mt-3 rounded-2xl border-4 border-neutral-800 bg-white p-4 shadow-xl focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-yellow-400 sm:p-5"
    >
      <div class="flex flex-wrap items-center justify-between gap-2">
        <strong class="font-pixel text-[11px] text-green-700">PROF. OAK</strong>
        {#if hasAsked && !loading}<span class="rounded bg-green-700 px-2 py-1 text-[11px] font-bold text-white">ANSWER READY</span>{/if}
        {#if loading}<span class="text-xs font-semibold text-neutral-500">CHECKING...</span>{/if}
      </div>
      {#if hasAsked}<p class="mt-2 break-words text-[12px] leading-relaxed text-neutral-600">You asked: {lastQuestion}</p>{/if}
      <p class="mt-3 whitespace-pre-wrap break-words text-base leading-relaxed text-neutral-900 sm:text-lg">{answer}</p>
      <span class="mt-2 block text-right text-xs text-neutral-400" aria-hidden="true">▼</span>
      <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 border-x-[15px] border-x-transparent border-t-[16px] border-t-neutral-800"></div>
    </div>

    <div class="flex justify-center py-3">
      <img src={sprite} alt="Professor Oak" class="h-24 object-contain drop-shadow-xl sm:h-40" />
    </div>
  </div>
</div>
