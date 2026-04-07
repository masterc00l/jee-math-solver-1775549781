import React from 'react';
export const StepNode = ({ step, isOpen, onToggle }: any) => (
  <div className="border-b">
    <button onClick={onToggle} className="w-full text-left p-3 font-medium hover:bg-gray-50">
      Step {step.step_number}: {step.content.slice(0, 60)}...
    </button>
    {isOpen && (
      <div className="p-3 pl-6 bg-gray-50">
        <p>{step.content}</p>
        {step.hint && <div className="mt-2 p-2 bg-yellow-50 border-l-2 border-yellow-500 text-sm"><strong>Hint:</strong> {step.hint}</div>}
        {step.alternatives && step.alternatives.length > 0 && (
          <div className="mt-2"><strong>Alternatives:</strong>
            {step.alternatives.map((a: any, i: number) => <div key={i} className="p-1 mt-1 border">{a.content}</div>)}
          </div>
        )}
      </div>
    )}
  </div>
);