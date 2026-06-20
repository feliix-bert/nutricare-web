"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChevronRight, Weight, Ruler, TrendingUp, Search, Bell, Plus, CalendarDays, Flame } from "lucide-react";
import { ReminderCard } from "@/components/home/ReminderCard";
import { ActivityTimeline } from "@/components/home/ActivityTimeline";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@/components/ui/Empty";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/common/Avatar";
import { PageShell } from "@/components/layout/PageShell";
import { UtensilsIcon } from "@/components/icons/utensils";
import { useChildrenList } from "@/features/children/hooks/useChildren";

/* ── Small bar chart inside metric card ── */
const SparkBars = React.memo(({ color }: { color: string }) => (
  <div className="flex gap-[3px] h-6 items-end">
    {[40, 55, 45, 70, 100].map((h, i) => (
      <motion.div
        key={i}
        initial={{ height: 0 }}
        animate={{ height: `${h}%` }}
        transition={{ duration: 0.6, delay: 0.6 + i * 0.08, ease: "easeOut" }}
        className="flex-1 rounded-sm"
        style={{ backgroundColor: color, opacity: 0.2 + i * 0.2 }}
      />
    ))}
  </div>
));
SparkBars.displayName = "SparkBars";

/* ── Macro pill ── */
const MacroPill = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className="w-1.5 h-1.5 rounded-full"
      style={{ backgroundColor: color }}
    />
    <span className="text-[10px] font-bold text-on-surface" style={{ color }}>{value}</span>
    <span className="text-[9px] text-on-surface-variant/60 font-medium">{label}</span>
  </div>
);

/* ── Child selector pill ── */
function ChildPill({
  child,
  isActive,
  onPress,
}: {
  child: { id: string; name: string; ageMonths: number };
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <button
      onClick={onPress}
      className={`relative flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full border text-sm transition-all duration-200 ${
        isActive
          ? "bg-primary text-white border-primary shadow-sm"
          : "bg-white border-outline-variant/15 text-on-surface-variant hover:border-primary/30 hover:text-on-surface"
      }`}
    >
      <Avatar seed={child.name} variant="child" size="sm" className="border-0 shadow-none" />
      <span className="font-semibold whitespace-nowrap">
        {child.name}
      </span>
      <span className={`text-xs ${isActive ? "text-white/70" : "text-on-surface-variant/50"}`}>
        {child.ageMonths}bln
      </span>
    </button>
  );
}

/* ── Home Page ── */
export default function HomePage() {
  const router = useRouter();
  const { data, isLoading } = useChildrenList();
  const children = data?.data ?? [];
  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const activeChild = children.find((c) => c.id === activeChildId) ?? children[0];

  if (!activeChild) {
    return (
      <PageShell>
        <Empty>
          <EmptyHeader>
            <EmptyMedia><Avatar seed="new" variant="child" size="xl" /></EmptyMedia>
            <EmptyTitle>Belum Ada Data Anak</EmptyTitle>
            <EmptyDescription>Tambahkan data anak untuk mulai memantau.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => router.push("/children/new")} variant="glow">Tambah Anak</Button>
          </EmptyContent>
        </Empty>
      </PageShell>
    );
  }

  const isAndi = activeChild.name.toLowerCase().includes("andi");
  const growthPct = isAndi ? 91 : 94;
  const calorieTarget = isAndi ? 1350 : 850;
  const calorieConsumed = isAndi ? 920 : 580;
  const caloriePct = Math.round((calorieConsumed / calorieTarget) * 100);
  const weightVal = isAndi ? "9.5" : "7.1";
  const heightVal = isAndi ? "74.0" : "65.0";
  const weightChange = isAndi ? "+0.2 kg" : "+0.35 kg";
  const heightChange = isAndi ? "+1.2 cm" : "+1.5 cm";

  const macros = isAndi
    ? [{ label: "Protein", value: "62g", color: "#2d8a7e" }, { label: "Lemak", value: "24g", color: "#6b9e6b" }, { label: "Karbo", value: "46g", color: "#d4a454" }]
    : [{ label: "Protein", value: "38g", color: "#2d8a7e" }, { label: "Lemak", value: "18g", color: "#6b9e6b" }, { label: "Karbo", value: "32g", color: "#d4a454" }];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      <PageShell
        header={
          <div className="flex flex-col gap-4">
            {/* ── Top bar ── */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/profile")}
                  className="flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30"
                  aria-label="Profil"
                >
                  <Avatar
                    seed="Ibu Ani"
                    variant="parent"
                    size="md"
                    className="ring-2 ring-white shadow-sm"
                  />
                </button>
                <div className="leading-tight">
                  <p className="text-[13px] text-on-surface-variant font-medium">Halo,</p>
                  <h1 className="text-[18px] font-extrabold text-on-surface tracking-tight">Ibu Ani</h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Search */}
                <button
                  id="home-search-btn"
                  aria-label="Cari"
                  className="flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-full bg-white border border-outline-variant/12 shadow-sm text-on-surface-variant/60 hover:border-primary/20 hover:text-on-surface-variant transition-all duration-200 text-sm"
                >
                  <Search size={14} />
                  <span className="hidden md:inline font-medium">Cari...</span>
                </button>
                {/* Bell */}
                <button
                  id="home-notif-btn"
                  aria-label="Notifikasi"
                  className="relative w-9 h-9 rounded-full bg-white border border-outline-variant/12 shadow-sm flex items-center justify-center text-on-surface-variant hover:border-primary/20 hover:text-primary transition-all duration-200"
                >
                  <Bell size={16} />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-danger border border-white" />
                </button>
              </div>
            </div>

            {/* ── Child pills ── */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {children.map((child) => (
                <ChildPill
                  key={child.id}
                  child={child}
                  isActive={child.id === activeChild.id}
                  onPress={() => setActiveChildId(child.id)}
                />
              ))}
              <button
                onClick={() => router.push("/children/new")}
                id="add-child-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-outline-variant/30 text-on-surface-variant/60 hover:border-primary/30 hover:text-primary transition-all duration-200 text-sm font-medium whitespace-nowrap"
              >
                <Plus size={13} />
                Tambah
              </button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4 md:gap-5 mt-2">

          {/* ══ ROW 1 — Growth Hero + Metrics ══ */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

            {/* Growth card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="md:col-span-5"
            >
              <div
                className="rounded-2xl p-5 md:p-6 relative overflow-hidden border border-primary/10"
                style={{ background: "linear-gradient(145deg, #d4f0eb 0%, #c8ecdb 50%, #ddf0dd 100%)" }}
              >
                {/* Decorative circle */}
                <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/20 pointer-events-none" />

                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-full text-xs font-bold text-primary mb-3">
                      <TrendingUp size={11} strokeWidth={2.5} />
                      {activeChild.latestPrediction?.status ?? "NORMAL"}
                    </div>
                    <p className="text-5xl font-extrabold text-on-surface leading-none">{growthPct}%</p>
                    <p className="text-sm font-semibold text-on-surface/60 mt-1">Tumbuh Kembang Optimal</p>
                  </div>

                  {/* Circular progress */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80" width="80" height="80">
                      <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.5)" strokeWidth="6" fill="white" />
                      <motion.circle
                        cx="40" cy="40" r="34"
                        stroke="#2d8a7e" strokeWidth="6" fill="none" strokeLinecap="round"
                        initial={{ strokeDasharray: 214, strokeDashoffset: 214 }}
                        animate={{ strokeDashoffset: 214 - (214 * growthPct) / 100 }}
                        transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-extrabold text-on-surface">{caloriePct}%</span>
                      <span className="text-[9px] text-on-surface-variant font-medium">kalori</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/children/${activeChild.id}`)}
                  className="mt-4 w-full bg-white/75 hover:bg-white rounded-xl py-2.5 flex items-center justify-center gap-1.5 border border-white/50 hover:shadow-sm transition-all duration-200 group"
                >
                  <span className="text-sm font-bold text-primary">Lihat Detail</span>
                  <ChevronRight size={15} className="text-primary group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>

            {/* Metric tiles */}
            <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">

              {/* Weight */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="bg-white rounded-2xl p-4 border border-outline-variant/8 shadow-card hover:shadow-card-hover transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-container/50 flex items-center justify-center">
                    <Weight size={15} className="text-primary" />
                  </div>
                  <span className="text-[11px] font-bold text-secondary-on-container bg-secondary-container/40 px-2 py-0.5 rounded-full">
                    {weightChange}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider mb-0.5">Berat</p>
                <p className="text-2xl font-extrabold text-on-surface">{weightVal}<span className="text-sm font-semibold text-on-surface-variant ml-0.5">kg</span></p>
                <div className="mt-2.5">
                  <SparkBars color="#2d8a7e" />
                </div>
              </motion.div>

              {/* Height */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white rounded-2xl p-4 border border-outline-variant/8 shadow-card hover:shadow-card-hover transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-tertiary-container/50 flex items-center justify-center">
                    <Ruler size={15} className="text-tertiary-on-container" />
                  </div>
                  <span className="text-[11px] font-bold text-tertiary-on-container bg-tertiary-container/50 px-2 py-0.5 rounded-full">
                    {heightChange}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider mb-0.5">Tinggi</p>
                <p className="text-2xl font-extrabold text-on-surface">{heightVal}<span className="text-sm font-semibold text-on-surface-variant ml-0.5">cm</span></p>
                <div className="mt-2.5">
                  <SparkBars color="#d4a454" />
                </div>
              </motion.div>

              {/* Nutrition */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="col-span-2 md:col-span-1 bg-white rounded-2xl p-4 border border-outline-variant/8 shadow-card hover:shadow-card-hover transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-container/40 flex items-center justify-center">
                      <UtensilsIcon size={15} className="text-primary" />
                    </div>
                    <p className="text-[11px] text-on-surface-variant font-semibold uppercase tracking-wider">Nutrisi</p>
                  </div>
                  <button
                    onClick={() => router.push("/scanner")}
                    aria-label="Tambah scan"
                    className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white hover:shadow-glow transition-all duration-200"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Calorie bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-1">
                      <Flame size={12} className="text-tertiary-on-container" />
                      <span className="text-sm font-extrabold text-on-surface">{calorieConsumed}</span>
                    </div>
                    <span className="text-xs text-on-surface-variant">/ {calorieTarget} kkal</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-high overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${caloriePct}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.7 }}
                      className="h-full rounded-full gradient-primary"
                    />
                  </div>
                </div>

                {/* Macro dots */}
                <div className="flex justify-around">
                  {macros.map((m) => <MacroPill key={m.label} {...m} />)}
                </div>
              </motion.div>
            </div>
          </div>

          {/* ══ ROW 2 — Quick Stats (desktop) ══ */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="hidden lg:grid grid-cols-4 gap-3"
          >
            {[
              { label: "Assessment Selesai", value: "3", unit: "bulan ini", bg: "bg-primary-container/30 border-primary/8" },
              { label: "Status Gizi", value: "Optimal", unit: "terkini", bg: "bg-secondary-container/30 border-secondary/8" },
              { label: "Imunisasi", value: "8/12", unit: "lengkap", bg: "bg-tertiary-container/30 border-tertiary/8" },
              { label: "Konsultasi AI", value: "5", unit: "minggu ini", bg: "bg-accent-light/30 border-accent/8" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.06 }}
                className={`px-4 py-3.5 rounded-2xl border ${stat.bg}`}
              >
                <p className="text-xs text-on-surface-variant font-medium mb-0.5">{stat.label}</p>
                <p className="text-xl font-extrabold text-on-surface leading-tight">{stat.value}</p>
                <p className="text-[11px] text-on-surface-variant/50 font-medium">{stat.unit}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* ══ ROW 3 — Assessment CTA ══ */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            onClick={() => router.push(`/children/${activeChild.id}/assessment/body-size`)}
            className="group w-full flex items-center justify-between p-4 rounded-2xl bg-white border border-outline-variant/8 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-sm group-hover:shadow-glow transition-shadow duration-300">
                <CalendarDays size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Mulai Assessment Bulan Ini</p>
                <p className="text-xs text-on-surface-variant font-medium">Belum ada assessment bulan ini</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
          </motion.button>

          {/* ══ ROW 4 — Reminders + Activity ══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <ReminderCard />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <ActivityTimeline />
            </motion.div>
          </div>
        </div>
      </PageShell>
    </motion.div>
  );
}
