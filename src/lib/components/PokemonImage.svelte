<script>
  import { gameState } from '../state.svelte.js';
  let imageStatus=$state('idle');
  let retryKey=$state(0);
  const spriteUrl=$derived(gameState.pokemonId?`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${gameState.pokemonId}.png`:null);
  const accuracy=$derived(gameState.numOfQuestions?Math.round(gameState.numOfRightAnswer/gameState.numOfQuestions*100):0);
  $effect(()=>{
    const src=spriteUrl;
    retryKey;
    gameState.spriteReady=false;
    if(!src){imageStatus='idle';return;}
    imageStatus='loading';
    let active=true;
    const image=new Image();
    image.onload=()=>{if(active){imageStatus='ready';gameState.spriteReady=true;}};
    image.onerror=()=>{if(active){imageStatus='error';gameState.spriteReady=false;}};
    image.src=src;
    return ()=>{active=false;};
  });
</script>
<div class="sprite-arena" class:result-arena={!gameState.pokemon}>
  {#if gameState.pokemon}
    <div class="arena-stars" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></div>
    {#if imageStatus==='loading'}
      <div class="image-message" role="status"><div class="loading-orb" aria-hidden="true">◈</div><p>Summoning your mystery...</p></div>
    {:else if imageStatus==='error'}
      <div class="image-message" role="alert"><div class="loading-orb" aria-hidden="true">!</div><p>Can't load this Pokémon's image.</p><button class="btn-action" onclick={()=>retryKey++}>Retry image</button><p class="muted-text">Your round has not been counted.</p></div>
    {:else if imageStatus==='ready'}
      {#if gameState.hidePokemon}
        <div class="silhouette-holder" role="img" aria-label="Mystery Pokémon silhouette" style={'--sprite-mask:url("'+spriteUrl+'")'}>
          <div class="mystery-silhouette"></div>
        </div>
        <div class="mystery-tag">WHO'S THAT POKÉMON?</div>
      {:else}
        <div class="reveal-rings" aria-hidden="true"></div>
        <img class="revealed-sprite" class:no-animation={!gameState.animationEnabled} draggable="false" src={spriteUrl} alt={'Revealed Pokémon: '+gameState.pokemon.name}/>
        <p class="reveal-name">{gameState.pokemon.name}</p>
      {/if}
    {/if}
  {:else if gameState.numOfQuestions>0}
    <div class="arena-result"><div class="results-emblem" aria-hidden="true">★</div><span class="result-percent">{accuracy}%</span><span class="arena-secondary">ACCURACY</span><span class="arena-secondary">{gameState.numOfRightAnswer} of {gameState.numOfQuestions} correct</span></div>
  {:else}
    <div class="arena-intro"><div class="intro-orb" aria-hidden="true"><span>?</span></div><p class="arena-secondary">A WORLD OF MYSTERY AWAITS</p></div>
  {/if}
</div>
<style>
.sprite-arena { position:relative;display:grid;place-items:center;margin:0 auto;min-height:230px;height:clamp(230px,33dvh,350px);width:min(100%,540px);border:1px solid #4661a2;border-radius:32px;background:radial-gradient(circle at 50% 44%,#2c58a4 0%,#1c326a 45%,#101b3c 85%);box-shadow:inset 0 1px 1px #ffffff3e,0 16px 48px #030b2d55;overflow:hidden; isolation:isolate;}
.sprite-arena::before {content:'';position:absolute;inset:9%;border:1px dashed #ffffff28;border-radius:50%;transform:scaleX(1.23);pointer-events:none;}
.sprite-arena::after {content:'';position:absolute;inset:0;background:repeating-linear-gradient(transparent 0 5px,#04122f08 5px 6px);pointer-events:none;}
.arena-stars {position:absolute;inset:0;pointer-events:none;color:#ffc953a6;font-size:24px;}
.arena-stars span {position:absolute;top:17%;left:20%}.arena-stars span:nth-child(2){top:70%;left:77%;font-size:32px}.arena-stars span:nth-child(3){top:26%;left:81%;font-size:15px}
.silhouette-holder {position:absolute;inset:10% 10% 14%;display:grid;place-items:center;filter:drop-shadow(0 12px 4px #09132966);}
.mystery-silhouette {width:100%;height:100%;background:#061023;mask-image:var(--sprite-mask);-webkit-mask-image:var(--sprite-mask);mask-size:contain;-webkit-mask-size:contain;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;mask-position:center;-webkit-mask-position:center;}
.mystery-tag {position:absolute;bottom:11px;color:#ffe28b;font-size:10px;font-weight:900;letter-spacing:.14em;text-shadow:0 2px 4px #0008;}
.revealed-sprite {z-index:1;width:min(72%,295px);height:min(78%,270px);object-fit:contain;image-rendering:pixelated;filter:drop-shadow(0 0 25px #ffd56599);animation:reveal .46s cubic-bezier(.15,.9,.19,1.2) both;}
.reveal-rings {position:absolute;width:280px;height:280px;border:2px solid #ffe07560;border-radius:100%;box-shadow:0 0 0 33px #ffe07512,0 0 0 64px #ffe0750a;animation:halo .6s ease-out both;}
.reveal-name {position:absolute;bottom:9px;z-index:2;font-weight:900;color:#fff6d5;text-transform:capitalize;font-size:18px;letter-spacing:.035em;text-shadow:0 2px 6px #0009;}
.image-message,.arena-intro,.arena-result {display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;color:#fff;padding:15px;z-index:1;}
.image-message p {font-weight:800;font-size:13px;}
.loading-orb,.intro-orb {display:grid;place-items:center;border:7px solid #fff1bd;border-radius:100%;color:#ffe386;background:#253b78;font-weight:900;box-shadow:0 0 0 6px #061b43;font-size:65px;}
.loading-orb{width:90px;height:90px}.intro-orb{width:155px;height:155px;transform:rotate(-13deg);box-shadow:0 10px 36px #06102a88,0 0 0 8px #12285c}
.intro-orb span{font-family:'pokemon',system-ui;font-size:112px;line-height:1;text-shadow:3px 3px #1d52a2;transform:rotate(13deg);}
.arena-secondary{color:#d4e0ff;letter-spacing:.15em;font-size:11px;font-weight:900;}
.results-emblem{font-size:44px;color:#fdd765}.result-percent{font-size:68px;font-weight:1000;color:white;letter-spacing:-.06em;line-height:1}
.btn-action{background:#f6c84b;color:#142140;padding:10px 22px;border-radius:14px;font-weight:900;min-height:44px;}
.muted-text{font-size:12px;color:#d1def7}
@keyframes reveal {from{opacity:0;transform:scale(.4) rotate(-10deg);filter:brightness(3) drop-shadow(0 0 60px #fdf6d9);}to{opacity:1;transform:scale(1) rotate(0);filter:drop-shadow(0 0 25px #ffd56599);}}
@keyframes halo{from{opacity:0;transform:scale(.25)}to{opacity:1;transform:scale(1)}}
.no-animation{animation:none}
:global([data-motion='off']) .revealed-sprite,:global([data-motion='off']) .reveal-rings{animation:none}
@media (prefers-reduced-motion:reduce){.revealed-sprite,.reveal-rings{animation:none!important}}
@media(max-width:400px){.sprite-arena{height:clamp(212px,30dvh,255px);min-height:212px;border-radius:22px}.intro-orb{width:125px;height:125px}.intro-orb span{font-size:89px}.mystery-tag{font-size:9px}}
</style>
