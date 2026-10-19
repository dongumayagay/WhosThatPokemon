<script>
  import { gameState } from '../state.svelte.js';
</script>
<div class="title-block"><div class="topline"><span class="topline-marker">◈</span> THE TRAINER'S ARCADE <span class="topline-marker">◈</span></div>
  <h1>Who's That <span>Pokémon?</span></h1>
  <p>{gameState.pokemon?'Mystery encounter in progress':gameState.numOfQuestions?'Another mystery awaits':'Every shadow tells a story'}</p>
</div>
