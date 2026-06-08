import React, { useState } from 'react';
import { useSimulation } from '../useSimulation';
import { Play, RotateCcw, Sliders, Target, Zap, DollarSign, Scale, Layers } from 'lucide-react';
import { AlgorithmType } from '../types';
import { motion } from 'motion/react';

export const SimulationControls: React.FC = () => {
  const { weights, setWeights, runSimulation, isSimulating, clearResults, tasks, vms } = useSimulation();
  const [iterations, setIterations] = useState(100);
  const [selectedAlg, setSelectedAlg] = useState<AlgorithmType | 'All'>('All');

  const handleWeightChange = (key: keyof typeof weights, value: number) => {
    setWeights({ ...weights, [key]: value });
  };

  const isDisabled = tasks.length === 0 || vms.length === 0 || isSimulating;

  const handleRun = () => {
    runSimulation(iterations, selectedAlg === 'All' ? undefined : selectedAlg);
  };

  const algs: (AlgorithmType | 'All')[] = ['All', 'GA', 'PSO', 'ACO', 'Hybrid'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Weight Adjusters */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Sliders size={20} /></div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Optimization Weights</h3>
            <p className="text-slate-500 text-xs">Define Multi-Objective priority coefficients (total relative weights).</p>
          </div>
        </div>

        <div className="space-y-8">
          <WeightSlider 
            label="Makespan (Time Efficiency)" 
            icon={<Target size={16} className="text-blue-500" />}
            value={weights.makespan} 
            onChange={(v) => handleWeightChange('makespan', v)} 
          />
          <WeightSlider 
            label="Execution Cost" 
            icon={<DollarSign size={16} className="text-green-500" />}
            value={weights.cost} 
            onChange={(v) => handleWeightChange('cost', v)} 
          />
          <WeightSlider 
            label="Energy Consumption" 
            icon={<Zap size={16} className="text-yellow-500" />}
            value={weights.energy} 
            onChange={(v) => handleWeightChange('energy', v)} 
          />
          <WeightSlider 
            label="Load Balancing Index" 
            icon={<Scale size={16} className="text-purple-500" />}
            value={weights.loadBalance} 
            onChange={(v) => handleWeightChange('loadBalance', v)} 
          />
        </div>
      </div>

      {/* Execution Control */}
      <div className="space-y-6">
        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl border-b-8 border-b-blue-600">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
            <Layers size={18} className="text-blue-400" />
            Simulation Workbench
          </h3>
          
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-black mb-3">Target Algorithm</label>
              <div className="grid grid-cols-3 gap-2">
                {algs.map(alg => (
                  <button 
                    key={alg}
                    onClick={() => setSelectedAlg(alg)}
                    className={`px-2 py-2 rounded-xl text-[10px] font-black border transition-all ${
                      selectedAlg === alg 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {alg}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-black mb-3">Evaluation Depth</label>
              <input 
                type="number" 
                value={iterations} 
                onChange={(e) => setIterations(Math.max(10, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm font-bold"
              />
            </div>
            
            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Environment</span>
              <span className={isDisabled ? 'text-red-500 text-[10px] font-black uppercase' : 'text-green-400 text-[10px] font-black uppercase'}>
                {isDisabled ? 'Incomplete' : 'Ready'}
              </span>
            </div>
          </div>

          <button 
            id="btn-run-simulation"
            onClick={handleRun}
            disabled={isDisabled}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${
              isSimulating 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isSimulating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Running Selection...</span>
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                <span>Execute Evaluation</span>
              </>
            )}
          </button>

          <button 
            id="btn-reset-results"
            onClick={() => clearResults()}
            className="w-full mt-4 py-4 bg-transparent border border-slate-800 text-slate-500 rounded-2xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
          >
            <RotateCcw size={14} />
            Purge Results
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl">
          <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">Simulation Insight</h4>
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            {selectedAlg === 'All' 
              ? "Comparative mode executes all metaheuristics concurrently for a full head-to-head analysis."
              : `Focus mode evaluates ${selectedAlg} exclusively, allowing for deeper refinement across ${iterations} iterations.`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

const WeightSlider = ({ label, value, onChange, icon }: any) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>
      <span className="text-xs font-mono font-bold px-2 py-1 bg-slate-100 rounded text-slate-600">
        {(value * 100).toFixed(0)}%
      </span>
    </div>
    <input 
      type="range" 
      min="0" 
      max="1" 
      step="0.05" 
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
  </div>
);
