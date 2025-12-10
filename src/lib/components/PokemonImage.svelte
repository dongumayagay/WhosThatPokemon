<script>
	import { scale } from 'svelte/transition';
	import { gameState } from '../state.svelte.js';

	function drawSpiky(ctx) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#0284c7';
		ctx.beginPath();
		for (let theta = 0; theta <= Math.PI * 2; theta += 0.05) {
			const radius = Math.random() * canvas.width * 0.3 + canvas.width * 0.25;
			ctx.lineTo(halfWidth + radius * Math.cos(theta), halfHeight + radius * Math.sin(theta));
		}
		ctx.fill();
		ctx.fillStyle = '#e5e5e5';
		ctx.beginPath();
		for (let theta = 0; theta <= Math.PI * 2; theta += 0.05) {
			const radius = Math.random() * canvas.width * 0.2 + canvas.width * 0.25;
			ctx.lineTo(halfWidth + radius * Math.cos(theta), halfHeight + radius * Math.sin(theta));
		}
		ctx.fill();
	}

	let width = $state(0);
	let height = $state(0);
	let canvas = $state(/** @type {HTMLCanvasElement | null} */ (null));
	let ctx = $state(/** @type {CanvasRenderingContext2D | null} */ (null));
	let halfWidth = $state(0);
	let halfHeight = $state(0);
	let resize = $state(false);

	function setupCanvas() {
		if (!canvas) return;
		canvas.width = width;
		canvas.height = height;
		ctx = canvas.getContext('2d');
		halfWidth = canvas.width / 2;
		halfHeight = canvas.height / 2;
		if (ctx) drawSpiky(ctx);
	}

	$effect(() => {
		if (canvas) {
			setupCanvas();
		}
	});

	function handleResize() {
		resize = !resize;
		setupCanvas();
	}

	// Derived value for score percentage
	const scorePercent = $derived(
		gameState.numOfQuestions > 0
			? Math.floor((gameState.numOfRightAnswer / gameState.numOfQuestions) * 100)
			: 0
	);
</script>

{#if gameState.pokemonId}
	<link
		rel="preload"
		as="image"
		href={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${gameState.pokemonId}.png`}
	/>
{/if}

<svelte:window onresize={handleResize} />

<section class="container aspect-square sm:aspect-video lg:aspect-[2/1] overflow-hidden">
	{#if gameState.pokemon}
		{#key gameState.pokemon.id}
			<div in:scale={{ delay: 400 }} out:scale class="block h-full relative aspect-square mx-auto">
				{#key resize}
					<div bind:clientWidth={width} bind:clientHeight={height} class="w-full h-full">
						<img
							draggable="false"
							src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${gameState.pokemon.id}.png`}
							style="image-rendering: pixelated;"
							alt="pokemon"
							class="block mx-auto absolute h-full aspect-square transition duration-1000 select-none pointer-events-none"
							class:brightness-0={gameState.hidePokemon}
						/>
						<canvas bind:this={canvas} class=""></canvas>
					</div>
				{/key}
			</div>
		{/key}
	{:else}
		<div
			in:scale={{ delay: 400 }}
			out:scale
			class="aspect-square h-full mx-auto flex flex-col justify-center"
		>
			{#if gameState.numOfQuestions === 0}
				<h1
					class="font-pokemon capitalize text-yellow-400 text-[250px] sm:text-[350px] lg:text-[450px] [-webkit-text-stroke:5px_#0369a1;] [text-shadow:-7px_7px_#171717;] sm:[-webkit-text-stroke:7px_#0369a1;] sm:[text-shadow:-10px_10px_#171717;] lg:[-webkit-text-stroke:9px_#0369a1;] lg:[text-shadow:-12px_12px_#171717;]"
				>
					?
				</h1>
			{:else}
				<div class="relative -top-7">
					<h1
						class="tracking-wider mb-4 font-pokemon capitalize text-yellow-400 text-8xl sm:text-[150px] [-webkit-text-stroke:4px_#0369a1;] [text-shadow:-7px_7px_#171717;] sm:[-webkit-text-stroke:5px_#0369a1;] sm:[text-shadow:-10px_10px_#171717;]"
					>
						<span>{scorePercent}%</span>
					</h1>
					<span
						class="font-pokemon text-yellow-400 text-3xl sm:text-[2.5rem] [-webkit-text-stroke:2px_#0369a1;] [text-shadow:-4px_4px_#171717;] sm:[-webkit-text-stroke:2.5px_#0369a1;] sm:[text-shadow:-5px_5px_#171717;]"
					>
						You guess <br />{gameState.numOfRightAnswer} out of {gameState.numOfQuestions}
					</span>
				</div>
			{/if}
		</div>
	{/if}
</section>
