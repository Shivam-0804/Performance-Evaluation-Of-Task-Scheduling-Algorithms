import { Task, VM, SimulationWeights } from './types';

export interface Recommendation {
  primary: {
    algorithm: 'GA' | 'PSO' | 'ACO' | 'Hybrid';
    confidence: number;
  };
  secondary: {
    algorithm: 'GA' | 'PSO' | 'ACO' | 'Hybrid';
    confidence: number;
  };
  comparison: string;
  reasoning: string[];
  expectedTradeoffs: string[];
}

export function getAIRecommendation(tasks: Task[], vms: VM[], weights: SimulationWeights): Recommendation {
  const taskCount = tasks.length;
  const vmCount = vms.length;
  
  const safeTaskCount = Math.max(1, taskCount);
  const safeVmCount = Math.max(1, vmCount);

  const avgLength = tasks.reduce((s, t) => s + t.length, 0) / safeTaskCount;
  const lengthVariance = taskCount > 0 ? Math.sqrt(tasks.reduce((s, t) => s + Math.pow(t.length - avgLength, 2), 0) / safeTaskCount) / (avgLength || 1) : 0;
  
  const avgMips = vms.reduce((s, v) => s + v.mips, 0) / safeVmCount;
  const vmHeterogeneity = vmCount > 0 ? Math.sqrt(vms.reduce((s, v) => s + Math.pow(v.mips - avgMips, 2), 0) / safeVmCount) / (avgMips || 1) : 0;

  let scores = {
    GA: 50,
    PSO: 50,
    ACO: 50,
    Hybrid: 60 
  };

  const reasons: string[] = [];
  const tradeoffs: string[] = [];

  if (vmHeterogeneity > 0.4) {
    scores.PSO += 25;
    scores.Hybrid += 15;
    reasons.push("High VM heterogeneity detected; PSO excels at exploring continuous scheduling landscapes.");
  }

  if (taskCount > 80) {
    scores.ACO += 25;
    scores.Hybrid += 10;
    reasons.push("Large-scale task queues favor ACO's multi-agent pheromone pathfinding.");
  }

  if (weights.makespan > 0.6) {
    scores.Hybrid += 20;
    scores.PSO += 10;
    reasons.push("Tight Makespan priority suggests the use of Accelerated Hybrid convergence.");
  }

  if (weights.cost > 0.5) {
    scores.GA += 15;
    tradeoffs.push("Strict cost constraints often lead GA to prefer slower, cheaper instances at the cost of overall time.");
  }

  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1]) as [any, number][];

  const primary = { algorithm: sorted[0][0], confidence: Math.min(98, sorted[0][1]) };
  const secondary = { algorithm: sorted[1][0], confidence: Math.min(95, sorted[1][1]) };

  const delta = primary.confidence - secondary.confidence;
  const comparison = delta > 12 
    ? `${primary.algorithm} provides a significantly more stable scheduling policy for this specific resource/workload mix.`
    : `${primary.algorithm} is the optimal choice, though ${secondary.algorithm} offers comparable performance with potentially lower memory overhead.`;

  return {
    primary,
    secondary,
    comparison,
    reasoning: reasons.length > 0 ? reasons : ["Workload profile suggests standard metaheuristic balancing across all agents."],
    expectedTradeoffs: tradeoffs.length > 0 ? tradeoffs : ["Balanced optimization across secondary processing constraints."]
  };
}
