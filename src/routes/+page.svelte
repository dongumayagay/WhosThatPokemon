<script>
	import { selectRandomPokemonIdFromGen } from '$lib/pokemon.svelte.js';
	import { gameState } from '$lib/state.svelte.js';
	import Header from '$lib/components/Header.svelte';
	import Control from '$lib/components/Control.svelte';
	import PokemonImage from '$lib/components/PokemonImage.svelte';
	import SelectGenerations from '$lib/components/SelectGenerations.svelte';
	import ProfessorOak from '$lib/components/ProfessorOak.svelte';

	selectRandomPokemonIdFromGen();

</script>

{#if gameState.showSelectGenerations}
	<SelectGenerations />
{/if}

{#if gameState.showProfessorOak}
	<ProfessorOak />
{/if}

<!-- Ask Professor Oak Floating Button -->
<button
	onclick={() => (gameState.showProfessorOak = true)}
	style="bottom: calc(0.75rem + env(safe-area-inset-bottom));"
	class="fixed right-3 z-20 bg-green-500 hover:bg-green-600 text-white font-pixel text-xs px-4 py-3 rounded-full shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2 outline outline-black outline-2"
	aria-label="Ask Professor Oak"
>
	<span class="text-lg">🥼</span>
	<span class="hidden sm:inline">Ask Prof. Oak</span>
</button>

<div
	class="min-h-dvh w-full bg-gradient-to-tr from-yellow-500 via-orange-500 to-red-500"
>
	<main class="mx-auto flex min-h-dvh w-full max-w-5xl flex-col items-stretch justify-start gap-3 px-3 pt-4 text-center sm:justify-center sm:gap-5 sm:pt-8"
		style="padding-bottom: calc(5.25rem + env(safe-area-inset-bottom));">
		<Header />
		<PokemonImage />
		<Control />
	</main>
</div>
