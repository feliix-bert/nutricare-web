"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

type InfoItem = {
  icon: LucideIcon;
  label: string;
  value: string;
};

type Props = {
  title: string;
  items: InfoItem[];
  delay?: number;
};

export function ProfileInfoCard({ title, items, delay = 0.25 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex flex-col"
    >
      <h3 className="font-bold text-on-surface-variant text-[13px] uppercase tracking-wider mb-3 px-1">
        {title}
      </h3>
      <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        {items.map((item, index, arr) => {
          const Icon = item.icon;
          const isLast = index === arr.length - 1;
          return (
            <div
              key={item.label}
              className={`flex items-center gap-4 p-4 hover:bg-surface-low transition-colors ${!isLast ? "border-b border-outline-variant/10" : ""}`}
            >
              <div className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center flex-shrink-0">
                <Icon className="text-on-surface-variant" size={16} strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-on-surface text-sm truncate">{item.value}</p>
                <p className="text-[12px] text-on-surface-variant font-medium mt-0.5">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
