import React, { useState, useEffect } from 'react';
import { SimContext } from './useSimulation';
import { Task, VM, SimulationWeights, SimulationResult, AlgorithmType } from './types';
import { runGA, runPSO, runACO, runHybrid } from './algorithms';
import { calculateMetrics } from './metrics';

export const SimProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vms, setVms] = useState<VM[]>([]);
  const [weights, setWeights] = useState<SimulationWeights>({
    makespan: 0.4,
    cost: 0.3,
    energy: 0.2,
    loadBalance: 0.1
  });
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [lastRunAlg, setLastRunAlg] = useState<AlgorithmType | 'All' | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDynamicReoptimizationEnabled, setDynamicReoptimization] = useState(false);

  // Initialize with some demo data
  useEffect(() => {
    const demoVms: VM[] = [
      { id: 'VM-1', mips: 1000, costPerExecutionUnit: 0.5, idlePower: 50, peakPower: 200 },
      { id: 'VM-2', mips: 1500, costPerExecutionUnit: 0.8, idlePower: 60, peakPower: 300 },
      { id: 'VM-3', mips: 2000, costPerExecutionUnit: 1.2, idlePower: 80, peakPower: 450 },
      { id: 'VM-4', mips: 1200, costPerExecutionUnit: 0.6, idlePower: 55, peakPower: 250 },
    ];
    setVms(demoVms);

    const demoTasks: Task[] = Array.from({ length: 40 }, (_, i) => ({
      id: `T-${i + 1}`,
      length: 5000 + Math.random() * 15000,
      arrivalTime: Math.random() * 5,
      priority: Math.floor(Math.random() * 5) + 1,
      deadline: 30 + Math.random() * 50,
      workloadType: 'light'
    }));
    setTasks(demoTasks);
  }, []);

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const updateVm = (id: string, updates: Partial<VM>) => {
    setVms(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const runSimulation = async (iters = 100, specificAlg?: AlgorithmType) => {
    setIsSimulating(true);
    setResults([]);
    setLastRunAlg(specificAlg || 'All');
    // Yield to UI
    await new Promise(r => setTimeout(r, 800));

    const algorithms: { type: AlgorithmType, fn: any }[] = [
      { type: 'GA' as AlgorithmType, fn: runGA },
      { type: 'PSO' as AlgorithmType, fn: runPSO },
      { type: 'ACO' as AlgorithmType, fn: runACO },
      { type: 'Hybrid' as AlgorithmType, fn: runHybrid }
    ].filter(a => !specificAlg || a.type === specificAlg);

    const newResults: SimulationResult[] = [];

    for (const alg of algorithms) {
      const startTime = performance.now();
      const res = alg.fn(tasks, vms, weights, 50, iters);
      const endTime = performance.now();
      const metrics = calculateMetrics(tasks, vms, res.allocations, res.fitness, res.time);
      
      const resultEntry = {
        algorithm: alg.type,
        allocations: res.allocations,
        metrics: metrics,
        convergenceHistory: res.history,
        executionTime: endTime - startTime
      };

      if (specificAlg) {
        const idx = newResults.findIndex(r => r.algorithm === specificAlg);
        if (idx !== -1) newResults[idx] = resultEntry;
        else newResults.push(resultEntry);
      } else {
        newResults.push(resultEntry);
      }
      
      // Small break for browser responsiveness
      await new Promise(r => setTimeout(r, 200));
    }

    setResults(newResults);
    setIsSimulating(false);
  };

  const clearResults = () => {
    setResults([]);
    setLastRunAlg(null);
  };

  return (
    <SimContext.Provider value={{
      tasks, vms, weights, results, lastRunAlg,
      setTasks, setVms, updateTask, updateVm, setWeights,
      runSimulation, isSimulating,
      clearResults,
      isDynamicReoptimizationEnabled,
      setDynamicReoptimization
    }}>
      {children}
    </SimContext.Provider>
  );
};
