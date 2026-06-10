"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useChild } from "@/features/children/hooks/useChildren";
import { useAssessmentFormStore } from "@/stores/assessmentFormStore";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/common/InputField";
import { ArrowLeft, Info } from "lucide-react";

export default function BodySizePage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.childId as string;
  const { data: child, isLoading } = useChild(childId);
  const { weight, height, headCircumference, setWeight, setHeight, setHeadCircumference } = useAssessmentFormStore();
  const [errors, setErrors] = useState<{ weight?: string; height?: string; headCircumference?: string }>({});

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!child) return null;

  const handleNext = () => {
    const errs: { weight?: string; height?: string; headCircumference?: string } = {};
    const wNum = parseFloat(weight);
    const hNum = parseFloat(height);
    const hcNum = parseFloat(headCircumference);

    if (!weight) {
      errs.weight = "Berat badan wajib diisi.";
    } else if (isNaN(wNum) || wNum <= 0) {
      errs.weight = "Berat badan harus angka positif.";
    }

    if (!height) {
      errs.height = "Tinggi badan wajib diisi.";
    } else if (isNaN(hNum) || hNum <= 0) {
      errs.height = "Tinggi badan harus angka positif.";
    }

    if (!headCircumference) {
      errs.headCircumference = "Lingkar kepala wajib diisi.";
    } else if (isNaN(hcNum) || hcNum < 20 || hcNum > 60) {
      errs.headCircumference = "Lingkar kepala harus antara 20 - 60 cm.";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    router.push(`/children/${child.id}/assessment/feeding-history`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header & Step Indicator */}
      <div className="px-6 py-4 border-b border-surface-container bg-surface-lowest flex flex-row items-center justify-between">
        <div className="flex flex-row items-center">
          <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-surface-low transition-colors">
            <ArrowLeft size={20} color="#3e646a" />
          </button>
          <h1 className="font-bold text-lg text-primary ml-3">Input Ukuran Tubuh</h1>
        </div>
        <span className="text-xs font-bold text-secondary bg-secondary-container px-2.5 py-1 rounded-full">
          Step 2 dari 5
        </span>
      </div>

      <div className="flex flex-col p-6 gap-5 max-w-md mx-auto w-full">
        {/* Child preview */}
        <div className="flex flex-row items-center gap-3 bg-surface-lowest p-4 rounded-[24px] border border-outline-variant/15">
          <span className="text-3xl">{child.gender === "MALE" ? "👦" : "👧"}</span>
          <div className="flex flex-col">
            <span className="font-bold text-on-surface text-sm">{child.name}</span>
            <span className="text-xs text-outline font-medium">{child.ageMonths} bulan</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-primary/5 border border-primary/10 rounded-[24px] p-4 flex flex-row items-start gap-3">
          <div className="mt-0.5">
            <Info size={18} color="#3e646a" />
          </div>
          <p className="text-xs text-primary leading-4 flex-1 font-medium">
            Pengukuran antropometri (berat badan, panjang badan, dan lingkar kepala) wajib diisi untuk menilai status
            pertumbuhan secara presisi.
          </p>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-6 mt-4">
          <InputField
            label="Berat Badan (kg)"
            value={weight}
            onChange={(e) => {
              setWeight(e.target.value);
              setErrors((prev) => ({ ...prev, weight: undefined }));
            }}
            placeholder="Contoh: 9.5"
            type="number"
            step="0.1"
            error={errors.weight}
            rightElement={<span className="text-xs text-outline font-bold">kg</span>}
          />

          <InputField
            label="Tinggi / Panjang Badan (cm)"
            value={height}
            onChange={(e) => {
              setHeight(e.target.value);
              setErrors((prev) => ({ ...prev, height: undefined }));
            }}
            placeholder="Contoh: 78.2"
            type="number"
            step="0.1"
            error={errors.height}
            rightElement={<span className="text-xs text-outline font-bold">cm</span>}
          />

          <InputField
            label="Lingkar Kepala (cm)"
            value={headCircumference}
            onChange={(e) => {
              setHeadCircumference(e.target.value);
              setErrors((prev) => ({ ...prev, headCircumference: undefined }));
            }}
            placeholder="Contoh: 45.5"
            type="number"
            step="0.1"
            error={errors.headCircumference}
            rightElement={<span className="text-xs text-outline font-bold">cm</span>}
          />
        </div>

        <Button onClick={handleNext} variant="primary" className="mt-8 w-full">
          Lanjutkan ke Riwayat Makan
        </Button>
      </div>
    </div>
  );
}
