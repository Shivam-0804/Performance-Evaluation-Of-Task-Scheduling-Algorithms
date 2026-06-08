import React, { useState } from 'react';
import { useSimulation } from '../useSimulation';
import { VM } from '../types';
import { Cpu, Zap, DollarSign, Trash2, Plus, Edit, Check, X } from 'lucide-react';

export const ResourceManager: React.FC = () => {
  const { vms, setVms, updateVm } = useSimulation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<VM>>({});

  const addRandomVM = () => {
    const id = `VM-${vms.length + 1}`;
    const newVM: VM = {
      id,
      mips: 800 + Math.random() * 1500,
      costPerExecutionUnit: 0.4 + Math.random() * 1.5,
      idlePower: 40 + Math.random() * 50,
      peakPower: 180 + Math.random() * 300
    };
    setVms([...vms, newVM]);
  };

  const removeVM = (id: string) => setVms(vms.filter(v => v.id !== id));

  const startEdit = (vm: VM) => {
    setEditingId(vm.id);
    setEditForm({ ...vm });
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      updateVm(editingId, editForm);
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Infrastructure Cluster</h2>
          <p className="text-slate-500 text-sm">Configure heterogeneous processing units for scheduling evaluation.</p>
        </div>
        <button 
          id="btn-add-vm"
          onClick={addRandomVM}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/20 font-bold"
        >
          <Plus size={20} />
          Provision Unit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vms.map((vm) => (
          <div key={vm.id} className={`bg-white rounded-3xl border shadow-sm p-6 relative group transition-all duration-300 ${editingId === vm.id ? 'border-indigo-400 ring-2 ring-indigo-100 shadow-xl' : 'border-slate-200 hover:border-indigo-300 hover:shadow-xl'}`}>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {editingId === vm.id ? (
                <>
                  <button onClick={saveEdit} className="text-green-600 hover:text-green-700 p-1.5 bg-green-50 rounded-lg"><Check size={16} /></button>
                  <button onClick={() => setEditingId(null)} className="text-slate-400 p-1.5 bg-slate-50 rounded-lg"><X size={16} /></button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => startEdit(vm)}
                    className="text-slate-300 hover:text-blue-500 p-1 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => removeVM(vm.id)}
                    className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
            </div>
            
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors mb-5 ${editingId === vm.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
              <Cpu size={24} />
            </div>
            
            <h3 className="text-lg font-black text-slate-900 mb-1">{vm.id}</h3>
            <div className="text-[10px] font-black text-slate-400 mb-5 uppercase tracking-widest border-b border-slate-50 pb-2">Computation Node</div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Processing Capacity</div>
                {editingId === vm.id ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={editForm.mips} 
                      onChange={(e) => setEditForm({...editForm, mips: parseFloat(e.target.value)})}
                      className="w-full bg-slate-50 border border-indigo-200 rounded px-2 py-1 text-sm font-black"
                    />
                    <span className="text-[10px] font-bold text-slate-400">MIPS</span>
                  </div>
                ) : (
                  <div className="text-xl font-black text-slate-900">{vm.mips.toFixed(0)} <span className="text-[10px] text-slate-400 font-bold uppercase">MIPS</span></div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Cost/Unit</div>
                  {editingId === vm.id ? (
                    <input 
                      type="number" 
                      value={editForm.costPerExecutionUnit} 
                      onChange={(e) => setEditForm({...editForm, costPerExecutionUnit: parseFloat(e.target.value)})}
                      className="w-full bg-slate-50 border border-indigo-200 rounded px-2 py-1 text-xs font-bold"
                    />
                  ) : (
                    <div className="text-sm font-bold text-slate-800">${vm.costPerExecutionUnit.toFixed(2)}</div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Peak Energy</div>
                  {editingId === vm.id ? (
                    <input 
                      type="number" 
                      value={editForm.peakPower} 
                      onChange={(e) => setEditForm({...editForm, peakPower: parseFloat(e.target.value)})}
                      className="w-full bg-slate-50 border border-indigo-200 rounded px-2 py-1 text-xs font-bold"
                    />
                  ) : (
                    <div className="text-sm font-bold text-slate-800">{vm.peakPower.toFixed(0)}W</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {vms.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
             <p className="text-slate-400 font-bold">No active resources found. Create a VM to begin simulation.</p>
          </div>
        )}
      </div>
    </div>
  );
};
