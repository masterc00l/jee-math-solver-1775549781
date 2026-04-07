import React from 'react';
export const ApproachTabs = ({ approaches, selected, onSelect }: any) => (
  <div className="flex gap-2 mb-4">
    {approaches.map((a: any, i: number) => (
      <button key={i} onClick={() => onSelect(i)} className={`px-3 py-1 rounded ${selected === i ? 'bg-black text-white' : 'bg-gray-200'}`}>{a.title}</button>
    ))}
  </div>
);