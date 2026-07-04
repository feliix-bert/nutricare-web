"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft, MessageCircle, Weight, Ruler,
  TrendingDown, TrendingUp, Calendar, FileCheck, Phone
} from "lucide-react";
import { usePatientSummary } from "@/features/medic/hooks/useMedic";
import { MedicShell, ClinicalBadge } from "@/components/layout/MedicShell";
import { Avatar } from "@/components/common/Avatar";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcAgeMonths(birthDate: string) {
  const b = new Date(birthDate);
  const n = new Date();
  return (n.getFullYear() - b.getFullYear()) * 12 + (n.getMonth() - b.getMonth());
}

// ─── Z-score bar (Medica Style) ───────────────────────────────────────────────
function ZBar({ label, value }: { label: string; value?: number }) {
  if (value == null) return null;
  const clamped = Math.max(-4, Math.min(4, value));
  const pct = ((clamped + 4) / 8) * 100;
  
  // Vibrant colors for Medica style
  const color = value < -3 ? "#ef4444" : value < -2 ? "#f59e0b" : value < -1 ? "#eab308" : "#14b8a6";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-500">
          {label}
        </span>
        <span className="text-sm font-extrabold" style={{ color }}>
          {value > 0 ? "+" : ""}{value.toFixed(2)} SD
        </span>
      </div>

      <div className="relative h-4 w-full">
        {/* Thick rounded track */}
        <div className="absolute inset-0 rounded-full bg-slate-100" />
        
        {/* Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-0 bottom-0 left-0 rounded-full"
          style={{ background: color }}
        />
        
        {/* Zero marker (center) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-full shadow-sm" />
      </div>

      <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase">
        <span>Severe</span><span>Normal</span><span>Over</span>
      </div>
    </div>
  );
}

// ─── Metric tile (Medica Style) ───────────────────────────────────────────────
function MetricTile({
  label, value, unit, icon: Icon, bgClass, textClass
}: {
  label: string; value?: number | string; unit: string; icon: React.ElementType; bgClass: string; textClass: string;
}) {
  return (
    <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-white border border-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${bgClass}`}>
        <Icon size={24} className={textClass} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-2xl font-extrabold text-slate-800 leading-none">
          {value ?? "—"} <span className="text-sm font-bold text-slate-400">{unit}</span>
        </p>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function PatientDetailPage() {
  const { childId } = useParams<{ childId: string }>();
  const router = useRouter();
  const { data: child, isLoading } = usePatientSummary(childId);

  if (isLoading) {
    return (
      <MedicShell>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-xl font-bold text-slate-400">Loading patient data...</div>
        </div>
      </MedicShell>
    );
  }

  if (!child) {
    return (
      <MedicShell>
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-xl font-bold text-slate-400">Patient not found</p>
          <button onClick={() => router.back()} className="px-6 py-3 rounded-full bg-slate-900 text-white font-bold">
            Back to Patients
          </button>
        </div>
      </MedicShell>
    );
  }

  const ageMonths = calcAgeMonths(child.birth_date);
  const parent = child.users as unknown as { name: string; phone?: string } | undefined;
  const assessments = (child.assessments as any[]) ?? [];
  const sorted = [...assessments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const latest = sorted[0];
  const latestPred = Array.isArray(latest?.predictions)
    ? latest.predictions[0]
    : latest?.predictions;

  return (
    <MedicShell>
      {/* ── Top Nav / Breadcrumb ── */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-extrabold text-slate-800">Patient Detail</h1>
      </div>

      {/* ── Layout Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
        
        {/* Left Column */}
        <div className="flex flex-col gap-8">
          
          {/* Profile Card (Medica Style - soft colors, large padding) */}
          <div className="p-8 rounded-[2rem] bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-100/50 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
              <div className="p-2 bg-white rounded-full shadow-sm">
                <Avatar seed={child.name} variant="parent" size="xl" />
              </div>
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{child.name}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                  <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-slate-600 shadow-sm">
                    {ageMonths} months
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-slate-600 shadow-sm">
                    {child.gender === "MALE" ? "Male" : "Female"}
                  </span>
                  {latestPred && <ClinicalBadge status={latestPred.stunt_status} />}
                </div>
                
                {/* Parent Info */}
                <div className="flex items-center gap-4 text-sm font-bold text-slate-600 bg-white/60 px-4 py-2 rounded-2xl inline-flex">
                  <span className="text-slate-400 uppercase text-[10px] tracking-wider">Parent</span>
                  <span>{parent?.name ?? "—"}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  <Phone size={14} className="text-slate-400" />
                  <span>{parent?.phone ?? "No phone"}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button
                onClick={() => router.push("/medic/consultations")}
                className="w-full md:w-auto px-6 py-3 rounded-full bg-teal-500 text-white font-bold shadow-lg shadow-teal-500/20 hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} /> Chat Parent
              </button>
              <button
                className="w-full md:w-auto px-6 py-3 rounded-full bg-white text-slate-700 font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <FileCheck size={18} /> Medical Report
              </button>
            </div>
          </div>

          {/* Assessment History Table */}
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 mb-4">Measurement History</h3>
            <div className="overflow-x-auto">
              {sorted.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-bold">No history available.</div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="pb-4 px-4">Date</th>
                      <th className="pb-4 px-4">Weight</th>
                      <th className="pb-4 px-4">Height</th>
                      <th className="pb-4 px-4">HAZ</th>
                      <th className="pb-4 px-4">WAZ</th>
                      <th className="pb-4 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((a, i) => {
                      const pred = Array.isArray(a.predictions) ? a.predictions[0] : a.predictions;
                      return (
                        <tr key={a.id} className="group hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-4 rounded-l-2xl border-t border-slate-50 group-hover:border-transparent">
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-slate-300" />
                              <span className="font-bold text-slate-600">
                                {new Date(a.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                              {i === 0 && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-lime-200 text-lime-800 ml-2">
                                  LATEST
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 border-t border-slate-50 group-hover:border-transparent font-bold text-slate-700">
                            {a.weight_kg ?? "—"} kg
                          </td>
                          <td className="py-4 px-4 border-t border-slate-50 group-hover:border-transparent font-bold text-slate-700">
                            {a.height_cm ?? "—"} cm
                          </td>
                          <td className="py-4 px-4 border-t border-slate-50 group-hover:border-transparent font-bold" style={{ color: pred?.zscore_ha < -2 ? "#ef4444" : "inherit" }}>
                            {pred?.zscore_ha?.toFixed(2) ?? "—"}
                          </td>
                          <td className="py-4 px-4 border-t border-slate-50 group-hover:border-transparent font-bold" style={{ color: pred?.zscore_wa < -2 ? "#ef4444" : "inherit" }}>
                            {pred?.zscore_wa?.toFixed(2) ?? "—"}
                          </td>
                          <td className="py-4 px-4 border-t border-slate-50 group-hover:border-transparent rounded-r-2xl">
                            {pred?.stunt_status ? <ClinicalBadge status={pred.stunt_status} /> : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Latest Metrics & Z-Scores */}
        {latest && (
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-extrabold text-slate-800">Latest Metrics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <MetricTile 
                label="Weight" value={latest.weight_kg} unit="kg" icon={Weight} 
                bgClass="bg-lime-100" textClass="text-lime-600" 
              />
              <MetricTile 
                label="Height" value={latest.height_cm} unit="cm" icon={Ruler} 
                bgClass="bg-sky-100" textClass="text-sky-600" 
              />
            </div>

            {latestPred && (
              <div className="mt-4 p-6 rounded-[2rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-6">
                <h4 className="text-base font-extrabold text-slate-800">Growth Standards (WHO)</h4>
                
                <ZBar label="Height for Age (HAZ)" value={latestPred.zscore_ha} />
                <ZBar label="Weight for Age (WAZ)" value={latestPred.zscore_wa} />
                <ZBar label="Weight for Height (WHZ)" value={latestPred.zscore_wh} />

                {latestPred.summary && (
                  <div className="mt-4 p-5 rounded-3xl bg-amber-50 text-amber-900 text-sm font-bold leading-relaxed shadow-sm">
                    {latestPred.summary}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </MedicShell>
  );
}
