export async function generateSolution(
  text: string,
  apiKey: string,
  model = 'saaras'
): Promise<any> {
  const res = await fetch('/api/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model })
  });

  const json = await res.json();
  if (!res.ok) throw new Error((json as any).error?.message || 'Server error');
  return json;
}
