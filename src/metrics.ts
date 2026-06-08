import { Task, VM, Allocation, PerformanceMetrics } from './types';

/**
 * Calculates all research metrics for a given allocation result.
 */
export function calculateMetrics(
  tasks: Task[],
  vms: VM[],
  allocations: Allocation[],
  fitnessScore: number = 0,
  convergenceTime: number = 0
): PerformanceMetrics {
  if (allocations.length === 0) {
    return getEmptyMetrics();
  }

  const makespan = Math.max(...allocations.map(a => a.endTime));
  
  // Waiting times, Turnaround times
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;
  let totalResponseTime = 0;
  let deadlineViolations = 0;

  tasks.forEach(task => {
    const alloc = allocations.find(a => a.taskId === task.id);
    if (alloc) {
      const waitingTime = alloc.startTime - task.arrivalTime;
      const turnaroundTime = alloc.endTime - task.arrivalTime;
      const responseTime = alloc.startTime - task.arrivalTime; // Simplified for batch

      totalWaitingTime += Math.max(0, waitingTime);
      totalTurnaroundTime += Math.max(0, turnaroundTime);
      totalResponseTime += Math.max(0, responseTime);

      if (task.deadline && alloc.endTime > task.deadline) {
        deadlineViolations++;
      }
    }
  });

  const avgWaitingTime = totalWaitingTime / tasks.length;
  const avgTurnaroundTime = totalTurnaroundTime / tasks.length;
  const avgResponseTime = totalResponseTime / tasks.length;
  const throughput = tasks.length / (makespan > 0 ? makespan : 1);

  // Resource Metrics
  const vmUtilization = vms.map(vm => {
    const vmAllocations = allocations.filter(a => a.vmId === vm.id);
    const busyTime = vmAllocations.reduce((sum, a) => sum + (a.endTime - a.startTime), 0);
    return busyTime / (makespan > 0 ? makespan : 1);
  });

  const avgUtilization = vmUtilization.reduce((a, b) => a + b, 0) / vms.length;
  const peakUtilization = Math.max(...vmUtilization);

  // Load Balance Index (Coefficient of Variation)
  const meanUtil = avgUtilization || 1;
  const variance = vmUtilization.reduce((sum, u) => sum + Math.pow(u - meanUtil, 2), 0) / vms.length;
  const loadBalanceIndex = 1 - Math.sqrt(variance) / meanUtil; // Closer to 1 is better

  // Cost & Energy
  let totalCost = 0;
  let totalEnergy = 0;

  vms.forEach((vm, index) => {
    const util = vmUtilization[index];
    const duration = makespan;
    
    // Energy: P_idle + (P_peak - P_idle) * utilization
    const energy = (vm.idlePower + (vm.peakPower - vm.idlePower) * util) * duration;
    totalEnergy += energy;

    // Cost: Base usage + execution cost
    const executionTime = allocations.filter(a => a.vmId === vm.id).reduce((sum, a) => sum + (a.endTime - a.startTime), 0);
    totalCost += executionTime * vm.costPerExecutionUnit;
  });

  const deadlineViolationRate = (deadlineViolations / tasks.length) * 100;
  const slaSatisfaction = 100 - deadlineViolationRate;

  return {
    makespan,
    avgWaitingTime,
    avgTurnaroundTime,
    avgResponseTime,
    throughput,
    avgUtilization,
    peakUtilization,
    loadBalanceIndex: Math.max(0, Math.min(1, loadBalanceIndex)),
    totalCost,
    totalEnergy,
    deadlineViolationRate,
    slaSatisfaction,
    fitnessScore,
    convergenceTime
  };
}

function getEmptyMetrics(): PerformanceMetrics {
  return {
    makespan: 0,
    avgWaitingTime: 0,
    avgTurnaroundTime: 0,
    avgResponseTime: 0,
    throughput: 0,
    avgUtilization: 0,
    peakUtilization: 0,
    loadBalanceIndex: 0,
    totalCost: 0,
    totalEnergy: 0,
    deadlineViolationRate: 0,
    slaSatisfaction: 0,
    fitnessScore: 0,
    convergenceTime: 0
  };
}
