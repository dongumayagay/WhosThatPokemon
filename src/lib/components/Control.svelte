<script>
  import { gameState } from '../state.svelte.js';
  import { GYMS, getGym, GYM_LENGTH } from '../gym-trials.js';
  import { ACHIEVEMENTS } from '../progression.js';
  import { CHALLENGE_LENGTH, DAILY_LENGTH } from '../game-rules.js';
  import { formatDailyShare, getUtcDateKey, getTrainerRank } from '../daily-challenge.js';
  import { startGame, startGym, answerPokemon, nextRound, endGame, useHint, setDifficulty } from '../pokemon.svelte.js';
  import { playResultTone } from '../sound.js';

  const correctGuess=$derived(!gameState.hidePokemon&&gameState.lastAnswer===gameState.pokemon?.name);
  const dailyFinished=$derived(gameState.dailyStatus?.date===getUtcDateKey()&&gameState.dailyStatus?.completed);
  const totalRounds=$derived(gameState.mode==='daily'?DAILY_LENGTH:gameState.mode==='gym'?GYM_LENGTH:gameState.mode==='challenge'?CHALLENGE_LENGTH:0);
  const currentGym=$derived(getGym(gameState.gymId));
  const newlyEarned=$derived(gameState.newAwards.map(id=>id.startsWith('badge:')?getGym(id.slice(6))?.name+' badge':ACHIEVEMENTS.find(a=>a.id===id)?.name).filter(Boolean));
  let showGyms=$state(false);
  let shareStatus=$state('');
  let copyResult=$state('');

  /** @param {string} choice */
  function guess(choice) {
    const before=gameState.hidePokemon;
    answerPokemon(choice);
    if(before&&!gameState.hidePokemon&&gameState.soundEnabled)playResultTone(choice===gameState.pokemon?.name,gameState.streak);
  }
  /** @param {KeyboardEvent} event */
  function shortcuts(event) {
    if(gameState.showSelectGenerations||gameState.showProfessorOak||gameState.showPokedex||gameState.showSettings||event.repeat||event.altKey||event.ctrlKey||event.metaKey)return;
    const target=event.target;
    if(target instanceof HTMLElement&&(target.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(target.tagName)))return;
    if(gameState.pokemon&&gameState.hidePokemon&&/^[1-4]$/.test(event.key)){
      const choice=gameState.choices[Number(event.key)-1];
      if(choice)guess(choice);
    } else if(gameState.pokemon&&!gameState.hidePokemon&&event.key==='Enter') {
      if(target instanceof HTMLElement&&target.tagName==='BUTTON')return;
      event.preventDefault();nextRound();
    }
  }
  /** @param {'classic'|'daily'|'challenge'} mode */
  function begin(mode) {shareStatus='';copyResult='';startGame(mode);}
  /** @param {string} id */
  function beginGym(id) {shareStatus='';copyResult='';startGym(id);}
  async function shareDaily() {
    const result=gameState.dailyStatus;
    if(!result?.completed)return;
    const content=formatDailyShare(result.date,result,'https://whos-that-pokemon-7iu.pages.dev');
    shareStatus='';copyResult='';
    try {
      if(navigator.share) {await navigator.share({title:'Daily Dex results',text:content});shareStatus='Result shared!';}
      else if(navigator.clipboard?.writeText) {await navigator.clipboard.writeText(content);shareStatus='Copied! Share your score with friends.';}
      else {copyResult=content;shareStatus='Copy your result below.';}
    } catch(e) {
      if(e instanceof Error&&e.name==='AbortError')return;
      copyResult=content;shareStatus='Copy your result below.';
    }
  }
</script>
<svelte:window onkeydown={shortcuts}/>

{#if gameState.pokemon}
  <section class="round-dashboard" aria-label="Current round statistics">
    <div class="stat"><span class="stat-label">MODE</span><strong>{gameState.mode==='gym'?currentGym?.name:gameState.mode==='daily'?'DAILY DEX':gameState.mode==='challenge'?'10-ROUND CHALLENGE':'FREE PLAY'}</strong></div>
    <div class="stat"><span class="stat-label">ROUND</span><strong>{totalRounds?(gameState.numOfQuestions+(gameState.hidePokemon?1:0))+'/'+totalRounds:'ENDLESS'}</strong></div>
    <div class="stat"><span class="stat-label">SCORE</span><strong>{gameState.points}</strong></div>
    <div class="stat"><span class="stat-label">COMBO</span><strong>{gameState.streak} <span aria-hidden="true">⚡</span></strong></div>
  </section>
  {#if totalRounds}
    <div class="run-progress" role="progressbar" aria-label="Challenge progress" aria-valuenow={gameState.numOfQuestions} aria-valuemin="0" aria-valuemax={totalRounds}><div style:width={(100*gameState.numOfQuestions/totalRounds)+'%'}></div></div>
  {/if}
  <div class="answer-heading"><div><p class="eyebrow">MAKE YOUR GUESS</p><h2>Who is this Pokémon?</h2></div>{#if gameState.hidePokemon}<span class="answer-help">{gameState.choices.length} possible answers</span>{/if}</div>
  <div class="answers-grid" role="group" aria-label="Choose the Pokémon">
    {#each gameState.choices as choice,i}
      <button
        class="answer-option" class:correct={!gameState.hidePokemon&&choice===gameState.pokemon.name}
        class:incorrect={!gameState.hidePokemon&&choice===gameState.lastAnswer&&!correctGuess}
        class:eliminated={gameState.eliminatedChoices.includes(choice)&&gameState.hidePokemon}
        onclick={()=>guess(choice)} disabled={!gameState.spriteReady||!gameState.hidePokemon||gameState.eliminatedChoices.includes(choice)}
        aria-keyshortcuts={String(i+1)} aria-label={'Answer '+(i+1)+': '+choice}>
        <span class="option-index">{i+1}</span><span class="option-name">{choice}</span>
        {#if !gameState.hidePokemon&&choice===gameState.pokemon.name}<span class="option-mark" aria-hidden="true">✓</span>{:else if !gameState.hidePokemon&&choice===gameState.lastAnswer&&!correctGuess}<span class="option-mark" aria-hidden="true">✕</span>{/if}
      </button>
    {/each}
  </div>
  {#if gameState.hidePokemon}
    <div class="game-actions">
      <button class="secondary-button hint-button" onclick={useHint} disabled={!gameState.spriteReady||gameState.hintUsed}>{gameState.hintUsed?'Hint used':'✦ 50/50 Hint'} <small>{gameState.hintUsed?'':'Half points'}</small></button>
      <button class="text-button" onclick={endGame}>{gameState.mode==='daily'?'Save & exit':'End run'} →</button>
    </div>
  {:else}
    <div class="answer-feedback" class:was-correct={correctGuess} role="status" aria-live="polite">
      <span class="feedback-symbol" aria-hidden="true">{correctGuess?'✓':'✕'}</span>
      <div><strong>{correctGuess?'Excellent catch!':'Mystery solved!'}</strong><p>{correctGuess?'+'+gameState.lastPoints+' points'+(gameState.streak>=3?' · '+gameState.streak+'-answer combo!':''):'It was '+gameState.pokemon.name+'. You’ll get the next one!'}</p></div>
    </div>
    {#if newlyEarned.length}
      <div class="award-toast" role="status">✦ Unlocked: {newlyEarned.join(', ')}!</div>
    {/if}
    <button class="primary-button next-button" onclick={nextRound}>{gameState.completed?'See your results':'Next mystery'} <span aria-hidden="true">→</span></button>
  {/if}
  <p class="keyboard-help">{gameState.hidePokemon?'PRESS 1–'+gameState.choices.length+' TO GUESS':'PRESS ENTER TO CONTINUE'}</p>
{:else}
  {#if gameState.numOfQuestions>0||gameState.completed}
    <section class="run-results">
      <p class="eyebrow">ROUND COMPLETE</p>
      <h2>{gameState.mode==='daily'?'Daily Dex complete!':gameState.mode==='gym'?(gameState.numOfRightAnswer>=4?'Gym badge earned!':'Gym trial complete!'):gameState.completed?'Challenge complete!':'Nice run, Trainer!'}</h2>
      <p class="result-rank">{gameState.mode==='daily'?getTrainerRank(gameState.numOfRightAnswer,DAILY_LENGTH):gameState.mode==='gym'?currentGym?.name:'Keep building your Pokédex'}</p>
      <div class="result-numbers"><div><strong>{gameState.points}</strong><span>POINTS</span></div><div><strong>{gameState.numOfRightAnswer}/{gameState.numOfQuestions}</strong><span>ACCURACY</span></div><div><strong>{gameState.bestStreak}</strong><span>BEST COMBO</span></div></div>
      {#if gameState.mode==='daily'}
        <p class="daily-grid" aria-label="Your five daily results">{gameState.dailyStatus?.marks.join('')??''}</p>
        <button class="primary-button share-button" onclick={shareDaily}>↗ Share daily score</button>
      {:else if gameState.mode==='gym'}
        <p class="muted-text">{gameState.numOfRightAnswer>=4?'You earned the '+currentGym?.name+' emblem!':'Get at least four right to earn the badge. Try again!'}</p>
      {:else if gameState.mode==='challenge'}
        <p class="muted-text">Personal best: {gameState.bestChallengeScore} points</p>
      {/if}
      {#if newlyEarned.length}<div class="award-toast">✦ New achievement: {newlyEarned.join(', ')}</div>{/if}
      <button class="secondary-button" onclick={()=>{gameState.showPokedex=true;}}>View my Pokédex →</button>
    </section>
  {:else}
    <div class="home-intro"><p class="eyebrow">THE ULTIMATE SILHOUETTE CHALLENGE</p><h2>Think you know every Pokémon?</h2><p>Guess the shadow. Build your streak. Become a Pokédex legend.</p></div>
  {/if}
  <section class="mode-area" aria-label="Choose a game mode">
    <button class="daily-card" onclick={()=>begin('daily')} disabled={dailyFinished}>
      <span class="daily-orb" aria-hidden="true">✦</span><span class="daily-copy"><span class="eyebrow">A FRESH PUZZLE EVERY DAY</span><strong>Daily Dex</strong><small>{dailyFinished?'Completed today · Come back tomorrow':gameState.dailyStatus?.guesses.length?'Continue '+gameState.dailyStatus.guesses.length+'/5 questions':'5 worldwide mysteries · Same puzzle for everyone'}</small></span><span class="daily-arrow" aria-hidden="true">{dailyFinished?'✓':'→'}</span>
    </button>
    {#if dailyFinished}<button class="secondary-button share-home" onclick={shareDaily}>↗ Share today’s result</button>{/if}
    <div class="game-mode-grid">
      <button class="mode-card free-card" onclick={()=>begin('classic')}><span class="mode-icon" aria-hidden="true">∞</span><span><strong>Free Play</strong><small>Infinite mysteries, zero pressure</small></span><span class="mode-arrow" aria-hidden="true">↗</span></button>
      <button class="mode-card challenge-card" onclick={()=>begin('challenge')}><span class="mode-icon" aria-hidden="true">★</span><span><strong>10-Round Challenge</strong><small>Chase your personal best</small></span><span class="mode-arrow" aria-hidden="true">↗</span></button>
    </div>
    <div class="difficulty-panel"><div><strong>Choose your difficulty</strong><small>{gameState.difficulty==='easy'?'3 choices · contrasting silhouettes':gameState.difficulty==='normal'?'4 choices · moderately similar shapes':'4 choices · closest-looking shapes'} · Daily Dex is fixed</small></div><div class="difficulty-segments" role="group" aria-label="Difficulty">
      {#each ['easy','normal','expert'] as level}
        <button class:active={gameState.difficulty===level} onclick={()=>setDifficulty(/** @type {'easy'|'normal'|'expert'} */(level))} aria-pressed={gameState.difficulty===level}>{level}</button>
      {/each}
    </div></div>
    <button class="generation-select" onclick={()=>gameState.showSelectGenerations=true}>◈ Generations {gameState.selectedGenerations.join(', ')} <span>Edit →</span></button>
    <div class="gym-heading"><div><p class="eyebrow">PROVE YOUR KNOWLEDGE</p><h3>Gym Trials <span>{gameState.profile.badges.length}/8 Badges</span></h3></div><button class="text-button" onclick={()=>showGyms=!showGyms} aria-expanded={showGyms}>{showGyms?'Collapse':'Explore Gyms'} ↗</button></div>
    {#if showGyms}
      <div class="gym-grid">
        {#each GYMS as gym}
          <button class="gym-card" onclick={()=>beginGym(gym.id)} aria-label={'Play '+gym.name}>
            <span class="gym-icon" aria-hidden="true">{gym.icon}</span><strong>{gym.name}</strong><small>{gym.description}</small>{#if gameState.profile.badges.includes(gym.id)}<span class="gym-badge">✓ BADGE EARNED</span>{:else}<span class="gym-badge dim">5 MYSTERIES · 4 TO PASS</span>{/if}
          </button>
        {/each}
      </div>
    {/if}
    <button class="collection-banner" onclick={()=>gameState.showPokedex=true}><span aria-hidden="true">◉</span><span><strong>My Pokédex</strong><small>{gameState.profile.discovered.length} / 898 species discovered · View awards</small></span><span aria-hidden="true">→</span></button>
  </section>
{/if}
{#if shareStatus}<div class="share-status" role="status">{shareStatus}{#if copyResult}<textarea rows="5" readonly aria-label="Copyable Daily Dex result">{copyResult}</textarea>{/if}</div>{/if}
