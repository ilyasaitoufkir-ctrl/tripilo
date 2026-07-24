const MODEL = 'claude-haiku-4-5-20251001';

// Shared by the JSON-answer AI tools (Visa, Notfall): send a prompt,
// get back a parsed object. Centralizes the error handling those screens all
// need — a raw `JSON.parse` on an unchecked response silently wedges the
// screen in its loading state the moment Claude wraps the answer in prose.
export async function askClaudeJSON<T = unknown>(prompt: string, maxTokens = 1000): Promise<T> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;
  if (!apiKey) throw new Error('VITE_ANTHROPIC_KEY ist nicht gesetzt.');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.error?.message || `Fehler ${res.status}`);
  }

  const data = await res.json();
  if (data.stop_reason === 'refusal' || !data.content?.length) {
    throw new Error('Keine Antwort erhalten. Bitte nochmal versuchen.');
  }

  const text: string = data.content[0]?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Antwort konnte nicht gelesen werden.');

  try {
    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    throw new Error('Antwort konnte nicht gelesen werden.');
  }
}
