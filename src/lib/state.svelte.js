// Svelte 5 runes-based state management
export const totalPokemon = 898;
export const numOfChoices = 3;
export const maxPokemonPerGeneration = [151, 100, 135, 107, 156, 72, 88, 89];

export const gameState = $state({
  pokemonId: 0,
  pokemon: /** @type {{ id: number; name: string } | null} */ (null),
  hidePokemon: true,
  selectedGenerations: /** @type {number[]} */ ([1]),
  showSelectGenerations: false,
  choices: /** @type {string[]} */ ([]),
  mode: /** @type {'classic' | 'challenge' | 'daily' | 'gym'} */ ('classic'),
  numOfQuestions: 0,
  numOfRightAnswer: 0,
  points: 0,
  streak: 0,
  bestStreak: 0,
  lastPoints: 0,
  lastAnswer: /** @type {string | null} */ (null),
  hintUsed: false,
  eliminatedChoice: /** @type {string | null} */ (null),
  eliminatedChoices: /** @type {string[]} */ ([]),
  usedPokemonIds: /** @type {number[]} */ ([]),
  completed: false,
  difficulty: /** @type {'easy'|'normal'|'expert'} */ ('normal'),
  gymId: '',
  gymDeck: /** @type {number[]} */ ([]),
  showPokedex: false,
  showSettings: false,
  soundEnabled: false,
  animationEnabled: true,
  spriteReady: false,
  profile: /** @type {ReturnType<typeof import('./progression.js').sanitizeProfile>} */ ({discovered:[],totalAnswered:0,totalCorrect:0,badges:[],achievements:[]}),
  newAwards: /** @type {string[]} */ ([]),
  bestChallengeScore: 0,
  dailyDate: '',
  dailyDeck: /** @type {Array<{id:number, choices:number[]}>} */ ([]),
  dailyGuesses: /** @type {Array<{choice:string,hintUsed:boolean}>} */ ([]),
  dailyStatus: /** @type {{date:string,guesses:Array<{choice:string,hintUsed:boolean}>,marks:string[],correct:number,streak:number,bestStreak:number,points:number,completed:boolean} | null} */ (null),
  showProfessorOak: false
});

export function resetGame() {
  gameState.pokemon = null;
  gameState.pokemonId = 0;
  gameState.hidePokemon = true;
  gameState.choices = [];
  gameState.usedPokemonIds = [];
  gameState.gymId = '';
  gameState.gymDeck = [];
  gameState.spriteReady = false;
  gameState.newAwards = [];
  gameState.numOfQuestions = 0;
  gameState.numOfRightAnswer = 0;
  gameState.points = 0;
  gameState.streak = 0;
  gameState.bestStreak = 0;
  gameState.lastAnswer = null;
  gameState.lastPoints = 0;
  gameState.hintUsed = false;
  gameState.eliminatedChoice = null;
  gameState.eliminatedChoices = [];
  gameState.completed = false;
  gameState.dailyDate = '';
  gameState.dailyDeck = [];
  gameState.dailyGuesses = [];
}
