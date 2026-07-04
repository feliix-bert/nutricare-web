"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronRight, MessageCircle } from "lucide-react";
import { usePatients } from "@/features/medic/hooks/useMedic";
import { MedicShell, ClinicalBadge } from "@/components/layout/MedicShell";
import { Avatar } from "@/components/common/Avatar";

type Sev = { label: string; bgHighlight: string; order: number };

const SEV: Record<string, Sev> = {
  SEVERELY_STUNTED: { label: "Severe", bgHighlight: "bg-rose-50/80", order: 0 },
  STUNTED: { label: "Stunting", bgHighlight: "bg-amber-50/80", order: 1 },
  AT_RISK: { label: "At Risk", bgHighlight: "bg-yellow-50/50", order: 2 },
};

export default function MedicAlertsPage() {
  const router = useRouter();
  const { data, isLoading } = usePatients(0, 100, "", "ALL");
  const patients = data?.data ?? [];

  const alerts = patients
    .filter((p) => Object.keys(SEV).includes(p.lastStatus))
    .sort((a, b) => (SEV[a.lastStatus]?.order ?? 9) - (SEV[b.lastStatus]?.order ?? 9));

  const critical = alerts.filter((p) => ["SEVERELY_STUNTED", "STUNTED"].includes(p.lastStatus)).length;
  const counts = Object.fromEntries(Object.keys(SEV).map((k) => [k, alerts.filter((p) => p.lastStatus === k).length]));

  return (
    <MedicShell>
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Critical Alerts
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            {alerts.length} patients need attention
          </p>
        </div>
        {critical > 0 && (
          <div className="px-5 py-3 rounded-full bg-rose-50 border border-rose-100 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center animate-pulse">
              <AlertTriangle size={16} className="text-white" />
            </div>
            <p className="text-sm font-bold text-rose-700">
              {critical} critical cases detected
            </p>
          </div>
        )}
      </div>

      {/* ── Table (Medica Style) ── */}
      <div className="flex-1 overflow-x-auto">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 font-bold">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-lime-100 flex items-center justify-center">
              <AlertTriangle size={32} className="text-lime-600" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-800">All Clear! 🎉</p>
              <p className="text-sm font-bold text-slate-400 mt-1">No patients require special attention.</p>
            </div>
          </div>
        ) : (
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="pb-4 px-4">Patient Name</th>
                <th className="pb-4 px-4">Age</th>
                <th className="pb-4 px-4">Parent</th>
                <th className="pb-4 px-4">Last Exam</th>
                <th className="pb-4 px-4">Status</th>
                <th className="pb-4 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((p) => {
                const sev = SEV[p.lastStatus];
                return (
                  <tr
                    key={p.childId}
                    className={`group border-b border-white ${sev?.bgHighlight ?? "bg-slate-50"} hover:brightness-95 transition-all`}
                  >
                    <td className="py-4 px-4 rounded-l-2xl">
                      <div className="flex items-center gap-3">
                        <Avatar seed={p.childName} variant="parent" size="md" />
                        <span className="font-bold text-slate-800">{p.childName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-600">
                      {p.ageMonths} mo
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-500">
                      {p.parentName}
                    </td>
                    <td className="py-4 px-4 text-sm font-bold text-slate-400">
                      {p.lastAssessmentDate
                        ? new Date(p.lastAssessmentDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="py-4 px-4">
                      <ClinicalBadge status={p.lastStatus} />
                    </td>
                    <td className="py-4 px-4 rounded-r-2xl text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => router.push(`/medic/patients/${p.childId}`)}
                          className="px-4 py-2 rounded-full bg-white text-slate-700 font-bold text-xs shadow-sm hover:bg-slate-50 transition-colors"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => router.push("/medic/consultations")}
                          className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-sm shadow-teal-500/30 hover:scale-105 transition-transform"
                        >
                          <MessageCircle size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </MedicShell>
  );
}
