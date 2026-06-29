"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { Calendar, Syringe, ClipboardList, ShieldAlert, ArrowRight } from "lucide-react";

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

export function ReminderCard({ childId, assessments = [], nutritionLogs = [] }: { childId: string, assessments: any[], nutritionLogs: any[] }) {
  const reminders: ReminderItem[] = [];

  const hasAssessmentThisMonth = assessments.some(a => {
    const d = new Date(a.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  if (!hasAssessmentThisMonth) {
    reminders.push({
      id: "r1",
      title: "Assessment Bulan Ini",
      date: "Segera lakukan",
      status: "Mendesak",
      actionText: "Mulai",
      icon: Calendar,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
    });
  } else {
    reminders.push({
      id: "r1",
      title: "Assessment Bulan Ini",
      date: "Selesai",
      status: "Selesai",
      icon: Calendar,
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
    });
  }

  const today = new Date().toDateString();
  const hasNutritionToday = nutritionLogs.some(n => new Date(n.createdAt).toDateString() === today);
  if (!hasNutritionToday) {
    reminders.push({
      id: "r2",
      title: "Upload Foto MPASI",
      date: "Belum ada hari ini",
      status: "Tertunda",
      actionText: "Lengkapi",
      icon: ClipboardList,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    });
  } else {
    reminders.push({
      id: "r2",
      title: "Upload Foto MPASI",
      date: "Sudah diisi hari ini",
      status: "Selesai",
      icon: ClipboardList,
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
    });
  }

  return (
    <Card variant="default" className="p-6 h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[18px] font-bold text-on-surface leading-tight">Pengingat</h3>
          <p className="text-[13px] text-on-surface-variant mt-1">Tugas & jadwal yang perlu perhatian</p>
        </div>
        <button className="group flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:opacity-80 transition-opacity">
          Lihat semua
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Reminder list */}
      <div className="flex-1 flex flex-col">
        {reminders.map((reminder, index) => {
          const Icon = reminder.icon;
          const isLast = index === reminders.length - 1;
          
          return (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`group flex items-center justify-between py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-[46px] h-[46px] rounded-2xl flex items-center justify-center flex-shrink-0 ${reminder.iconBg} ${reminder.iconColor}`}
                >
                  <Icon size={22} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-on-surface mb-0.5 group-hover:text-primary transition-colors">
                    {reminder.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-on-surface-variant">
                      {reminder.date}
                    </p>
                    {reminder.status === "Mendesak" && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span className="text-[12px] font-bold text-red-500">Mendesak</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right ml-4 flex-shrink-0">
                {reminder.actionText ? (
                  <button className="px-4 py-2 rounded-xl text-[13px] font-bold border border-gray-200 text-on-surface hover:border-primary hover:text-primary hover:bg-primary/5 transition-all bg-white shadow-sm">
                    {reminder.actionText}
                  </button>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-[12px] font-bold bg-gray-50 text-on-surface-variant border border-gray-100">
                    {reminder.status}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
