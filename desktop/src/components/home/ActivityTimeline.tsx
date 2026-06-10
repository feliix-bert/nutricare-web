"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { Activity, MessageSquare, Camera, ShieldCheck, TrendingUp } from "lucide-react";

type ActivityItem = {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
};

const ACTIVITIES: ActivityItem[] = [
  {
    id: "a1",
    type: "Assessment",
    title: "Assessment bulan ini selesai.",
    timestamp: "2 hari yang lalu",
    icon: Activity,
    colorClass: "text-primary",
    bgClass: "bg-primary-container",
  },
  {
    id: "a2",
    type: "Status",
    title: "Status gizi berubah ke Optimal.",
    timestamp: "2 hari yang lalu",
    icon: TrendingUp,
    colorClass: "text-secondary-on-container",
    bgClass: "bg-secondary-container",
  },
  {
    id: "a3",
    type: "Upload",
    title: "Makan siang: Nasi Tim Ayam.",
    timestamp: "4 hari yang lalu",
    icon: Camera,
    colorClass: "text-tertiary-on-container",
    bgClass: "bg-tertiary-container/60",
  },
  {
    id: "a4",
    type: "Chat",
    title: "Konsultasi demam ringan.",
    timestamp: "1 minggu yang lalu",
    icon: MessageSquare,
    colorClass: "text-primary",
    bgClass: "bg-surface-low border border-primary/10",
  },
  {
    id: "a5",
    type: "Credential",
    title: "VC Bulan April diterbitkan.",
    timestamp: "3 minggu yang lalu",
    icon: ShieldCheck,
    colorClass: "text-secondary",
    bgClass: "bg-surface-lowest border border-outline-variant/15",
  },
];

export function ActivityTimeline() {
  return (
    <Card className="p-5 md:p-6 rounded-3xl shadow-none border border-outline-variant/15 bg-surface-lowest h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base md:text-lg font-bold text-on-surface">Riwayat Aktivitas</h3>
        <button className="text-sm font-semibold text-primary hover:text-primary-focus transition-colors">
          Semua Riwayat
        </button>
      </div>

      <div className="relative pl-3 mt-2 space-y-6">
        {/* Timeline line */}
        <div className="absolute top-2 bottom-4 left-6 w-px bg-outline-variant/20" />

        {ACTIVITIES.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative flex items-start gap-4 group"
            >
              {/* Timeline marker */}
              <div
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${activity.bgClass} ${activity.colorClass} shadow-sm ring-4 ring-surface-lowest`}
              >
                <Icon size={13} strokeWidth={2.5} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-surface leading-tight mb-1 group-hover:text-primary transition-colors cursor-default">
                  {activity.title}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-on-surface-variant/70">
                    {activity.type}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant/30" />
                  <span className="text-xs font-medium text-outline">
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
