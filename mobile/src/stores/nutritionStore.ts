import { create } from "zustand";

export type NutritionLog = {
  id: string;
  childId: string;
  photoUrl: string;
  foodDetected: string[];
  portionEstimate: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  adequacyNote: string;
  mpasiRecommendation: string;
  createdAt: string;
};

type NutritionState = {
  logs: NutritionLog[];
  addLog: (log: Omit<NutritionLog, "id" | "createdAt">) => void;
  removeLog: (id: string) => void;
  getLogsByChild: (childId: string) => NutritionLog[];
};

export const useNutritionStore = create<NutritionState>((set, get) => ({
  logs: [],
  addLog: (log) => {
    const newLog: NutritionLog = {
      ...log,
      id: `log_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ logs: [newLog, ...state.logs] }));
  },
  removeLog: (id) => {
    set((state) => ({ logs: state.logs.filter((l) => l.id !== id) }));
  },
  getLogsByChild: (childId) => {
    return get().logs.filter((l) => l.childId === childId);
  },
}));
