"use client";

import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Baby, Activity, MessageCircle, Calendar, Weight, Ruler, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { MedicShell, ClinicalBadge } from "@/components/layout/MedicShell";
import { Avatar } from "@/components/common/Avatar";
import { fetchPatientSummary } from "@/features/medic/services/medic.service";
import { useConsultationList } from "@/features/medic/hooks/useConsultation";
import type { Consultation } from "@/features/medic/types/consultation.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcAgeMonths(birthDate: string) {
  const birth = new Date(birthDate);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function InfoCard({ label, value, unit, icon: Icon, color }: {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 mb-0.5">{label}</p>
        <p className="text-xl font-extrabold text-slate-800 leading-none">
          {value}<span className="text-sm font-semibold text-slate-400 ml-1">{unit}</span>
        </p>
      </div>
    </div>
  );
}

// ─── Z-score indicator ────────────────────────────────────────────────────────

function ZScore({ label, value }: { label: string; value: number | null }) {
  if (value === null || value === undefined) return null;
  const color = Math.abs(value) < 2 ? "text-teal-500" : Math.abs(value) < 3 ? "text-amber-500" : "text-red-500";
  const Icon = value > 0.3 ? TrendingUp : value < -0.3 ? TrendingDown : Minus;
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-none">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <div className={`flex items-center gap-1.5 font-extrabold text-sm ${color}`}>
        <Icon size={14} />
        {value > 0 ? "+" : ""}{value.toFixed(2)}
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function PatientDetailPage() {
  const { childId } = useParams<{ childId: string }>();
  const router = useRouter();

  const { data: child, isLoading } = useQuery({
    queryKey: ["patient-detail", childId],
    queryFn: () => fetchPatientSummary(childId),
    enabled: !!childId,
  });

  const { data: consultations } = useConsultationList();

  const childConsultations = useMemo(
    () => (consultations ?? []).filter((c: Consultation) => c.child_id === childId),
    [consultations, childId]
  );

  const openConsult = childConsultations.find((c: Consultation) => c.status === "OPEN");

  if (isLoading) {
    return (
      <MedicShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </MedicShell>
    );
  }

  if (!child) {
    return (
      <MedicShell>
        <div className="text-center py-20 text-slate-400 font-bold">Pasien tidak ditemukan.</div>
      </MedicShell>
    );
  }

  const ageMonths = calcAgeMonths(child.birth_date);
  const assessments = (child.assessments as any[] ?? []).sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const latestAssessment = assessments[0];
  const latestPred = Array.isArray(latestAssessment?.predictions)
    ? latestAssessment.predictions[0]
    : latestAssessment?.predictions;

  return (
    <MedicShell>
      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/medic/patients")}
          className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{child.name}</h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Patient Detail · {ageMonths} bulan · {(child as any).gender === "MALE" ? "Laki-laki" : "Perempuan"}
          </p>
        </div>
        <button
          onClick={() => router.push("/medic/consultations")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-500 text-white font-bold text-sm hover:bg-teal-600 transition-colors shadow-lg shadow-teal-500/20"
        >
          <MessageCircle size={15} />
          {openConsult ? "Lanjut Chat" : "Mulai Chat"}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
        {/* ── Left ── */}
        <div className="flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-5 mb-6">
              <Avatar seed={child.name} variant="parent" size="lg" />
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">{child.name}</h2>
                <p className="text-sm font-semibold text-slate-400">Orang tua: {(child as any).users?.name ?? "—"}</p>
                <div className="mt-2"><ClinicalBadge status={latestPred?.stunt_status ?? "NORMAL"} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <InfoCard label="Usia" value={ageMonths} unit="bulan" icon={Baby} color="bg-teal-500" />
              <InfoCard label="Berat Terakhir" value={latestAssessment?.weight ?? "—"} unit="kg" icon={Weight} color="bg-blue-500" />
              <InfoCard label="Tinggi Terakhir" value={latestAssessment?.height ?? "—"} unit="cm" icon={Ruler} color="bg-violet-500" />
            </div>
          </motion.div>

          {latestPred && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
              <h2 className="text-lg font-extrabold text-slate-800 mb-4">Z-Score Terakhir</h2>
              <ZScore label="BB/U (Berat per Usia)" value={latestPred.zscore_wa} />
              <ZScore label="TB/U (Tinggi per Usia)" value={latestPred.zscore_ha} />
              <ZScore label="BB/TB (Berat per Tinggi)" value={latestPred.zscore_wh} />
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-extrabold text-slate-800 mb-4">Riwayat Asesmen</h2>
            {assessments.length === 0 ? (
              <p className="text-slate-400 font-semibold text-center py-6">Belum ada asesmen.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {assessments.map((a: any, i: number) => {
                  const pred = Array.isArray(a.predictions) ? a.predictions[0] : a.predictions;
                  return (
                    <div key={a.id} className={`flex items-center justify-between p-4 rounded-2xl ${i === 0 ? "bg-teal-50 border border-teal-100" : "bg-slate-50"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${i === 0 ? "bg-teal-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                          <Activity size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{a.weight} kg · {a.height} cm</p>
                          <p className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                            <Calendar size={10} /> {formatDate(a.created_at)}
                          </p>
                        </div>
                      </div>
                      <ClinicalBadge status={pred?.stunt_status ?? "NORMAL"} />
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Right: Consultations ── */}
        <div className="flex flex-col gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <h2 className="text-lg font-extrabold text-slate-800 mb-4">Riwayat Konsultasi</h2>
            {childConsultations.length === 0 ? (
              <p className="text-slate-400 font-semibold text-sm text-center py-6">Belum ada konsultasi.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {childConsultations.map((c: Consultation) => (
                  <button
                    key={c.id}
                    onClick={() => router.push("/medic/consultations")}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-700">{c.status === "OPEN" ? "🟢 Aktif" : "⚫ Selesai"}</p>
                      <p className="text-xs font-semibold text-slate-400">{formatDate(c.updated_at)}</p>
                    </div>
                    <MessageCircle size={16} className="text-slate-300" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </MedicShell>
  );
}
