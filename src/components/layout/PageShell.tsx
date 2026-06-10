"use client";

import { ReactNode } from "react";
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
    <div className={cn("w-full min-h-screen bg-background", className)}>
      <div className={cn("mx-auto w-full", maxWMap[maxWidth], flush ? "px-0 py-0" : "px-4 py-5 md:px-8 md:py-8")}>
        {header ?? (title ? (
          <header className="flex flex-col gap-3 mb-5 md:flex-row md:items-center md:justify-between md:gap-4 md:mb-8">
            <div>
              {subtitle && (
                <p className="text-sm font-medium text-outline mb-0.5">{subtitle}</p>
              )}
              <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
                {title}
              </h1>
            </div>
            {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
          </header>
        ) : null)}
        <div className={cn("w-full", contentClassName)}>{children}</div>
      </div>
    </div>
  );
}
