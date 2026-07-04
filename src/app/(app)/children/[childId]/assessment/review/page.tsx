"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useChild } from "@/features/children/hooks/useChildren";
import { useVaultStore } from "@/stores/vaultStore";
import { useAssessmentFormStore } from "@/stores/assessmentFormStore";
import { assessmentService } from "@/features/assessment/services/assessment.service";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";

export default function ReviewPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.childId as string;
  const { data: child, isLoading } = useChild(childId);
  const addRecord = useVaultStore((s) => s.addRecord);

  const {
    weight,
    height,
    headCircumference,
    bfExclusive,
    mpasiAge,
    mealFreq,
    illnessHistory,
    resetForm,
  } = useAssessmentFormStore();

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }
  if (!child) return null;

  const wNum = parseFloat(weight || "0");
  const hNum = parseFloat(height || "0");
  const hcNum = parseFloat(headCircumference || "0");
  const mpasiNum = parseFloat(mpasiAge || "6");
  const freqNum = parseInt(mealFreq || "3", 10);

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    try {
      const resDto = await assessmentService.createAssessment({
        childId: child.id,
        weight: wNum,
        height: hNum,
        headCircumference: hcNum,
        bfExclusive,
        mpasiAge: mpasiNum,
        mealFreq: freqNum,
        illnessHistory: illnessHistory,
      });

      // 2. Add record to blockchain vault store for user dashboard log
      addRecord({
        childId: child.id,
        childName: child.name,
        weight: wNum,
        height: hNum,
        ageMonths: child.ageMonths,
        status: resDto.prediction?.status || 'PENDING',
      });

      // 3. Reset store data
      resetForm();
      setIsSubmitting(false);

      // 4. Navigate to results page
      router.push(`/children/${child.id}/assessment/results?assessmentId=${resDto.id}`);
    } catch (error) {
      console.error("Failed to submit assessment:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header & Step Indicator */}
      <div className="px-6 py-4 border-b border-surface-container bg-surface-lowest flex flex-row items-center justify-between">
        <div className="flex flex-row items-center">
          <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-surface-low transition-colors">
            <ArrowLeft size={20} color="#3e646a" />
          </button>
          <h1 className="font-bold text-lg text-primary ml-3">Review & Kirim</h1>
        </div>
        <span className="text-xs font-bold text-secondary bg-secondary-container px-2.5 py-1 rounded-full">
          Step 5 dari 5
        </span>
      </div>

      {isSubmitting ? (
        <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center px-8 gap-4 max-w-md mx-auto text-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <h2 className="font-bold text-on-surface text-base">Menulis Blok ke GiziChain...</h2>
          <p className="text-xs text-outline">
            Memverifikasi tanda tangan kriptografi ECDSA (secp256k1) dan menyebarkan transaksi ke ledger.
          </p>
        </div>
      ) : (
        <div className="flex flex-col p-6 gap-5 max-w-md mx-auto w-full">
          {/* Child Card Header */}
          <div className="bg-surface-lowest p-4 rounded-[24px] border border-outline-variant/15 flex flex-row justify-between items-center">
            <div className="flex flex-row items-center gap-3">
              <span className="text-2xl">{child.gender === "MALE" ? "👦" : "👧"}</span>
              <div className="flex flex-col">
                <span className="font-bold text-on-surface text-sm">{child.name}</span>
                <span className="text-xs text-outline font-medium">{child.ageMonths} bulan</span>
              </div>
            </div>
          </div>

          {/* Section: Antropometri */}
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-xs text-outline uppercase tracking-wider">1. Parameter Antropometri</h3>
            <Card className="p-0 border border-outline-variant/15 shadow-none rounded-[24px] overflow-hidden">
              <div className="flex flex-row justify-between items-center p-4">
                <div className="flex flex-col items-center flex-1">
                  <span className="text-xs text-outline font-bold">Tinggi</span>
                  <span className="font-bold text-on-surface text-sm mt-0.5">{weight} kg</span>
                </div>
                <div className="w-px h-8 bg-surface-container" />
                <div className="flex flex-col items-center flex-1">
                  <span className="text-xs text-outline font-bold">Panjang</span>
                  <span className="font-bold text-on-surface text-sm mt-0.5">{height} cm</span>
                </div>
                <div className="w-px h-8 bg-surface-container" />
                <div className="flex flex-col items-center flex-1">
                  <span className="text-xs text-outline font-bold">L. Kepala</span>
                  <span className="font-bold text-on-surface text-sm mt-0.5">{headCircumference} cm</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Section: Riwayat Makan */}
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-xs text-outline uppercase tracking-wider">2. Riwayat Makan</h3>
            <Card className="p-4 flex flex-col gap-3 border border-outline-variant/15 shadow-none rounded-[24px]">
              <div className="flex flex-row justify-between">
                <span className="text-xs text-outline font-medium">ASI Eksklusif (6 bln)</span>
                <span className="text-xs font-bold text-on-surface">{bfExclusive ? "Ya" : "Tidak"}</span>
              </div>
              <div className="flex flex-row justify-between">
                <span className="text-xs text-outline font-medium">Usia Mulai MPASI</span>
                <span className="text-xs font-bold text-on-surface">{mpasiAge} bulan</span>
              </div>
              <div className="flex flex-row justify-between">
                <span className="text-xs text-outline font-medium">Frekuensi Makan</span>
                <span className="text-xs font-bold text-on-surface">{mealFreq} kali / hari</span>
              </div>
            </Card>
          </div>

          {/* Section: Riwayat Penyakit */}
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-xs text-outline uppercase tracking-wider">3. Riwayat Penyakit</h3>
            <Card className="p-4 border border-outline-variant/15 shadow-none rounded-[24px]">
              <p className="text-xs text-on-surface leading-5 font-semibold">
                {illnessHistory.trim() ? illnessHistory : "Tidak ada catatan riwayat penyakit."}
              </p>
            </Card>
          </div>

          {/* Blockchain Gas Proof */}
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-xs text-outline uppercase tracking-wider">Kalkulasi Ledger Gas</h3>
            <Card className="p-4 flex flex-col gap-3 border border-outline-variant/15 shadow-none rounded-[24px]">
              <div className="flex flex-row justify-between">
                <span className="text-xs text-outline font-medium">Metode Tanda Tangan</span>
                <span className="text-xs font-bold text-on-surface">ECDSA (secp256k1)</span>
              </div>
              <div className="flex flex-row justify-between">
                <span className="text-xs text-outline font-medium">Block Gas Cost</span>
                <span className="text-xs font-bold text-secondary">0.00045 GZI (Free Tier)</span>
              </div>
            </Card>
          </div>

          <Button onClick={handleConfirmSubmit} variant="primary" className="mt-4 w-full">
            Tanda Tangan & Kirim ke GiziChain
          </Button>
        </div>
      )}
    </div>
  );
}
