export async function generateSolution(
  text: string,
  model = 'gemini-2.5-flash'
): Promise<any> {
  const res = await fetch('/api/llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model })
  });
  const json = await res.json();
  if (!res.ok) throw new Error((json as any).error?.message || json.error || 'Server error');
  return json;
}
