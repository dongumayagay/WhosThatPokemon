<script>
	import { gameState } from '../state.svelte.js';
	import { getRandomPokemon, selectRandomPokemonIdFromGen } from '../pokemon.svelte.js';

	const showPokemon = () => (gameState.hidePokemon = false);
	let rightAnswer = $state(/** @type {string | null} */ (null));
	let wrongAnswer = $state(/** @type {string | null} */ (null));

	function play() {
		gameState.numOfQuestions = 0;
		gameState.numOfRightAnswer = 0;
		getRandomPokemon();
	}

	function checkAnswer(answer) {
		showPokemon();
		selectRandomPokemonIdFromGen();
		rightAnswer = gameState.pokemon?.name ?? null;
		gameState.numOfQuestions += 1;
		if (answer !== rightAnswer) {
			wrongAnswer = answer;
		} else {
			gameState.numOfRightAnswer += 1;
		}
	}

	function quit() {
		gameState.pokemon = null;
		rightAnswer = null;
		selectRandomPokemonIdFromGen();
	}
</script>

<section class="container grid sm:grid-cols-2 gap-4 px-4">
	{#if !gameState.pokemon}
		<button onclick={play} class="btn bg-emerald-500 border-b-emerald-700 text-white">
			{gameState.numOfQuestions === 0 ? 'Play' : 'Play Again'}
		</button>
		<button
			onclick={() => (gameState.showSelectGenerations = true)}
			class="btn bg-pink-500 border-b-pink-700 text-white"
		>
			Select Gen
		</button>
	{:else}
		{#each gameState.choices as choice}
			<button
				onclick={() => checkAnswer(choice)}
				class="btn {choice === rightAnswer ? 'btn-correct' : ''} {choice === wrongAnswer
					? 'btn-wrong'
					: ''}"
				class:btn-disable={!gameState.hidePokemon}
				disabled={!gameState.hidePokemon}
			>
				{choice}
			</button>
		{/each}
		{#if gameState.hidePokemon}
			<button onclick={quit} class="btn bg-sky-500 border-sky-700 text-white"> Quit </button>
		{:else}
			<button onclick={getRandomPokemon} class="btn bg-sky-500 border-sky-700 text-white">
				Next
			</button>
		{/if}
	{/if}
</section>
