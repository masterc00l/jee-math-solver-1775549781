export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { text, model, provider, apiKey } = req.body;

  if (!text || !model || !provider || !apiKey) {
    return res.status(400).json({ error: 'text, model, provider, and apiKey are required' });
  }

  try {
    let url: string;
    let headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let body: any;

    switch (provider) {
      case 'google':
        url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        body = {
          contents: [{ role: 'user', parts: [{ text }] }],
          systemInstruction: { parts: [{ text: 'You are an expert JEE mathematics tutor. Output ONLY a JSON object with structure: { "problem_latex": string, "approaches": [{ "id": string, "title": string, "steps": [{ "step_number": number, "content": string, "hint": string }] }] }' }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
        };
        break;
      case 'groq':
        url = 'https://api.groq.com/openai/v1/chat/completions';
        headers['Authorization'] = `Bearer ${apiKey}`;
        body = {
          model,
          messages: [
            { role: 'system', content: 'Return ONLY JSON: { "problem_latex": string, "approaches": [{ "id": string, "title": string, "steps": [{ "step_number": number, "content": string, "hint": string }] }] }' },
            { role: 'user', content: text }
          ],
          temperature: 0.7,
          max_tokens: 4096,
          stream: false,
          response_format: { type: 'json_object' }
        };
        break;
      case 'openrouter':
        url = 'https://openrouter.ai/api/v1/chat/completions';
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['HTTP-Referer'] = process.env.VERCEL_URL || 'http://localhost:3000';
        headers['X-Title'] = 'JEE Math Solver';
        body = {
          model,
          messages: [
            { role: 'system', content: 'Return ONLY JSON: { "problem_latex": string, "approaches": [{ "id": string, "title": string, "steps": [{ "step_number": number, "content": string, "hint": string }] }] }' },
            { role: 'user', content: text }
          ],
          temperature: 0.7,
          max_tokens: 4096,
          stream: false,
          response_format: { type: 'json_object' }
        };
        break;
      default:
        return res.status(400).json({ error: 'Unknown provider' });
    }

    const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Provider error' }));
      return res.status(response.status).json(err);
    }

    const data = await response.json();

    // Parse the model output which should be JSON inside the message content (OpenRouter/Groq) or directly JSON (Google)
    let parsed;
    if (provider === 'google') {
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) throw new Error('No content from Google');
      parsed = JSON.parse(textResponse);
    } else {
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('No content from provider');
      parsed = JSON.parse(content);
    }

    if (!parsed.approaches?.length) throw new Error('Invalid solution format');
    return res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
