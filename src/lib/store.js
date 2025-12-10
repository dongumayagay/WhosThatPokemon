import { writable } from 'svelte/store';

export const totalPokemon = 898;
export const maxPokemonPerGeneration = [151, 100, 135, 107, 156, 72, 88, 89];
export let pokemon_id = writable(0);
export let pokemon = writable();
export let hidePokemon = writable(true);
export let selectedGenerations = writable([1]);
export let showSelectGenerations = writable(false);
export const numOfChoices = 3;
export let choices = writable([]);
export let numOfQuestions = writable(0);
export let numOfRightAnswer = writable(0);

// Professor Oak Chat State
export let showProfessorOak = writable(false);
export let chatMessages = writable([]);
export let isChatLoading = writable(false);
