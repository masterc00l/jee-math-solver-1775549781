export async function generateSolution(
  text: string,
  apiKey: string,
  model = 'google/gemma-4-31b-it'
): Promise<any> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'JEE Math Solver',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are an expert JEE math tutor. Return ONLY JSON with problem_latex and approaches[].' },
        { role: 'user', content: text }
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    })
  });
  const json = await res.json();
  if (!res.ok) throw new Error((json as any).error?.message || 'LLM error');
  const parsed = JSON.parse(json.choices[0].message.content);
  return parsed;
}
