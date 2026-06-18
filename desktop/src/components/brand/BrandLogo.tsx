"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/utils/cn";

type BrandLogoProps = {
  /** compact = sidebar/nav, full = full wordmark, icon-only = just logo mark */
  variant?: "compact" | "full" | "icon-only";
  className?: string;
  href?: string;
  priority?: boolean;
  /** Force text to show alongside icon (overrides variant logic) */
  showText?: boolean;
  /** White variant for use on dark/image backgrounds */
  onDark?: boolean;
};

export function BrandLogo({
  variant = "compact",
  className,
  href,
  priority = false,
  showText,
  onDark = false,
}: BrandLogoProps) {
  const showWordmark = showText ?? (variant !== "icon-only");
  const iconSize = variant === "full" ? "w-9 h-9" : "w-8 h-8";

  const content = (
    <div className={cn("flex items-center gap-2.5 select-none", className)}>
      {/* Icon mark */}
      <div className={cn("relative flex-shrink-0", iconSize)}>
        <Image
          src="/logo.png"
          alt="TumbuhSehat"
          fill
          priority={priority}
          sizes="40px"
          className="object-contain"
        />
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <span
          className={cn(
            "font-extrabold leading-none tracking-tight",
            variant === "full" ? "text-[22px]" : "text-[17px]"
          )}
        >
          <span className={onDark ? "text-white" : "text-primary"}>Tumbuh</span>
          <span className={onDark ? "text-white/80" : "text-on-surface"}>Sehat</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        {content}
      </Link>
    );
  }

  return content;
}
