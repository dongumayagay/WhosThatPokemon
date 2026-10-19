<script>
  import { gameState,maxPokemonPerGeneration } from '../state.svelte.js';
  import { pokemonNames } from '../pokemonNames.json';
  import { ACHIEVEMENTS,generationProgress } from '../progression.js';
  import { GYMS } from '../gym-trials.js';
  let currentGen=$state(1);
  let tab=$state('collection');
  const discovered=$derived(new Set(gameState.profile.discovered));
  const progress=$derived(generationProgress(gameState.profile.discovered,maxPokemonPerGeneration));
  const offset=$derived(maxPokemonPerGeneration.slice(0,currentGen-1).reduce((a,b)=>a+b,0));
  const visibleIds=$derived(Array.from({length:maxPokemonPerGeneration[currentGen-1]},(_,i)=>offset+i+1));
  /** @param {KeyboardEvent} e */
  function closeOnEscape(e) { if(e.key==='Escape')gameState.showPokedex=false; }
</script>
<svelte:window onkeydown={closeOnEscape}/>
<div class="overlay-backdrop">
  <section class="game-dialog dex-dialog" role="dialog" aria-modal="true" aria-label="Personal Pokédex">
    <div class="dialog-head">
      <div><p class="eyebrow">YOUR JOURNEY</p><h2>Trainer Pokédex</h2><p class="muted-text">{gameState.profile.discovered.length} / 898 species discovered</p></div>
      <button class="icon-button close-button" onclick={()=>gameState.showPokedex=false} aria-label="Close Pokédex">✕</button>
    </div>
    <div class="dex-tabs" role="group" aria-label="Pokédex sections">
      <button class:active={tab==='collection'} onclick={()=>tab='collection'}>Collection</button>
      <button class:active={tab==='badges'} onclick={()=>tab='badges'}>Badges ({gameState.profile.badges.length}/8)</button>
      <button class:active={tab==='achievements'} onclick={()=>tab='achievements'}>Awards ({gameState.profile.achievements.length})</button>
    </div>
    {#if tab==='collection'}
      <div class="generation-pills" role="group" aria-label="Pokémon generation">
        {#each progress as g}
          <button class:active={currentGen===g.generation} onclick={()=>currentGen=g.generation} aria-pressed={currentGen===g.generation}>Gen {g.generation}<small>{g.found}/{g.total}</small></button>
        {/each}
      </div>
      <div class="progress-row"><span>Generation {currentGen}</span><span>{progress[currentGen-1].found} / {progress[currentGen-1].total}</span></div>
      <div class="progress-track"><div style:width={(progress[currentGen-1].found/progress[currentGen-1].total*100)+'%'}></div></div>
      <div class="dex-grid">
        {#each visibleIds as id}
          <article class="dex-mon" class:found={discovered.has(id)} aria-label={discovered.has(id)?'Discovered '+pokemonNames[id-1]:'Undiscovered Pokémon '+id}>
            {#if discovered.has(id)}
              <img loading="lazy" src={'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+id+'.png'} alt="" />
            {:else}
              <span class="locked-mon" aria-hidden="true">?</span>
            {/if}
            <span class="dex-number">#{String(id).padStart(3,'0')}</span>
            <strong>{discovered.has(id)?pokemonNames[id-1]:'Unknown'}</strong>
          </article>
        {/each}
      </div>
    {:else if tab==='badges'}
      <p class="muted-text">Earn a Gym Badge by identifying at least four of five Pokémon in a Gym Trial.</p>
      <div class="achievement-grid">
        {#each GYMS as gym}
          <div class="achievement" class:earned={gameState.profile.badges.includes(gym.id)}>
            <span class="achievement-icon" aria-hidden="true">{gym.icon}</span><div><strong>{gym.name}</strong><small>{gameState.profile.badges.includes(gym.id)?'Badge earned':'Not yet earned'}</small></div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="muted-text">Your progress is personal. Each award unlocks once.</p>
      <div class="achievement-grid">
        {#each ACHIEVEMENTS as achievement}
          <div class="achievement" class:earned={gameState.profile.achievements.includes(achievement.id)}>
            <span class="achievement-icon" aria-hidden="true">{achievement.icon}</span><div><strong>{achievement.name}</strong><small>{achievement.detail}</small></div>
          </div>
        {/each}
      </div>
    {/if}
    <p class="setting-note">Progress is stored in this browser only. Clearing site data also clears your Pokédex.</p>
  </section>
</div>
