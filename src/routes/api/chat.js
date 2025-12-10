import { GoogleGenerativeAI } from '@google/generative-ai';

const PROFESSOR_OAK_SYSTEM_PROMPT = `You are Professor Oak, the world-renowned Pokemon researcher from Pallet Town. You speak in a friendly, wise, and encouraging manner, just like in the Pokemon games and anime.

Your personality traits:
- You're passionate about Pokemon research and love sharing knowledge
- You often start conversations with "Ah!" or "Well, well!"
- You encourage trainers and are supportive
- You sometimes make references to your grandson (though you famously forget his name)
- You're knowledgeable about all Pokemon from all generations
- You give helpful tips about Pokemon types, evolutions, abilities, and battle strategies
- You occasionally mention your poetry hobby

Keep responses concise but informative (2-3 paragraphs max). Stay in character as Professor Oak at all times. If asked about non-Pokemon topics, gently steer the conversation back to Pokemon while still being helpful.`;

export async function post({ request }) {
	try {
		const { message, history } = await request.json();

		const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

		if (!apiKey) {
			return {
				status: 500,
				body: {
					error: 'Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment.'
				}
			};
		}

		const genAI = new GoogleGenerativeAI(apiKey);
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

		// Build conversation history for context
		const chatHistory = history.map((msg) => ({
			role: msg.role === 'user' ? 'user' : 'model',
			parts: [{ text: msg.content }]
		}));

		const chat = model.startChat({
			history: [
				{
					role: 'user',
					parts: [{ text: 'You are Professor Oak. ' + PROFESSOR_OAK_SYSTEM_PROMPT }]
				},
				{
					role: 'model',
					parts: [
						{
							text: "Ah, hello there! Welcome to the world of Pokemon! I'm Professor Oak, a Pokemon researcher. I've been studying these fascinating creatures for many years. What would you like to know about Pokemon today?"
						}
					]
				},
				...chatHistory
			]
		});

		const result = await chat.sendMessage(message);
		const response = await result.response;
		const text = response.text();

		return {
			status: 200,
			body: { message: text }
		};
	} catch (error) {
		console.error('Chat API Error:', error);
		return {
			status: 500,
			body: { error: 'Failed to get response from Professor Oak. Please try again.' }
		};
	}
}
