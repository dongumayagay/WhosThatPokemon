<script>
	import { gameState } from '../state.svelte.js';
	import { fade, scale } from 'svelte/transition';

	// Professor Oak sprite
	const oakSprite =
		'https://archives.bulbagarden.net/media/upload/thumb/3/3e/Lets_Go_Pikachu_Eevee_Professor_Oak.png/200px-Lets_Go_Pikachu_Eevee_Professor_Oak.png';

	let inputMessage = $state('');

	// Get the latest response to display
	const currentResponse = $derived(() => {
		const assistantMessages = gameState.chatMessages.filter((m) => m.role === 'assistant');
		return assistantMessages.length > 0
			? assistantMessages[assistantMessages.length - 1].content
			: "Ah, hello there! Welcome to the world of Pokemon! I'm Professor Oak. What would you like to know?";
	});

	async function sendMessage() {
		if (!inputMessage.trim() || gameState.isChatLoading) return;

		const userMessage = inputMessage.trim();
		inputMessage = '';

		gameState.chatMessages = [...gameState.chatMessages, { role: 'user', content: userMessage }];
		gameState.isChatLoading = true;

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: userMessage,
					history: gameState.chatMessages.slice(0, -1)
				})
			});

			const data = await response.json();

			if (response.ok) {
				gameState.chatMessages = [
					...gameState.chatMessages,
					{ role: 'assistant', content: data.message }
				];
			} else {
				gameState.chatMessages = [
					...gameState.chatMessages,
					{
						role: 'assistant',
						content:
							data.error || "Hmm, it seems I'm having trouble thinking right now. Please try again!"
					}
				];
			}
		} catch (error) {
			gameState.chatMessages = [
				...gameState.chatMessages,
				{
					role: 'assistant',
					content:
						"Ah, it seems there's a connection problem. Please check your internet and try again!"
				}
			];
		} finally {
			gameState.isChatLoading = false;
		}
	}

	function handleKeydown(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function closeChat() {
		gameState.showProfessorOak = false;
	}
</script>

<!-- Overlay -->
<div
	class="fixed inset-0 bg-black/70 z-30 flex items-center justify-center p-4"
	transition:fade={{ duration: 200 }}
	onclick={closeChat}
	onkeydown={(e) => e.key === 'Escape' && closeChat()}
	role="button"
	tabindex="0"
>
	<!-- Main Container -->
	<div
		class="relative w-full max-w-md"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
		role="dialog"
		aria-label="Chat with Professor Oak"
		transition:scale={{ duration: 300, start: 0.9 }}
	>
		<!-- Close Button -->
		<button
			class="absolute -top-2 -right-2 z-10 w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-lg border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all shadow-lg outline outline-2 outline-black"
			onclick={closeChat}
			aria-label="Close"
		>
			X
		</button>

		<!-- Speech Bubble -->
		<div class="relative mb-4">
			<div
				class="bg-white rounded-2xl px-5 py-4 shadow-xl border-4 border-neutral-800 min-h-[120px] max-h-[200px] overflow-y-auto"
			>
				{#if gameState.isChatLoading}
					<div class="flex items-center gap-2">
						<span class="text-neutral-600">Thinking</span>
						<span class="flex gap-1">
							<span
								class="w-2 h-2 bg-green-500 rounded-full animate-bounce"
								style="animation-delay: 0s"
							></span>
							<span
								class="w-2 h-2 bg-green-500 rounded-full animate-bounce"
								style="animation-delay: 0.15s"
							></span>
							<span
								class="w-2 h-2 bg-green-500 rounded-full animate-bounce"
								style="animation-delay: 0.3s"
							></span>
						</span>
					</div>
				{:else}
					<p class="text-neutral-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
						{currentResponse()}
					</p>
				{/if}
			</div>

			<!-- Speech bubble tail pointing down to Oak -->
			<div class="absolute -bottom-4 left-1/2 -translate-x-1/2">
				<div
					class="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[20px] border-t-neutral-800"
				></div>
				<div
					class="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-white"
				></div>
			</div>
		</div>

		<!-- Professor Oak Sprite -->
		<div class="flex justify-center mb-4">
			<div class="relative">
				<img
					src={oakSprite}
					alt="Professor Oak"
					class="h-48 sm:h-56 object-contain drop-shadow-2xl"
					style="image-rendering: auto;"
				/>
				<!-- Name plate -->
				<div
					class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-600 px-4 py-1 rounded-full border-2 border-green-800 shadow-md"
				>
					<span class="font-pixel text-white text-xs whitespace-nowrap">Prof. Oak</span>
				</div>
			</div>
		</div>

		<!-- Input Box (Game style) -->
		<div class="bg-neutral-800 rounded-xl p-3 border-4 border-neutral-900 shadow-xl">
			<div class="flex gap-2">
				<input
					type="text"
					bind:value={inputMessage}
					onkeydown={handleKeydown}
					placeholder="Ask a question..."
					disabled={gameState.isChatLoading}
					class="flex-1 px-4 py-3 rounded-lg bg-white border-2 border-neutral-400 focus:border-green-500 focus:outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
				/>
				<button
					onclick={sendMessage}
					disabled={!inputMessage.trim() || gameState.isChatLoading}
					class="px-5 py-3 bg-green-500 text-white rounded-lg font-pixel text-xs border-b-4 border-green-700 hover:bg-green-600 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4"
				>
					ASK
				</button>
			</div>
		</div>
	</div>
</div>
