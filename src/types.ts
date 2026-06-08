/**
 * MetaMetrics: AI Metaheuristic Scheduler - Types
 */

export interface Task {
  id: string;
  length: number; // in MI (Million Instructions) / "Burst Time"
  arrivalTime: number;
  deadline?: number;
  priority: number; // 1 (low) to 5 (high)
  workloadType?: 'light' | 'heavy' | 'burst';
}

export interface VM {
  id: string;
  mips: number; // Million Instructions Per Second
  costPerExecutionUnit: number;
  idlePower: number; // Watts
  peakPower: number; // Watts
}

export interface SimulationWeights {
  makespan: number;
  cost: number;
  energy: number;
  loadBalance: number;
}

export type AlgorithmType = 'GA' | 'PSO' | 'ACO' | 'Hybrid' | 'RoundRobin';

export interface PerformanceMetrics {
  makespan: number;
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  throughput: number;
  avgUtilization: number;
  peakUtilization: number;
  loadBalanceIndex: number;
  totalCost: number;
  totalEnergy: number;
  deadlineViolationRate: number;
  slaSatisfaction: number;
  fitnessScore: number;
  convergenceTime: number;
}

export interface Allocation {
  taskId: string;
  vmId: string;
  startTime: number;
  endTime: number;
}

export interface SimulationResult {
  algorithm: AlgorithmType;
  allocations: Allocation[];
  metrics: PerformanceMetrics;
  convergenceHistory: { iteration: number; fitness: number }[];
  executionTime: number; // Duration of search in ms
}

export interface SimContextType {
  tasks: Task[];
  vms: VM[];
  weights: SimulationWeights;
  results: SimulationResult[];
  lastRunAlg: AlgorithmType | 'All' | null;
  setTasks: (t: Task[]) => void;
  setVms: (v: VM[]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  updateVm: (id: string, updates: Partial<VM>) => void;
  setWeights: (w: SimulationWeights) => void;
  runSimulation: (iters: number, specificAlg?: AlgorithmType) => Promise<void>;
  isSimulating: boolean;
  clearResults: () => void;
  isDynamicReoptimizationEnabled: boolean;
  setDynamicReoptimization: (val: boolean) => void;
}
