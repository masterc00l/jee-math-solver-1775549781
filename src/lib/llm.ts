export async function generateSolution(
  text: string,
  model: string,
  apiKey: string,
  provider: 'google' | 'groq' | 'openrouter'
): Promise<any> {
  if (!apiKey) throw new Error('API key is required');

  let url: string;
  let headers: Record<string, string> = { 'Content-Type': 'application/json' };
  let body: any = {
    messages: [
      { role: 'system', content: 'You are an expert JEE mathematics tutor. Output ONLY a JSON object with structure: { "problem_latex": string, "approaches": [{ "id": string, "title": string, "steps": [{ "step_number": number, "content": string, "hint": string }] }] }' },
      { role: 'user', content: text }
    ],
    temperature: 0.7,
    max_tokens: 4096,
    response_format: { type: 'json_object' }
  };

  switch (provider) {
    case 'google':
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      // Google expects a different payload shape
      body = {
        contents: [{ role: 'user', parts: [{ text }] }],
        systemInstruction: { parts: [{ text: body.messages[0].content }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
      };
      break;
    case 'groq':
      url = 'https://api.groq.com/openai/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      body.model = model;
      body.stream = false;
      break;
    case 'openrouter':
      url = 'https://openrouter.ai/api/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['HTTP-Referer'] = window.location.origin;
      headers['X-Title'] = 'JEE Math Solver';
      body.model = model;
      body.stream = false;
      break;
    default:
      throw new Error('Unknown provider');
  }

  const res = await fetch('/api/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model, provider, apiKey })
  });
  const json = await res.json();
  if (!res.ok) throw new Error((json as any).error?.message || json.error || 'Server error');
  return json;
}
