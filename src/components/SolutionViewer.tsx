import React, { useState } from 'react';
import { ApproachTabs } from './ApproachTabs';
import { ProgressBar } from './ProgressBar';
import { StepNode } from './StepNode';

export const SolutionViewer = ({ tree }: any) => {
  const [apIdx, setApIdx] = useState(0);
  const [openSteps, setOpenSteps] = useState(new Set<number>());
  const toggleStep = (i: number) => {
    setOpenSteps(s => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };
  const approach = tree.approaches[apIdx];
  return (
    <div className="max-w-2xl mx-auto mt-4">
      <ApproachTabs approaches={tree.approaches} selected={apIdx} onSelect={setApIdx} />
      <ProgressBar current={openSteps.size || 1} total={approach.steps.length} />
      {approach.steps.map((s: any, i: number) => (
        <StepNode key={i} step={s} isOpen={openSteps.has(i)} onToggle={() => toggleStep(i)} />
      ))}
    </div>
  );
};