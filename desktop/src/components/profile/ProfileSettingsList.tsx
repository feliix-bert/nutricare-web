"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";

type SettingItem = {
  icon: LucideIcon;
  label: string;
  desc: string;
};

type Props = {
  title: string;
  items: SettingItem[];
  delay?: number;
};

export function ProfileSettingsList({ title, items, delay = 0.32 }: Props) {
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
      <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden flex flex-col">
        {items.map((item, index, arr) => {
          const Icon = item.icon;
          const isLast = index === arr.length - 1;
          return (
            <button
              key={item.label}
              className={`group flex items-center gap-4 p-4 hover:bg-surface-low transition-colors text-left ${!isLast ? "border-b border-outline-variant/10" : ""}`}
            >
              <div className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-on-surface-variant group-hover:text-primary transition-colors" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">{item.label}</p>
                <p className="text-[12px] text-on-surface-variant font-medium mt-0.5">{item.desc}</p>
              </div>
              <ChevronRight size={16} className="text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
