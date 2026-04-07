export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { text, model = 'saaras', apiKey } = req.body;

  if (!text) return res.status(400).json({ error: 'text is required' });

  try {
    // Sarvam API endpoint
    const response = await fetch('https://api.sarvam.ai/chat/completions', {
      method: 'POST',
      headers: {
        'api-subscription-key': 'sk_o85nb0oc_YxvI3Svg7HvwwWp7xYlfwXmZ',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are an expert JEE math tutor. Output ONLY valid JSON with structure: { "problem_latex": "...", "approaches": [{ "id": "id1", "title": "...", "steps": [{ "step_number": 1, "content": "...", "hint": "..." }] }] }' },
          { role: 'user', content: text }
        ],
        stream: false,
        temperature: 0.7,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: 'Sarvam error' }));
      return res.status(response.status).json(errData);
    }

    const data = await response.json();
    // Sarvam returns choices similar to OpenAI
    try {
      const content = data.choices?.[0]?.message?.content;
      const parsed = JSON.parse(content);
      res.status(200).json(parsed);
    } catch (parseError) {
      res.status(500).json({ error: 'Failed to parse model output', raw: content });
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
