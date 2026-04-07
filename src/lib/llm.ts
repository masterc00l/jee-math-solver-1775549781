export async function generateSolution(
  text: string,
  model = 'gemini-2.5-flash',
  apiKey: string
): Promise<any> {
  if (!apiKey) throw new Error('API key is required');

  const res = await fetch('/api/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model, apiKey })
  });

  const json = await res.json();
  if (!res.ok) throw new Error((json as any).error?.message || 'Server error');
  return json;
}
