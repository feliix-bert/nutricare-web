"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { Calendar, Syringe, ClipboardList, ShieldAlert, ChevronRight, ArrowRight } from "lucide-react";

type ReminderItem = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  accentColor: string;
  accentBg: string;
  borderColor: string;
  priority?: "high" | "medium" | "low";
  actionText?: string;
};

const REMINDERS: ReminderItem[] = [
  {
    id: "r1",
    title: "Assessment Bulan Ini",
    description: "Jadwal pemantauan rutin — segera lakukan",
    icon: Calendar,
    accentColor: "text-primary",
    accentBg: "bg-primary-container/60",
    borderColor: "border-l-primary",
    priority: "high",
    actionText: "Mulai",
  },
  {
    id: "r2",
    title: "Jadwal Imunisasi",
    description: "Vaksin Polio (OPV) belum dicatat",
    icon: Syringe,
    accentColor: "text-secondary-on-container",
    accentBg: "bg-secondary-container/60",
    borderColor: "border-l-secondary",
    priority: "medium",
    actionText: "Cek",
  },
  {
    id: "r3",
    title: "Assessment Belum Lengkap",
    description: "Upload foto MPASI minggu ini belum diisi",
    icon: ClipboardList,
    accentColor: "text-tertiary-on-container",
    accentBg: "bg-tertiary-container/60",
    borderColor: "border-l-tertiary",
    priority: "medium",
    actionText: "Lengkapi",
  },
  {
    id: "r4",
    title: "Verifiable Credential",
    description: "VC bulan lalu sedang diproses validator",
    icon: ShieldAlert,
    accentColor: "text-on-surface-variant",
    accentBg: "bg-surface-high",
    borderColor: "border-l-outline-variant",
    priority: "low",
  },
];

const priorityDot = {
  high: "bg-danger",
  medium: "bg-tertiary",
  low: "bg-outline-variant",
};

export function ReminderCard() {
  return (
    <Card variant="default" className="p-0 h-full overflow-hidden">
      {/* Header band */}
      <div className="px-5 pt-5 pb-4 border-b border-outline-variant/8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-on-surface tracking-tight">
              Pengingat &amp; Notifikasi
            </h3>
            <p className="text-xs text-on-surface-variant/60 font-medium mt-0.5">
              {REMINDERS.filter(r => r.priority === "high").length} tugas mendesak
            </p>
          </div>
          <button className="group flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors duration-200 px-3 py-1.5 rounded-full hover:bg-primary-container/30">
            Lihat Semua
            <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Reminder list */}
      <div className="p-3 flex flex-col gap-2">
        {REMINDERS.map((reminder, index) => {
          const Icon = reminder.icon;
          return (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: index * 0.07 }}
              className={`group flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-warm border border-outline-variant/8 border-l-[3px] ${reminder.borderColor} hover:bg-white hover:shadow-card cursor-pointer transition-all duration-300`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${reminder.accentBg} ${reminder.accentColor} transition-all duration-300 group-hover:scale-110`}
              >
                <Icon size={16} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors duration-200">
                    {reminder.title}
                  </p>
                  {reminder.priority && (
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot[reminder.priority]}`} />
                  )}
                </div>
                <p className="text-xs text-on-surface-variant font-medium line-clamp-1">
                  {reminder.description}
                </p>
              </div>
              {reminder.actionText && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0">
                  <span className="text-xs font-bold text-primary whitespace-nowrap">{reminder.actionText}</span>
                  <ChevronRight size={13} className="text-primary" strokeWidth={2.5} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
