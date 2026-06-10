"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useNutritionStore } from "@/stores/nutritionStore";
import { CheckCircle2, Loader2 } from "lucide-react";

const STEPS = [
  "Menganalisis gambar makanan si kecil...",
  "Mengidentifikasi bahan makanan (Salmon, Wortel, Beras Merah)...",
  "Menghitung kalori dan komposisi makronutrisi...",
  "Menyimpan data log gizi ke akun...",
];

export default function AnalysisPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const addLog = useNutritionStore((s) => s.addLog);

  useEffect(() => {
    if (currentStep < STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      // Completed, add mock record and redirect
      addLog({
        childId: "child_001",
        photoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=240&auto=format&fit=crop",
        foodDetected: ["Bubur Salmon", "Beras Merah", "Wortel"],
        portionEstimate: "Porsi Sedang (~200g)",
        calories: 145,
        protein: 6.5,
        fat: 4.0,
        carbs: 21.0,
        fiber: 2.2,
        adequacyNote: "Sangat baik untuk pemenuhan gizi protein dan omega-3 makan siang anak.",
        mpasiRecommendation: "Tambahkan porsi lemak sehat seperti 1 sdt minyak zaitun.",
      });
      router.replace("/nutrition"); // Redirect to nutrition dashboard
    }
  }, [currentStep, addLog, router]);

  return (
    <div className="flex flex-col h-screen bg-background items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        {/* Animated Icon */}
        <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center shadow-lg border border-primary/20">
          <div className="animate-bounce">
            <span className="text-4xl">🥗</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="font-extrabold text-xl text-primary text-center">Gemini AI Vision Analysis</h1>
          <p className="text-xs text-outline text-center px-6 leading-4">
            Kami sedang memproses foto makanan dengan model kecerdasan buatan Gemini.
          </p>
        </div>

        {/* Steps List */}
        <div className="w-full mt-8 flex flex-col gap-4">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;

            return (
              <div key={idx} className="flex flex-row items-center gap-3 opacity-90">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 size={18} color="#506444" className="fill-[#506444] text-white" />
                  ) : isActive ? (
                    <Loader2 size={16} color="#3e646a" className="animate-spin" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-surface-dim" />
                  )}
                </div>
                <span
                  className={`text-xs flex-1 ${
                    isCompleted
                      ? "text-secondary font-bold line-through opacity-60"
                      : isActive
                      ? "text-primary font-bold"
                      : "text-outline font-medium"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
