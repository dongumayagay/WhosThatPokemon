<script>
  import { gameState } from '../state.svelte.js';
  import Header from './Header.svelte';

  let imageStatus = $state('idle');
  let retryKey = $state(0);
  const spriteUrl = $derived(gameState.pokemonId
    ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + gameState.pokemonId + '.png'
    : null);

  // A sprite is preloaded before any guesses are enabled. The color image is
  // inserted into the DOM only after an answer is committed.
  $effect(() => {
    const src = spriteUrl;
    retryKey;
    gameState.spriteReady = false;
    if (!src) { imageStatus = 'idle'; return; }

    imageStatus = 'loading';
    let active = true;
    const image = new Image();
    image.onload = () => {
      if (active) { imageStatus = 'ready'; gameState.spriteReady = true; }
    };
    image.onerror = () => {
      if (active) { imageStatus = 'error'; gameState.spriteReady = false; }
    };
    image.src = src;
    return () => { active = false; };
  });
</script>

<section class="anime-stage" aria-label="Who's That Pokémon? classic mystery screen"
  data-scene={gameState.pokemon ? (gameState.hidePokemon ? 'mystery' : 'reveal') : 'opening'}>
  <div class="anime-speedlines" aria-hidden="true"></div>
  <div class="anime-grain" aria-hidden="true"></div>
  <svg class="anime-burst" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
    <polygon class="anime-burst-outline" points="400.0,21.0 444.1,127.1 531.7,39.3 527.0,150.8 647.5,91.9 594.7,195.5 733.4,172.5 638.8,255.6 779.2,271.4 654.1,324.0 779.2,376.6 638.8,392.4 733.4,475.5 594.7,452.5 647.5,556.1 527.1,497.2 531.7,608.7 444.1,520.9 400.0,627.0 355.9,520.9 268.3,608.7 272.9,497.2 152.5,556.1 205.3,452.5 66.6,475.5 161.2,392.4 20.8,376.6 145.9,324.0 20.8,271.4 161.2,255.6 66.6,172.5 205.3,195.5 152.5,91.9 273.0,150.8 268.3,39.3 355.9,127.1" />
    <polygon class="anime-burst-center" points="400.0,54.0 441.7,143.2 520.7,70.3 520.0,165.0 626.9,117.2 583.9,206.0 705.7,189.0 625.6,261.2 747.6,277.1 640.0,324.0 747.6,370.9 625.6,386.8 705.7,459.0 583.9,442.0 626.9,530.8 520.0,483.0 520.7,577.7 441.7,504.8 400.0,594.0 358.3,504.8 279.3,577.7 280.0,483.0 173.1,530.8 216.1,442.0 94.3,459.0 174.4,386.8 52.4,370.9 160.0,324.0 52.4,277.1 174.4,261.2 94.3,189.0 216.1,206.0 173.1,117.2 280.0,165.0 279.3,70.3 358.3,143.2" />
  </svg>
  <Header />

  {#if gameState.pokemon}
    {#if imageStatus === 'loading'}
      <p class="anime-loading" role="status">Getting the silhouette ready…</p>
    {:else if imageStatus === 'error'}
      <div class="anime-error" role="alert">
        <p>Can't load this silhouette.</p>
        <button class="anime-retry" onclick={() => retryKey++}>Retry image</button>
        <small>No answer has been counted.</small>
      </div>
    {:else if imageStatus === 'ready'}
      {#if gameState.hidePokemon}
        <div class="silhouette-holder" role="img" aria-label="Mystery Pokémon silhouette"
          style={'--sprite-mask:url("' + spriteUrl + '")'}>
          <div class="mystery-silhouette"></div>
        </div>
        <span class="anime-question" aria-hidden="true">?</span>
      {:else}
        <div class="reveal-rings" aria-hidden="true"></div>
        <div class="reveal-flash" aria-hidden="true"></div>
        <img class="revealed-sprite" src={spriteUrl} draggable="false"
          alt={'Revealed Pokémon: ' + gameState.pokemon.name} />
        <div class="anime-answer" role="status" aria-live="polite">
          <span>IT'S</span>
          <strong>{gameState.pokemon.name}!</strong>
        </div>
      {/if}
    {/if}
  {:else if gameState.numOfQuestions > 0}
    <div class="anime-end-scene" role="status">
      <span aria-hidden="true">★</span>
      <p>GREAT RUN!</p>
    </div>
  {:else}
    <span class="anime-opening-question" aria-hidden="true">?</span>
  {/if}
</section>
