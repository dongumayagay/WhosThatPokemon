import { json } from '@sveltejs/kit';
import { GoogleGenAI } from '@google/genai';
import { env } from '$env/dynamic/private';

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

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  // Keep the key on the server; do not let an absent key break the entire build.
  if (!env.GEMINI_API_KEY) {
    return json({ error: 'Professor Oak is not configured yet.' }, { status: 503 });
  }

  try {
    const payload = await request.json();
    const message = typeof payload?.message === 'string' ? payload.message.trim() : '';
    if (!message || message.length > 2000) {
      return json({ error: 'Please enter a question under 2,000 characters.' }, { status: 400 });
    }

    /** @type {{ role: 'user' | 'assistant', content: string }[]} */
    const history = Array.isArray(payload?.history) ? payload.history : [];
    const contents = history.slice(-12)
      .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
      .map((item) => ({
        role: item.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: item.content.slice(0, 2000) }]
      }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const result = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: PROFESSOR_OAK_SYSTEM_PROMPT,
        maxOutputTokens: 450
      }
    });

    return json({ message: result.text || "I'm still thinking. Could you try another question?" });
  } catch (error) {
    console.error('Professor Oak request failed:', error);
    return json({ error: 'Professor Oak is temporarily unavailable.' }, { status: 502 });
  }
}
