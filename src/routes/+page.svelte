<script>
  import { onMount } from 'svelte';
  import { loadGamePreferences, startGame } from '$lib/pokemon.svelte.js';
  import { gameState } from '$lib/state.svelte.js';
  import Control from '$lib/components/Control.svelte';
  import PokemonImage from '$lib/components/PokemonImage.svelte';
  import SelectGenerations from '$lib/components/SelectGenerations.svelte';
  import ProfessorOak from '$lib/components/ProfessorOak.svelte';
  import Pokedex from '$lib/components/Pokedex.svelte';
  import GameSettings from '$lib/components/GameSettings.svelte';

  onMount(() => { loadGamePreferences(); startGame('classic'); });
</script>

<svelte:head>
  <title>Who's That Pokémon? | The Classic Silhouette Quiz</title>
  <meta name="description" content="The classic anime-inspired Who's That Pokémon? silhouette quiz. Guess the shape, enjoy the reveal, and play Daily Dex, Gym Trials and more." />
</svelte:head>

<div class="site-shell" data-motion={gameState.animationEnabled ? 'on' : 'off'}>
  <div class="wtp-shell">
    <nav class="wtp-toolbar" aria-label="Game navigation">
      <button class="wtp-menu-button" aria-label="Open game modes and options"
        aria-expanded={gameState.showModes} onclick={() => gameState.showModes = true}>
        <span class="wtp-menu-icon" aria-hidden="true">☰</span> Menu
      </button>
    </nav>
    <main class="wtp-main">
      <PokemonImage />
      <Control />
    </main>
    <footer class="wtp-footer">Unofficial fan project · Not affiliated with The Pokémon Company</footer>
  </div>

  {#if gameState.showSelectGenerations}<SelectGenerations />{/if}
  {#if gameState.showProfessorOak}<ProfessorOak />{/if}
  {#if gameState.showPokedex}<Pokedex />{/if}
  {#if gameState.showSettings}<GameSettings />{/if}
</div>
