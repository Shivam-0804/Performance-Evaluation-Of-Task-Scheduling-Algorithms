import React from 'react';
import { useSimulation } from '../useSimulation';
import { Clock } from 'lucide-react';
import { SimulationResult } from '../types';

interface GanttChartProps {
  result: SimulationResult;
}

export const GanttChart: React.FC<GanttChartProps> = ({ result }) => {
  const { vms } = useSimulation();

  if (!result) return null;

  const maxTime = result.metrics.makespan;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Clock size={20} /></div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Task Allocation Gantt</h3>
            <p className="text-xs text-slate-500">Visualization for: <span className="font-bold text-indigo-600">{result.algorithm} Protocol</span></p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-sm" />
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Task Block</span>
          </div>
          <div className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded">
            Horizon: {maxTime.toFixed(2)}s
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px] space-y-4">
          {vms.map((vm) => {
            const vmAllocations = result.allocations.filter(a => a.vmId === vm.id);
            return (
              <div key={vm.id} className="flex items-center gap-4 group">
                <div className="w-24 text-sm font-bold text-slate-600">{vm.id}</div>
                <div className="flex-1 h-10 bg-slate-50 rounded-lg relative border border-slate-100 group-hover:border-indigo-200 transition-colors">
                  {vmAllocations.map((alloc) => (
                    <div 
                      key={alloc.taskId}
                      className="absolute h-full bg-indigo-500 border border-white/20 rounded-[2px] transition-all hover:bg-indigo-600 hover:z-20 cursor-help"
                      style={{
                        left: `${(alloc.startTime / maxTime) * 100}%`,
                        width: `${((alloc.endTime - alloc.startTime) / maxTime) * 100}%`
                      }}
                      title={`${alloc.taskId} (${(alloc.endTime - alloc.startTime).toFixed(2)}s)`}
                    >
                      <div className="text-[8px] text-white font-bold h-full flex items-center justify-center overflow-hidden px-1 truncate">
                        {alloc.taskId}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Time Labels */}
          <div className="flex items-center gap-4 border-t border-slate-100 pt-2 ml-24">
             {Array.from({ length: 6 }).map((_, i) => (
               <div 
                 key={i} 
                 className="flex-1 text-[10px] font-mono text-slate-400 border-l border-slate-100 pl-1"
               >
                 {((maxTime / 5) * i).toFixed(1)}s
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
