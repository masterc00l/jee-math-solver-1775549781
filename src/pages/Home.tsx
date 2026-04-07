import React, { useState, useEffect } from 'react';
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

type Keys = { google: string; groq: string; openrouter: string };

const STORAGE_KEY = 'jee-math-solver-keys';

export const Home: React.FC = () => {
  const initialKeys: Keys = { google: '', groq: '', openrouter: '' };
  const [keys, setKeys] = useState<Keys>(initialKeys);
  const [provider, setProvider] = useState<'google' | 'groq' | 'openrouter'>('google');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solution, setSolution] = useState<any>(null);

  // Load keys from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setKeys({ ...initialKeys, ...parsed });
      }
    } catch (e) {
      console.error('Failed to load keys', e);
    }
  }, []);

  // Save keys whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    } catch (e) {
      console.error('Failed to save keys', e);
    }
  }, [keys]);

  const solve = async (text: string) => {
    const apiKey = keys[provider];
    if (!apiKey) {
      setError(`Please enter your ${provider} API key below.`);
      return;
    }
    setLoading(true); setError(null);
    const start = Date.now();
    try {
      const sol = await generateSolution(text, model, apiKey, provider);
      setSolution(sol);
    } catch (e: any) { setError(e.message); }
    finally {
      const elapsed = Date.now() - start;
      if (elapsed < 2000) {
        await new Promise(resolve => setTimeout(resolve, 2000 - elapsed));
      }
      setLoading(false);
    }
  };

  const testApi = async () => {
    const apiKey = keys[provider];
    if (!apiKey) {
      setError(`Please enter your ${provider} API key to test.`);
      return;
    }
    setError(null);
    try {
      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Hello', apiKey, provider }),
      });
      const data = await res.json();
      if (res.ok) alert('✅ API works!');
      else alert('❌ Error: ' + (data.error?.message || JSON.stringify(data)));
    } catch (e: any) { alert('❌ Network error: ' + e.message); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-6 text-center">JEE Math Solver</h1>

        {/* Settings Card */}
        <div className="bg-white p-4 rounded-lg shadow mb-4 space-y-3">
          {/* Provider & Model */}
          <div className="flex gap-2">
            <select value={provider} onChange={e => setProvider(e.target.value as any)} className="flex-1 p-2 border rounded">
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

          {/* API Keys */}
          <div className="space-y-2">
            <label className="text-xs text-gray-500 uppercase font-semibold">API Keys (stored locally)</label>
            <input
              type="password"
              placeholder="Google AI API key"
              value={keys.google}
              onChange={e => setKeys(k => ({ ...k, google: e.target.value }))}
              className="w-full p-2 border rounded text-sm"
            />
            <input
              type="password"
              placeholder="Groq API key"
              value={keys.groq}
              onChange={e => setKeys(k => ({ ...k, groq: e.target.value }))}
              className="w-full p-2 border rounded text-sm"
            />
            <input
              type="password"
              placeholder="OpenRouter API key"
              value={keys.openrouter}
              onChange={e => setKeys(k => ({ ...k, openrouter: e.target.value }))}
              className="w-full p-2 border rounded text-sm"
            />
          </div>

          {/* Test API Button */}
          <div className="pt-2 border-t">
            <button
              onClick={testApi}
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
