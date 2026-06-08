import React from 'react';
import { 
  Activity, 
  Database, 
  Cpu, 
  Settings, 
  BarChart3, 
  FileText, 
  BrainCircuit,
  LayoutDashboard
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Task Manager', icon: Database },
    { id: 'vms', label: 'Resources (VMs)', icon: Cpu },
    { id: 'simulation', label: 'Run Simulation', icon: Activity },
    { id: 'results', label: 'Comparative Results', icon: BarChart3 },
    { id: 'ai-insights', label: 'AI Recommendations', icon: BrainCircuit },
    { id: 'report', label: 'Research Report', icon: FileText },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 overflow-hidden shadow-xl z-50">
      <div className="p-6 border-b border-slate-800">
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>
          );
        })}
      </nav>

    </div>
  );
};
