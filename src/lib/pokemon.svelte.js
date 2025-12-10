import { pokemonNames } from './pokemonNames.json';
import { gameState, maxPokemonPerGeneration, totalPokemon } from './state.svelte.js';

export function getRandomPokemon() {
	gameState.hidePokemon = true;
	const randomId = gameState.pokemonId;
	const names = getNames(randomId);
	gameState.pokemon = { id: randomId, name: names[0] };
	gameState.choices = shuffleChoices(names);
}

function getName(id) {
	return pokemonNames[id - 1];
}

function selectRandomGeneration() {
	const items = gameState.selectedGenerations;
	if (items.length === 0) {
		gameState.selectedGenerations = [1];
	}
	const item = items[Math.floor(Math.random() * items.length)];
	return item - 1;
}

export function selectRandomPokemonIdFromGen() {
	const randomGeneration = selectRandomGeneration();
	const maxId = maxPokemonPerGeneration[randomGeneration];
	const ranIdInGeneration = Math.floor(Math.random() * maxId) + 1;
	const id = ranIdInGeneration + getOffset(randomGeneration);
	gameState.pokemonId = id;
}

function getRandomPokemonId() {
	return Math.floor(Math.random() * totalPokemon) + 1;
}

function getOffset(index) {
	let offset = 0;
	for (let i = 0; i < index; i += 1) {
		offset += maxPokemonPerGeneration[i];
	}
	return offset;
}

function getNames(id) {
	const choiceId = [id, getRandomPokemonId(), getRandomPokemonId()];
	return choiceId.map((tempId) => getName(tempId));
}

function shuffleChoices(names) {
	return [...names].sort(() => 0.5 - Math.random());
}
