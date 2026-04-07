import React, { useState } from 'react';
import { ProblemInput } from '../components/ProblemInput';
import { SolutionViewer } from '../components/SolutionViewer';
import { generateSolution } from '../lib/llm';

const MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google' },
  { id: 'openai/gpt-oss-120b', name: 'OpenAI OSS 120B (via Groq)', provider: 'groq' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B (Groq)', provider: 'groq' },
  { id: 'google/gemma-4-31b-it', name: 'Gemma 4 31B (OpenRouter)', provider: 'openrouter' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude Haiku (OpenRouter)', provider: 'openrouter' },
];

export const Home: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'google' | 'groq' | 'openrouter'>('google');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solution, setSolution] = useState<any>(null);

  const solve = async (text: string) => {
    if (!apiKey) { setError('Please enter your API key'); return; }
    setLoading(true); setError(null);
    try {
      const sol = await generateSolution(text, model, apiKey, provider);
      setSolution(sol);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-6 text-center">JEE Math Solver</h1>
        
        {/* Settings Card */}
        <div className="bg-white p-4 rounded-lg shadow mb-4 space-y-3">
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Enter your API key (Google, Groq, etc.)"
            className="w-full p-2 border rounded text-sm"
          />
          <div className="flex gap-2">
            <select value={provider} onChange={e => setProvider(e.target.value)} className="flex-1 p-2 border rounded">
              <option value="google">Google AI</option>
              <option value="groq">Groq</option>
              <option value="openrouter">OpenRouter</option>
            </select>
            <select value={model} onChange={e => setModel(e.target.value)} className="flex-1 p-2 border rounded">
              {MODELS.filter(m => m.provider === provider).map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          
          {/* Test API Button */}
          <div className="pt-2 border-t">
            <button
              onClick={async () => {
                setError(null);
                try {
                  const res = await fetch('/api/llm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: 'Hello', apiKey, provider })
                  });
                  const data = await res.json();
                  if (res.ok) alert('✅ API works!');
                  else alert('❌ Error: ' + (data.error?.message || JSON.stringify(data)));
                } catch (e: any) { alert('❌ Network error: ' + e.message); }
              }}
              className="w-full py-1.5 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200"
            >
              Test API Connection
            </button>
          </div>
        </div>

        {/* Problem Input & Solution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <ProblemInput onSubmit={solve} loading={loading} />
          {error && <div className="mt-3 p-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
          {solution && <SolutionViewer tree={solution} />}
        </div>
      </div>
    </div>
  );
};
