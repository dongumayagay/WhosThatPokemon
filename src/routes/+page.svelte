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
  <title>Who's That Pokémon? | Trainer Arcade</title>
  <meta name="description" content="Guess Pokémon silhouettes, play Daily Dex, challenge eight Gyms and complete your personal Pokédex." />
</svelte:head>
<div class="site-shell" data-motion={gameState.animationEnabled?'on':'off'}>
  <div class="site-topbar"><div class="site-identity"><span class="identity-ball" aria-hidden="true">◉</span><strong>WTP <span>ARCADE</span></strong></div>
    <nav class="top-actions" aria-label="Game features">
      <button onclick={()=>gameState.showPokedex=true} aria-label="Open personal Pokédex">◫ <span>Pokédex</span></button>
      <button onclick={()=>gameState.showSettings=true} aria-label="Open game settings">⚙ <span>Settings</span></button>
      <button onclick={()=>gameState.showProfessorOak=true} aria-label="Ask Professor Oak">? <span>Prof. Oak</span></button>
    </nav>
  </div>
  <main class="arcade-main"><Header/><PokemonImage/><Control/></main>
  <footer class="game-footer">FAN-MADE POKÉMON TRIVIA · MADE FOR TRAINERS · NOT AFFILIATED WITH THE POKÉMON COMPANY</footer>
  {#if gameState.showSelectGenerations}<SelectGenerations/>{/if}
  {#if gameState.showProfessorOak}<ProfessorOak/>{/if}
  {#if gameState.showPokedex}<Pokedex/>{/if}
  {#if gameState.showSettings}<GameSettings/>{/if}
</div>
