import React, { useState } from 'react';
import { ProblemInput } from '../components/ProblemInput';
import { SolutionViewer } from '../components/SolutionViewer';
import { generateSolution } from '../lib/llm';

const MODELS = [
    { id: 'saaras', name: 'Sarvam 105B' },
    { id: 'mistral-large', name: 'Mistral Large (Sarvam)' },
  ];

export const Home: React.FC = () => {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openrouter_key') || '');
  const [model, setModel] = useState('saaras');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solution, setSolution] = useState<any>(null);

  const solve = async (text: string) => {
    if (!apiKey) { setError('Set your OpenRouter key above'); return; }
    setLoading(true); setError(null);
    try {
      const sol = await generateSolution(text, apiKey, model);
      setSolution(sol);
    } catch (e: any) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-6 text-center">JEE Math Solver</h1>
        <div className="bg-white p-4 rounded-lg shadow space-y-3 mb-4">
          <input value={apiKey} onChange={e => { setApiKey(e.target.value); localStorage.setItem('openrouter_key', e.target.value); }} placeholder="sk-or-... (OpenRouter API key)" className="w-full p-2 border rounded" type="password" />
          <select value={model} onChange={e => setModel(e.target.value)} className="w-full p-2 border rounded">
            {MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>

          <div className="mt-4 border-t pt-4">
            <button
              onClick={async () => {
                setError(null);
                try {
                  const res = await fetch('/api/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: 'Hello', key: apiKey })
              });
              const data = await res.json();
              if (res.ok) {
                alert('✅ API works! Response: ' + JSON.stringify(data).slice(0, 200));
              } else {
                const msg = data?.error?.message || data?.message || JSON.stringify(data) || res.status.toString();
                alert('❌ Error: ' + msg);
              } }
              }}
              className="px-3 py-1.5 bg-gray-800 text-white text-sm rounded"
            >
              Test API
            </button>
            <p className="text-xs text-gray-500 mt-1">Checks connectivity to the Vercel serverless function using your API key.</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <ProblemInput onSubmit={solve} loading={loading} />
          {error && <div className="mt-3 p-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
          {solution && <SolutionViewer tree={solution} />}
        </div>
      </div>
    </div>
  );
};