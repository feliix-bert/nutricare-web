"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/utils/cn";

type MedicShellProps = {
  children: ReactNode;
  className?: string;
  noPadding?: boolean; // For full-bleed pages like chat
};

/**
 * MedicShell — Medica Style Layout
 *
 * Visual identity:
 *  - Background: Soft sky blue to peach gradient.
 *  - Main container: Large, floating white board with rounded corners and soft shadow.
 */
export function MedicShell({ children, className, noPadding }: MedicShellProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col p-4 md:p-6",
        "bg-gradient-to-b from-[var(--color-medic-bg-gradient-start)] to-[var(--color-medic-bg-gradient-end)]",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex flex-col bg-white rounded-[2.5rem] shadow-medica overflow-hidden border border-white/50 relative"
      >
        {/* Subtle inner highlight to make it pop like glass/premium card */}
        <div className="absolute inset-0 rounded-[2.5rem] border border-white pointer-events-none" />
        
        <div className={cn("flex-1 flex flex-col relative z-10 w-full mx-auto max-w-screen-xl", !noPadding && "p-6 md:p-10")}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/** Section heading */
export function MedicSectionHead({
  title,
  count,
  action,
}: {
  title: string;
  count?: number;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <h2
          className="text-lg font-bold"
          style={{ color: "var(--color-medic-text)" }}
        >
          {title}
        </h2>
        {count !== undefined && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              background: "var(--color-medic-accent-light)",
              color: "var(--color-medic-accent-hover)",
            }}
          >
            {count}
          </span>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

/** Medica style status chip — pill shape, soft bg */
export function ClinicalBadge({
  status,
}: {
  status: "NORMAL" | "AT_RISK" | "STUNTED" | "SEVERELY_STUNTED" | string;
}) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    NORMAL: {
      label: "Normal",
      bg: "var(--color-medic-success-bg)",
      color: "var(--color-medic-success)",
    },
    AT_RISK: {
      label: "Berisiko",
      bg: "var(--color-medic-warning-bg)",
      color: "var(--color-medic-warning)",
    },
    STUNTED: {
      label: "Stunting",
      bg: "#ffedd5",
      color: "#ea580c",
    },
    SEVERELY_STUNTED: {
      label: "Parah",
      bg: "var(--color-medic-critical-bg)",
      color: "var(--color-medic-critical)",
    },
  };
  const { label, bg, color } = map[status] ?? {
    label: status,
    bg: "var(--color-medic-border)",
    color: "var(--color-medic-text-muted)",
  };

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}
