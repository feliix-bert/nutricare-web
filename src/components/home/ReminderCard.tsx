"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { Calendar, Syringe, ClipboardList, ShieldAlert, Check } from "lucide-react";

type ReminderItem = {
  id: string;
  title: string;
  date: string;
  status: string;
  actionText?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
};

const REMINDERS: ReminderItem[] = [
  {
    id: "r1",
    title: "Assessment Bulan Ini",
    date: "Segera lakukan",
    status: "Mendesak",
    actionText: "Mulai",
    icon: Calendar,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
  },
  {
    id: "r2",
    title: "Jadwal Imunisasi",
    date: "Vaksin Polio (OPV)",
    status: "Penting",
    actionText: "Cek",
    icon: Syringe,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  {
    id: "r3",
    title: "Upload Foto MPASI",
    date: "Belum lengkap",
    status: "Tertunda",
    actionText: "Lengkapi",
    icon: ClipboardList,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    id: "r4",
    title: "Verifiable Credential",
    date: "Bulan lalu",
    status: "Diproses",
    icon: ShieldAlert,
    iconBg: "bg-gray-50",
    iconColor: "text-gray-500",
  },
];

export function ReminderCard() {
  return (
    <Card variant="default" className="p-0 h-full overflow-hidden flex flex-col bg-white">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-bold text-on-surface">Pengingat</h3>
          <button className="text-[13px] font-bold text-on-surface-variant hover:text-primary transition-colors">
            Lihat semua
          </button>
        </div>
      </div>

      {/* Reminder list */}
      <div className="p-3 flex-1 flex flex-col gap-1">
        {REMINDERS.map((reminder, index) => {
          const Icon = reminder.icon;
          return (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="group flex items-center justify-between p-3 rounded-2xl hover:bg-surface-warm cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-[42px] h-[42px] rounded-full flex items-center justify-center flex-shrink-0 ${reminder.iconBg} ${reminder.iconColor}`}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-on-surface leading-tight mb-0.5 group-hover:text-primary transition-colors">
                    {reminder.title}
                  </p>
                  <p className="text-[12px] font-medium text-on-surface-variant">
                    {reminder.date}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-[13px] font-bold ${reminder.actionText ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  {reminder.actionText || reminder.status}
                </p>
                {reminder.actionText && (
                  <p className="text-[11px] font-medium text-on-surface-variant mt-0.5">
                    {reminder.status}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
