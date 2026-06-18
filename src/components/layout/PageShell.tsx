"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/utils/cn";

type PageShellProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  maxWidth?: "5xl" | "6xl" | "7xl";
  flush?: boolean;
};

export function PageShell({
  title,
  subtitle,
  actions,
  header,
  children,
  className,
  contentClassName,
  maxWidth = "7xl",
  flush = false,
}: PageShellProps) {
  const maxWMap = { "5xl": "max-w-5xl", "6xl": "max-w-6xl", "7xl": "max-w-7xl" } as const;

  return (
    <div className={cn("w-full min-h-screen bg-background relative", className)}>
      {/* Subtle background decoration */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] opacity-[0.03] pointer-events-none" aria-hidden>
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full bg-primary organic-blob" />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn("mx-auto w-full relative z-10", maxWMap[maxWidth], flush ? "px-0 py-0" : "px-4 py-6 md:px-8 md:py-10")}
      >
        {header ?? (title ? (
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-2 mb-6 md:flex-row md:items-end md:justify-between md:gap-4 md:mb-10"
          >
            <div>
              {subtitle && (
                <p className="text-sm font-medium text-on-surface-variant mb-1">{subtitle}</p>
              )}
              <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
                {title}
              </h1>
            </div>
            {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
          </motion.header>
        ) : null)}
        <div className={cn("w-full", contentClassName)}>{children}</div>
      </motion.div>
    </div>
  );
}
