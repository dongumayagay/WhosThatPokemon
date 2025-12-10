<script>
	import { scale } from 'svelte/transition';
	import { hidePokemon, pokemon, pokemon_id, numOfQuestions, numOfRightAnswer } from '../store';

	function drawSpiky(ctx) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillStyle = '#0284c7';
		ctx.beginPath();
		for (theta = _i = 0, _ref = Math.PI * 2; _i <= _ref; theta = _i += 0.05) {
			radius = Math.random() * canvas.width * 0.3 + canvas.width * 0.25;
			ctx.lineTo(halfWidth + radius * Math.cos(theta), halfHeight + radius * Math.sin(theta));
		}
		ctx.fill();
		ctx.fillStyle = '#e5e5e5';
		ctx.beginPath();
		for (theta = _i = 0, _ref = Math.PI * 2; _i <= _ref; theta = _i += 0.05) {
			radius = Math.random() * canvas.width * 0.2 + canvas.width * 0.25;
			ctx.lineTo(halfWidth + radius * Math.cos(theta), halfHeight + radius * Math.sin(theta));
		}
		ctx.fill();
	}
	let width, height;
	let canvas, ctx, halfWidth, halfHeight, radius, theta, _i, _ref;

	function setupCanvas() {
		canvas.width = width;
		canvas.height = height;
		ctx = canvas.getContext('2d');
		halfWidth = canvas.width / 2;
		halfHeight = canvas.height / 2;
		drawSpiky(ctx);
	}
	$: if (canvas) {
		setupCanvas();
	}
	//official
	// `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${$pokemon.pokemon_id}.png`

	// gif
	// `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${$pokemon.id}.gif`

	// default
	// `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${$pokemon.id}.png`
	let resize = false;
</script>

{#if $pokemon_id}
	<link
		rel="preload"
		as="image"
		href={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${$pokemon_id}.png`}
	/>
{/if}

<svelte:window
	on:resize={() => {
		resize = !resize;
		setupCanvas();
	}}
/>

<section class="container aspect-square sm:aspect-video lg:aspect-[2/1] overflow-hidden">
	{#if $pokemon}
		{#key $pokemon.id}
			<div in:scale={{ delay: 400 }} out:scale class="block h-full relative aspect-square mx-auto">
				{#key resize}
					<div bind:clientWidth={width} bind:clientHeight={height} class="w-full h-full">
						<img
							draggable="false"
							src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${$pokemon.id}.png`}
							style="image-rendering: pixelated;"
							alt="pokemon"
							class="block mx-auto absolute h-full aspect-square transition duration-1000 select-none pointer-events-none"
							class:brightness-0={$hidePokemon}
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
			class="aspect-square h-full  mx-auto flex flex-col justify-center "
		>
			{#if $numOfQuestions === 0}
				<h1
					class=" font-pokemon capitalize text-yellow-400
							text-[250px]
							sm:text-[350px]
							lg:text-[450px]
							[-webkit-text-stroke:5px_#0369a1;]
							[text-shadow:-7px_7px_#171717;]
							sm:[-webkit-text-stroke:7px_#0369a1;]
							sm:[text-shadow:-10px_10px_#171717;]
      						lg:[-webkit-text-stroke:9px_#0369a1;]
							lg:[text-shadow:-12px_12px_#171717;]
							"
				>
					?
				</h1>
			{:else}
				<div class="relative -top-7">
					<h1
						class=" tracking-wider mb-4
								font-pokemon capitalize text-yellow-400
								text-8xl
								sm:text-[150px]
								[-webkit-text-stroke:4px_#0369a1;]
								[text-shadow:-7px_7px_#171717;]
								sm:[-webkit-text-stroke:5px_#0369a1;]
								sm:[text-shadow:-10px_10px_#171717;]
								"
					>
						<span>{Math.floor(($numOfRightAnswer / $numOfQuestions) * 100)}%</span>
					</h1>
					<span
						class=" font-pokemon text-yellow-400
								text-3xl sm:text-[2.5rem]
								[-webkit-text-stroke:2px_#0369a1;]
								[text-shadow:-4px_4px_#171717;]
								sm:[-webkit-text-stroke:2.5px_#0369a1;]
								sm:[text-shadow:-5px_5px_#171717;]
								"
					>
						You guess <br />{$numOfRightAnswer} out of {$numOfQuestions}</span
					>
				</div>
			{/if}
		</div>
	{/if}
</section>
