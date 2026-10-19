<script>
  import { gameState } from '../state.svelte.js';
  import { setAnimations,setSound } from '../pokemon.svelte.js';
  /** @param {KeyboardEvent} event */
  function closeWithEscape(event) { if (event.key==='Escape') gameState.showSettings=false; }
</script>
<svelte:window onkeydown={closeWithEscape}/>
<div class="overlay-backdrop">
  <div class="game-dialog settings-dialog" role="dialog" aria-modal="true" aria-label="Game settings">
    <div class="dialog-head">
      <div><p class="eyebrow">PREFERENCES</p><h2>Game settings</h2></div>
      <button class="icon-button close-button" onclick={()=>gameState.showSettings=false} aria-label="Close settings">✕</button>
    </div>
    <p class="muted-text">Your preferences stay on this device. No login needed.</p>
    <button class="setting-row" aria-pressed={gameState.soundEnabled} onclick={()=>setSound(!gameState.soundEnabled)}>
      <span><strong>Arcade sounds</strong><small>Original synthesized feedback tones</small></span><span class="switch" class:enabled={gameState.soundEnabled}>{gameState.soundEnabled?'ON':'OFF'}</span>
    </button>
    <button class="setting-row" aria-pressed={gameState.animationEnabled} onclick={()=>setAnimations(!gameState.animationEnabled)}>
      <span><strong>Reveal animations</strong><small>Reduced motion system setting is always respected</small></span><span class="switch" class:enabled={gameState.animationEnabled}>{gameState.animationEnabled?'ON':'OFF'}</span>
    </button>
    <p class="setting-note">Both settings are optional. The game remains fully playable with either disabled.</p>
  </div>
</div>
