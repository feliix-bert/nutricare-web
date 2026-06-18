"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Flame, Droplet, Wheat, Search, Plus, Check, Beef, Camera } from "lucide-react";
import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/common/Avatar";
import { PageShell } from "@/components/layout/PageShell";
import { useNutritionStore, NutritionLog } from "@/stores/nutritionStore";
import { getAvatarUri } from "@/utils/avatar";
import { ScanLineIcon } from "@/components/icons/scan-line";

type SuggestionItem = {
  id: string;
  name: string;
  ageRange: string;
  seed: string;
  subtitle: string;
  image?: string;
};

const SUGGESTIONS: SuggestionItem[] = [
  { id: "sug_2", name: "Bubur Salmon Labu", ageRange: "6-8 Bulan", seed: "bubur-salmon-labu", subtitle: "Kaya Omega-3 & Vitamin A", image: "/Bubur salmon.png" },
  { id: "sug_1", name: "Nasi Tim Ayam Brokoli", ageRange: "9-12 Bulan", seed: "nasi-tim-ayam", subtitle: "Tekstur cincang halus", image: "/Resep-MPASI-NasiTimAyamWortelBrokoli.jpg" },
  { id: "sug_3", name: "Puree Alpukat", ageRange: "6 Bulan", seed: "puree-alpukat", subtitle: "Lemak sehat untuk otak", image: "/avocado-puree-baby-food.jpg" },
  { id: "sug_4", name: "Bubur Beras Merah", ageRange: "6-8 Bulan", seed: "bubur-beras-merah", subtitle: "Sumber serat & zat besi", image: "/Bubur Beras Merah, Hati Ayam.png" },
];

function formatTimeLocal(dateString: string) {
  return new Date(dateString).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

// ── Desktop Metric Card ──
function MetricCard({ 
  icon: Icon, title, value, max, unit, bgClass, iconColor 
}: { 
  icon: React.ElementType, title: string, value: number, max: number, unit: string, bgClass: string, iconColor: string 
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`p-5 rounded-[2rem] flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${bgClass}`}>
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Icon size={20} className={iconColor} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{title}</p>
          <p className="text-[10px] font-semibold text-on-surface-variant/70 mt-0.5">{value} / {max} {unit}</p>
        </div>
      </div>
      <div className="relative z-10 flex items-end justify-between">
        <p className="text-3xl font-extrabold text-on-surface leading-none">{value}</p>
        <div className="text-right">
          <p className="text-lg font-extrabold text-on-surface">{pct}%</p>
        </div>
      </div>
    </div>
  );
}

// ── Desktop Log Item Row ──
function MealTrackerRow({ item, onRemove }: { item: NutritionLog; onRemove: () => void }) {
  const foodAvatar = getAvatarUri(item.foodDetected.join("-"), "food");
  return (
    <div className="group flex items-center py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 px-2 rounded-xl transition-colors gap-2">
      <div className="flex items-start gap-3 w-[40%] min-w-0">
        <div className="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Check size={12} className="text-green-500" strokeWidth={3} />
        </div>
        <div className="w-10 h-10 rounded-xl overflow-hidden relative flex-shrink-0 bg-gray-100">
          {item.photoUrl ? (
            <Image src={item.photoUrl} alt="Food" fill sizes="40px" className="object-cover" />
          ) : (
            <Image src={foodAvatar} alt="Food" fill sizes="40px" className="object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900 break-words whitespace-normal leading-snug">{item.foodDetected.join(", ")}</p>
          <p className="text-xs text-gray-500 font-medium mt-0.5">{item.portionEstimate}</p>
        </div>
      </div>
      <div className="hidden sm:flex w-[25%] justify-center">
        <p className="text-sm font-semibold text-gray-700">{item.calories} <span className="text-xs text-gray-400 font-medium">kkal</span></p>
      </div>
      <div className="w-[35%] flex items-center justify-end gap-2">
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
          {formatTimeLocal(item.createdAt)}
        </span>
        <button 
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all text-xs flex-shrink-0"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}

// ── Mobile Log Item Card ──
function MobileMealCard({ item, onRemove }: { item: NutritionLog; onRemove: () => void }) {
  const foodAvatar = getAvatarUri(item.foodDetected.join("-"), "food");
  return (
    <div className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
      <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0 bg-gray-100">
        {item.photoUrl ? (
          <Image src={item.photoUrl} alt="Food" fill sizes="48px" className="object-cover" />
        ) : (
          <Image src={foodAvatar} alt="Food" fill sizes="48px" className="object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 break-words whitespace-normal leading-snug">{item.foodDetected.join(", ")}</p>
        <p className="text-xs text-gray-500 mt-0.5">{item.portionEstimate} · {formatTimeLocal(item.createdAt)}</p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-sm font-extrabold text-gray-800">{item.calories}</span>
        <span className="text-[10px] text-gray-400 font-medium">kkal</span>
        <button onClick={onRemove} className="text-[10px] text-red-400 font-semibold">Hapus</button>
      </div>
    </div>
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
  const totalFiber = Math.round((totalCarbs * 0.1) * 10) / 10;

  const goals = { Calories: 800, Protein: 30, Lemak: 25, Karbohidrat: 100 };

  return (
    <PageShell
      title="Log Nutrisi Anak"
      subtitle="Pantau gizi harian si kecil"
      actions={<Avatar seed="Ibu Ani" variant="parent" size="sm" />}
    >
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

        {/* ══════════════════════════════════
            MOBILE LAYOUT
        ══════════════════════════════════ */}
        <div className="lg:hidden flex flex-col gap-5 pb-8">

          {/* 1. Hero Nutrition Card — elegant gradient */}
          <div className="relative overflow-hidden rounded-[2rem] p-6"
            style={{ background: "linear-gradient(145deg, #1e5c54 0%, #2d8a7e 55%, #3aa394 100%)" }}
          >
            {/* Decorative blobs */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
            <div className="absolute top-1/2 right-4 -translate-y-1/2 w-20 h-20 rounded-full bg-white/5" />

            {/* Top label */}
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-5 relative z-10">Total Nutrisi Hari Ini</p>

            {/* Main row: big number + circular ring */}
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div>
                <div className="flex items-end gap-2">
                  <span className="text-[52px] font-black text-white leading-none tracking-tight">{totalCalories}</span>
                  <span className="text-sm font-semibold text-white/60 mb-2">kkal</span>
                </div>
                <p className="text-xs font-medium text-white/60 mt-1">Kalori Terpenuhi</p>
                {/* Target badge */}
                <span className="inline-block mt-3 bg-white/15 text-white text-[11px] font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                  Target: {goals.Calories} kkal
                </span>
              </div>

              {/* Circular progress */}
              <div className="relative w-[88px] h-[88px] flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
                  <circle cx="44" cy="44" r="36" fill="transparent" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
                  <circle
                    cx="44" cy="44" r="36"
                    fill="transparent"
                    stroke="rgba(255,255,255,0.85)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - Math.min(totalCalories / goals.Calories, 1))}`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-black text-white leading-none">
                    {Math.round(Math.min(totalCalories / goals.Calories, 1) * 100)}%
                  </span>
                  <span className="text-[9px] font-semibold text-white/60 uppercase mt-0.5">tercapai</span>
                </div>
              </div>
            </div>

            {/* Macro pills row */}
            <div className="grid grid-cols-4 gap-2 relative z-10">
              {[
                { label: "Protein", value: totalProtein, unit: "g" },
                { label: "Lemak", value: totalFat, unit: "g" },
                { label: "Karbo", value: totalCarbs, unit: "g" },
                { label: "Serat", value: totalFiber, unit: "g" },
              ].map(({ label, value, unit }) => (
                <div key={label} className="bg-white/10 rounded-2xl py-2.5 px-2 flex flex-col items-center gap-0.5 backdrop-blur-sm">
                  <span className="text-[13px] font-extrabold text-white leading-none">{value}{unit}</span>
                  <span className="text-[9px] font-semibold text-white/60">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Action Cards — 2 columns */}
          <div className="grid grid-cols-2 gap-4">
            {/* AI Vision Scan */}
            <div
              onClick={() => router.push("/scanner")}
              className="bg-primary-container rounded-[1.75rem] p-5 flex flex-col gap-4 cursor-pointer active:scale-[0.97] transition-transform shadow-card hover-lift"
            >
              <div className="w-11 h-11 bg-primary/15 rounded-2xl flex items-center justify-center">
                <Camera size={22} className="text-primary" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[14px] font-extrabold text-on-surface tracking-tight">AI Vision Scan</p>
                <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed mt-1">
                  Foto makanan bayi, Gemini AI hitung gizinya otomatis.
                </p>
              </div>
            </div>

            {/* Input Manual */}
            <div
              onClick={() => router.push("/scanner")}
              className="bg-surface rounded-[1.75rem] p-5 flex flex-col gap-4 cursor-pointer active:scale-[0.97] transition-transform shadow-card hover-lift border border-outline-variant/20"
            >
              <div className="w-11 h-11 bg-surface-dim rounded-2xl flex items-center justify-center">
                <Plus size={22} className="text-on-surface-variant" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[14px] font-extrabold text-on-surface tracking-tight">Input Manual</p>
                <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed mt-1">
                  Cari dari database makanan lokal &amp; MPASI buatan rumah.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Saran Menu MPASI — horizontal scroll */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-extrabold text-on-surface">Saran Menu MPASI</h3>
              <button className="text-xs font-bold text-primary">Lihat Semua</button>
            </div>
            {/* Scroll container — bleed to page edge */}
            <div className="-mx-4 px-4">
              <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
                {SUGGESTIONS.map((item) => (
                  <div
                    key={item.id}
                    className="flex-shrink-0 w-[148px] bg-white rounded-[1.5rem] overflow-hidden shadow-card border border-gray-100/80 cursor-pointer active:scale-[0.97] transition-transform"
                  >
                    {/* Image */}
                    <div className="relative w-full h-[110px] bg-gray-100">
                      <Image
                        src={item.image || getAvatarUri(item.seed, "food")}
                        alt={item.name}
                        fill
                        sizes="148px"
                        className="object-cover"
                      />
                      {/* Age badge */}
                      <span className="absolute top-2 left-2 bg-primary-container text-primary-on-container text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {item.ageRange}
                      </span>
                    </div>
                    {/* Text */}
                    <div className="p-3 pt-2.5">
                      <p className="text-[12px] font-extrabold text-on-surface leading-snug">{item.name}</p>
                      <p className="text-[10px] text-on-surface-variant font-medium mt-1">{item.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Riwayat Makan (Mobile) */}
          {logs.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-extrabold text-on-surface">Riwayat Makan</h3>
                <button
                  onClick={() => router.push("/scanner")}
                  className="flex items-center gap-1.5 bg-on-surface text-white text-xs font-bold px-3.5 py-2 rounded-full"
                >
                  <Plus size={12} /> Tambah
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {logs.map((log) => (
                  <MobileMealCard key={log.id} item={log} onRemove={() => removeLog(log.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state (Mobile) */}
          {logs.length === 0 && (
            <div className="bg-white rounded-[2rem] p-8 flex flex-col items-center justify-center text-center border border-gray-100 shadow-card">
              <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center mb-4">
                <ScanLineIcon size={24} className="text-primary" />
              </div>
              <p className="text-sm font-bold text-on-surface mb-1">Belum ada catatan</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">Scan atau input makanan untuk mulai mencatat gizi si kecil.</p>
              <button
                onClick={() => router.push("/scanner")}
                className="mt-5 bg-primary text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-md shadow-primary/20"
              >
                Mulai Scan
              </button>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════
            DESKTOP LAYOUT
        ══════════════════════════════════ */}
        <div className="hidden lg:block">
          {/* Desktop Metric Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <MetricCard 
              title="Kalori" value={totalCalories} max={goals.Calories} unit="kkal"
              icon={Flame} bgClass="bg-[#fff0f0] border border-[#ffe6e6]" iconColor="text-red-500"
            />
            <MetricCard 
              title="Protein" value={totalProtein} max={goals.Protein} unit="g"
              icon={Beef} bgClass="bg-[#f0f4ff] border border-[#e6ecff]" iconColor="text-blue-500"
            />
            <MetricCard 
              title="Lemak" value={totalFat} max={goals.Lemak} unit="g"
              icon={Droplet} bgClass="bg-[#f2f8f2] border border-[#e8f4e8]" iconColor="text-green-600"
            />
            <MetricCard 
              title="Karbo" value={totalCarbs} max={goals.Karbohidrat} unit="g"
              icon={Wheat} bgClass="bg-[#fff9eb] border border-[#fff2cc]" iconColor="text-orange-500"
            />
          </div>

          <div className="grid grid-cols-12 gap-6 md:gap-8">
            {/* Left Column: Meal Tracker */}
            <div className="col-span-8 flex flex-col gap-6">
              <Card variant="default" className="p-6 md:p-8 bg-white border-none shadow-sm rounded-[2rem]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Riwayat Makan</h2>
                    <p className="text-sm font-medium text-gray-500 mt-0.5">Asupan gizi yang tercatat hari ini</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                      <Search size={16} /> Cari
                    </button>
                    <button 
                      onClick={() => router.push("/scanner")}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition-colors"
                    >
                      <Plus size={16} /> Tambah
                    </button>
                  </div>
                </div>

                {logs.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                      <ScanLineIcon size={24} className="text-gray-400" />
                    </div>
                    <p className="text-base font-bold text-gray-900 mb-1">Belum ada makanan</p>
                    <p className="text-sm text-gray-500">Scan MPASI anak Anda untuk mulai mencatat gizinya.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-center py-2 border-b border-gray-100 mb-2">
                      <span className="w-[40%] text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Menu &amp; Porsi</span>
                      <span className="w-[25%] text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Kalori</span>
                      <span className="w-[35%] text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Waktu</span>
                    </div>
                    {logs.map((log) => (
                      <MealTrackerRow key={log.id} item={log} onRemove={() => removeLog(log.id)} />
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column */}
            <div className="col-span-4 flex flex-col gap-6">
              {/* AI Scan CTA */}
              <div 
                onClick={() => router.push("/scanner")}
                className="p-6 rounded-[2rem] bg-gradient-to-br from-primary to-[#206960] text-white cursor-pointer hover:-translate-y-1 transition-transform shadow-lg shadow-primary/20 relative overflow-hidden"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 relative z-10 backdrop-blur-sm">
                  <ScanLineIcon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-extrabold mb-1 relative z-10">AI Food Scan</h3>
                <p className="text-sm text-white/80 font-medium relative z-10">
                  Pindai makanan untuk mengetahui estimasi kalori dan makronutrisi.
                </p>
              </div>

              {/* Menu Recommendations */}
              <Card variant="default" className="p-6 bg-white border-none shadow-sm rounded-[2rem]">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Rekomendasi Menu</h3>
                  <button className="text-xs font-bold text-primary hover:text-primary/80">Lihat Semua</button>
                </div>
                <div className="flex flex-col gap-4">
                  {SUGGESTIONS.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 relative flex-shrink-0 border border-gray-200 group-hover:border-primary/20 transition-colors">
                        <Image src={item.image || getAvatarUri(item.seed, "food")} alt={item.name} fill sizes="48px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary transition-colors">{item.name}</p>
                        <p className="text-xs font-medium text-gray-500">{item.ageRange}</p>
                      </div>
                      <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20 transition-all">
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>

      </motion.div>
    </PageShell>
  );
}
