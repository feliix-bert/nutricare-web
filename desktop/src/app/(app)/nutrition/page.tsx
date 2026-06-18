"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Flame, Droplet, Wheat, Search, Plus, Check, Beef } from "lucide-react";
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
  image?: string;
};

const SUGGESTIONS: SuggestionItem[] = [
  { id: "sug_1", name: "Nasi Tim Ayam Brokoli", ageRange: "9-12 Bulan", seed: "nasi-tim-ayam", image: "/Resep-MPASI-NasiTimAyamWortelBrokoli.jpg" },
  { id: "sug_2", name: "Bubur Salmon Labu", ageRange: "6-8 Bulan", seed: "bubur-salmon-labu", image: "/Bubur salmon.png" },
  { id: "sug_3", name: "Puree Alpukat", ageRange: "6 Bulan", seed: "puree-alpukat", image: "/avocado-puree-baby-food.jpg" },
];

function formatTimeLocal(dateString: string) {
  return new Date(dateString).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

// ── Soft Metric Card (Ref Image 3) ──
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

// ── Mobile Progress Card (Ref Image 1) ──
function MobileProgressCard({ title, current, max, icon: Icon, bgClass, textClass }: { title: string, current: number, max: number, icon: React.ElementType, bgClass: string, textClass: string }) {
  return (
    <div className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl ${bgClass} flex-1`}>
      <Icon size={18} className={`mb-1 ${textClass}`} strokeWidth={2.5} />
      <p className="text-[10px] font-bold text-gray-500 mb-0.5">{title}</p>
      <p className="text-xs font-extrabold text-gray-900">{current} <span className="text-[9px] font-medium text-gray-500">/{max}</span></p>
    </div>
  );
}

// ── Log Item row (Ref Image 3 Medication Tracker) ──
function MealTrackerRow({ item, onRemove }: { item: NutritionLog; onRemove: () => void }) {
  const foodAvatar = getAvatarUri(item.foodDetected.join("-"), "food");
  
  return (
    <div className="group flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 px-2 rounded-xl transition-colors">
      <div className="flex items-center gap-4 flex-1">
        {/* Status / Check circle */}
        <div className="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
          <Check size={12} className="text-green-500" strokeWidth={3} />
        </div>
        
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden relative flex-shrink-0 bg-gray-100">
             {item.photoUrl ? (
                <Image src={item.photoUrl} alt="Food" fill sizes="40px" className="object-cover" />
              ) : (
                <Image src={foodAvatar} alt="Food" fill sizes="40px" className="object-cover" />
              )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{item.foodDetected.join(", ")}</p>
            <p className="text-xs text-gray-500 font-medium">{item.portionEstimate}</p>
          </div>
        </div>
      </div>

      <div className="hidden sm:block flex-1 text-center">
        <p className="text-sm font-semibold text-gray-700">{item.calories} <span className="text-xs text-gray-400 font-medium">kkal</span></p>
      </div>

      <div className="flex-1 text-right flex items-center justify-end gap-3">
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {formatTimeLocal(item.createdAt)}
        </span>
        <button 
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          Hapus
        </button>
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

  const goals = { Calories: 800, Protein: 30, Lemak: 25, Karbohidrat: 100 };

  return (
    <PageShell
      title="Nutrition Dashboard"
      subtitle="Pantau asupan gizi harian si kecil"
      actions={<Avatar seed="Ibu Ani" variant="parent" size="md" />}
    >
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        
        {/* ── Mobile UI: Metric Summary (Ref Image 1) ── */}
        <div className="lg:hidden mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Today calorie</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-black text-gray-900 tracking-tight">{totalCalories}</span>
                <span className="text-sm font-bold text-gray-400">kcal</span>
              </div>
            </div>
            
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#104f44" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * Math.min(totalCalories, goals.Calories)) / goals.Calories} strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-sm font-extrabold text-gray-900">{Math.max(0, goals.Calories - totalCalories)}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase">left</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <MobileProgressCard title="Carbs" current={totalCarbs} max={goals.Karbohidrat} icon={Wheat} bgClass="bg-[#fff9eb]" textClass="text-orange-500" />
            <MobileProgressCard title="Protein" current={totalProtein} max={goals.Protein} icon={Beef} bgClass="bg-[#f0f4ff]" textClass="text-blue-500" />
            <MobileProgressCard title="Fat" current={totalFat} max={goals.Lemak} icon={Droplet} bgClass="bg-[#f2f8f2]" textClass="text-green-600" />
          </div>
        </div>

        {/* ── Desktop Metric Cards Row (Ref Image 3 Top Cards) ── */}
        <div className="hidden lg:grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          
          {/* ── Left Column: Meal Tracker ── */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Card variant="default" className="p-6 md:p-8 bg-white border-none shadow-sm rounded-[2rem]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Riwayat Makan</h2>
                  <p className="text-sm font-medium text-gray-500 mt-0.5">Asupan gizi yang tercatat hari ini</p>
                </div>
                <div className="flex gap-2">
                  <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
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
                  {/* Table Header (hidden on mobile) */}
                  <div className="hidden sm:flex items-center justify-between py-2 border-b border-gray-100 mb-2">
                    <span className="flex-1 text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Menu & Porsi</span>
                    <span className="flex-1 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Kalori</span>
                    <span className="flex-1 text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-2">Waktu</span>
                  </div>
                  {/* Table Body */}
                  {logs.map((log) => (
                    <MealTrackerRow key={log.id} item={log} onRemove={() => removeLog(log.id)} />
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* ── Right Column: Menu Suggestions (Ref Image 3 Care Team) ── */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Quick Action (Ref Image 1) */}
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

            <Card variant="default" className="p-6 bg-white border-none shadow-sm rounded-[2rem] hidden lg:block">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Rekomendasi Menu</h3>
                <button className="text-xs font-bold text-blue-500 hover:text-blue-600">Lihat Semua</button>
              </div>
              
              <div className="flex flex-col gap-4">
                {SUGGESTIONS.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 relative flex-shrink-0 border border-gray-200 group-hover:border-blue-200 transition-colors">
                      <Image src={item.image || getAvatarUri(item.seed, "food")} alt={item.name} fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{item.name}</p>
                      <p className="text-xs font-medium text-gray-500">{item.ageRange}</p>
                    </div>
                    <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-all">
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Mobile UI: Meal Suggestion Cards (Ref Image 1) ── */}
            <div className="lg:hidden mt-2 mb-6">
              <h3 className="text-lg font-extrabold text-gray-900 tracking-tight mb-4">Meal Suggest</h3>
              <div className="flex flex-col gap-4">
                {SUGGESTIONS.map((item, index) => {
                  const isChecked = index === 1;
                  return (
                    <div key={item.id} className={`p-4 rounded-[2rem] flex flex-col gap-3 relative overflow-hidden ${index % 2 === 0 ? 'bg-[#e2f1f0]' : 'bg-[#e7e7fc]'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white/60 relative flex-shrink-0 shadow-sm">
                          <Image src={item.image || getAvatarUri(item.seed, "food")} alt={item.name} fill sizes="48px" className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-extrabold text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs font-bold text-gray-500 flex items-center gap-1">
                            <Flame size={10} className="text-gray-400" /> {index === 0 ? '344' : (index === 1 ? '142' : '200')} kcal
                          </p>
                        </div>
                        <button className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'bg-gray-900 text-white' : 'bg-white/60 text-gray-700 hover:bg-white'}`}>
                          {isChecked ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
                        </button>
                      </div>
                      <div className="mt-2 flex flex-col gap-1.5">
                        <div className="w-full h-1.5 rounded-full bg-black/5 overflow-hidden">
                          <div className={`h-full rounded-full ${index % 2 === 0 ? 'bg-[#3b8782]' : 'bg-[#706cf4]'}`} style={{ width: isChecked ? '100%' : '60%' }} />
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 text-right">
                          {isChecked ? 'Completed' : '195 left'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </motion.div>
    </PageShell>
  );
}
