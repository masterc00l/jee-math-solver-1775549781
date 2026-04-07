export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { text, model, provider, apiKey } = req.body;

  if (!text || !model || !provider || !apiKey) {
    return res.status(400).json({ error: 'text, model, provider, and apiKey are required' });
  }

  // Simple in-memory rate limiting (5 requests per minute per IP)
  if (!global.__rate_limit) global.__rate_limit = new Map();
  const clientId = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const now = Date.now();
  const bucket = global.__rate_limit;
  if (bucket.has(clientId)) {
    const { last, count } = bucket.get(clientId);
    if (now - last < 60_000 && count >= 5) {
      return res.status(429).json({ error: 'Rate limit exceeded (5/min)' });
    }
    bucket.set(clientId, { last: now, count: count + 1 });
  } else {
    bucket.set(clientId, { last: now, count: 1 });
  }

  const MAX_RETRIES = 3;
  const INITIAL_DELAY = 2000; // 2 seconds

  async function callProviderWithRetry(attempt = 0) {
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

    try {
      const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        let errObj = { error: 'Provider error', status: response.status };
        try { errObj = JSON.parse(errText); } catch {}
        return { status: response.status, error: errObj };
      }
      return { ok: true, data: await response.json() };
    } catch (err: any) {
      const isRetryable = !err.ok &&
        (err.status >= 500 || err.status === 429 ||
         err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT');
      if (isRetryable && attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_DELAY * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        return callProviderWithRetry(attempt + 1);
      }
      throw err;
    }
  }

  try {
    const result = await callProviderWithRetry();
    if (!result.ok) {
      return res.status(result.status || 502).json(result.error);
    }
    const data = result.data;

    let parsed: any;
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
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
