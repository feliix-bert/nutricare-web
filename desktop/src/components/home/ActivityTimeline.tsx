"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { Activity, MessageSquare, Camera, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";

type ActivityItem = {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  chipColor: string;
};

const ACTIVITIES: ActivityItem[] = [
  {
    id: "a1",
    type: "Assessment",
    title: "Assessment bulan ini selesai",
    timestamp: "2 hari lalu",
    icon: Activity,
    colorClass: "text-primary",
    bgClass: "bg-primary-container/60",
    chipColor: "bg-primary-container/80 text-primary",
  },
  {
    id: "a2",
    type: "Status Gizi",
    title: "Status gizi berubah ke Optimal",
    timestamp: "2 hari lalu",
    icon: TrendingUp,
    colorClass: "text-secondary-on-container",
    bgClass: "bg-secondary-container/60",
    chipColor: "bg-secondary-container/80 text-secondary-on-container",
  },
  {
    id: "a3",
    type: "MPASI",
    title: "Makan siang: Nasi Tim Ayam",
    timestamp: "4 hari lalu",
    icon: Camera,
    colorClass: "text-tertiary-on-container",
    bgClass: "bg-tertiary-container/60",
    chipColor: "bg-tertiary-container/80 text-tertiary-on-container",
  },
  {
    id: "a4",
    type: "Konsultasi",
    title: "Sesi konsultasi demam ringan",
    timestamp: "1 minggu lalu",
    icon: MessageSquare,
    colorClass: "text-primary",
    bgClass: "bg-primary-container/40",
    chipColor: "bg-primary-container/60 text-primary",
  },
  {
    id: "a5",
    type: "Credential",
    title: "VC Bulan April diterbitkan",
    timestamp: "3 minggu lalu",
    icon: ShieldCheck,
    colorClass: "text-secondary-on-container",
    bgClass: "bg-surface-high",
    chipColor: "bg-surface-high text-on-surface-variant",
  },
];

export function ActivityTimeline() {
  return (
    <Card variant="default" className="p-0 h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-outline-variant/8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-on-surface tracking-tight">Riwayat Aktivitas</h3>
            <p className="text-xs text-on-surface-variant/60 font-medium mt-0.5">
              {ACTIVITIES.length} aktivitas terkini
            </p>
          </div>
          <button className="group flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors duration-200 px-3 py-1.5 rounded-full hover:bg-primary-container/30">
            Semua Riwayat
            <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4 flex flex-col gap-1">
        {ACTIVITIES.map((activity, index) => {
          const Icon = activity.icon;
          const isLast = index === ACTIVITIES.length - 1;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10px" }}
              transition={{ duration: 0.35, delay: index * 0.07 }}
              className="group relative flex items-start gap-3.5 py-3 px-3 rounded-xl hover:bg-surface-warm transition-all duration-300 cursor-default"
            >
              {/* Timeline connector */}
              {!isLast && (
                <div
                  className="absolute left-[2.125rem] top-[3.25rem] w-px h-[calc(100%-1.5rem)] z-0"
                  style={{ background: "linear-gradient(180deg, rgba(45,138,126,0.2) 0%, rgba(212,164,84,0.1) 100%)" }}
                  aria-hidden
                />
              )}

              {/* Icon dot */}
              <div
                className={`relative z-10 w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${activity.bgClass} ${activity.colorClass} shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-card`}
              >
                <Icon size={14} strokeWidth={2.5} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-bold text-on-surface leading-tight mb-1.5 group-hover:text-primary transition-colors duration-200">
                  {activity.title}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${activity.chipColor}`}>
                    {activity.type}
                  </span>
                  <span className="text-[11px] font-medium text-on-surface-variant/50">{activity.timestamp}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
