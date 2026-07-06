"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Users, MessageCircle, AlertTriangle, TrendingUp,
  ArrowUpRight, Clock, ChevronRight
} from "lucide-react";
import { usePatients } from "@/features/medic/hooks/useMedic";
import { useConsultationList } from "@/features/medic/hooks/useConsultation";
import { MedicShell, MedicSectionHead, ClinicalBadge } from "@/components/layout/MedicShell";
import { Avatar } from "@/components/common/Avatar";
import { useAuthStore } from "@/stores/authStore";

// ─── Stat Card (Medica Style) ────────────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, dateText, iconBg, iconColor
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  dateText?: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all"
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        <Icon size={24} style={{ color: iconColor }} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--color-medic-text-subtle)" }}>
          {label}
        </p>
        <p className="text-2xl font-extrabold leading-none" style={{ color: "var(--color-medic-text)" }}>
          {value}
        </p>
      </div>
      {dateText && (
        <div className="hidden xl:block text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-50 text-slate-400">
          {dateText}
        </div>
      )}
    </motion.div>
  );
}

// ─── Simple Bar Chart ────────────────────────────────────────────────────────
function SimpleBarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end justify-between h-48 mt-6 gap-2">
      {data.map((d, i) => {
        const heightPct = (d.value / max) * 100;
        return (
          <div key={i} className="flex flex-col items-center flex-1 gap-2 group relative">
            {/* Tooltip */}
            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-[#f59e0b] text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 pointer-events-none">
              {d.value}
            </div>
            <div className="w-full max-w-[2.5rem] h-full flex items-end justify-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                className="w-full rounded-full transition-colors"
                style={{
                  background: heightPct > 80 ? "var(--color-medic-accent)" : "var(--color-medic-blue)",
                }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function MedicDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data: pData, isLoading } = usePatients(0, 50, "", "ALL");
  const { data: cData } = useConsultationList();

  const patients = pData?.data ?? [];
  const consultations = (cData ?? []).filter((c: any) => c.status === "OPEN");

  const total = pData?.totalElements ?? patients.length;
  const critical = patients.filter((p) => ["STUNTED", "SEVERELY_STUNTED"].includes(p.lastStatus)).length;
  const activeConsults = consultations.length;
  const newThisWeek = patients.filter((p) => {
    if (!p.lastAssessmentDate) return false;
    const d = new Date(p.lastAssessmentDate);
    const w = new Date(); w.setDate(w.getDate() - 7);
    return d >= w;
  }).length;

  const todayStr = new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  
  // Calculate real chart data representing patient assessments over the last 6 months
  const chartData = React.useMemo(() => {
    const counts = new Array(6).fill(0);
    const labels = new Array(6).fill("");
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels[5 - i] = d.toLocaleDateString("en-US", { month: "short" });
    }

    patients.forEach((p) => {
      (p as any).assessments?.forEach((a: any) => {
        const d = new Date(a.created_at);
        const monthDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
        if (monthDiff >= 0 && monthDiff < 6) {
          counts[5 - monthDiff]++;
        }
      });
    });

    return labels.map((label, i) => ({ label, value: counts[i] }));
  }, [patients]);

  return (
    <MedicShell>
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-sm font-bold text-slate-400 mb-1">
            Hi {user?.name?.split(" ")[0] ?? "Doctor"},
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Good Morning!
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-50 text-sm font-bold text-slate-600 border border-slate-100">
            <div className="w-6 h-6 rounded-full bg-lime-100 flex items-center justify-center">
              <Clock size={12} className="text-lime-700" />
            </div>
            {todayStr}
          </div>
          <button className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold shadow-lg shadow-slate-900/20 hover:scale-105 transition-transform">
            Export <ArrowUpRight size={14} className="inline ml-1" />
          </button>
        </div>
      </div>

      {/* ── Main Layout Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[320px_1fr_360px] gap-6 xl:gap-8">
        
        {/* Left Col: Stat Cards */}
        <div className="flex flex-col gap-4">
          <StatCard
            label="Total Patients"
            value={total}
            icon={Users}
            iconBg="var(--color-medic-lime)"
            iconColor="var(--color-medic-lime-text)"
            dateText="Update Today"
          />
          <StatCard
            label="Active Consults"
            value={activeConsults}
            icon={MessageCircle}
            iconBg="#cffafe" // cyan-100
            iconColor="#0891b2" // cyan-600
            dateText="Update Today"
          />
          <StatCard
            label="Critical Alerts"
            value={critical}
            icon={AlertTriangle}
            iconBg="#fee2e2" // red-100
            iconColor="#dc2626" // red-600
            dateText="Update Today"
          />
          <StatCard
            label="New This Week"
            value={newThisWeek}
            icon={TrendingUp}
            iconBg="#fef3c7" // amber-100
            iconColor="#d97706" // amber-600
            dateText="Update Today"
          />
        </div>

        {/* Middle Col: Chart & Table */}
        <div className="flex flex-col gap-8 min-w-0">
          {/* Chart Container */}
          <div className="p-6 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-800">Patient Statistic</h2>
              <ArrowUpRight size={20} className="text-slate-400" />
            </div>
            <SimpleBarChart data={chartData} />
          </div>

          {/* Table Container */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-slate-800">Recent Patients</h2>
              <button
                onClick={() => router.push("/medic/patients")}
                className="text-sm font-bold text-slate-400 hover:text-teal-500 transition-colors"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-4 pr-4">Patient Name</th>
                    <th className="pb-4 px-4">Age</th>
                    <th className="pb-4 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={3} className="py-4 text-center text-slate-400">Loading...</td></tr>
                  ) : patients.slice(0, 5).map((p) => (
                    <tr
                      key={p.childId}
                      className="group cursor-pointer"
                      onClick={() => router.push(`/medic/patients/${p.childId}`)}
                    >
                      <td className="py-3 pr-4 border-t border-slate-50 group-hover:bg-slate-50/50 rounded-l-2xl transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar seed={p.childName} variant="parent" size="sm" />
                          <span className="font-bold text-slate-700">{p.childName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-t border-slate-50 group-hover:bg-slate-50/50 text-sm font-semibold text-slate-500 transition-colors">
                        {p.ageMonths} mo
                      </td>
                      <td className="py-3 px-4 border-t border-slate-50 group-hover:bg-slate-50/50 rounded-r-2xl transition-colors">
                        <ClinicalBadge status={p.lastStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Consultations/Appointments */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-extrabold text-slate-800">Active Consults</h2>
            <ArrowUpRight size={20} className="text-slate-400" />
          </div>

          {/* Date Pills */}
          <div className="flex items-center gap-2 mb-2 overflow-x-auto no-scrollbar pb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
              <div
                key={day}
                className={`flex flex-col items-center justify-center min-w-[3rem] p-2 rounded-2xl ${
                  i === 3 ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-500"
                }`}
              >
                <span className="text-[10px] font-bold">{day}</span>
                <span className={`text-sm font-extrabold mt-1 ${i === 3 ? "text-white" : "text-slate-800"}`}>
                  {i + 7}
                </span>
              </div>
            ))}
          </div>

          {/* Consult Cards */}
          <div className="flex flex-col gap-3">
            {consultations.length === 0 ? (
              <div className="p-6 text-center rounded-[2rem] bg-slate-50 text-slate-400 text-sm font-bold">
                No active consultations.
              </div>
            ) : consultations.slice(0, 3).map((c: any, i: number) => {
              // Alternate colors like in reference
              const isTeal = i % 2 !== 0;
              const bg = isTeal ? "var(--color-medic-accent)" : "#fcd34d"; // teal vs amber
              const color = isTeal ? "#fff" : "#1e293b"; // white vs dark text

              return (
                <div
                  key={c.id}
                  onClick={() => router.push("/medic/consultations")}
                  className="flex items-center gap-3 p-2 pr-4 rounded-full cursor-pointer hover:scale-[1.02] transition-transform"
                  style={{ background: bg, color: color }}
                >
                  <div className="bg-white/20 p-1 rounded-full">
                    <Avatar seed={c.children?.name ?? "P"} variant="parent" size="sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">Chat with {c.children?.name}</p>
                    <p className="text-[10px] font-semibold opacity-80 mt-0.5">
                      Waiting for reply
                    </p>
                  </div>
                </div>
              );
            })}
            
            <button
              onClick={() => router.push("/medic/consultations")}
              className="mt-2 py-3 rounded-full bg-slate-50 text-slate-500 font-bold text-sm hover:bg-slate-100 transition-colors"
            >
              + Open Consultation
            </button>
          </div>
        </div>

      </div>
    </MedicShell>
  );
}
