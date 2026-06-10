"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useChild } from "@/features/children/hooks/useChildren";
import { useAssessmentFormStore } from "@/stores/assessmentFormStore";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/common/InputField";
import { ArrowLeft, Info } from "lucide-react";

export default function FeedingHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.childId as string;
  const { data: child, isLoading } = useChild(childId);

  const { bfExclusive, mpasiAge, mealFreq, setBfExclusive, setMpasiAge, setMealFreq } = useAssessmentFormStore();

  const [errors, setErrors] = useState<{ mpasiAge?: string; mealFreq?: string }>({});

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!child) return null;

  const handleNext = () => {
    const errs: { mpasiAge?: string; mealFreq?: string } = {};
    const mpasiNum = parseFloat(mpasiAge);
    const freqNum = parseInt(mealFreq, 10);

    if (!mpasiAge) {
      errs.mpasiAge = "Usia mulai MPASI wajib diisi.";
    } else if (isNaN(mpasiNum) || mpasiNum < 0 || mpasiNum > 24) {
      errs.mpasiAge = "Usia mulai MPASI harus di antara 0 - 24 bulan.";
    }

    if (!mealFreq) {
      errs.mealFreq = "Frekuensi makan wajib diisi.";
    } else if (isNaN(freqNum) || freqNum <= 0 || freqNum > 10) {
      errs.mealFreq = "Frekuensi makan harus angka positif antara 1 - 10.";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    router.push(`/children/${child.id}/assessment/illness-history`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header & Step Indicator */}
      <div className="px-6 py-4 border-b border-surface-container bg-surface-lowest flex flex-row items-center justify-between">
        <div className="flex flex-row items-center">
          <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-surface-low transition-colors">
            <ArrowLeft size={20} color="#3e646a" />
          </button>
          <h1 className="font-bold text-lg text-primary ml-3">Riwayat Makan (MPASI)</h1>
        </div>
        <span className="text-xs font-bold text-secondary bg-secondary-container px-2.5 py-1 rounded-full">
          Step 3 dari 5
        </span>
      </div>

      <div className="flex flex-col p-6 gap-5 max-w-md mx-auto w-full">
        {/* Step Info */}
        <div className="bg-primary/5 border border-primary/10 rounded-[24px] p-4 flex flex-row items-start gap-3">
          <div className="mt-0.5">
            <Info size={18} color="#3e646a" />
          </div>
          <p className="text-xs text-primary leading-4 flex-1 font-medium">
            Riwayat pemberian ASI eksklusif dan pola makan sangat berpengaruh terhadap pemenuhan gizi makro dan mikro
            anak.
          </p>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-6 mt-4">
          {/* ASI Eksklusif */}
          <div className="flex flex-row items-center justify-between bg-surface-lowest p-5 rounded-[24px] border border-outline-variant/15">
            <div className="flex flex-col flex-1 pr-4">
              <span className="font-bold text-sm text-on-surface">ASI Eksklusif (6 Bulan)</span>
              <span className="text-xs text-outline leading-4 mt-0.5">
                Apakah anak mendapatkan ASI eksklusif penuh selama 6 bulan pertama tanpa tambahan makanan?
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={bfExclusive}
                onChange={(e) => setBfExclusive(e.target.checked)}
              />
              <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <InputField
            label="Usia Mulai MPASI (bulan)"
            value={mpasiAge}
            onChange={(e) => {
              setMpasiAge(e.target.value);
              setErrors((prev) => ({ ...prev, mpasiAge: undefined }));
            }}
            placeholder="Contoh: 6"
            type="number"
            error={errors.mpasiAge}
            rightElement={<span className="text-xs text-outline font-bold">bulan</span>}
          />

          <InputField
            label="Frekuensi Makan Utama (per hari)"
            value={mealFreq}
            onChange={(e) => {
              setMealFreq(e.target.value);
              setErrors((prev) => ({ ...prev, mealFreq: undefined }));
            }}
            placeholder="Contoh: 3"
            type="number"
            error={errors.mealFreq}
            rightElement={<span className="text-xs text-outline font-bold">kali</span>}
          />
        </div>

        <Button onClick={handleNext} variant="primary" className="mt-8 w-full">
          Lanjutkan ke Riwayat Penyakit
        </Button>
      </div>
    </div>
  );
}
