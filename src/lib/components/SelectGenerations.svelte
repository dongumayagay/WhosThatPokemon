<script>
	import { gameState } from '../state.svelte.js';
	import { selectRandomPokemonIdFromGen } from '../pokemon.svelte.js';
	import { fade, scale } from 'svelte/transition';

	const options = [1, 2, 3, 4, 5, 6, 7, 8];
	const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

	// Local state for temp selection (using $state)
	let tempSelectedGen = $state([...gameState.selectedGenerations]);

	function toggleGeneration(gen) {
		if (tempSelectedGen.includes(gen)) {
			tempSelectedGen = tempSelectedGen.filter((g) => g !== gen);
		} else {
			tempSelectedGen = [...tempSelectedGen, gen];
		}
	}

	function saveSelectedGeneration() {
		gameState.selectedGenerations = [...tempSelectedGen];
		gameState.showSelectGenerations = false;
		selectRandomPokemonIdFromGen();
	}

	function closeModal() {
		gameState.showSelectGenerations = false;
	}
</script>

<div class="fixed h-full w-full bg-black/50 z-20 grid place-items-center px-4" transition:fade>
	<div
		class="bg-neutral-200 rounded-xl gap-4 w-full sm:w-[500px] px-8 py-6 grid grid-cols-2"
		transition:scale
	>
		{#each options as gen}
			<label class="{tempSelectedGen.includes(gen) ? 'btn-selected' : ''} btn col-span-2">
				<input
					type="checkbox"
					checked={tempSelectedGen.includes(gen)}
					onchange={() => toggleGeneration(gen)}
					name="generations"
					value={gen}
					class="invisible absolute"
				/>
				Gen {roman[gen - 1]}
			</label>
		{/each}
		<button
			disabled={tempSelectedGen.length === 0}
			class="flex-1 {tempSelectedGen.length === 0
				? 'btn-disable'
				: 'bg-green-500 text-white border-green-700'} btn"
			onclick={saveSelectedGeneration}
		>
			Apply
		</button>
		<button
			disabled={tempSelectedGen.length === 0}
			class="flex-1 {tempSelectedGen.length === 0
				? 'btn-disable'
				: 'bg-red-500 text-white border-red-700'} btn"
			onclick={closeModal}
		>
			Close
		</button>
	</div>
</div>
