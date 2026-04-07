import React, { useState } from 'react';
export const ProblemInput = ({ onSubmit, loading }: { onSubmit: (t: string) => void; loading: boolean }) => {
  const [text, setText] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) onSubmit(text); }} className="flex gap-2">
      <input value={text} onChange={e => setText(e.target.value)} placeholder="Enter JEE problem..." className="flex-1 p-2 border rounded" disabled={loading} />
      <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{loading ? '...' : 'Solve'}</button>
    </form>
  );
};