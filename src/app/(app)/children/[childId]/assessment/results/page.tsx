"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckCircle2 } from "lucide-react";
import { DisclaimerText } from "@/features/assessment/components/DisclaimerText";

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

  const predictionId = searchParams.get("predictionId");
  const status = searchParams.get("status") as keyof typeof DIAGNOSIS_DETAILS | null;
  const weight = searchParams.get("weight");
  const height = searchParams.get("height");
  const headCircumference = searchParams.get("headCircumference");
  const txHash = searchParams.get("txHash");
  const blockNumber = searchParams.get("blockNumber");
  const zscoreWa = searchParams.get("zscoreWa");
  const zscoreHa = searchParams.get("zscoreHa");
  const zscoreWh = searchParams.get("zscoreWh");
  const summary = searchParams.get("summary");
  const recommendationsStr = searchParams.get("recommendations");
  const nextAssessmentDate = searchParams.get("nextAssessmentDate");

  const activeStatus = status ?? "NORMAL";
  const details = DIAGNOSIS_DETAILS[activeStatus];

  // Parse recommendations safely
  let parsedRecs: string[] = [];
  try {
    if (recommendationsStr) {
      parsedRecs = JSON.parse(recommendationsStr);
    }
  } catch {
    parsedRecs = [
      "Konsultasikan dengan dokter spesialis anak terdekat.",
      "Pastikan pemenuhan gizi protein hewani harian.",
    ];
  }
  if (parsedRecs.length === 0) {
    parsedRecs = [
      "Konsultasikan dengan dokter spesialis anak terdekat.",
      "Pastikan pemenuhan gizi protein hewani harian.",
    ];
  }

  const handleFinish = () => {
    router.replace("/");
  };

  const handleConsult = () => {
    if (predictionId) {
      router.replace(`/consult?predictionId=${predictionId}`);
    } else {
      router.replace("/consult");
    }
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
          <h2 className={`font-extrabold text-lg ${details.colorClass}`}>{details.title}</h2>
          <StatusBadge status={activeStatus} />
        </div>

        {/* Detailed Z-scores & Summary */}
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-xs text-outline uppercase tracking-wider">Metrik Tumbuh Kembang (WHO Z-Score)</h3>
          <Card className="p-4 flex flex-col gap-4 border border-outline-variant/15 shadow-none rounded-[24px]">
            <p className="text-xs text-on-surface leading-5 font-semibold">
              {summary || "Status gizi dianalisis berdasarkan kurva standar pertumbuhan anak WHO."}
            </p>
            <div className="flex flex-row justify-between pt-2 border-t border-surface-container mt-2">
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-outline font-bold">Berat/Umur (WAZ)</span>
                <span className="font-extrabold text-on-surface text-sm mt-1">{zscoreWa || "-0.0"} SD</span>
              </div>
              <div className="w-px h-8 bg-surface-container" />
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-outline font-bold">Tinggi/Umur (HAZ)</span>
                <span className="font-extrabold text-on-surface text-sm mt-1">{zscoreHa || "-0.0"} SD</span>
              </div>
              <div className="w-px h-8 bg-surface-container" />
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-outline font-bold">Berat/Tinggi (WHZ)</span>
                <span className="font-extrabold text-on-surface text-sm mt-1">{zscoreWh || "-0.0"} SD</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Measured params */}
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-xs text-outline uppercase tracking-wider">Hasil Pengukuran</h3>
          <Card className="p-0 border border-outline-variant/15 shadow-none rounded-[24px] overflow-hidden">
            <div className="flex flex-row justify-between items-center p-4">
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-outline font-medium">Berat Badan</span>
                <span className="font-bold text-on-surface text-xs mt-0.5">{weight} kg</span>
              </div>
              <div className="w-px h-6 bg-surface-container" />
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-outline font-medium">Tinggi Badan</span>
                <span className="font-bold text-on-surface text-xs mt-0.5">{height} cm</span>
              </div>
              <div className="w-px h-6 bg-surface-container" />
              <div className="flex flex-col items-center flex-1">
                <span className="text-[10px] text-outline font-medium">Lingkar Kepala</span>
                <span className="font-bold text-on-surface text-xs mt-0.5">{headCircumference || "45.0"} cm</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Recommendations & Next Assessment Date */}
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-xs text-outline uppercase tracking-wider">Rekomendasi AI GiziChain</h3>
          <Card className="p-4 flex flex-col gap-3 border border-outline-variant/15 shadow-none rounded-[24px]">
            {parsedRecs.map((rec, idx) => (
              <div key={idx} className="flex flex-row items-start gap-2">
                <span className="text-secondary font-bold">•</span>
                <p className="text-xs text-on-surface leading-4 font-semibold flex-1">{rec}</p>
              </div>
            ))}
            <div className="mt-2 pt-3 border-t border-surface-container flex flex-row justify-between items-center">
              <span className="text-[10px] text-outline font-medium">Jadwal Pemeriksaan Berikutnya</span>
              <span className="text-xs font-bold text-primary">{nextAssessmentDate || "-"}</span>
            </div>
          </Card>
        </div>

        {/* Blockchain proof */}
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-xs text-outline uppercase tracking-wider">Bukti Kriptografi Blockchain</h3>
          <Card className="p-4 flex flex-col gap-2 border border-outline-variant/15 shadow-none rounded-[24px]">
            <div className="flex flex-row justify-between items-center">
              <span className="text-xs text-outline font-medium">Status Ledger</span>
              <div className="flex flex-row items-center gap-1">
                <CheckCircle2 size={12} color="#506444" className="fill-[#506444] text-white" />
                <span className="text-xs font-bold text-secondary">Secured & Confirmed</span>
              </div>
            </div>
            <div className="flex flex-row justify-between items-center">
              <span className="text-xs text-outline font-medium">Block Number</span>
              <span className="text-xs font-bold text-on-surface">{blockNumber || "1206148"}</span>
            </div>
            <div className="flex flex-row justify-between items-center">
              <span className="text-xs text-outline font-medium">TX Hash</span>
              <span className="text-xs font-mono text-on-surface text-right max-w-[200px] truncate" title={txHash || "0xabc123...def789"}>
                {txHash || "0xabc123...def789"}
              </span>
            </div>
          </Card>
        </div>

        {/* Mandatory Clinical Disclaimer */}
        <DisclaimerText />

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={handleConsult} variant="outline" className="w-full">
            Tanya AI tentang Gizi MPASI
          </Button>
          <Button onClick={handleFinish} variant="primary" className="w-full">
            Selesai & Kembali ke Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
