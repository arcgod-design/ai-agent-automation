export interface RunStats {
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  successRate: number;
  avgDurationMs: number;
  minDurationMs: number | null;
  maxDurationMs: number | null;
}

export interface StepStat {
  stepId: string;
  type: string;
  executions: number;
  successes: number;
  failures: number;
  successRate: number;
  avgDurationMs: number;
  commonErrors: string[];
}

export interface BranchOutcome {
  label: string;
  count: number;
  percentage: number;
}

export interface BranchRouting {
  stepId: string;
  type: string;
  totalExecutions: number;
  outcomes: BranchOutcome[];
  deadBranches: string[];
  isSkewed: boolean;
}

export interface SemanticMetrics {
  memory: {
    retrievalCount: number;
    totalRetrieved: number;
    avgSimilarity: number;
    lowRelevance: boolean;
  };
  rag: {
    topK: number;
    totalRetrieved: number;
    relevantChunks: number;
    avgSimilarity: number;
    lowRelevance: boolean;
  };
}

export interface Recommendation {
  type: string;
  severity: 'critical' | 'warning' | 'notice';
  message: string;
}

export interface WorkflowInsights {
  workflowId: string;
  analysedRuns: number;
  runStats: RunStats | null;
  stepStats: StepStat[];
  branchRouting: BranchRouting[];
  semanticMetrics: SemanticMetrics;
  healthScore: number | null;
  recommendations: Recommendation[];
  message?: string;
}

export interface WorkflowSummary {
  workflowId: string;
  totalRuns: number;
  successRate: number;
  avgDurationMs: number;
}

export interface GlobalInsights {
  userId: string;
  analysedRuns: number;
  workflowSummaries: WorkflowSummary[];
  overallSuccessRate: number;
  stepStats: StepStat[];
  branchRouting: BranchRouting[];
  semanticMetrics: SemanticMetrics;
  healthScore: number | null;
  recommendations: Recommendation[];
  message?: string;
}
