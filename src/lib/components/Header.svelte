<script>
	import { scale } from 'svelte/transition';
	import { gameState } from '../state.svelte.js';
</script>

<header class="h-20 shrink-0 sm:h-28 lg:h-28 px-3 relative header">
	{#if (gameState.pokemon && gameState.hidePokemon) || (!gameState.pokemon && gameState.numOfQuestions === 0)}
		<h1 in:scale={{ delay: 400 }} out:scale>Who's That Pokemon?</h1>
	{:else if !gameState.pokemon && gameState.numOfQuestions !== 0}
		<h1 in:scale={{ delay: 400 }} out:scale>Your Score</h1>
	{:else}
		<h1 in:scale={{ delay: 400 }} out:scale>It's {gameState.pokemon?.name}</h1>
	{/if}
</header>
