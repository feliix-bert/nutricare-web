import { create } from "zustand";

export type AssessmentFormState = {
  weight: string;
  height: string;
  headCircumference: string;
  bfExclusive: boolean;
  mpasiAge: string;
  mealFreq: string;
  illnessHistory: string;
  setWeight: (w: string) => void;
  setHeight: (h: string) => void;
  setHeadCircumference: (hc: string) => void;
  setBfExclusive: (bf: boolean) => void;
  setMpasiAge: (age: string) => void;
  setMealFreq: (freq: string) => void;
  setIllnessHistory: (history: string) => void;
  resetForm: () => void;
};

export const useAssessmentFormStore = create<AssessmentFormState>((set) => ({
  weight: "",
  height: "",
  headCircumference: "",
  bfExclusive: true,
  mpasiAge: "6",
  mealFreq: "3",
  illnessHistory: "",
  setWeight: (weight) => set({ weight }),
  setHeight: (height) => set({ height }),
  setHeadCircumference: (headCircumference) => set({ headCircumference }),
  setBfExclusive: (bfExclusive) => set({ bfExclusive }),
  setMpasiAge: (mpasiAge) => set({ mpasiAge }),
  setMealFreq: (mealFreq) => set({ mealFreq }),
  setIllnessHistory: (illnessHistory) => set({ illnessHistory }),
  resetForm: () =>
    set({
      weight: "",
      height: "",
      headCircumference: "",
      bfExclusive: true,
      mpasiAge: "6",
      mealFreq: "3",
      illnessHistory: "",
    }),
}));
