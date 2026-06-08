import React, { useMemo } from 'react';
import { useSimulation } from '../useSimulation';
import { getAIRecommendation } from '../aiEngine';
import { 
  Zap, 
  Cpu, 
  Globe, 
  Database, 
  Clock, 
  Target, 
  BarChart3,
  BrainCircuit,
  TrendingUp,
  Activity,
  AlertCircle,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, Tooltip, YAxis } from 'recharts';

export const Dashboard: React.FC = () => {
  const { tasks, vms, results, weights, lastRunAlg } = useSimulation();

  const totalLength = tasks.reduce((s: any, t: string | any[]) => s + t.length, 0);
  const totalMips = vms.reduce((s: any, v: { mips: any; }) => s + v.mips, 0);
  
  // AI Recommendation for performance audit
  const aiRec = useMemo(() => getAIRecommendation(tasks, vms, weights), [tasks, vms, weights]);

  // Find the result for the last run algorithm
  const lastResult = useMemo(() => {
    if (!lastRunAlg) return null;
    if (lastRunAlg === 'All') return results[results.length - 1]; 
    return results.find((r: { algorithm: any; }) => r.algorithm === lastRunAlg);
  }, [results, lastRunAlg]);

  const handlePrint = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const element = document.getElementById('dashboard-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('CloudSim_Research_Report.pdf');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      // Fallback to basic print if canvas fails
      window.print();
    }
  };

  const vmsNeeded = Math.ceil(totalLength / 25000) || 1; 
  const utilizationGap = vms.length - vmsNeeded;

  const chartData = vms.map((v: { id: any; mips: any; }) => ({
    id: v.id,
    mips: v.mips,
    utilization: results.length > 0 ? (results[0].metrics.avgUtilization * 100) : (Math.random() * 20 + 10)
  }));

  const slaStatus = useMemo(() => {
    if (!lastResult) return { value: "Projected", desc: "Deadlines within safe windows.", positive: true };
    const sla = lastResult.metrics.slaSatisfaction;
    if (sla > 95) return { value: "Critical Success", desc: "All core constraints satisfied.", positive: true };
    if (sla > 85) return { value: "Warning", desc: "Minor deadline skew detected.", positive: false };
    return { value: "SLA Failure", desc: "Significant deadline violations.", positive: false };
  }, [lastResult]);

  const varianceStatus = useMemo(() => {
    if (!lastResult) return { value: "Stability", desc: "Distribution mapping optimal.", positive: true };
    const lb = lastResult.metrics.loadBalanceIndex;
    if (lb < 0.1) return { value: "Ideal", desc: "Near-perfect load equilibrium.", positive: true };
    if (lb < 0.25) return { value: "Standard", desc: "Normal cluster distribution.", positive: true };
    return { value: "Skewed", desc: "Detected bottleneck nodes.", positive: false };
  }, [lastResult]);

  return (
    <div id="dashboard-content" className="space-y-8 pb-10 print:p-8">
      <div data-html2canvas-ignore className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Deployment</h2>
          <p className="text-slate-500 font-medium font-sans">Strategic resource telemetry and AI optimization audit.</p>
        </div>
        <div className="flex gap-3">
          <div className="hidden xl:flex items-center gap-3 px-6 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Recommended: {aiRec.primary.algorithm}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Database size={20} className="text-indigo-600" />} 
          label="Workload Volume" 
          value={(totalLength / 1000).toFixed(0) + 'k'} 
          unit="MI" 
          trend={tasks.length > 60 ? "High Load" : "Balanced Queue"} 
          color="bg-indigo-50" 
        />
        <StatCard 
          icon={<Cpu size={20} className="text-blue-600" />} 
          label="Cluster Scale" 
          value={vms.length} 
          unit="Nodes" 
          trend={`${totalMips.toLocaleString()} MIPS`} 
          color="bg-blue-50" 
        />
        <StatCard 
          icon={<Globe size={20} className="text-emerald-600" />} 
          label="Processing Power" 
          value={(totalMips / (vms.length || 1)).toFixed(0)} 
          unit="Avg. MIPS" 
          trend={totalMips / (vms.length || 1) > 1500 ? "Compute Bound" : "IO Bound"} 
          color="bg-emerald-50" 
        />
        <StatCard 
          icon={<Target size={20} className="text-amber-600" />} 
          label="Empirical Leader" 
          value={results.length > 0 ? results.sort((a: { metrics: { fitnessScore: number; }; },b: { metrics: { fitnessScore: number; }; }) => b.metrics.fitnessScore - a.metrics.fitnessScore)[0].algorithm : '---'} 
          unit={results.length > 0 ? "Best Score" : ""} 
          trend={results.length > 0 ? (Math.max(...results.map((r: { metrics: { fitnessScore: any; }; }) => r.metrics.fitnessScore))).toFixed(1) : "Optimality"} 
          color="bg-amber-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Execution Context */}
          {results.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden border-l-8 border-l-indigo-500 transition-all hover:bg-slate-950"
            >
              <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none rotate-12">
                <Clock size={160} />
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Performance Leader</span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">{(results.sort((a: { metrics: { fitnessScore: number; }; },b: { metrics: { fitnessScore: number; }; }) => b.metrics.fitnessScore - a.metrics.fitnessScore)[0].executionTime).toFixed(1)}ms execution</span>
                  </div>
                  <h3 className="text-4xl font-black tracking-tighter">
                    {results.sort((a: { metrics: { fitnessScore: number; }; },b: { metrics: { fitnessScore: number; }; }) => b.metrics.fitnessScore - a.metrics.fitnessScore)[0].algorithm} <span className="text-xl text-slate-500 font-bold">Optimization</span>
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-8 pr-4">
                  <div className="text-right border-r border-white/10 pr-8">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Makespan</div>
                    <div className="text-2xl font-black text-blue-400 font-mono">{results.sort((a: { metrics: { fitnessScore: number; }; },b: { metrics: { fitnessScore: number; }; }) => b.metrics.fitnessScore - a.metrics.fitnessScore)[0].metrics.makespan.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Efficiency</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">{(results.sort((a: { metrics: { fitnessScore: number; }; },b: { metrics: { fitnessScore: number; }; }) => b.metrics.fitnessScore - a.metrics.fitnessScore)[0].metrics.avgUtilization * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/5 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-sm flex-1 w-full">
                  <BrainCircuit className="text-indigo-400 shrink-0" size={24} />
                  <div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Decision Intelligence Check</div>
                    <p className="text-xs font-bold text-indigo-100 leading-relaxed">
                      {results.sort((a: { metrics: { fitnessScore: number; }; },b: { metrics: { fitnessScore: number; }; }) => b.metrics.fitnessScore - a.metrics.fitnessScore)[0].algorithm === aiRec.primary.algorithm 
                        ? `Optimal Selection confirmed. The agent's performance aligns perfectly with the predicted strategy vector.`
                        : `Empirical Variance. Although ${results.sort((a: { metrics: { fitnessScore: number; }; },b: { metrics: { fitnessScore: number; }; }) => b.metrics.fitnessScore - a.metrics.fitnessScore)[0].algorithm} showed strong results, the AI persists in recommending ${aiRec.primary.algorithm} for maximum consistency.`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                   <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Validation</div>
                   <div className={`text-sm font-black px-3 py-1 rounded-full ${results.sort((a: { metrics: { fitnessScore: number; }; },b: { metrics: { fitnessScore: number; }; }) => b.metrics.fitnessScore - a.metrics.fitnessScore)[0].algorithm === aiRec.primary.algorithm ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'}`}>
                     {results.sort((a: { metrics: { fitnessScore: number; }; },b: { metrics: { fitnessScore: number; }; }) => b.metrics.fitnessScore - a.metrics.fitnessScore)[0].algorithm === aiRec.primary.algorithm ? 'MATCHED' : 'EMPIRICAL GAP'}
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Active Cluster Analysis</h1>
                <p className="text-sm text-slate-500 font-medium">Telemetry distribution across heterogeneous resource nodes.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 rounded-xl text-[10px] font-black text-white uppercase tracking-widest">
                Real-time Data
              </div>
            </div>

            <div className="h-64 mb-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700}} />
                  <YAxis hide domain={[0, 3000]} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="mips" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-50">
              <AnalysisBox 
                title="Infrastructure Scale" 
                value={`${vmsNeeded} Units`} 
                desc={utilizationGap >= 0 ? "Cluster headroom sufficient." : "Resource exhaustion risk detected."}
                icon={utilizationGap >= 0 ? <TrendingUp size={16} /> : <AlertCircle size={16} />}
                positive={utilizationGap >= 0}
              />
              <AnalysisBox 
                title="Compute Variance" 
                value={varianceStatus.value} 
                desc={varianceStatus.desc}
                icon={<Globe size={16} />}
                positive={varianceStatus.positive}
              />
              <AnalysisBox 
                title="SLA Compliance" 
                value={slaStatus.value} 
                desc={slaStatus.desc}
                icon={<CheckCircle2 size={16} />}
                positive={slaStatus.positive}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Resource Telemetry Monitor */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col h-full border-b-8 border-b-slate-900">
            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
              <Activity size={20} className="text-indigo-600" />
              Node Telemetry
            </h3>
            <div className="space-y-8 flex-1">
              {vms.slice(0, 6).map((v: { id: any; }, i: number) => {
                const util = (lastResult?.metrics.avgUtilization || (0.2 + (i*0.1))) * 100;
                return (
                  <div key={v.id} className="space-y-2.5">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{v.id} Node</span>
                      <span className="text-[10px] font-mono font-bold text-slate-400">{(util).toFixed(1)}% Load</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200 p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, util)}%` }}
                        className={`h-full rounded-full transition-all duration-1000 ${util > 80 ? 'bg-red-500' : 'bg-slate-900'}`} 
                      />
                    </div>
                  </div>
                );
              })}
              {vms.length > 6 && (
                <div className="text-center text-[10px] font-black text-slate-400 py-3 border-t border-slate-100 mt-2">
                  + {vms.length - 6} ADDITIONAL INSTANCES
                </div>
              )}
            </div>
            
            <div className="mt-10">
               <div className="bg-indigo-600 rounded-2xl p-5 shadow-xl shadow-indigo-200 text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 text-white/10 group-hover:scale-110 transition-transform">
                   <BrainCircuit size={48} />
                 </div>
                 <div className="relative z-10">
                   <div className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <Zap size={14} className="text-amber-400" />
                     Strategy Delta
                   </div>
                   <p className="text-[10px] text-indigo-50 font-medium leading-relaxed mb-4">
                     Primary Vector: <span className="font-black text-white">{aiRec.primary.algorithm}</span>
                     <br />
                     Target Confidence: <span className="font-black text-white">{aiRec.primary.confidence}%</span>
                   </p>
                   <p className="text-[10px] text-indigo-100 italic">
                     {aiRec.comparison}
                   </p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, unit, trend, color }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-b-4 border-b-slate-100"
  >
    <div className={`p-3 rounded-2xl w-fit mb-5 ${color}`}>
      {icon}
    </div>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</div>
    <div className="flex items-baseline gap-1 mb-3">
      <span className="text-3xl font-black text-slate-900 tracking-tighter">{value}</span>
      <span className="text-xs font-bold text-slate-400">{unit}</span>
    </div>
    <div className="flex items-center gap-2">
      <div className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${trend.includes('High') || trend.includes('Node') ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
        {trend}
      </div>
    </div>
  </motion.div>
);

const AnalysisBox = ({ title, value, desc, icon, positive }: any) => (
  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-indigo-100 transition-all">
    <div className="flex items-center gap-2 mb-4">
      <div className={positive ? 'text-indigo-600' : 'text-red-500'}>{icon}</div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
    </div>
    <div className="text-xl font-black text-slate-900 mb-1 tracking-tight">{value}</div>
    <p className="text-[10px] text-slate-500 font-bold leading-tight uppercase tracking-tighter">{desc}</p>
  </div>
);

const CheckCircle2 = ({ size, className }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} height={size} 
    viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="3" 
    strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);


