<script>
  import { gameState } from '../state.svelte.js';
  import { cropPokemonSprite, getPokemonVisualUrls } from '../sprite-frame.js';

  let imageStatus = $state('idle');
  let retryKey = $state(0);
  let displaySpriteUrl = $state(/** @type {string | null} */(null));
  const visualUrls = $derived(getPokemonVisualUrls(gameState.pokemonId));

  // Preload high-resolution art first; never consume a guess while loading.
  // Use the legacy sprite when official artwork is temporarily unavailable.
  $effect(() => {
    const sources = visualUrls;
    retryKey;
    gameState.spriteReady = false;
    displaySpriteUrl = null;
    if (!sources.length) { imageStatus = 'idle'; return; }

    imageStatus = 'loading';
    let active = true;

    /** @param {number} index */
    function loadSource(index) {
      if (!active) return;
      if (index >= sources.length) {
        imageStatus = 'error';
        gameState.spriteReady = false;
        return;
      }
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        if (!active) return;
        displaySpriteUrl = cropPokemonSprite(image) || sources[index];
        imageStatus = 'ready';
        gameState.spriteReady = true;
      };
      image.onerror = () => {
        if (active) loadSource(index + 1);
      };
      image.src = sources[index];
    }

    loadSource(0);
    return () => { active = false; };
  });
</script>

<section class="anime-stage" aria-label="Who's That Pokémon? classic mystery screen"
  data-scene={gameState.pokemon ? (gameState.hidePokemon ? 'mystery' : 'reveal') : 'opening'}>
  <div class="anime-burst" aria-hidden="true"></div>
  <div class="anime-speedlines" aria-hidden="true"></div>
  <div class="anime-grain" aria-hidden="true"></div>
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
          style={'--sprite-mask:url("' + displaySpriteUrl + '");--sprite-fit:' + (displaySpriteUrl?.startsWith('data:') ? 'contain' : '152%')}>
          <div class="mystery-silhouette"></div>
        </div>
        <svg class="anime-question" viewBox="0 0 150 240" aria-hidden="true" focusable="false">
          <path d="M 31 31 Q 79 5 122 31 L 134 51 L 129 119 L 101 130 L 98 152 L 60 152 L 60 109 L 87 95 L 87 60 Q 73 51 56 61 L 56 83 L 19 75 L 19 47 Z"
            fill="#ffd53d" stroke="#0d485b" stroke-width="11" stroke-linejoin="round"/>
          <path d="M 65 178 L 104 175 L 106 215 L 68 218 Z" fill="#ffd53d" stroke="#0d485b" stroke-width="11" stroke-linejoin="round"/>
        </svg>
      {:else}
        <div class="reveal-rings" aria-hidden="true"></div>
        <div class="reveal-flash" aria-hidden="true"></div>
        <img class="revealed-sprite" src={displaySpriteUrl || visualUrls[0]} draggable="false"
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
  <div class="anime-logo" aria-hidden="true">Pokémon</div>
</section>
