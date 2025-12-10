<script>
	import { selectRandomPokemonIdFromGen } from '$lib/pokemon';
	import { showSelectGenerations, showProfessorOak } from '$lib/store';
	import Header from '$lib/components/Header.svelte';
	import Control from '$lib/components/Control.svelte';
	import PokemonImage from '$lib/components/PokemonImage.svelte';
	import SelectGenerations from '$lib/components/SelectGenerations.svelte';
	import ProfessorOak from '$lib/components/ProfessorOak.svelte';
	import { onMount } from 'svelte';
	selectRandomPokemonIdFromGen();
	onMount(() => {
		setTimeout(() => window.scrollTo(0, 1), 0);
	});
</script>

{#if $showSelectGenerations}
	<SelectGenerations />
{/if}

{#if $showProfessorOak}
	<ProfessorOak />
{/if}

<!-- Ask Professor Oak Floating Button -->
<button
	on:click={() => ($showProfessorOak = true)}
	class="fixed bottom-4 right-4 z-20 bg-green-500 hover:bg-green-600 text-white font-pixel text-xs px-4 py-3 rounded-full shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2 outline outline-black outline-2"
	aria-label="Ask Professor Oak"
>
	<span class="text-lg">🥼</span>
	<span class="hidden sm:inline">Ask Prof. Oak</span>
</button>

<div
	class="	h-screen bg-gradient-to-tr from-yellow-500 via-orange-500 to-red-500
			scroll-smooth snap-y snap-mandatory overflow-y-auto
			"
>
	<main class=" container h-screen snap-center text-center flex flex-col justify-center">
		<Header />
		<PokemonImage />
		<Control />
	</main>
</div>
