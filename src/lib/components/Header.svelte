<script>
  import { gameState } from '../state.svelte.js';
</script>

<header class="title-block">
  <p class="topline"><span class="topline-marker" aria-hidden="true">★</span> A CLASSIC SILHOUETTE MYSTERY <span class="topline-marker" aria-hidden="true">★</span></p>
  <h1>Who's That <span>Pokémon?</span></h1>
  <p>{gameState.pokemon
    ? gameState.hidePokemon ? 'Look closely. Do you recognize the shape?' : 'The mystery is revealed!'
    : gameState.numOfQuestions ? 'Another adventure is just a guess away.' : 'Just like the classic anime break — now you get to guess.'}</p>
</header>
