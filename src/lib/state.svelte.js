// Svelte 5 runes-based state management

// Constants
export const totalPokemon = 898;
export const maxPokemonPerGeneration = [151, 100, 135, 107, 156, 72, 88, 89];
export const numOfChoices = 3;

// Reactive game state using $state rune
export const gameState = $state({
	pokemonId: 0,
	pokemon: /** @type {{ id: number; name: string } | null} */ (null),
	hidePokemon: true,
	selectedGenerations: /** @type {number[]} */ ([1]),
	showSelectGenerations: false,
	choices: /** @type {string[]} */ ([]),
	numOfQuestions: 0,
	numOfRightAnswer: 0
});

// Reset game function
export function resetGame() {
	gameState.numOfQuestions = 0;
	gameState.numOfRightAnswer = 0;
}
