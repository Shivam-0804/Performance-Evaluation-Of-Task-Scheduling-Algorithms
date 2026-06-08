import React, { useMemo } from 'react';
import { useSimulation } from '../useSimulation';
import { getAIRecommendation } from '../aiEngine';
import { GanttChart } from './GanttChart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Activity, Clock, Zap, DollarSign, Target, Trophy, Info } from 'lucide-react';
import { motion } from 'motion/react';

export const ResultsDashboard: React.FC = () => {
  const { results, tasks, vms, weights } = useSimulation();

  const rec = useMemo(() => getAIRecommendation(tasks, vms, weights), [tasks, vms, weights]);

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      if (a.algorithm === rec.primary.algorithm) return -1;
      if (b.algorithm === rec.primary.algorithm) return 1;
      return b.metrics.fitnessScore - a.metrics.fitnessScore;
    });
  }, [results, rec]);

  if (results.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-slate-500 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <Activity size={48} className="mb-4 opacity-20" />
        <h3 className="text-xl font-semibold">No Simulation Data</h3>
        <p>Run a simulation to see comparative metaheuristic performance.</p>
      </div>
    );
  }

  const makespanData = sortedResults.map(r => ({ name: r.algorithm, value: parseFloat(r.metrics.makespan.toFixed(2)) }));
  const energyData = sortedResults.map(r => ({ name: r.algorithm, value: parseFloat(r.metrics.totalEnergy.toFixed(2)) }));
  const costData = sortedResults.map(r => ({ name: r.algorithm, value: parseFloat(r.metrics.totalCost.toFixed(2)) }));
  const convergenceData = sortedResults[0].convergenceHistory.map((_, idx) => {
    const entry: any = { iteration: idx };
    sortedResults.forEach(r => {
      entry[r.algorithm] = r.convergenceHistory[idx]?.fitness.toFixed(2);
    });
    return entry;
  });

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-8 pb-12">
      {/* AI Recommendation Badge / Alert */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-indigo-600 rounded-3xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-900/20"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <Trophy size={32} className="text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Strategy Validation</h2>
            <p className="text-indigo-100 text-sm font-medium">The decision engine has identified <span className="font-black text-white">{rec.primary.algorithm}</span> as the optimal vector for this topology.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/20 px-4 py-2 rounded-xl border border-white/20 text-xs font-black uppercase tracking-widest">
            {rec.primary.confidence}% confidence
          </div>
        </div>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Best Makespan" value={Math.min(...results.map(r => r.metrics.makespan)).toFixed(2)} unit="s" icon={<Clock />} color="text-blue-600" />
        <MetricCard label="Lowest Cost" value={Math.min(...results.map(r => r.metrics.totalCost)).toFixed(2)} unit="$" icon={<DollarSign />} color="text-green-600" />
        <MetricCard label="Energy Savings" value={Math.min(...results.map(r => r.metrics.totalEnergy)).toFixed(0)} unit="J" icon={<Zap />} color="text-yellow-600" />
        <MetricCard label="Optimal Fitness" value={Math.max(...results.map(r => r.metrics.fitnessScore)).toFixed(2)} unit="pts" icon={<Target />} color="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Makespan Chart */}
        <ChartCard title="Makespan Comparison (Lower is Better)" icon={<Clock size={18} />}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={makespanData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {makespanData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={sortedResults[index].algorithm === rec.primary.algorithm ? '#4f46e5' : '#cbd5e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Convergence Chart */}
        <ChartCard title="Convergence Rate (Fitness vs Iterations)" icon={<Activity size={18} />}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={convergenceData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="iteration" />
              <YAxis />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="top" height={36}/>
              {sortedResults.map((r, i) => (
                <Line 
                  key={r.algorithm} 
                  type="monotone" 
                  dataKey={r.algorithm} 
                  stroke={r.algorithm === rec.primary.algorithm ? '#4f46e5' : COLORS[i + 1 % COLORS.length]} 
                  strokeWidth={r.algorithm === rec.primary.algorithm ? 3 : 1.5} 
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Task Allocation Gantt Charts for ALL algos */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg"><Activity size={20} /></div>
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Comparative Gantt Scenarios</h3>
            <p className="text-sm text-slate-500 font-medium font-sans">Visualizing task-on-node scheduling distribution for each metaheuristic.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          {sortedResults.map((r) => (
            <div key={r.algorithm} className="relative">
              {r.algorithm === rec.primary.algorithm && (
                <div className="absolute -top-3 left-6 z-10 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  AI Recommended Choice
                </div>
              )}
              <GanttChart result={r} />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Total Execution Cost" icon={<DollarSign size={18} />} className="lg:col-span-1">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={costData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {costData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={sortedResults[index].algorithm === rec.primary.algorithm ? '#4f46e5' : COLORS[index + 1 % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Energy Consumption Analysis" icon={<Zap size={18} />} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={energyData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {energyData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={sortedResults[index].algorithm === rec.primary.algorithm ? '#4f46e5' : COLORS[index + 1 % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden shadow-indigo-900/5">
        <div className="px-8 py-5 border-b border-slate-100 bg-white flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-lg tracking-tight">Performance Audit Matrix</h3>
            <p className="text-xs text-slate-500 font-medium">Detailed empirical metrics for each agent.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
            Certified Analytics
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-700 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-4 border-b border-slate-100 italic">Protocol Agent</th>
                <th className="px-8 py-4 border-b border-slate-100">Avg Utilization</th>
                <th className="px-8 py-4 border-b border-slate-100">Load Factor</th>
                <th className="px-8 py-4 border-b border-slate-100">Energy Drain (J)</th>
                <th className="px-8 py-4 border-b border-slate-100">SLA Success</th>
                <th className="px-10 py-4 border-b border-slate-100">Convergence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {sortedResults.map((r, i) => (
                <tr key={r.algorithm} className={`hover:bg-slate-50/80 transition-colors group ${r.algorithm === rec.primary.algorithm ? 'bg-indigo-50/30' : ''}`}>
                  <td className="px-8 py-5 font-black text-slate-900 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${r.algorithm === rec.primary.algorithm ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`} />
                    {r.algorithm}
                    {r.algorithm === rec.primary.algorithm && (
                      <span className="ml-2 px-2 py-0.5 bg-indigo-600 text-[8px] font-black text-white uppercase rounded">Optimal Choice</span>
                    )}
                  </td>
                  <td className="px-8 py-5 font-mono text-slate-600">{(r.metrics.avgUtilization * 100).toFixed(1)}%</td>
                  <td className="px-8 py-5 font-mono text-slate-500">{r.metrics.loadBalanceIndex.toFixed(3)}</td>
                  <td className="px-8 py-5 font-mono text-slate-600">{r.metrics.totalEnergy.toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${r.metrics.slaSatisfaction > 90 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {r.metrics.slaSatisfaction.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-10 py-5 font-mono text-slate-400 group-hover:text-indigo-600 transition-colors">{r.metrics.convergenceTime.toFixed(0)} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, unit, icon, color, subValue }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
  >
    <div className="absolute -right-2 -bottom-2 opacity-5 scale-150 transform -rotate-12 group-hover:scale-110 transition-transform duration-500">
      {icon}
    </div>
    <div className="flex items-center gap-3 mb-2">
      <div className={`p-2 rounded-lg bg-slate-50 ${color}`}>{icon}</div>
      <span className="text-sm font-medium text-slate-500 uppercase tracking-tight">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      <span className="text-xs font-semibold text-slate-400">{unit}</span>
    </div>
    {subValue && <div className="mt-2 text-xs text-slate-400">{subValue}</div>}
  </motion.div>
);

const ChartCard = ({ title, icon, children, className }: any) => (
  <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm ${className}`}>
    <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
      <div className="text-blue-500">{icon}</div>
      <h3 className="font-bold text-slate-800">{title}</h3>
    </div>
    {children}
  </div>
);
