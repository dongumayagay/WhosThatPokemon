<script>
	import { scale } from 'svelte/transition';
	import { hidePokemon, numOfQuestions, pokemon } from '../store';
</script>

<header class="h-28 sm:h-36 lg:h-28 px-4 relative overflow-hidden header">
	{#if ($pokemon && $hidePokemon) || (!$pokemon && $numOfQuestions === 0)}
		<h1 in:scale={{ delay: 400 }} out:scale>Who's That Pokemon?</h1>
	{:else if !$pokemon && $numOfQuestions !== 0}
		<h1 in:scale={{ delay: 400 }} out:scale>Your Score</h1>
	{:else}
		<h1 in:scale={{ delay: 400 }} out:scale>It's {$pokemon.name}</h1>
	{/if}
</header>
