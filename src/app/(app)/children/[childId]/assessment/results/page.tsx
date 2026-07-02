"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { DisclaimerText } from "@/features/assessment/components/DisclaimerText";
import { usePredictionPolling } from "@/features/assessment/hooks/usePredictionPolling";

const DIAGNOSIS_DETAILS = {
  NORMAL: {
    title: "Tumbuh Kembang Normal",
    icon: "🎉",
    colorClass: "text-secondary",
    bgClass: "bg-secondary/5 border-secondary/20",
  },
  AT_RISK: {
    title: "Berisiko Stunting",
    icon: "⚠️",
    colorClass: "text-tertiary",
    bgClass: "bg-tertiary/5 border-tertiary/20",
  },
  STUNTED: {
    title: "Terindikasi Stunting",
    icon: "🚨",
    colorClass: "text-danger",
    bgClass: "bg-danger/5 border-danger/20",
  },
  SEVERELY_STUNTED: {
    title: "Stunting Sangat Pendek",
    icon: "🚨",
    colorClass: "text-danger-dark",
    bgClass: "bg-danger/10 border-danger/30",
  },
};

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("assessmentId");

  const {
    data: prediction,
    isLoading,
    isError,
    error,
  } = usePredictionPolling(assessmentId, !!assessmentId);

  // ── Loading state ──────────────────────────────────────────────────────
  if (isLoading || !prediction) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="px-6 py-4 border-b border-surface-container bg-surface-lowest flex items-center justify-center">
          <h1 className="font-bold text-lg text-primary">Hasil Deteksi AI</h1>
        </div>
        <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center px-8 gap-4 max-w-md mx-auto text-center">
          <Loader2 size={40} className="animate-spin text-primary" />
          <h2 className="font-bold text-on-surface text-base">Menganalisis Data...</h2>
          <p className="text-xs text-outline">
            AI sedang menghitung Z-Score dan menghasilkan rekomendasi. Tunggu sebentar.
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="px-6 py-4 border-b border-surface-container bg-surface-lowest flex items-center justify-center">
          <h1 className="font-bold text-lg text-primary">Hasil Deteksi AI</h1>
        </div>
        <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center px-8 gap-4 max-w-md mx-auto text-center">
          <span className="text-4xl">❌</span>
          <h2 className="font-bold text-on-surface text-base">Analisis Gagal</h2>
          <p className="text-xs text-outline">
            {(error as Error)?.message ?? "Terjadi kesalahan saat menganalisis data."}
          </p>
          <Button onClick={() => router.replace("/")} variant="primary">
            Kembali ke Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const activeStatus = prediction.stuntStatus as keyof typeof DIAGNOSIS_DETAILS;
  const details = DIAGNOSIS_DETAILS[activeStatus] ?? DIAGNOSIS_DETAILS.NORMAL;
  const recs = prediction.recommendations.length > 0
    ? prediction.recommendations
    : [
        "Konsultasikan dengan dokter spesialis anak terdekat.",
        "Pastikan pemenuhan gizi protein hewani harian.",
      ];

  const handleFinish = () => {
    router.replace("/");
  };

  const handleConsult = () => {
    router.replace(`/consult?predictionId=${prediction.id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-surface-container bg-surface-lowest flex items-center justify-center">
        <h1 className="font-bold text-lg text-primary">Hasil Deteksi AI</h1>
      </div>

      <div className="flex flex-col p-6 gap-5 max-w-md mx-auto w-full pb-10">
        {/* Diagnostic Status Card */}
        <div className="flex flex-col items-center py-4 gap-3 bg-surface-lowest rounded-[24px] border border-outline-variant/15 p-5">
          <span className="text-5xl">{details.icon}</span>
          <h2 className={`font-extrabold text-lg ${details.colorClass}`}>
            {details.title}
          </h2>
          <StatusBadge status={activeStatus} />
        </div>

        {/* Detailed Z-scores & Summary */}
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-xs text-outline uppercase tracking-wider">
            Metrik Tumbuh Kembang (WHO Z-Score)
          </h3>
          <Card className="p-4 flex flex-col gap-4 border border-outline-variant/15 shadow-none rounded-[24px]">
            <p className="text-xs text-on-surface leading-5 font-semibold">
              {prediction.summary ??
                "Status gizi dianalisis berdasarkan kurva standar pertumbuhan anak WHO."}
            </p>
            <div className="flex flex-row justify-between pt-2 border-t border-surface-container mt-2">
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-outline font-bold">
                  Berat/Umur (WAZ)
                </span>
                <span className="font-extrabold text-on-surface text-sm mt-1">
                  {prediction.zscoreWa?.toFixed(2) ?? "-"} SD
                </span>
              </div>
              <div className="w-px h-8 bg-surface-container" />
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-outline font-bold">
                  Tinggi/Umur (HAZ)
                </span>
                <span className="font-extrabold text-on-surface text-sm mt-1">
                  {prediction.zscoreHa?.toFixed(2) ?? "-"} SD
                </span>
              </div>
              <div className="w-px h-8 bg-surface-container" />
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-outline font-bold">
                  Berat/Tinggi (WHZ)
                </span>
                <span className="font-extrabold text-on-surface text-sm mt-1">
                  {prediction.zscoreWh?.toFixed(2) ?? "-"} SD
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recommendations & Next Assessment Date */}
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-xs text-outline uppercase tracking-wider">
            Rekomendasi AI GiziChain
          </h3>
          <Card className="p-4 flex flex-col gap-3 border border-outline-variant/15 shadow-none rounded-[24px]">
            {recs.map((rec, idx) => (
              <div key={idx} className="flex flex-row items-start gap-2">
                <span className="text-secondary font-bold">•</span>
                <p className="text-xs text-on-surface leading-4 font-semibold flex-1">
                  {rec}
                </p>
              </div>
            ))}
            <div className="mt-2 pt-3 border-t border-surface-container flex flex-row justify-between items-center">
              <span className="text-[10px] text-outline font-medium">
                Jadwal Pemeriksaan Berikutnya
              </span>
              <span className="text-xs font-bold text-primary">
                {prediction.nextAssessmentDate ?? "-"}
              </span>
            </div>
          </Card>
        </div>

        {/* Blockchain proof */}
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-xs text-outline uppercase tracking-wider">
            Bukti Kriptografi Blockchain
          </h3>
          <Card className="p-4 flex flex-col gap-2 border border-outline-variant/15 shadow-none rounded-[24px]">
            <div className="flex flex-row justify-between items-center">
              <span className="text-xs text-outline font-medium">
                Status Ledger
              </span>
              <div className="flex flex-row items-center gap-1">
                <CheckCircle2
                  size={12}
                  color="#506444"
                  className="fill-[#506444] text-white"
                />
                <span className="text-xs font-bold text-secondary">
                  Secured & Confirmed
                </span>
              </div>
            </div>
            <div className="flex flex-row justify-between items-center">
              <span className="text-xs text-outline font-medium">
                Hasil AI
              </span>
              <span className="text-xs font-bold text-on-surface">
                {prediction.predictionStatus}
              </span>
            </div>
          </Card>
        </div>

        {/* Mandatory Clinical Disclaimer */}
        <DisclaimerText />

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={handleConsult}
            variant="outline"
            className="w-full"
          >
            Tanya AI tentang Gizi MPASI
          </Button>
          <Button
            onClick={handleFinish}
            variant="primary"
            className="w-full"
          >
            Selesai & Kembali ke Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
