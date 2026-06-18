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
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn("mx-auto w-full relative z-10", maxWMap[maxWidth], flush ? "px-0 py-0" : "px-4 py-6 md:px-8 md:py-10")}
      >
        {header ?? (title ? (
          <motion.header
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-row items-center justify-between gap-3 mb-6 md:mb-10"
          >
            {/* Title block */}
            <div className="flex-1 min-w-0">
              {subtitle && (
                <p className="text-xs font-medium text-on-surface-variant mb-0.5 truncate md:text-sm">{subtitle}</p>
              )}
              <h1 className="text-xl font-extrabold text-on-surface tracking-tight leading-tight truncate md:text-3xl">
                {title}
              </h1>
            </div>
            {/* Actions — right side */}
            {actions && (
              <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
            )}
          </motion.header>
        ) : null)}
        <div className={cn("w-full", contentClassName)}>{children}</div>
      </motion.div>
    </div>
  );
}
