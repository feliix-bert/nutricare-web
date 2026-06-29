"use client";

import { motion } from "motion/react";
import { Card } from "@/components/ui/Card";
import { Plus, Activity, HeartPulse, Scale, Ruler, Star, Clock } from "lucide-react";

type ActivityItem = {
  id: string;
  title: string;
  datetime: string;
  duration: string;
  stat1: string;
  stat1Icon: React.ElementType;
  stat1Color: string;
  stat2: string;
  stat2Icon: React.ElementType;
  stat2Color: string;
  score: string;
  icon: React.ElementType;
};

export function ActivityTimeline({ childId, assessments = [], nutritionLogs = [] }: { childId: string, assessments: any[], nutritionLogs: any[] }) {
  const activities: ActivityItem[] = [];

  assessments.forEach(a => {
    activities.push({
      id: `assess_${a.id}`,
      title: "Pemantauan Status Gizi",
      datetime: new Date(a.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }),
      duration: "Selesai",
      stat1: `${a.weight} kg`,
      stat1Icon: Scale,
      stat1Color: "text-orange-500",
      stat2: `${a.height} cm`,
      stat2Icon: Ruler,
      stat2Color: "text-blue-500",
      score: "+2 Poin",
      icon: Activity,
    });
  });

  nutritionLogs.forEach(n => {
    activities.push({
      id: `nutri_${n.id}`,
      title: "Catatan Nutrisi MPASI",
      datetime: new Date(n.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }),
      duration: "Selesai",
      stat1: `${n.calories} kkal`,
      stat1Icon: HeartPulse,
      stat1Color: "text-red-500",
      stat2: `${n.protein}g P`,
      stat2Icon: Activity,
      stat2Color: "text-green-500",
      score: "+5 Poin",
      icon: Activity,
    });
  });

  // Sort descending and take top 5
  activities.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  const displayActivities = activities.slice(0, 5);

  return (
    <Card variant="default" className="p-0 h-full overflow-hidden bg-white shadow-card">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-[28px] font-extrabold text-[#1c1c1c] tracking-tight leading-none mb-1.5">
              Aktivitas
            </h3>
            <p className="text-[14px] text-on-surface-variant font-medium">
              Aktivitas terbaru untuk anak ini.
            </p>
          </div>
          <button className="w-10 h-10 rounded-full border border-blue-100 flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors">
            <Plus size={20} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="flex flex-col">
        {displayActivities.length === 0 && (
          <div className="p-6 text-center text-gray-500 font-medium">Belum ada aktivitas.</div>
        )}
        {displayActivities.map((activity, index) => {
          const Icon = activity.icon;
          const isLast = index === displayActivities.length - 1;
          const Stat1Icon = activity.stat1Icon;
          const Stat2Icon = activity.stat2Icon;
          
          return (
            <div
              key={activity.id}
              className={`p-6 ${!isLast ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="mt-0.5 text-[#1c1c1c]">
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <h4 className="text-[16px] font-bold text-[#1c1c1c] mb-0.5">{activity.title}</h4>
                    <p className="text-[13px] text-gray-500 font-medium">{activity.datetime}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="pl-10 grid grid-cols-2 gap-y-2 gap-x-4">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" strokeWidth={2.5} />
                  <span className="text-[13px] font-medium text-gray-600">{activity.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stat1Icon size={14} className={activity.stat1Color} strokeWidth={2.5} />
                  <span className="text-[13px] font-medium text-gray-600">{activity.stat1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stat2Icon size={14} className={activity.stat2Color} strokeWidth={2.5} />
                  <span className="text-[13px] font-medium text-gray-600">{activity.stat2}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-yellow-500" strokeWidth={2.5} />
                  <span className="text-[13px] font-medium text-gray-600">{activity.score}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
