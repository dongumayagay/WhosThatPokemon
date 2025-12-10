<script>
	import { selectRandomPokemonIdFromGen } from '$lib/pokemon';
	import { showSelectGenerations } from '$lib/store';
	import Header from '$lib/components/Header.svelte';
	import Control from '$lib/components/Control.svelte';
	import PokemonImage from '$lib/components/PokemonImage.svelte';
	import SelectGenerations from '$lib/components/SelectGenerations.svelte';
	import { onMount } from 'svelte';
	selectRandomPokemonIdFromGen();
	onMount(() => {
		setTimeout(() => window.scrollTo(0, 1), 0);
	});
</script>

{#if $showSelectGenerations}
	<SelectGenerations />
{/if}
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
