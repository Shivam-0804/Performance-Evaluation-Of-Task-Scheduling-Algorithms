import React, { useMemo } from 'react';
import { useSimulation } from '../useSimulation';
import { getAIRecommendation } from '../aiEngine';
import { BrainCircuit, CheckCircle2, AlertTriangle, Lightbulb, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export const AIInsights: React.FC = () => {
  const { 
    tasks, 
    vms, 
    weights
  } = useSimulation();

  const rec = useMemo(() => getAIRecommendation(tasks, vms, weights), [tasks, vms, weights]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI Strategy Engine</h2>
          <p className="text-slate-500 font-medium">Multi-modal metaheuristic selection based on active workload entropy.</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-900/20">
          <BrainCircuit size={16} className="animate-pulse" />
          Neural Core Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Primary recommendation */}
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden group border-b-8 border-b-indigo-600 transition-all hover:shadow-xl">
           <div className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
             <Trophy size={200} />
           </div>
           
           <div className="relative z-10">
             <div className="flex items-center gap-2 mb-6">
               <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg ring-4 ring-indigo-50">Primary Vector</span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rec.primary.confidence}% Efficiency Forecast</span>
             </div>
             
             <h3 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter">
               {rec.primary.algorithm} <span className="text-xl text-slate-400 font-bold">Optimization</span>
             </h3>
             
             <p className="text-slate-600 mb-8 max-w-md font-medium leading-relaxed">
               {rec.comparison}
             </p>
           </div>
        </div>

        {/* Secondary recommendation */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 shadow-sm relative overflow-hidden group border-b-8 border-b-slate-400">
           <div className="relative z-10">
             <div className="flex items-center gap-2 mb-6">
               <span className="px-3 py-1 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Alternative Path</span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rec.secondary.confidence}% Peak Stability</span>
             </div>
             
             <h3 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter">
               {rec.secondary.algorithm} <span className="text-lg text-slate-400 font-bold">Runner-up</span>
             </h3>
             
             <div className="space-y-4">
               {rec.expectedTradeoffs.map((t, i) => (
                 <div key={i} className="flex gap-3 text-slate-600 text-sm font-medium italic">
                   <div className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-slate-400" />
                   {t}
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-green-500" size={18} />
            Structural Reasoning
          </h3>
          <div className="space-y-4">
            {rec.reasoning.map((r, i) => (
              <div key={i} className="flex gap-4 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
                  <Lightbulb size={16} />
                </div>
                <p className="text-sm font-medium text-slate-600 leading-relaxed">{r}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-white shadow-xl shadow-slate-900/40">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Zap className="text-amber-400" size={18} />
            Operational Forecast
          </h3>
          <div className="space-y-6">
            <ForecastItem label="Throughput Potential" value="Optimal" color="text-green-400" />
            <ForecastItem label="Energy Footprint" value="Standard" color="text-blue-400" />
            <ForecastItem label="Vulnerability Risk" value="Minimal" color="text-emerald-400" />
            <ForecastItem label="Real-time Latency" value="Critical Low" color="text-amber-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ForecastItem = ({ label, value, color }: any) => (
  <div className="flex justify-between items-center group/item hover:translate-x-1 transition-transform">
    <span className="text-xs font-bold text-slate-400 group-hover/item:text-slate-300 transition-colors">{label}</span>
    <span className={`text-xs font-black uppercase tracking-widest ${color}`}>{value}</span>
  </div>
);

const Trophy = ({ size, className }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} height={size} 
    viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="1.5" 
    strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 22V18" />
    <path d="M14 22V18" />
    <path d="M12 4v10" />
    <path d="M12 18a6 6 0 0 1-6-6V9h12v3a6 6 0 0 1-6 6Z" />
  </svg>
);
