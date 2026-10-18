<script>
	import { gameState } from '../state.svelte.js';
	import { selectRandomPokemonIdFromGen } from '../pokemon.svelte.js';
	import { fade, scale } from 'svelte/transition';

	const options = [1, 2, 3, 4, 5, 6, 7, 8];
	const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

	// Local state for temp selection (using $state)
	let tempSelectedGen = $state([...gameState.selectedGenerations]);

	/** @param {number} gen */
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

<div class="fixed inset-0 z-30 grid place-items-center overflow-y-auto bg-black/60 p-3" transition:fade>
	<div
		class="grid max-h-[calc(100dvh-2rem)] w-full max-w-md grid-cols-2 gap-2 overflow-y-auto rounded-xl bg-neutral-200 p-4 sm:gap-4 sm:p-6"
		transition:scale
	>
		{#each options as gen}
			<label class="{tempSelectedGen.includes(gen) ? 'btn-selected' : ''} btn col-span-1 min-h-[44px]">
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
			class="btn min-h-[44px] bg-red-500 text-white border-red-700"
			onclick={closeModal}
		>
			Close
		</button>
	</div>
</div>
