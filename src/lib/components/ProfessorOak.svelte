<script>
	import { showProfessorOak, chatMessages, isChatLoading } from '../store';
	import { fade, fly } from 'svelte/transition';

	// Professor Oak sprite from PokeAPI
	const oakSprite = 'https://archives.bulbagarden.net/media/upload/thumb/3/3e/Lets_Go_Pikachu_Eevee_Professor_Oak.png/100px-Lets_Go_Pikachu_Eevee_Professor_Oak.png';

	let inputMessage = '';
	let chatContainer;

	async function sendMessage() {
		if (!inputMessage.trim() || $isChatLoading) return;

		const userMessage = inputMessage.trim();
		inputMessage = '';

		// Add user message to chat
		$chatMessages = [...$chatMessages, { role: 'user', content: userMessage }];
		$isChatLoading = true;

		// Scroll to bottom
		setTimeout(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 50);

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: userMessage,
					history: $chatMessages.slice(0, -1)
				})
			});

			const data = await response.json();

			if (response.ok) {
				$chatMessages = [...$chatMessages, { role: 'assistant', content: data.message }];
			} else {
				$chatMessages = [
					...$chatMessages,
					{
						role: 'assistant',
						content: data.error || "Hmm, it seems I'm having trouble thinking right now. Please try again!"
					}
				];
			}
		} catch (error) {
			$chatMessages = [
				...$chatMessages,
				{
					role: 'assistant',
					content: "Ah, it seems there's a connection problem. Please check your internet and try again!"
				}
			];
		} finally {
			$isChatLoading = false;
			setTimeout(() => {
				if (chatContainer) {
					chatContainer.scrollTop = chatContainer.scrollHeight;
				}
			}, 50);
		}
	}

	function handleKeydown(event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function closeChat() {
		$showProfessorOak = false;
	}
</script>

<div
	class="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4"
	transition:fade={{ duration: 200 }}
	on:click={closeChat}
	on:keydown={(e) => e.key === 'Escape' && closeChat()}
	role="button"
	tabindex="0"
>
	<div
		class="bg-neutral-100 rounded-2xl w-full max-w-lg h-[550px] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl outline outline-black outline-4"
		transition:fly={{ y: 50, duration: 300 }}
		on:click|stopPropagation
		on:keydown|stopPropagation
		role="dialog"
		aria-label="Chat with Professor Oak"
	>
		<!-- Header -->
		<div
			class="bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 flex items-center gap-3 border-b-4 border-green-800"
		>
			<div
				class="w-14 h-14 rounded-full bg-gradient-to-b from-amber-100 to-amber-200 flex items-center justify-center border-3 border-green-800 overflow-hidden shadow-inner"
			>
				<img
					src={oakSprite}
					alt="Professor Oak"
					class="w-12 h-12 object-contain object-top"
					on:error={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }}
				/>
				<span class="text-2xl hidden">🥼</span>
			</div>
			<div class="flex-1">
				<h2 class="font-pixel text-white text-sm sm:text-base drop-shadow-md">Professor Oak</h2>
				<p class="text-green-200 text-xs">Pokemon Researcher • Pallet Town</p>
			</div>
			<button
				class="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold text-sm border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all"
				on:click={closeChat}
				aria-label="Close chat"
			>
				X
			</button>
		</div>

		<!-- Chat Messages -->
		<div
			bind:this={chatContainer}
			class="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-stone-100 to-stone-200"
		>
			{#if $chatMessages.length === 0}
				<!-- Welcome Message -->
				<div class="flex items-end gap-2">
					<div class="w-10 h-10 rounded-full bg-gradient-to-b from-amber-100 to-amber-200 flex-shrink-0 flex items-center justify-center border-2 border-green-700 overflow-hidden">
						<img src={oakSprite} alt="Oak" class="w-8 h-8 object-contain object-top" />
					</div>
					<div class="relative max-w-[80%]">
						<!-- Speech bubble tail -->
						<div class="absolute -left-2 bottom-2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent"></div>
						<div
							class="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border-2 border-green-200"
						>
							<p class="text-sm text-neutral-700">
								Ah, hello there! Welcome to the world of Pokemon! I'm Professor Oak, a Pokemon researcher.
							</p>
							<p class="text-sm text-neutral-700 mt-2">
								What would you like to know about Pokemon today?
							</p>
						</div>
					</div>
				</div>
			{/if}

			{#each $chatMessages as message}
				{#if message.role === 'assistant'}
					<!-- Professor Oak's Message -->
					<div class="flex items-end gap-2">
						<div class="w-10 h-10 rounded-full bg-gradient-to-b from-amber-100 to-amber-200 flex-shrink-0 flex items-center justify-center border-2 border-green-700 overflow-hidden">
							<img src={oakSprite} alt="Oak" class="w-8 h-8 object-contain object-top" />
						</div>
						<div class="relative max-w-[80%]">
							<!-- Speech bubble tail -->
							<div class="absolute -left-2 bottom-2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent"></div>
							<div
								class="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border-2 border-green-200"
							>
								<p class="text-sm text-neutral-700 whitespace-pre-wrap">{message.content}</p>
							</div>
						</div>
					</div>
				{:else}
					<!-- User's Message -->
					<div class="flex items-end gap-2 justify-end">
						<div class="relative max-w-[80%]">
							<!-- Speech bubble tail -->
							<div class="absolute -right-2 bottom-2 w-0 h-0 border-t-8 border-t-transparent border-l-8 border-l-blue-500 border-b-8 border-b-transparent"></div>
							<div
								class="bg-blue-500 rounded-2xl rounded-br-sm px-4 py-3 shadow-md"
							>
								<p class="text-sm text-white whitespace-pre-wrap">{message.content}</p>
							</div>
						</div>
						<div class="w-10 h-10 rounded-full bg-gradient-to-b from-red-400 to-red-500 flex-shrink-0 flex items-center justify-center border-2 border-red-700 shadow-inner">
							<span class="text-white text-lg">?</span>
						</div>
					</div>
				{/if}
			{/each}

			{#if $isChatLoading}
				<!-- Loading indicator -->
				<div class="flex items-end gap-2">
					<div class="w-10 h-10 rounded-full bg-gradient-to-b from-amber-100 to-amber-200 flex-shrink-0 flex items-center justify-center border-2 border-green-700 overflow-hidden">
						<img src={oakSprite} alt="Oak" class="w-8 h-8 object-contain object-top" />
					</div>
					<div class="relative">
						<div class="absolute -left-2 bottom-2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent"></div>
						<div class="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-md border-2 border-green-200">
							<div class="flex gap-1 items-center">
								<span class="w-2 h-2 bg-green-400 rounded-full animate-bounce" style="animation-delay: 0s" />
								<span class="w-2 h-2 bg-green-500 rounded-full animate-bounce" style="animation-delay: 0.15s" />
								<span class="w-2 h-2 bg-green-600 rounded-full animate-bounce" style="animation-delay: 0.3s" />
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Input Area -->
		<div class="p-3 bg-gradient-to-r from-green-100 to-emerald-100 border-t-2 border-green-300">
			<div class="flex gap-2">
				<input
					type="text"
					bind:value={inputMessage}
					on:keydown={handleKeydown}
					placeholder="Ask Professor Oak about Pokemon..."
					disabled={$isChatLoading}
					class="flex-1 px-4 py-2 rounded-full border-2 border-green-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed bg-white"
				/>
				<button
					on:click={sendMessage}
					disabled={!inputMessage.trim() || $isChatLoading}
					class="px-5 py-2 bg-green-500 text-white rounded-full font-pixel text-xs border-b-4 border-green-700 hover:bg-green-600 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4"
				>
					Send
				</button>
			</div>
		</div>
	</div>
</div>
