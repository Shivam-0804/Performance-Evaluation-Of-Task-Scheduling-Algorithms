import { Task, VM, Allocation, SimulationWeights } from './types';

/**
 * Base Fitness Function for Multi-Objective Optimization
 */
export function evaluateFitness(
  allocations: Allocation[], 
  tasks: Task[], 
  vms: VM[], 
  weights: SimulationWeights
): number {
  if (allocations.length === 0) return 0;

  const makespan = Math.max(...allocations.map(a => a.endTime));
  
  // Cost
  let totalCost = 0;
  allocations.forEach(a => {
    const vm = vms.find(v => v.id === a.vmId)!;
    totalCost += (a.endTime - a.startTime) * vm.costPerExecutionUnit;
  });

  // Energy
  let totalEnergy = 0;
  const vmUtilizationMap = new Map<string, number>();
  vms.forEach(vm => {
    const busy = allocations.filter(a => a.vmId === vm.id).reduce((s, a) => s + (a.endTime - a.startTime), 0);
    const util = busy / (makespan || 1);
    vmUtilizationMap.set(vm.id, util);
    totalEnergy += (vm.idlePower + (vm.peakPower - vm.idlePower) * util) * makespan;
  });

  // Load Balance
  const utils = Array.from(vmUtilizationMap.values());
  const avgUtil = utils.reduce((a, b) => a + b, 0) / vms.length;
  const stdDev = Math.sqrt(utils.reduce((s, u) => s + Math.pow(u - avgUtil, 2), 0) / vms.length);
  const lbIndex = 1 / (1 + stdDev); // Inverse of standard deviation

  // Normalization Factors (Heuristic-based for research)
  const normMakespan = 1000 / (makespan + 1);
  const normCost = 10000 / (totalCost + 1);
  const normEnergy = 50000 / (totalEnergy + 1);
  const normLB = lbIndex * 100;

  return (
    weights.makespan * normMakespan +
    weights.cost * normCost +
    weights.energy * normEnergy +
    weights.loadBalance * normLB
  );
}

/**
 * GENETIC ALGORITHM
 */
export function runGA(
  tasks: Task[], 
  vms: VM[], 
  weights: SimulationWeights,
  popSize = 50,
  maxIter = 100
) {
  const t0 = performance.now();
  // Simple discrete representation: array of VM indices for each task
  let population = Array.from({ length: popSize }, () => 
    tasks.map(() => Math.floor(Math.random() * vms.length))
  );

  const history: { iteration: number; fitness: number }[] = [];

  for (let iter = 0; iter < maxIter; iter++) {
    const scoredPop = population.map(chromosome => {
      const allocations = getAllocations(chromosome, tasks, vms);
      return { chromosome, fitness: evaluateFitness(allocations, tasks, vms, weights) };
    });

    scoredPop.sort((a, b) => b.fitness - a.fitness);
    history.push({ iteration: iter, fitness: scoredPop[0].fitness });

    // Selection & Next Gen
    const nextGen = [scoredPop[0].chromosome, ...scoredPop.slice(1, 10).map(s => s.chromosome)]; // Elitism
    
    while (nextGen.length < popSize) {
      // Crossover
      const p1 = scoredPop[Math.floor(Math.random() * 20)].chromosome;
      const p2 = scoredPop[Math.floor(Math.random() * 20)].chromosome;
      const split = Math.floor(Math.random() * tasks.length);
      const child = [...p1.slice(0, split), ...p2.slice(split)];
      
      // Mutation
      if (Math.random() < 0.1) {
        const idx = Math.floor(Math.random() * tasks.length);
        child[idx] = Math.floor(Math.random() * vms.length);
      }
      nextGen.push(child);
    }
    population = nextGen;
  }

  const best = population[0];
  const t1 = performance.now();
  return { 
    allocations: getAllocations(best, tasks, vms), 
    history, 
    fitness: history[history.length - 1].fitness,
    time: t1 - t0 
  };
}

/**
 * PARTICLE SWARM OPTIMIZATION
 */
export function runPSO(
  tasks: Task[], 
  vms: VM[], 
  weights: SimulationWeights,
  popSize = 50,
  maxIter = 100
) {
  const t0 = performance.now();
  let particles = Array.from({ length: popSize }, () => ({
    pos: tasks.map(() => Math.floor(Math.random() * vms.length)),
    vel: tasks.map(() => Math.random() * 2 - 1),
    pBest: [] as number[],
    pBestScore: -Infinity
  }));

  let gBest = [] as number[];
  let gBestScore = -Infinity;
  const history: { iteration: number; fitness: number }[] = [];

  for (let iter = 0; iter < maxIter; iter++) {
    particles.forEach(p => {
      const allocations = getAllocations(p.pos, tasks, vms);
      const score = evaluateFitness(allocations, tasks, vms, weights);
      
      if (score > p.pBestScore) {
        p.pBestScore = score;
        p.pBest = [...p.pos];
      }
      if (score > gBestScore) {
        gBestScore = score;
        gBest = [...p.pos];
      }
    });

    history.push({ iteration: iter, fitness: gBestScore });

    // Update Velocity and Position
    particles.forEach(p => {
      for (let i = 0; i < tasks.length; i++) {
        const r1 = Math.random();
        const r2 = Math.random();
        p.vel[i] = 0.5 * p.vel[i] + 1.5 * r1 * (p.pBest[i] - p.pos[i]) + 1.5 * r2 * (gBest[i] - p.pos[i]);
        p.pos[i] = Math.round(Math.abs(p.pos[i] + p.vel[i])) % vms.length;
      }
    });
  }

  const t1 = performance.now();
  return { 
    allocations: getAllocations(gBest, tasks, vms), 
    history, 
    fitness: gBestScore,
    time: t1 - t0 
  };
}

/**
 * ANT COLONY OPTIMIZATION
 */
export function runACO(
  tasks: Task[], 
  vms: VM[], 
  weights: SimulationWeights,
  antCount = 20,
  maxIter = 100
) {
  const t0 = performance.now();
  // Pheromone matrix: trails[taskIndex][vmIndex]
  let pheromones = Array.from({ length: tasks.length }, () => 
    Array.from({ length: vms.length }, () => 1.0)
  );

  let gBest = [] as number[];
  let gBestScore = -Infinity;
  const history: { iteration: number; fitness: number }[] = [];

  for (let iter = 0; iter < maxIter; iter++) {
    const antPaths: { path: number[], score: number }[] = [];

    for (let ant = 0; ant < antCount; ant++) {
      const path: number[] = [];
      for (let t = 0; t < tasks.length; t++) {
        // Probabilistic selection
        const probs = vms.map((vm, vIdx) => {
          const pher = pheromones[t][vIdx];
          const visibility = vm.mips / tasks[t].length; // heuristic info
          return pher * Math.pow(visibility, 2);
        });
        const total = probs.reduce((a, b) => a + b, 0);
        let rand = Math.random() * total;
        let selected = 0;
        for (let i = 0; i < vms.length; i++) {
          rand -= probs[i];
          if (rand <= 0) { selected = i; break; }
        }
        path.push(selected);
      }
      const allocations = getAllocations(path, tasks, vms);
      antPaths.push({ path, score: evaluateFitness(allocations, tasks, vms, weights) });
    }

    antPaths.sort((a, b) => b.score - a.score);
    if (antPaths[0].score > gBestScore) {
      gBestScore = antPaths[0].score;
      gBest = [...antPaths[0].path];
    }
    history.push({ iteration: iter, fitness: gBestScore });

    // Evaporation
    pheromones = pheromones.map(row => row.map(v => v * 0.9));
    
    // Update (Best ants deposit)
    antPaths.slice(0, 5).forEach(ant => {
      ant.path.forEach((vIdx, tIdx) => {
        pheromones[tIdx][vIdx] += ant.score / 100;
      });
    });
  }

  const t1 = performance.now();
  return { 
    allocations: getAllocations(gBest, tasks, vms), 
    history, 
    fitness: gBestScore,
    time: t1 - t0 
  };
}

/**
 * HYBRID GA + PSO
 */
export function runHybrid(
  tasks: Task[], 
  vms: VM[], 
  weights: SimulationWeights,
  popSize = 50,
  maxIter = 100
) {
  const t0 = performance.now();
  // 1. GA for 50% iterations
  const gaStages = Math.floor(maxIter / 2);
  const gaResult = runGA(tasks, vms, weights, popSize, gaStages);
  
  // 2. PSO starts with GA result in population
  const history = gaResult.history;
  let particles = Array.from({ length: popSize }, (_, i) => ({
    pos: i === 0 ? gaResult.allocations.map(a => vms.findIndex(v => v.id === a.vmId)) : tasks.map(() => Math.floor(Math.random() * vms.length)),
    vel: tasks.map(() => Math.random() * 2 - 1),
    pBest: [] as number[],
    pBestScore: -Infinity
  }));

  let gBest = [] as number[];
  let gBestScore = -Infinity;

  for (let iter = gaStages; iter < maxIter; iter++) {
    particles.forEach(p => {
      const allocations = getAllocations(p.pos, tasks, vms);
      const score = evaluateFitness(allocations, tasks, vms, weights);
      if (score > p.pBestScore) { p.pBestScore = score; p.pBest = [...p.pos]; }
      if (score > gBestScore) { gBestScore = score; gBest = [...p.pos]; }
    });
    history.push({ iteration: iter, fitness: gBestScore });
    particles.forEach(p => {
      for (let i = 0; i < tasks.length; i++) {
        const r1 = Math.random();
        const r2 = Math.random();
        p.vel[i] = 0.5 * p.vel[i] + 1.5 * r1 * (p.pBest[i] - p.pos[i]) + 1.5 * r2 * (gBest[i] - p.pos[i]);
        p.pos[i] = Math.round(Math.abs(p.pos[i] + p.vel[i])) % vms.length;
      }
    });
  }

  const t1 = performance.now();
  return { 
    allocations: getAllocations(gBest, tasks, vms), 
    history, 
    fitness: gBestScore,
    time: t1 - t0 
  };
}

/**
 * UTILS
 */
export function getAllocations(vmIndices: number[], tasks: Task[], vms: VM[]): Allocation[] {
  const allocations: Allocation[] = [];
  const vmAvailableTime = new Map<string, number>();
  vms.forEach(v => vmAvailableTime.set(v.id, 0));

  // For batch scheduling, we sort tasks by arrival time if dynamic, or just process them
  const sortedTasks = [...tasks].sort((a, b) => a.arrivalTime - b.arrivalTime);
  
  vmIndices.forEach((vmIdx, taskIdx) => {
    const task = sortedTasks[taskIdx];
    const vm = vms[vmIdx];
    const currentAvailable = vmAvailableTime.get(vm.id)!;
    
    const startTime = Math.max(currentAvailable, task.arrivalTime);
    const executionTime = task.length / vm.mips;
    const endTime = startTime + executionTime;

    allocations.push({
      taskId: task.id,
      vmId: vm.id,
      startTime,
      endTime
    });

    vmAvailableTime.set(vm.id, endTime);
  });

  return allocations;
}
