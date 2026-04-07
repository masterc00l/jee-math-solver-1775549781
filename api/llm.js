export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { text, model = 'gemini-2.5-flash' } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const apiKey = req.body.apiKey || process.env.GOOGLE_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'Missing Google API key' });

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text }] }],
        systemInstruction: { parts: [{ text: 'You are an expert JEE mathematics tutor. Output ONLY valid JSON with this exact structure: { "problem_latex": string, "approaches": [{ "id": string, "title": string, "steps": [{ "step_number": number, "content": string, "hint": string, "alternatives": [{ "label": string, "content": string }], "prerequisite_steps": number[] }] }] }' }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json(err);
    }

    const data = await response.json();
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) return res.status(500).json({ error: 'No content returned' });

    try {
      const parsed = JSON.parse(textResponse);
      if (!parsed.approaches?.length) throw new Error('Invalid solution format');
      return res.status(200).json(parsed);
    } catch (e) {
      return res.status(500).json({ error: 'Model output not valid JSON', raw: textResponse });
    }
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
