export interface SolutionTree {
  problem_latex: string;
  approaches: Array<{
    id: string;
    title: string;
    steps: Array<{
      step_number: number;
      content: string;
      hint?: string;
      alternatives?: { label: string; content: string }[];
      prerequisite_steps?: number[];
    }>;
  }>;
}
