<script>
	import { showProfessorOak, chatMessages, isChatLoading } from '../store';
	import { fade, fly } from 'svelte/transition';

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
					history: $chatMessages.slice(0, -1) // Send history without the just-added message
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
			// Scroll to bottom after response
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
		class="bg-neutral-100 rounded-2xl w-full max-w-lg h-[500px] max-h-[80vh] flex flex-col overflow-hidden shadow-2xl outline outline-black outline-4"
		transition:fly={{ y: 50, duration: 300 }}
		on:click|stopPropagation
		on:keydown|stopPropagation
		role="dialog"
		aria-label="Chat with Professor Oak"
	>
		<!-- Header -->
		<div
			class="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 flex items-center gap-3 border-b-4 border-green-800"
		>
			<div
				class="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl border-2 border-green-800 overflow-hidden"
			>
				<span role="img" aria-label="Professor Oak">🥼</span>
			</div>
			<div class="flex-1">
				<h2 class="font-pixel text-white text-sm sm:text-base">Professor Oak</h2>
				<p class="text-green-200 text-xs">Pokemon Researcher</p>
			</div>
			<button
				class="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all"
				on:click={closeChat}
				aria-label="Close chat"
			>
				X
			</button>
		</div>

		<!-- Chat Messages -->
		<div
			bind:this={chatContainer}
			class="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-neutral-100 to-neutral-200"
		>
			{#if $chatMessages.length === 0}
				<div class="text-center py-8">
					<div class="text-4xl mb-3">🔬</div>
					<p class="font-pixel text-neutral-600 text-xs px-4">
						Ah, hello there! I'm Professor Oak. Ask me anything about Pokemon!
					</p>
				</div>
			{/if}

			{#each $chatMessages as message}
				<div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
					<div
						class="max-w-[80%] rounded-2xl px-4 py-2 {message.role === 'user'
							? 'bg-blue-500 text-white rounded-br-sm'
							: 'bg-white text-neutral-800 rounded-bl-sm border-2 border-neutral-300'}"
					>
						<p class="text-sm whitespace-pre-wrap">{message.content}</p>
					</div>
				</div>
			{/each}

			{#if $isChatLoading}
				<div class="flex justify-start">
					<div class="bg-white rounded-2xl rounded-bl-sm px-4 py-3 border-2 border-neutral-300">
						<div class="flex gap-1">
							<span class="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
							<span
								class="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
								style="animation-delay: 0.1s"
							/>
							<span
								class="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"
								style="animation-delay: 0.2s"
							/>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Input Area -->
		<div class="p-3 bg-neutral-200 border-t-2 border-neutral-300">
			<div class="flex gap-2">
				<input
					type="text"
					bind:value={inputMessage}
					on:keydown={handleKeydown}
					placeholder="Ask Professor Oak..."
					disabled={$isChatLoading}
					class="flex-1 px-4 py-2 rounded-full border-2 border-neutral-400 focus:border-green-500 focus:outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
				/>
				<button
					on:click={sendMessage}
					disabled={!inputMessage.trim() || $isChatLoading}
					class="px-4 py-2 bg-green-500 text-white rounded-full font-pixel text-xs border-b-4 border-green-700 hover:bg-green-600 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4"
				>
					Send
				</button>
			</div>
		</div>
	</div>
</div>
