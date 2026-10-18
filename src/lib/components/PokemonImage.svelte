<script>
	import { scale } from 'svelte/transition';
	import { gameState } from '../state.svelte.js';

	/** @param {CanvasRenderingContext2D} ctx */
	function drawSpiky(ctx) {
		const surface = canvas;
		if (!surface) return;
		ctx.clearRect(0, 0, surface.width, surface.height);
		ctx.fillStyle = '#0284c7';
		ctx.beginPath();
		for (let theta = 0; theta <= Math.PI * 2; theta += 0.05) {
			const radius = Math.random() * surface.width * 0.3 + surface.width * 0.25;
			ctx.lineTo(halfWidth + radius * Math.cos(theta), halfHeight + radius * Math.sin(theta));
		}
		ctx.fill();
		ctx.fillStyle = '#e5e5e5';
		ctx.beginPath();
		for (let theta = 0; theta <= Math.PI * 2; theta += 0.05) {
			const radius = Math.random() * surface.width * 0.2 + surface.width * 0.25;
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

<section class="pokemon-stage mx-auto w-full overflow-hidden">
	{#if gameState.pokemon}
		{#key gameState.pokemon.id}
			<div in:scale={{ delay: 250 }} out:scale class="relative mx-auto h-full aspect-square">
				<div bind:clientWidth={width} bind:clientHeight={height} class="relative h-full w-full">
					<canvas bind:this={canvas} aria-hidden="true" class="pointer-events-none absolute inset-0 z-0 h-full w-full"></canvas>
					{#if gameState.hidePokemon}
						<div
							class="pokemon-silhouette absolute inset-0 z-10"
							role="img"
							aria-label="Mystery Pokémon silhouette"
							style={'--pokemon-mask: url("https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+gameState.pokemon.id+'.png")'}
							oncontextmenu={(event) => event.preventDefault()}
						></div>
					{:else}
						<img
							draggable="false"
							src={'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+gameState.pokemon.id+'.png'}
							style="image-rendering: pixelated;"
							alt={'Revealed Pokémon: '+gameState.pokemon.name}
							oncontextmenu={(event) => event.preventDefault()}
							class="pointer-events-none absolute inset-0 z-10 h-full w-full select-none object-contain"
						/>
					{/if}
				</div>
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
					class="font-pokemon capitalize text-yellow-400 text-[clamp(100px,25dvh,195px)] sm:text-[clamp(220px,36dvh,340px)] lg:text-[420px] [-webkit-text-stroke:5px_#0369a1;] [text-shadow:-7px_7px_#171717;] sm:[-webkit-text-stroke:7px_#0369a1;] sm:[text-shadow:-10px_10px_#171717;] lg:[-webkit-text-stroke:9px_#0369a1;] lg:[text-shadow:-12px_12px_#171717;]"
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

<style>
  .pokemon-stage {
    height: clamp(180px, 32dvh, 285px);
    max-width: min(100%, 360px);
    -webkit-touch-callout: none;
    user-select: none;
    touch-action: manipulation;
  }
  .pokemon-silhouette {
    background: #111827;
    -webkit-mask-image: var(--pokemon-mask);
    mask-image: var(--pokemon-mask);
    -webkit-mask-size: contain;
    mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
    -webkit-touch-callout: none;
    user-select: none;
    pointer-events: none;
  }
  @media (min-width: 640px) {
    .pokemon-stage {
      height: clamp(260px, 46dvh, 450px);
      max-width: 700px;
    }
  }
</style>
