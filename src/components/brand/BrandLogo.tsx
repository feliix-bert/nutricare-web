"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/utils/cn";

const SIZE_MAP = {
  /** Intro / splash hero */
  hero: "h-36 w-36 sm:h-44 sm:w-44 md:h-52 md:w-52 lg:h-56 lg:w-56",
  /** Auth panels */
  lg: "h-32 w-32 sm:h-40 sm:w-40 md:h-44 md:w-44",
  /** Sidebar desktop */
  sidebar: "h-10 w-10 sm:h-12 sm:w-12",
  /** Mobile header / compact */
  sm: "h-8 w-8 sm:h-9 sm:w-9",
  /** Loading splash */
  splash: "h-28 w-28 sm:h-32 sm:w-32",
} as const;

type BrandLogoProps = {
  size?: keyof typeof SIZE_MAP;
  className?: string;
  href?: string;
  priority?: boolean;
  align?: "left" | "center";
  withText?: boolean;
};

export function BrandLogo({
  size = "sidebar",
  className,
  href,
  priority = false,
  align = "left",
  withText,
}: BrandLogoProps) {
  const showText = withText ?? (size === "sidebar" || size === "sm");

  const image = (
    <div className={cn("flex items-center", align === "center" ? "justify-center" : "justify-start", className)}>
      <div className={cn("relative flex-shrink-0", SIZE_MAP[size])}>
        <Image
          src="/logo.png"
          alt="Tumbuh Sehat — GiziChain"
          fill
          priority={priority}
          sizes="(max-width: 640px) 128px, 224px"
          className="object-contain"
        />
      </div>
      {showText && (
        <span className={cn(
          "font-bold tracking-tight text-primary ml-3",
          size === "sm" ? "text-lg" : "text-xl sm:text-2xl"
        )}>
          GiziChain
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg">
        {image}
      </Link>
    );
  }

  return image;
}
