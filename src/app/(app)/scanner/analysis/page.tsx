"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useNutritionStore } from "@/stores/nutritionStore";
import { nutritionService } from "@/features/nutrition/services/nutrition.service";
import { useChildrenList } from "@/features/children/hooks/useChildren";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

const STEPS = [
  "Menganalisis gambar makanan si kecil...",
  "Mengidentifikasi bahan makanan (Salmon, Wortel, Beras Merah)...",
  "Menghitung kalori dan komposisi makronutrisi...",
  "Menyimpan data log gizi ke akun...",
];

export default function AnalysisPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const photoFile = useNutritionStore((s) => s.photoFile);
  const addLog = useNutritionStore((s) => s.addLog);
  const { data: childrenData } = useChildrenList(0, 1);

  useEffect(() => {
    let mounted = true;

    const processPhoto = async () => {
      // 1. Wait for file and child data
      if (!photoFile || !childrenData?.data?.[0]) {
        // If no file or child, just simulate then go back
        await new Promise(r => setTimeout(r, 2000));
        if (mounted) router.replace("/nutrition");
        return;
      }

      try {
        const childId = childrenData.data[0].id;

        // Progress steps automatically — guard with ref
        const stepInterval = setInterval(() => {
          setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 2));
        }, 1500);
        // Upload to real API
        const log = await nutritionService.uploadNutritionPhoto(childId, photoFile);

        clearInterval(stepInterval);

        if (mounted) {
          setCurrentStep(STEPS.length); // complete
          addLog(log);
          setTimeout(() => {
            router.replace("/nutrition");
          }, 800);
        }
      } catch (err) {
        console.error("Failed to upload photo:", err);
        if (mounted) router.replace("/nutrition");
      }
    };

    processPhoto();
    
    return () => { mounted = false; };
  }, [photoFile, childrenData, addLog, router]);

  const progressPercent = (currentStep / STEPS.length) * 100;

  return (
    <div
      className="flex flex-col h-screen items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "linear-gradient(155deg, #faf8f5 0%, #e8f0ec 50%, #faf8f5 100%)" }}
    >
      {/* Decorative shapes */}
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/5 organic-blob" aria-hidden />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-secondary/5 organic-blob-alt" aria-hidden />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-6 w-full max-w-sm relative z-10"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-[2rem] gradient-primary flex items-center justify-center shadow-glow"
        >
          <Sparkles size={40} className="text-white" />
        </motion.div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="font-extrabold text-xl text-on-surface text-center tracking-tight">
            Gemini AI Vision Analysis
          </h1>
          <p className="text-sm text-on-surface-variant text-center px-4 leading-relaxed font-medium">
            Kami sedang memproses foto makanan dengan model kecerdasan buatan Gemini.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-surface-high overflow-hidden">
          <motion.div
            className="h-full rounded-full gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Steps List */}
        <div className="w-full mt-4 flex flex-col gap-3">
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isActive = idx === currentStep;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className={`flex flex-row items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isActive ? "bg-primary-container/30 border border-primary/10" :
                  isCompleted ? "bg-surface-warm" : "bg-transparent"
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <CheckCircle2 size={18} className="text-primary fill-primary-container" />
                    </motion.div>
                  ) : isActive ? (
                    <Loader2 size={16} className="text-primary animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-outline-variant/30" />
                  )}
                </div>
                <span
                  className={`text-sm flex-1 ${
                    isCompleted
                      ? "text-on-surface-variant font-medium line-through opacity-50"
                      : isActive
                      ? "text-primary font-bold"
                      : "text-on-surface-variant/50 font-medium"
                  }`}
                >
                  {step}
                </span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
