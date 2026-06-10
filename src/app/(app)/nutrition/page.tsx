"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
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
    ageRange: "6-8 Bulan",
    description: "Kaya Omega-3 & Vitamin A",
    seed: "bubur-salmon-labu",
  },
  {
    id: "sug_2",
    name: "Nasi Tim Ayam Brokoli",
    ageRange: "9-12 Bulan",
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

function LogItem({ item, onRemove }: { item: NutritionLog; onRemove: () => void }) {
  const foodAvatar = getAvatarUri(item.foodDetected.join("-"), "food");

  return (
    <div className="flex items-center gap-4 p-4 bg-surface-lowest rounded-2xl border border-outline-variant/10">
      <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 relative bg-primary-light">
        {item.photoUrl ? (
          <Image src={item.photoUrl} alt="Makanan" fill sizes="44px" className="object-cover" />
        ) : (
          <Image src={foodAvatar} alt="Makanan" fill sizes="44px" className="object-cover" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <span className="font-semibold text-on-surface text-sm truncate">
            {item.foodDetected.join(", ")}
          </span>
          <span className="text-xs text-outline font-medium flex-shrink-0">{formatTimeLocal(item.createdAt)}</span>
        </div>
        <p className="text-xs text-primary font-semibold mt-0.5">{item.portionEstimate}</p>
        <p className="text-sm text-outline mt-1">
          {item.calories} kkal · P: {item.protein}g · L: {item.fat}g · K: {item.carbs}g
        </p>
      </div>
      <button
        onClick={onRemove}
        aria-label="Hapus log"
        className="p-2 rounded-full hover:bg-danger-light transition-colors flex-shrink-0"
      >
        <X size={16} className="text-danger" />
      </button>
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
  const totalFiber = Math.round(logs.reduce((acc, curr) => acc + (curr.fiber || 0), 0) * 10) / 10;

  return (
    <PageShell
      title="Log Nutrisi Anak"
      subtitle="Pantau asupan gizi harian"
      actions={<Avatar seed="Ibu Ani" variant="parent" size="md" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="bg-primary-container/40 border border-primary/10 shadow-none rounded-3xl">
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
                Total Nutrisi Hari Ini
              </p>
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
                <div>
                  <p className="text-4xl md:text-5xl font-extrabold text-on-surface leading-none">{totalCalories}</p>
                  <p className="text-sm text-outline mt-1">Kalori terpenuhi (kkal)</p>
                </div>
                <span className="self-start bg-primary-light px-4 py-1.5 rounded-full text-sm font-semibold text-primary">
                  Target: 800 kkal
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3 pt-4 border-t border-primary/10">
                {[
                  { label: "Protein", value: `${totalProtein}g` },
                  { label: "Lemak", value: `${totalFat}g` },
                  { label: "Karbohidrat", value: `${totalCarbs}g` },
                  { label: "Serat", value: `${totalFiber}g` },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-lg font-bold text-on-surface">{m.value}</p>
                    <p className="text-xs text-outline">{m.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-lg font-bold text-on-surface mb-4">Riwayat Hari Ini</h2>
            {logs.length === 0 ? (
              <div className="bg-surface-low border border-outline-variant/10 rounded-3xl p-10 flex flex-col items-center text-center">
                <Avatar seed="empty-plate" variant="food" size="lg" className="mb-3" />
                <p className="text-sm text-outline">Belum ada makanan yang dicatat hari ini</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {logs.map((log) => (
                  <LogItem key={log.id} item={log} onRemove={() => removeLog(log.id)} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <button
              onClick={() => router.push("/scanner")}
              className="text-left p-5 rounded-3xl bg-primary-light border border-primary/20 hover:shadow-sm transition-shadow"
            >
              <div className="w-11 h-11 rounded-full bg-surface-lowest flex items-center justify-center text-primary mb-4">
                <ScanLineIcon size={22} />
              </div>
              <h3 className="font-bold text-primary mb-1">AI Vision Scan</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Foto makanan bayi, AI hitung gizinya otomatis.
              </p>
            </button>

            <button className="text-left p-5 rounded-3xl bg-surface-lowest border border-outline-variant/20 hover:shadow-sm transition-shadow">
              <div className="w-11 h-11 rounded-full bg-surface-low flex items-center justify-center text-primary mb-4">
                <PlusIcon size={22} />
              </div>
              <h3 className="font-bold text-on-surface mb-1">Input Manual</h3>
              <p className="text-sm text-outline leading-relaxed">
                Cari dari database makanan lokal dan MPASI buatan rumah.
              </p>
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-on-surface">Saran Menu MPASI</h2>
              <button className="text-sm font-semibold text-primary">Lihat Semua</button>
            </div>
            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible no-scrollbar">
              {SUGGESTIONS.map((item) => (
                <Card
                  key={item.id}
                  className="min-w-[220px] lg:min-w-0 p-0 rounded-2xl shadow-none border border-outline-variant/15 overflow-hidden"
                >
                  <div className="flex lg:flex-row">
                    <div className="w-full lg:w-24 h-24 flex-shrink-0 relative bg-primary-container">
                      <Image
                        src={getAvatarUri(item.seed, "food")}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4 flex-1">
                      <span className="inline-block bg-secondary-container px-2 py-0.5 rounded-full text-xs font-semibold text-secondary-on-container mb-1.5">
                        {item.ageRange}
                      </span>
                      <p className="font-bold text-sm text-on-surface">{item.name}</p>
                      <p className="text-xs text-outline mt-0.5">{item.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
