import React, { useState } from 'react';
import { useSimulation } from '../useSimulation';
import { Task } from '../types';
import { 
  Plus, 
  Trash2, 
  FileStack, 
  Search, 
  Download, 
  Upload, 
  Settings2, 
  Edit, 
  Check, 
  X,
  Zap,
  Weight,
  Clock
} from 'lucide-react';

export const TaskManager: React.FC = () => {
  const { tasks, setTasks, updateTask } = useSimulation();
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkCount, setBulkCount] = useState(20);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({});

  const generateTasks = (count: number, type: Task['workloadType'] = 'light') => {
    const newTasks: Task[] = Array.from({ length: count }, (_, i) => {
      let length = 5000 + Math.random() * 15000;
      if (type === 'heavy') length = 30000 + Math.random() * 50000;
      if (type === 'burst') length = 2000 + Math.random() * 40000;

      return {
        id: `T-${tasks.length + i + 1}`,
        length,
        arrivalTime: Math.random() * 10,
        priority: Math.floor(Math.random() * 5) + 1,
        deadline: (length / 1000) + 20 + Math.random() * 40,
        workloadType: type
      };
    });
    setTasks([...tasks, ...newTasks]);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Burst Time (Length)', 'Arrival Time', 'Deadline', 'Priority', 'Type'];
    const rows = tasks.map(t => [t.id, t.length, t.arrivalTime, t.deadline || '', t.priority, t.workloadType || '']);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "metametrics_tasks.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").slice(1);
      const importedTasks: Task[] = lines.filter(l => l.trim()).map((line, i) => {
        const parts = line.split(",");
        return {
          id: parts[0] || `IMP-${i}`,
          length: parseFloat(parts[1]) || 5000,
          arrivalTime: parseFloat(parts[2]) || 0,
          deadline: parseFloat(parts[3]) || 50,
          priority: parseInt(parts[4]) || 3,
          workloadType: (parts[5] as any) || 'light'
        };
      });
      setTasks([...tasks, ...importedTasks]);
    };
    reader.readAsText(file);
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditForm({ ...task });
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      updateTask(editingId, editForm);
      setEditingId(null);
    }
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => t.id.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Workload Schema</h2>
          <p className="text-slate-500 text-sm">Configure task queue with custom burst times and priorities.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl cursor-pointer text-sm font-bold text-slate-700 transition-all border border-slate-200">
            <Upload size={16} />
            Import CSV
            <input type="file" accept=".csv" onChange={importCSV} className="hidden" />
          </label>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all border border-slate-200 text-sm font-bold"
          >
            <Download size={16} />
            Export
          </button>
          <div className="h-8 w-px bg-slate-200 mx-2" />
          <div className="flex items-center gap-2 bg-slate-900 text-white rounded-xl overflow-hidden shadow-lg shadow-slate-900/20">
            <input 
              type="number" 
              value={bulkCount}
              onChange={(e) => setBulkCount(parseInt(e.target.value) || 0)}
              className="w-16 bg-transparent px-4 py-2 text-center outline-none border-r border-white/10 text-sm font-bold"
            />
            <button 
              onClick={() => generateTasks(bulkCount)}
              className="px-4 py-2 hover:bg-slate-800 transition-colors text-sm font-bold flex items-center gap-2"
            >
              <Plus size={16} />
              Bulk Add
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PresetCard title="Light Workload" desc="Short tasks, low MI complexity" icon={<Zap size={18} />} onClick={() => generateTasks(10, 'light')} color="blue" />
        <PresetCard title="Heavy Compute" desc="Long tasks, high MIPS usage" icon={<Weight size={18} />} onClick={() => generateTasks(10, 'heavy')} color="indigo" />
        <PresetCard title="High Burst" desc="High variance arrival patterns" icon={<Clock size={18} />} onClick={() => generateTasks(10, 'burst')} color="purple" />
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 flex-1 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-slate-900 transition-all">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Filter tasks by ID..." 
            className="bg-transparent text-sm w-full outline-none font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm font-bold text-slate-400">
          Showing <span className="text-slate-900">{filteredTasks.length}</span> of {tasks.length}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden border-b-8 border-b-slate-900">
        <div className="max-h-[600px] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                <th className="px-8 py-5">Task Identity</th>
                <th className="px-6 py-5">Burst Time (MI)</th>
                <th className="px-6 py-5">Arrival (s)</th>
                <th className="px-6 py-5">Deadline (s)</th>
                <th className="px-6 py-5">Priority</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTasks.map((task) => (
                <tr key={task.id} className={`hover:bg-slate-50 transition-colors ${editingId === task.id ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-8 py-4 font-mono text-xs font-bold text-slate-800">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${task.workloadType === 'heavy' ? 'bg-indigo-500' : task.workloadType === 'burst' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                      {task.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingId === task.id ? (
                      <input 
                        type="number" 
                        value={editForm.length} 
                        onChange={(e) => setEditForm({...editForm, length: parseFloat(e.target.value)})}
                        className="w-24 bg-white border border-blue-200 rounded px-2 py-1 text-sm font-bold"
                      />
                    ) : (
                      <span className="text-sm font-black text-slate-900">{task.length.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === task.id ? (
                       <input 
                        type="number" 
                        value={editForm.arrivalTime} 
                        onChange={(e) => setEditForm({...editForm, arrivalTime: parseFloat(e.target.value)})}
                        className="w-16 bg-white border border-blue-200 rounded px-2 py-1 text-sm text-slate-600"
                      />
                    ) : (
                      <span className="text-sm text-slate-500 font-medium">{task.arrivalTime.toFixed(2)}s</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === task.id ? (
                        <input 
                        type="number" 
                        value={editForm.deadline} 
                        onChange={(e) => setEditForm({...editForm, deadline: parseFloat(e.target.value)})}
                        className="w-16 bg-white border border-blue-200 rounded px-2 py-1 text-sm text-slate-600"
                      />
                    ) : (
                      <span className="text-sm text-slate-400 font-mono">{task.deadline?.toFixed(1) || 'N/A'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                     {editingId === task.id ? (
                        <select 
                          value={editForm.priority}
                          onChange={(e) => setEditForm({...editForm, priority: parseInt(e.target.value)})}
                          className="text-xs font-bold border border-blue-200 rounded px-1 py-1"
                        >
                          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                     ) : (
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-1.5 h-3 rounded-full ${i < task.priority ? 'bg-slate-800' : 'bg-slate-100'}`} 
                          />
                        ))}
                      </div>
                     )}
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {editingId === task.id ? (
                         <>
                           <button onClick={saveEdit} className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow-sm transition-colors border border-green-600">
                             <Check size={14} />
                           </button>
                           <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors">
                             <X size={14} />
                           </button>
                         </>
                       ) : (
                         <>
                           <button onClick={() => startEdit(task)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                             <Edit size={16} />
                           </button>
                           <button onClick={() => removeTask(task.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                             <Trash2 size={16} />
                           </button>
                         </>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PresetCard = ({ title, desc, icon, onClick, color }: any) => {
  const colors = {
    blue: 'border-blue-100 bg-blue-50 text-blue-600 hover:border-blue-400',
    indigo: 'border-indigo-100 bg-indigo-50 text-indigo-600 hover:border-indigo-400',
    purple: 'border-purple-100 bg-purple-50 text-purple-600 hover:border-purple-400'
  };
  
  return (
    <button 
      onClick={onClick}
      className={`p-6 rounded-2xl border text-left flex items-start gap-4 transition-all duration-300 group ${colors[color as keyof typeof colors]}`}
    >
      <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white group-hover:scale-110 transition-transform shadow-sm">
        {icon}
      </div>
      <div>
        <h4 className="font-black text-sm uppercase tracking-tight">{title}</h4>
        <p className="text-[11px] font-medium opacity-70 leading-relaxed">{desc}</p>
      </div>
    </button>
  );
};
