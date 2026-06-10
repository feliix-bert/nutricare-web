"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useChild } from "@/features/children/hooks/useChildren";
import { useAssessmentFormStore } from "@/stores/assessmentFormStore";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Info } from "lucide-react";

export default function IllnessHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.childId as string;
  const { data: child, isLoading } = useChild(childId);

  const { illnessHistory, setIllnessHistory } = useAssessmentFormStore();

  const [error, setError] = useState<string | undefined>();

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!child) return null;

  const handleNext = () => {
    if (illnessHistory.length > 500) {
      setError("Riwayat penyakit maksimal 500 karakter.");
      return;
    }

    setError(undefined);
    router.push(`/children/${child.id}/assessment/review`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header & Step Indicator */}
      <div className="px-6 py-4 border-b border-surface-container bg-surface-lowest flex flex-row items-center justify-between">
        <div className="flex flex-row items-center">
          <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-surface-low transition-colors">
            <ArrowLeft size={20} color="#3e646a" />
          </button>
          <h1 className="font-bold text-lg text-primary ml-3">Riwayat Penyakit Anak</h1>
        </div>
        <span className="text-xs font-bold text-secondary bg-secondary-container px-2.5 py-1 rounded-full">
          Step 4 dari 5
        </span>
      </div>

      <div className="flex flex-col p-6 gap-5 max-w-md mx-auto w-full">
        {/* Step Info */}
        <div className="bg-primary/5 border border-primary/10 rounded-[24px] p-4 flex flex-row items-start gap-3">
          <div className="mt-0.5">
            <Info size={18} color="#3e646a" />
          </div>
          <p className="text-xs text-primary leading-4 flex-1 font-medium">
            Catat riwayat penyakit infeksi seperti diare, ISPA (Infeksi Saluran Pernapasan Akut), atau demam berulang.
            Penyakit infeksi kronis dapat menghambat penyerapan nutrisi si kecil.
          </p>
        </div>

        {/* Multiline Input */}
        <div className="flex flex-col gap-2 mt-4">
          <span className="text-sm font-semibold text-on-surface">
            Catatan Riwayat Penyakit (ISPA, Diare, Demam, dll.)
          </span>
          <div
            className={`border rounded-[24px] px-5 py-4 bg-surface-lowest transition-colors focus-within:border-primary ${
              error ? "border-danger focus-within:border-danger" : "border-outline-variant/30 hover:border-outline-variant"
            }`}
          >
            <textarea
              rows={6}
              value={illnessHistory}
              onChange={(e) => {
                setIllnessHistory(e.target.value);
                setError(undefined);
              }}
              placeholder="Contoh: Mengalami diare 2 kali dalam 3 bulan terakhir, dan flu/ISPA ringan sebulan sekali. Tidak ada riwayat penyakit kronis bawaan."
              className="w-full text-base text-on-surface min-h-[120px] resize-none bg-transparent outline-none focus:ring-0"
              maxLength={500}
            />
          </div>
          <div className="flex flex-row justify-between px-1">
            {error ? (
              <span className="text-xs font-medium text-danger">{error}</span>
            ) : (
              <span className="text-xs text-outline font-medium">
                Opsional (Kosongkan jika tidak ada riwayat penyakit)
              </span>
            )}
            <span className="text-xs text-outline font-medium">{illnessHistory.length}/500</span>
          </div>
        </div>

        <Button onClick={handleNext} variant="primary" className="mt-8 w-full">
          Lanjutkan ke Review & Tanda Tangan
        </Button>
      </div>
    </div>
  );
}
