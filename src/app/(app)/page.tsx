"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChevronRight, Dumbbell, Ruler } from "lucide-react";
import { IntroOverlay } from "@/components/brand/IntroPage";
import { useSessionIntro } from "@/hooks/useSessionIntro";
import { ReminderCard } from "@/components/home/ReminderCard";
import { ActivityTimeline } from "@/components/home/ActivityTimeline";

import { Card } from "@/components/ui/Card";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@/components/ui/Empty";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/common/Avatar";
import { PageShell } from "@/components/layout/PageShell";
import { BellIcon } from "@/components/icons/bell";
import { SearchIcon } from "@/components/icons/search";
import { PlusIcon } from "@/components/icons/plus";
import { UtensilsIcon } from "@/components/icons/utensils";
import { useChildrenList } from "@/features/children/hooks/useChildren";

const MiniBarChart = React.memo(({ color }: { color: string }) => (
  <div className="flex gap-1.5 h-8 items-end mt-3">
    {[3, 4, 5, 3, 8].map((h, i) => (
      <motion.div
        key={i}
        initial={{ height: 0 }}
        animate={{ height: `${h * 3}px` }}
        transition={{ duration: 0.6, delay: 0.4 + i * 0.1, ease: "easeOut" }}
        className="flex-1 rounded-full"
        style={{ backgroundColor: color, opacity: i === 4 ? 1 : 0.25 + i * 0.1 }}
      />
    ))}
  </div>
));
MiniBarChart.displayName = "MiniBarChart";

const NutritionColumn = React.memo(
  ({ label, value, percentage, color }: { label: string; value: string; percentage: number; color: string }) => (
    <div className="flex flex-col items-center flex-1">
      <div className="w-9 md:w-10 h-16 md:h-20 bg-surface-low rounded-full overflow-hidden flex flex-col justify-end mb-2 border border-outline-variant/10">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.6 }}
          style={{ backgroundColor: color, borderRadius: 9999, width: "100%" }}
        />
      </div>
      <span className="text-xs text-outline font-semibold">{label}</span>
      <span className="text-sm font-bold text-on-surface">{value}</span>
    </div>
  )
);
NutritionColumn.displayName = "NutritionColumn";

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
      className={`flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full border transition-all ${
        isActive
          ? "bg-secondary-container border-secondary/20 shadow-sm"
          : "bg-surface-lowest border-outline-variant/15 hover:bg-surface-low"
      }`}
    >
      <Avatar seed={child.name} variant="child" size="sm" className="border-0 shadow-none" />
      <span className={`text-sm font-bold whitespace-nowrap ${isActive ? "text-secondary-on-container" : "text-on-surface-variant"}`}>
        {child.name}
        <span className="text-xs font-medium opacity-70 ml-1">({child.ageMonths} bln)</span>
      </span>
    </button>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { data, isLoading } = useChildrenList();
  const children = data?.data ?? [];
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const { showIntro, dismissIntro, ready: introReady } = useSessionIntro();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const activeChild = children.find((c) => c.id === activeChildId) ?? children[0];

  if (!activeChild) {
    return (
      <PageShell
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar seed="Ibu Ani" variant="parent" size="lg" />
              <div>
                <p className="text-sm text-outline">Halo,</p>
                <h1 className="text-2xl font-bold text-on-surface">Bunda</h1>
              </div>
            </div>
          </div>
        }
      >
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <Avatar seed="new-child" variant="child" size="xl" />
            </EmptyMedia>
            <EmptyTitle>Belum Ada Data Anak</EmptyTitle>
            <EmptyDescription>
              Tambahkan data anak pertama untuk mulai memantau tumbuh kembangnya.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => router.push("/children/new")} variant="primary" size="md" className="px-8">
              Tambah Anak
            </Button>
          </EmptyContent>
        </Empty>
      </PageShell>
    );
  }

  const isAndi = activeChild.name.toLowerCase().includes("andi");
  const growthPercentage = isAndi ? 91 : 94;
  const statusLabel = isAndi ? "Tumbuh Kembang Optimal" : "Tumbuh Sangat Baik";
  const calorieTarget = isAndi ? "1350" : "850";
  const weightChange = isAndi ? "+200g" : "+350g";
  const heightChange = isAndi ? "+1.2cm" : "+1.5cm";
  const weightVal = isAndi ? "9.5" : "7.1";
  const heightVal = isAndi ? "74.0" : "65.0";

  const nutrition = isAndi
    ? [
        { label: "Prot", value: "62.5g", percentage: 75, color: "#8fa4a6" },
        { label: "Lemak", value: "23.6g", percentage: 60, color: "#a3b59a" },
        { label: "Karbo", value: "45.7g", percentage: 70, color: "#c5be95" },
        { label: "RDC", value: "14%", percentage: 14, color: "#f2c4c4" },
      ]
    : [
        { label: "Prot", value: "38.2g", percentage: 80, color: "#8fa4a6" },
        { label: "Lemak", value: "18.4g", percentage: 75, color: "#a3b59a" },
        { label: "Karbo", value: "32.1g", percentage: 65, color: "#c5be95" },
        { label: "RDC", value: "45%", percentage: 45, color: "#f2c4c4" },
      ];

  const displayIntro = introReady && showIntro && !isLoading;

  return (
    <>
      <IntroOverlay show={displayIntro} onComplete={dismissIntro} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: displayIntro ? 0 : 1 }}
        transition={{ duration: 0.7, delay: displayIntro ? 0 : 0.15 }}
      >
        <PageShell
          header={
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar seed="Ibu Ani" variant="parent" size="lg" />
                  <div>
                    <p className="text-sm text-outline font-medium">Selamat pagi,</p>
                    <h1 className="text-xl md:text-2xl font-bold text-on-surface">Hello, Ibu Ani!</h1>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    aria-label="Cari"
                    className="w-10 h-10 rounded-full bg-surface-lowest border border-outline-variant/15 flex items-center justify-center text-primary hover:bg-surface-low transition-colors"
                  >
                    <SearchIcon size={18} />
                  </button>
                  <button
                    aria-label="Notifikasi"
                    className="w-10 h-10 rounded-full bg-surface-lowest border border-outline-variant/15 flex items-center justify-center text-primary hover:bg-surface-low transition-colors relative"
                  >
                    <BellIcon size={18} />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger border border-white" />
                  </button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-dashed border-outline/30 text-outline hover:bg-surface-low transition-colors whitespace-nowrap"
                >
                  <PlusIcon size={16} />
                  <span className="text-sm font-semibold">Tambah Anak</span>
                </button>
              </div>
            </div>
          }
        >
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            className="flex flex-col gap-6 md:gap-8 mt-6"
          >
            {/* Top Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6">
              {/* Progress hero */}
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="lg:col-span-5">
                <div className="bg-primary-container rounded-[32px] p-6 md:p-8 h-full border border-primary/10">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <span className="inline-block bg-white/60 px-3 py-1 rounded-full text-xs font-bold text-primary uppercase tracking-wide mb-4">
                        Status: {activeChild.latestPrediction?.status ?? "NORMAL"}
                      </span>
                      <p className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-on-surface leading-none mb-2">
                        {growthPercentage}%
                      </p>
                      <p className="text-base font-semibold text-on-surface-variant">{statusLabel}</p>
                    </div>
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center relative flex-shrink-0">
                      <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="white" className="text-white/80" />
                        <motion.circle 
                          cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="none" 
                          className="text-primary"
                          strokeLinecap="round"
                          initial={{ strokeDasharray: 264, strokeDashoffset: 264 }}
                          animate={{ strokeDashoffset: 264 - (264 * growthPercentage) / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                        />
                      </svg>
                      <div className="text-center z-10 relative">
                        <p className="text-lg font-extrabold text-on-surface leading-none">{calorieTarget}</p>
                        <p className="text-xs text-outline font-semibold">kkal</p>
                      </div>
                    </div>
                  </div>
                <button
                  onClick={() => router.push(`/children/${activeChild.id}`)}
                  className="w-full mt-6 bg-white/80 hover:bg-white rounded-full py-3.5 flex items-center justify-center gap-1.5 border border-primary/5 transition-colors"
                >
                  <span className="text-sm font-bold text-primary">Detail Perkembangan</span>
                  <ChevronRight size={16} className="text-primary" strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>

            {/* Metrics — 2 kolom di mobile, stack di desktop sidebar */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="grid grid-cols-2 gap-4 lg:col-span-3 lg:flex lg:flex-col lg:gap-5">
              <Card className="flex-1 p-5 rounded-3xl shadow-none border border-outline-variant/15 bg-surface-lowest">
                <div className="flex justify-between items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-secondary-container/50 flex items-center justify-center">
                    <Dumbbell size={18} className="text-secondary-on-container" />
                  </div>
                  <span className="text-xs font-bold text-secondary">{weightChange}</span>
                </div>
                <p className="text-sm text-outline font-semibold">Berat Badan</p>
                <p className="text-2xl font-extrabold text-on-surface mt-0.5">
                  {weightVal} <span className="text-sm font-semibold text-outline">kg</span>
                </p>
                <MiniBarChart color="#506444" />
              </Card>

              <Card className="flex-1 p-5 rounded-3xl shadow-none border border-outline-variant/15 bg-surface-lowest">
                <div className="flex justify-between items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-tertiary-container/60 flex items-center justify-center">
                    <Ruler size={18} className="text-tertiary-on-container" />
                  </div>
                  <span className="text-xs font-bold text-tertiary-on-container">{heightChange}</span>
                </div>
                <p className="text-sm text-outline font-semibold">Tinggi Badan</p>
                <p className="text-2xl font-extrabold text-on-surface mt-0.5">
                  {heightVal} <span className="text-sm font-semibold text-outline">cm</span>
                </p>
                <MiniBarChart color="#64601e" />
              </Card>
            </motion.div>

            {/* Nutrition bento */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="lg:col-span-4">
              <Card className="p-5 md:p-6 rounded-3xl shadow-none border border-outline-variant/15 bg-secondary-container/30 h-full">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-lowest flex items-center justify-center text-primary border border-outline-variant/10">
                      <UtensilsIcon size={18} />
                    </div>
                    <h3 className="text-base font-bold text-on-surface">Nutrisi Hari Ini</h3>
                  </div>
                  <button
                    onClick={() => router.push("/scanner")}
                    aria-label="Scan Nutrisi"
                    className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-primary hover:opacity-90 transition-opacity"
                  >
                    <PlusIcon size={18} />
                  </button>
                </div>
                <div className="flex justify-between gap-2">
                  {nutrition.map((item) => (
                    <NutritionColumn key={item.label} {...item} />
                  ))}
                </div>
              </Card>
            </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <ReminderCard />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                <ActivityTimeline />
              </motion.div>
            </div>
          </motion.div>
        </PageShell>
      </motion.div>
    </>
  );
}
