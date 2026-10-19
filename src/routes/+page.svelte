<script>
  import { onMount } from 'svelte';
  import { loadGamePreferences } from '$lib/pokemon.svelte.js';
  import { gameState } from '$lib/state.svelte.js';
  import Header from '$lib/components/Header.svelte';
  import Control from '$lib/components/Control.svelte';
  import PokemonImage from '$lib/components/PokemonImage.svelte';
  import SelectGenerations from '$lib/components/SelectGenerations.svelte';
  import ProfessorOak from '$lib/components/ProfessorOak.svelte';
  import Pokedex from '$lib/components/Pokedex.svelte';
  import GameSettings from '$lib/components/GameSettings.svelte';
  onMount(loadGamePreferences);
</script>
<svelte:head>
  <title>Who's That Pokémon? | Classic Silhouette Quiz</title>
  <meta name="description" content="The classic anime-inspired Who’s That Pokémon? silhouette quiz: guess mysteries, conquer Gym Trials, play Daily Dex and collect your Pokédex." />
</svelte:head>
<div class="site-shell" data-visual="classic-eyecatch" data-motion={gameState.animationEnabled?'on':'off'}>
  <div class="site-topbar"><div class="site-identity"><span class="identity-ball" aria-hidden="true">◓</span><strong>WTP <span>CLASSIC</span></strong></div>
    <nav class="top-actions" aria-label="Game features">
      <button onclick={()=>gameState.showPokedex=true} aria-label="Open personal Pokédex">◫ <span>Pokédex</span></button>
      <button onclick={()=>gameState.showSettings=true} aria-label="Open game settings">⚙ <span>Settings</span></button>
      <button onclick={()=>gameState.showProfessorOak=true} aria-label="Ask Professor Oak">? <span>Prof. Oak</span></button>
    </nav>
  </div>
  <main class="arcade-main">
    <Header/>
    <div class="play-layout">
      <div class="stage-column">
        <PokemonImage/>
        <p class="broadcast-strip" aria-hidden="true">{gameState.pokemon ? gameState.hidePokemon ? '✦ LOOK CLOSELY · MAKE YOUR GUESS ✦' : '✦ THE MYSTERY IS REVEALED! ✦' : '✦ THE CLASSIC SILHOUETTE CHALLENGE ✦'}</p>
      </div>
      <div class="control-zone"><Control/></div>
    </div>
  </main>
  <footer class="game-footer">CLASSIC MYSTERY, MODERN PLAY · UNOFFICIAL FAN GAME · NOT AFFILIATED WITH THE POKÉMON COMPANY</footer>
  {#if gameState.showSelectGenerations}<SelectGenerations/>{/if}
  {#if gameState.showProfessorOak}<ProfessorOak/>{/if}
  {#if gameState.showPokedex}<Pokedex/>{/if}
  {#if gameState.showSettings}<GameSettings/>{/if}
</div>
