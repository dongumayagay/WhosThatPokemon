<script>
  import { gameState } from '../state.svelte.js';
  import { fade, scale } from 'svelte/transition';

  const sprite = 'https://archives.bulbagarden.net/media/upload/thumb/3/3e/Lets_Go_Pikachu_Eevee_Professor_Oak.png/200px-Lets_Go_Pikachu_Eevee_Professor_Oak.png';
  const endpoint = 'https://pokemo.pages.dev/api/oak';
  let question = $state('');
  let answer = $state("Ah! Welcome, Trainer! Ask me a Pokémon question.");
  let loading = $state(false);

  /** @param {SubmitEvent} event */
  async function ask(event) {
    event.preventDefault();
    const current = question.trim();
    if (loading || current.length < 3 || current.length > 240) return;
    loading = true;
    answer = 'Hmm! Let me think...';
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
    }
  }

  function close() { gameState.showProfessorOak = false; }
</script>

<div class="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-4" transition:fade={{duration:180}}>
  <button type="button" class="absolute inset-0 h-full w-full bg-black/70" onclick={close} aria-label="Close Professor Oak"></button>
  <div role="dialog" tabindex="-1" aria-modal="true" aria-label="Ask Professor Oak" class="relative z-10 w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto rounded-xl" transition:scale={{duration:200,start:0.95}}>
    <button type="button" class="sticky top-0 ml-auto z-20 w-10 h-10 rounded-full bg-red-500 text-white font-bold border-2 border-red-900" onclick={close} aria-label="Close">X</button>
    <div class="relative mb-5 rounded-2xl border-4 border-neutral-800 bg-white p-5 shadow-xl min-h-[125px]">
      <strong class="font-pixel text-[11px] text-green-700">PROF. OAK</strong>
      <p class="mt-3 text-neutral-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words" aria-live="polite" aria-busy={loading}>{answer}</p>
      <span class="block text-right text-neutral-400 text-xs mt-3" aria-hidden="true">▼</span>
      <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 border-x-[15px] border-x-transparent border-t-[16px] border-t-neutral-800"></div>
    </div>
    <div class="flex justify-center my-3">
      <img src={sprite} alt="Professor Oak" class="h-32 sm:h-48 object-contain drop-shadow-xl"/>
    </div>
    <form onsubmit={ask} class="rounded-xl border-4 border-neutral-900 bg-neutral-800 p-3 shadow-xl">
      <label for="oak-question" class="block text-xs font-pixel text-white mb-2">ONE POKéMON QUESTION</label>
      <div class="flex gap-2">
        <input id="oak-question" type="text" bind:value={question} maxlength="240" minlength="3" placeholder="What is Pikachu weak against?" required autocomplete="off" disabled={loading} class="min-w-0 flex-1 bg-white rounded-md border-2 border-neutral-400 px-3 py-3 text-sm text-neutral-900 disabled:opacity-60"/>
        <button type="submit" disabled={loading || question.trim().length < 3} class="rounded-md bg-green-500 px-4 text-white font-pixel text-xs disabled:opacity-50">{loading ? '...' : 'ASK'}</button>
      </div>
      <p class="text-neutral-300 text-[11px] mt-2">No chat history. Your next question replaces this answer.</p>
    </form>
  </div>
</div>
