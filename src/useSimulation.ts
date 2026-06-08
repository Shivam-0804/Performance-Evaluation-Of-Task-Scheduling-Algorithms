import { createContext, useContext } from 'react';
import { Task, VM, SimulationWeights, SimulationResult, SimContextType } from './types';

export const SimContext = createContext<SimContextType | undefined>(undefined);

export const useSimulation = () => {
  const context = useContext(SimContext);
  if (!context) throw new Error('useSimulation must be used within a SimProvider');
  return context;
};
