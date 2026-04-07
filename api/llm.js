export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { text, key, model = 'google/gemma-4-31b-it' } = req.body;
  if (!text || !key) return res.status(400).json({ error: 'text and key required' });
  const messages = [
    { role: 'system', content: 'Return ONLY JSON: { "problem_latex": string, "approaches": [{ "id": string, "title": string, "steps": [{ "step_number": number, "content": string, "hint": string }] }] }' },
    { role: 'user', content: text }
  ];
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
        'X-Title': 'JEE Math Solver',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 4096, response_format: { type: 'json_object' } })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    const content = data.choices[0].message.content;
    res.status(200).json(JSON.parse(content));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
