<script>
  import { gameState } from '../state.svelte.js';

  let imageStatus = $state('idle');
  let retryKey = $state(0);
  const spriteUrl = $derived(gameState.pokemonId
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${gameState.pokemonId}.png`
    : null);
  const accuracy = $derived(gameState.numOfQuestions
    ? Math.round(gameState.numOfRightAnswer / gameState.numOfQuestions * 100)
    : 0);

  // Preload each target before enabling an answer, without exposing its colored image.
  $effect(() => {
    const url = spriteUrl;
    retryKey;
    gameState.spriteReady = false;
    if (!url) { imageStatus = 'idle'; return; }
    imageStatus = 'loading';
    let active = true;
    const image = new Image();
    image.onload = () => {
      if (active) { imageStatus = 'ready'; gameState.spriteReady = true; }
    };
    image.onerror = () => {
      if (active) { imageStatus = 'error'; gameState.spriteReady = false; }
    };
    image.src = url;
    return () => { active = false; };
  });
</script>

<section
  class="sprite-arena"
  class:result-arena={!gameState.pokemon}
  aria-label={gameState.pokemon ? 'Who is that Pokémon? Mystery screen' : 'Classic Pokémon mystery screen'}
>
  <div class="classic-speedlines" aria-hidden="true"></div>
  <div class="classic-burst" aria-hidden="true"></div>
  <div class="classic-burst-inner" aria-hidden="true"></div>
  <div class="classic-halftone" aria-hidden="true"></div>

  {#if gameState.pokemon}
    {#if imageStatus==='loading'}
      <div class="image-message" role="status">
        <div class="loading-orb" aria-hidden="true">?</div>
        <p>Getting the silhouette ready...</p>
      </div>
    {:else if imageStatus==='error'}
      <div class="image-message" role="alert">
        <div class="loading-orb" aria-hidden="true">!</div>
        <p>This Pokémon's image couldn't load.</p>
        <button class="btn-action" onclick={() => retryKey++}>Retry image</button>
        <p class="muted-text">No guess or points have been counted.</p>
      </div>
    {:else if imageStatus==='ready'}
      {#if gameState.hidePokemon}
        <div
          class="silhouette-holder"
          role="img"
          aria-label="Mystery Pokémon silhouette"
          style={'--sprite-mask:url("'+spriteUrl+'")'}
        >
          <div class="mystery-silhouette"></div>
        </div>
        <div class="mystery-mark" aria-hidden="true">?</div>
        <span class="mystery-tag">MAKE YOUR GUESS!</span>
      {:else}
        <div class="reveal-rings" aria-hidden="true"></div>
        <div class="reveal-flash" aria-hidden="true"></div>
        <img
          class="revealed-sprite"
          class:no-animation={!gameState.animationEnabled}
          draggable="false"
          oncontextmenu={(event) => event.preventDefault()}
          src={spriteUrl}
          alt={'Revealed Pokémon: '+gameState.pokemon.name}
        />
        <div class="reveal-callout" role="status" aria-live="polite">
          <span>It's</span>
          <strong>{gameState.pokemon.name}!</strong>
        </div>
      {/if}
    {/if}
  {:else if gameState.numOfQuestions>0}
    <div class="arena-result">
      <div class="results-emblem" aria-hidden="true">★</div>
      <span class="result-percent">{accuracy}%</span>
      <span class="arena-secondary">CORRECT GUESSES</span>
      <span class="arena-secondary">{gameState.numOfRightAnswer} out of {gameState.numOfQuestions}</span>
    </div>
  {:else}
    <div class="arena-intro">
      <div class="intro-orb" aria-hidden="true"><span>?</span></div>
      <p class="arena-secondary">THE CLASSIC SILHOUETTE CHALLENGE</p>
    </div>
  {/if}
</section>

<style>
  .sprite-arena {
    --classic-blue: #154792;
    position: relative;
    isolation: isolate;
    display: grid;
    place-items: center;
    width: min(100%, 640px);
    height: clamp(245px, 41dvh, 392px);
    min-height: 245px;
    margin: 0 auto;
    overflow: hidden;
    border: 6px solid #16418e;
    border-radius: 19px;
    background: #f15a29;
    box-shadow: 0 9px 0 #112e69, 0 18px 32px #68171961, inset 0 0 0 3px #fff7cb;
    -webkit-touch-callout: none;
  }
  .classic-speedlines {
    position: absolute;
    inset: -20%;
    background: repeating-conic-gradient(
      from -12deg at 49% 51%,
      #de2725 0deg 10deg,
      #fc642d 10deg 20deg,
      #f5a332 20deg 24deg,
      #e63b26 24deg 36deg
    );
    transform: scale(1.12);
  }
  .classic-burst, .classic-burst-inner {
    position: absolute;
    inset: -8% 7%;
    clip-path: polygon(
      50% 0%, 57% 29%, 70% 3%, 67% 34%, 88% 12%, 77% 41%,
      100% 31%, 78% 50%, 100% 59%, 76% 61%, 91% 83%, 67% 70%,
      70% 100%, 54% 74%, 50% 100%, 43% 74%, 29% 100%, 33% 70%,
      8% 84%, 23% 61%, 0% 57%, 23% 48%, 1% 29%, 28% 39%,
      14% 11%, 38% 35%, 31% 3%, 45% 30%
    );
  }
  .classic-burst {
    background: #0099cf;
    filter: drop-shadow(0 2px 0 #16509c);
  }
  .classic-burst-inner {
    background: radial-gradient(ellipse at 43% 50%, #fff 0%, #faffff 38%, #a5eaff 100%);
    transform: scale(.875);
  }
  .classic-halftone {
    position: absolute;
    inset: 0;
    background: radial-gradient(#092f6830 1.2px, transparent 1.3px) 0 0 / 11px 11px;
    opacity: .36;
    pointer-events: none;
  }
  .silhouette-holder {
    position: absolute;
    inset: 14% 37% 13% 6%;
    z-index: 2;
    display: grid;
    place-items: center;
    filter: drop-shadow(4px 7px 0 #152e5b20);
    animation: silhouette-enter .38s cubic-bezier(.2,.7,.2,1) both;
  }
  .mystery-silhouette {
    width: 100%;
    height: 100%;
    background: #10172d;
    mask-image: var(--sprite-mask);
    -webkit-mask-image: var(--sprite-mask);
    mask-size: contain;
    -webkit-mask-size: contain;
    mask-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
    mask-position: center;
    -webkit-mask-position: center;
    pointer-events: none;
    -webkit-touch-callout: none;
    user-select: none;
  }
  .mystery-mark {
    position: absolute;
    z-index: 2;
    right: 10%;
    top: 42%;
    transform: translateY(-50%) rotate(-9deg);
    color: #ffdf3b;
    font-family: 'pokemon', sans-serif;
    font-size: clamp(84px, 17vw, 156px);
    line-height: 1;
    -webkit-text-stroke: 5px #174899;
    paint-order: stroke fill;
    text-shadow: 6px 8px 0 #112e6e, 9px 12px 0 #ffffffa6;
    user-select: none;
    pointer-events: none;
  }
  .mystery-tag {
    position: absolute;
    z-index: 3;
    bottom: 5%;
    right: 7%;
    display: block;
    padding: 6px 11px;
    border: 3px solid #103778;
    border-radius: 8px;
    background: #ffdf4d;
    color: #163b83;
    transform: rotate(-3deg);
    font-size: clamp(10px, 1.8vw, 15px);
    font-weight: 1000;
    letter-spacing: .09em;
    box-shadow: 3px 4px 0 #103778;
  }
  .revealed-sprite {
    position: absolute;
    left: 5%;
    top: 12%;
    z-index: 3;
    width: 56%;
    height: 74%;
    object-fit: contain;
    image-rendering: pixelated;
    filter: drop-shadow(3px 5px 0 #22508355);
    animation: classic-reveal .5s cubic-bezier(.15,.85,.32,1.3) both;
  }
  .reveal-rings {
    position: absolute;
    left: 8%;
    top: 10%;
    z-index: 1;
    width: 52%;
    height: 75%;
    border: 4px solid #ffe78080;
    border-radius: 50%;
    animation: classic-ring .6s ease-out both;
  }
  .reveal-flash {
    position: absolute;
    inset: 0;
    z-index: 5;
    background: #fff;
    pointer-events: none;
    animation: classic-flash .42s ease-out forwards;
  }
  .reveal-callout {
    position: absolute;
    z-index: 4;
    right: 5%;
    top: 46%;
    width: 40%;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transform: translateY(-50%) rotate(-3deg);
    color: #fff9e6;
    filter: drop-shadow(2px 3px 0 #12346e);
    animation: reveal-words .42s .12s backwards;
  }
  .reveal-callout span {
    display: block;
    font-weight: 1000;
    font-size: clamp(20px, 3vw, 34px);
    text-transform: uppercase;
    color: #163b7c;
    -webkit-text-stroke: 1px #fff;
  }
  .reveal-callout strong {
    display: block;
    width: 100%;
    overflow-wrap: anywhere;
    text-wrap: balance;
    text-transform: capitalize;
    font-family: 'pokemon', system-ui, sans-serif;
    font-weight: 500;
    font-size: clamp(20px, 4vw, 42px);
    line-height: 1.18;
    color: #ffe241;
    -webkit-text-stroke: 2px #174899;
    paint-order: stroke fill;
    text-shadow: 3px 4px 0 #0e3475;
  }
  .image-message,.arena-intro,.arena-result {
    position: relative;
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    max-width: min(94%, 350px);
    text-align: center;
    color: #143a78;
    padding: 14px 18px;
    border: 3px solid #16418e;
    border-radius: 15px;
    background: #fffcf2f2;
    box-shadow: 5px 6px 0 #12336f;
  }
  .image-message p { margin: 0; font-size: 13px; font-weight: 800; }
  .loading-orb,.intro-orb {
    display: grid;
    place-items: center;
    color: #ffde3b;
    background: #fff;
    border: 4px solid #174898;
    border-radius: 50%;
    font-family: 'pokemon', sans-serif;
    box-shadow: 3px 4px 0 #174898;
  }
  .loading-orb { height: 76px; width: 76px; font-size: 48px; }
  .intro-orb { height: clamp(98px,17dvh,130px); width: clamp(98px,17dvh,130px); transform: rotate(-8deg); }
  .intro-orb span { font-size: clamp(74px,11dvh,108px); -webkit-text-stroke: 3px #174898; text-shadow: 3px 5px 0 #16418e; }
  .arena-secondary { font-size: clamp(10px,1.7vw,13px); font-weight: 1000; letter-spacing: .07em; text-align: center; }
  .arena-result { min-width: min(83%,280px); }
  .results-emblem { font-size: 29px; color: #f2b82d; }
  .result-percent { font-weight: 1000; font-size: clamp(44px,9vw,74px); line-height: 1; color: #174898; }
  .muted-text { color: #233e73; font-size: 12px; }
  .btn-action { border: 3px solid #163e83; border-bottom-width: 6px; background: #ffd735; color: #143a78; border-radius: 9px; padding: 9px 16px; min-height: 44px; font-weight: 900; }
  .no-animation { animation: none; }
  @keyframes silhouette-enter {from { opacity: 0; transform: scale(.8); } to { opacity: 1; transform: scale(1); }}
  @keyframes classic-reveal {from {opacity:0;transform:scale(.5) rotate(-9deg);filter:brightness(2.5);}to {opacity:1;transform:scale(1) rotate(0);filter:drop-shadow(3px 5px 0 #22508355);}}
  @keyframes classic-flash {0% { opacity: .82; } 100% { opacity: 0; }}
  @keyframes classic-ring {from {opacity:0;transform:scale(.55);}to {opacity:1;transform:scale(1);}}
  @keyframes reveal-words {from {opacity:0;transform:translateY(-50%) scale(.7) rotate(-7deg);}to {opacity:1;transform:translateY(-50%) scale(1) rotate(-3deg);}}
  :global([data-motion='off']) .silhouette-holder,
  :global([data-motion='off']) .revealed-sprite,
  :global([data-motion='off']) .reveal-callout,
  :global([data-motion='off']) .reveal-rings,
  :global([data-motion='off']) .reveal-flash {animation:none;}
  @media (prefers-reduced-motion:reduce) {
    .silhouette-holder,.revealed-sprite,.reveal-rings,.reveal-flash,.reveal-callout {animation:none!important;}
  }
  @media (max-width: 650px) {
    .sprite-arena {width:100%;height:clamp(220px,36dvh,315px);border-width:5px;border-radius:15px;}
    .mystery-mark {font-size:clamp(85px,24vw,127px);right:9%;-webkit-text-stroke:4px #174899;}
    .mystery-tag {font-size:10px;padding:5px 7px;border-width:2px;}
    .reveal-callout strong {font-size:clamp(21px,5.2vw,30px);}
  }
  @media (max-width: 400px) {
    .sprite-arena {height:clamp(205px,35dvh,260px);min-height:205px;border-width:4px;}
    .mystery-mark {font-size:clamp(80px,23vw,100px);-webkit-text-stroke:3px #174899;}
    .silhouette-holder {inset:16% 36% 15% 4%;}
    .reveal-callout {right:3%;width:42%;}
    .reveal-callout strong {font-size:clamp(20px,5.8vw,27px);-webkit-text-stroke:1.5px #174899;}
    .arena-secondary {letter-spacing:.03em;}
  }
</style>
