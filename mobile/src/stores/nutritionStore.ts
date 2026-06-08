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
  logs: [
    {
      id: "log_001",
      childId: "child_001",
      photoUrl: "https://images.unsplash.com/photo-1547058886-f685c2c77d5b?q=80&w=240&auto=format&fit=crop",
      foodDetected: ["Bubur Beras Merah", "Hati Ayam"],
      portionEstimate: "Porsi Sedang (~150g)",
      calories: 120,
      protein: 4.5,
      fat: 3.2,
      carbs: 20.0,
      fiber: 1.5,
      adequacyNote: "Cukup untuk makan pagi",
      mpasiRecommendation: "Tambahkan sayur hijau di menu berikutnya",
      createdAt: "2026-06-08T08:30:00Z",
    },
    {
      id: "log_002",
      childId: "child_001",
      photoUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=240&auto=format&fit=crop",
      foodDetected: ["Potongan Pepaya"],
      portionEstimate: "Porsi Kecil (~50g)",
      calories: 45,
      protein: 0.5,
      fat: 0.1,
      carbs: 11.0,
      fiber: 1.8,
      adequacyNote: "Selingan buah yang baik",
      mpasiRecommendation: "Lanjutkan pemberian buah segar",
      createdAt: "2026-06-08T10:45:00Z",
    },
  ],
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
