"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Flame, TrendingUp, Zap } from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/common/Avatar";
import { PageShell } from "@/components/layout/PageShell";
import { ScanLineIcon } from "@/components/icons/scan-line";
import { PlusIcon } from "@/components/icons/plus";
import { useNutritionStore, NutritionLog } from "@/stores/nutritionStore";
import { getAvatarUri } from "@/utils/avatar";

type SuggestionItem = {
  id: string;
  name: string;
  ageRange: string;
  description: string;
  seed: string;
};

const SUGGESTIONS: SuggestionItem[] = [
  {
    id: "sug_1",
    name: "Bubur Salmon Labu",
    ageRange: "6–8 Bulan",
    description: "Kaya Omega-3 & Vitamin A",
    seed: "bubur-salmon-labu",
  },
  {
    id: "sug_2",
    name: "Nasi Tim Ayam Brokoli",
    ageRange: "9–12 Bulan",
    description: "Tekstur cincang halus",
    seed: "nasi-tim-ayam",
  },
  {
    id: "sug_3",
    name: "Puree Alpukat Halus",
    ageRange: "6 Bulan",
    description: "Lemak sehat untuk otak",
    seed: "puree-alpukat",
  },
];

function formatTimeLocal(dateString: string) {
  return new Date(dateString).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

const MACRO_COLORS = {
  Protein: "#2d8a7e",
  Lemak: "#6b9e6b",
  Karbohidrat: "#d4a454",
  Serat: "#c47d3e",
};

function MacroBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-on-surface-variant">{label}</span>
        <span className="text-xs font-bold text-on-surface">{value}g</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-high overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function LogItem({ item, onRemove, index }: { item: NutritionLog; onRemove: () => void; index: number }) {
  const foodAvatar = getAvatarUri(item.foodDetected.join("-"), "food");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-outline-variant/8 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative bg-primary-container/30 shadow-sm">
        {item.photoUrl ? (
          <Image src={item.photoUrl} alt="Makanan" fill sizes="48px" className="object-cover" />
        ) : (
          <Image src={foodAvatar} alt="Makanan" fill sizes="48px" className="object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center gap-2 mb-1">
          <span className="font-bold text-on-surface text-sm truncate group-hover:text-primary transition-colors duration-200">
            {item.foodDetected.join(", ")}
          </span>
          <span className="text-[11px] text-on-surface-variant font-medium flex-shrink-0 bg-surface-high px-2 py-0.5 rounded-full">
            {formatTimeLocal(item.createdAt)}
          </span>
        </div>
        <p className="text-xs text-primary font-semibold mb-0.5">{item.portionEstimate}</p>
        <p className="text-xs text-on-surface-variant">
          {item.calories} kkal · P: {item.protein}g · L: {item.fat}g · K: {item.carbs}g
        </p>
      </div>
      <button
        onClick={onRemove}
        aria-label="Hapus log"
        className="p-2 rounded-xl hover:bg-danger-light transition-all duration-200 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:scale-110"
      >
        <X size={15} className="text-danger" />
      </button>
    </motion.div>
  );
}

export default function NutritionPage() {
  const router = useRouter();
  const logs = useNutritionStore((s) => s.logs);
  const removeLog = useNutritionStore((s) => s.removeLog);

  const totalCalories = logs.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProtein = Math.round(logs.reduce((acc, curr) => acc + curr.protein, 0) * 10) / 10;
  const totalFat = Math.round(logs.reduce((acc, curr) => acc + curr.fat, 0) * 10) / 10;
  const totalCarbs = Math.round(logs.reduce((acc, curr) => acc + curr.carbs, 0) * 10) / 10;
  const totalFiber = Math.round(logs.reduce((acc, curr) => acc + (curr.fiber || 0), 0) * 10) / 10;

  const calorieGoal = 800;
  const caloriePercent = Math.min(100, Math.round((totalCalories / calorieGoal) * 100));

  const macroGoals = { Protein: 60, Lemak: 30, Karbohidrat: 100, Serat: 10 };

  return (
    <PageShell
      title="Nutrisi"
      subtitle="Pantau asupan gizi harian si kecil"
      actions={<Avatar seed="Ibu Ani" variant="parent" size="md" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Column ── */}
        <div className="lg:col-span-8 flex flex-col gap-5">

          {/* Hero Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="rounded-[2rem] p-6 md:p-8 border border-primary/10 shadow-card relative overflow-hidden"
              style={{ background: "linear-gradient(145deg, #d4f0eb 0%, #c8ecdb 40%, #ddf0dd 80%, #faf0dc 100%)" }}
            >
              <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/15" aria-hidden />
              <div className="absolute top-8 -right-4 w-24 h-24 rounded-full bg-white/10" aria-hidden />

              <div className="flex items-center gap-2 mb-5 relative z-10">
                <div className="w-7 h-7 rounded-lg bg-white/70 flex items-center justify-center">
                  <Flame size={14} className="text-tertiary-on-container" />
                </div>
                <p className="text-sm font-bold text-primary uppercase tracking-wide">Total Nutrisi Hari Ini</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-6 relative z-10">
                <div>
                  <p className="text-5xl md:text-6xl font-extrabold text-on-surface leading-none">{totalCalories}</p>
                  <p className="text-sm text-on-surface-variant mt-1.5 font-medium">dari {calorieGoal} kkal target harian</p>
                </div>
                {/* Circular progress */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.4)" strokeWidth="6" fill="white" />
                    <motion.circle
                      cx="40" cy="40" r="34" stroke="url(#cal-grad)" strokeWidth="6" fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: 214, strokeDashoffset: 214 }}
                      animate={{ strokeDashoffset: 214 - (214 * caloriePercent) / 100 }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                    />
                    <defs>
                      <linearGradient id="cal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#2d8a7e" />
                        <stop offset="100%" stopColor="#6b9e6b" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-extrabold text-on-surface">{caloriePercent}%</span>
                    <span className="text-[9px] font-semibold text-on-surface-variant">target</span>
                  </div>
                </div>
              </div>

              {/* Macro bars */}
              <div className="grid grid-cols-2 gap-3 pt-5 border-t border-primary/12 relative z-10">
                <MacroBar label="Protein" value={totalProtein} total={macroGoals.Protein} color={MACRO_COLORS.Protein} />
                <MacroBar label="Lemak" value={totalFat} total={macroGoals.Lemak} color={MACRO_COLORS.Lemak} />
                <MacroBar label="Karbohidrat" value={totalCarbs} total={macroGoals.Karbohidrat} color={MACRO_COLORS.Karbohidrat} />
                <MacroBar label="Serat" value={totalFiber} total={macroGoals.Serat} color={MACRO_COLORS.Serat} />
              </div>
            </div>
          </motion.div>

          {/* Log List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-on-surface tracking-tight">Riwayat Hari Ini</h2>
              {logs.length > 0 && (
                <span className="text-xs font-bold text-on-surface-variant bg-surface-high px-3 py-1 rounded-full">
                  {logs.length} makanan
                </span>
              )}
            </div>
            {logs.length === 0 ? (
              <div className="rounded-[2rem] p-10 flex flex-col items-center text-center bg-surface-warm border border-outline-variant/8 shadow-card">
                <div className="w-16 h-16 rounded-2xl bg-primary-container/40 flex items-center justify-center mb-4">
                  <Flame size={28} className="text-primary" />
                </div>
                <p className="font-bold text-on-surface mb-1">Belum Ada Catatan</p>
                <p className="text-sm text-on-surface-variant font-medium">Scan atau input makanan bayi untuk mulai mencatat</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {logs.map((log, i) => (
                  <LogItem key={log.id} item={log} onRemove={() => removeLog(log.id)} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <motion.button
              whileHover={{ y: -3, boxShadow: "0 8px 32px rgba(45,138,126,0.25)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/scanner")}
              className="text-left p-5 rounded-[1.75rem] gradient-primary text-white shadow-card transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <ScanLineIcon size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-white mb-1">AI Vision Scan</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Foto makanan bayi, AI hitung gizinya otomatis.
              </p>
            </motion.button>

            <motion.button
              whileHover={{ y: -3, boxShadow: "0 8px 32px rgba(45,138,126,0.12)" }}
              whileTap={{ scale: 0.97 }}
              className="text-left p-5 rounded-[1.75rem] bg-white border border-outline-variant/10 shadow-card transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-tertiary-container/50 flex items-center justify-center mb-4">
                <PlusIcon size={20} className="text-tertiary-on-container" />
              </div>
              <h3 className="font-bold text-on-surface mb-1">Input Manual</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Cari dari database makanan lokal dan MPASI buatan rumah.
              </p>
            </motion.button>
          </div>

          {/* Daily insight */}
          <div className="p-5 rounded-[1.75rem] bg-surface-warm border border-outline-variant/8 shadow-card">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-tertiary-container/60 flex items-center justify-center">
                <Zap size={15} className="text-tertiary-on-container" />
              </div>
              <h3 className="font-bold text-on-surface text-sm">Tips Nutrisi</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Perkenalkan protein hewani (telur, ikan, daging) pada MPASI usia 6 bulan untuk mencegah defisiensi zat besi.
            </p>
          </div>

          {/* Suggestions */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-on-surface tracking-tight">Saran Menu MPASI</h2>
              <button className="group text-xs font-bold text-primary hover:text-primary-hover transition-colors px-3 py-1.5 rounded-full hover:bg-primary-container/30">
                Lihat Semua
              </button>
            </div>
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible no-scrollbar">
              {SUGGESTIONS.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="group min-w-[220px] lg:min-w-0 flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-outline-variant/8 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative bg-primary-container/20">
                    <Image
                      src={getAvatarUri(item.seed, "food")}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block bg-tertiary-container/60 px-2 py-0.5 rounded-full text-[10px] font-bold text-tertiary-on-container mb-1">
                      {item.ageRange}
                    </span>
                    <p className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors duration-200">{item.name}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
