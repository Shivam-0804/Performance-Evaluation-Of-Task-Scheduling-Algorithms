import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { TaskManager } from "./components/TaskManager";
import { ResourceManager } from "./components/ResourceManager";
import { SimulationControls } from "./components/SimulationControls";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { AIInsights } from "./components/AIInsights";
import { ResearchReport } from "./components/ResearchReport";
import { GanttChart } from "./components/GanttChart";
import { SimProvider } from "./SimProvider";
import { useSimulation } from "./useSimulation";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight } from "lucide-react";

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { results } = useSimulation();

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "tasks":
        return <TaskManager />;
      case "vms":
        return <ResourceManager />;
      case "simulation":
        return <SimulationControls />;
      case "results":
        return <ResultsDashboard />;
      case "ai-insights":
        return <AIInsights />;
      case "report":
        return <ResearchReport />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Operational Overview";
      case "tasks":
        return "Workload Schema";
      case "vms":
        return "Infrastructure Cluster";
      case "simulation":
        return "Simulation Workbench";
      case "results":
        return "Comparative Analytics";
      case "ai-insights":
        return "Heuristic Intelligence";
      case "report":
        return "Research Findings";
      default:
        return "";
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-900 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-slate-400">
              <ChevronRight size={16} />
            </div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              {getPageTitle()}
            </h2>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <SimProvider>
      <AppContent />
    </SimProvider>
  );
}
