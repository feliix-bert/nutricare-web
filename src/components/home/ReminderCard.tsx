"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { Calendar, Syringe, AlertTriangle, ClipboardList, ShieldAlert } from "lucide-react";
import { ChevronRight } from "lucide-react";

type ReminderItem = {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  actionText?: string;
};

// Default is normal (no high risk alert)
const REMINDERS: ReminderItem[] = [
  {
    id: "r1",
    title: "Assessment Berikutnya",
    description: "Jadwal pemantauan rutin untuk bulan ini.",
    icon: Calendar,
    iconBg: "bg-primary-container",
    iconColor: "text-primary",
    actionText: "Mulai",
  },
  {
    id: "r2",
    title: "Jadwal Imunisasi",
    description: "Vaksin Polio (OPV) belum dicatat.",
    icon: Syringe,
    iconBg: "bg-secondary-container/60",
    iconColor: "text-secondary",
    actionText: "Cek",
  },
  {
    id: "r3",
    title: "Assessment Belum Lengkap",
    description: "Upload foto MPASI minggu ini belum diisi.",
    icon: ClipboardList,
    iconBg: "bg-tertiary-container/60",
    iconColor: "text-tertiary-on-container",
    actionText: "Lengkapi",
  },
  {
    id: "r4",
    title: "Verifiable Credential",
    description: "VC bulan lalu sedang diproses validator.",
    icon: ShieldAlert,
    iconBg: "bg-surface-low",
    iconColor: "text-outline",
  },
];

export function ReminderCard() {
  return (
    <Card className="p-5 md:p-6 rounded-3xl shadow-none border border-outline-variant/15 bg-surface-lowest h-full">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base md:text-lg font-bold text-on-surface">Reminder & Alerts</h3>
        <button className="text-sm font-semibold text-primary hover:text-primary-focus transition-colors">
          Lihat Semua
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {REMINDERS.map((reminder) => {
          const Icon = reminder.icon;
          return (
            <motion.div
              key={reminder.id}
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-start gap-4 p-3.5 rounded-2xl bg-surface-lowest border border-outline-variant/10 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${reminder.iconBg} ${reminder.iconColor}`}
              >
                <Icon size={18} strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                  {reminder.title}
                </p>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5 line-clamp-1">
                  {reminder.description}
                </p>
              </div>
              {reminder.actionText && (
                <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold text-primary">{reminder.actionText}</span>
                  <ChevronRight size={14} className="text-primary" strokeWidth={3} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
