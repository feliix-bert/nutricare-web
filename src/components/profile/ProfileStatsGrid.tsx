"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

type StatItem = {
  label: string;
  value: string;
  icon: LucideIcon;
};

type Props = {
  stats: StatItem[];
  delay?: number;
};

export function ProfileStatsGrid({ stats, delay = 0.15 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="grid grid-cols-3 gap-3 md:gap-4"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="p-4 md:p-5 rounded-2xl bg-white border border-outline-variant/10 shadow-sm text-center flex flex-col items-center"
          >
            <div className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center mb-3">
              <Icon size={16} className="text-on-surface-variant" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-on-surface mb-1">{stat.value}</p>
            <p className="text-[11px] md:text-xs text-on-surface-variant font-medium">{stat.label}</p>
          </div>
        );
      })}
    </motion.div>
  );
}
