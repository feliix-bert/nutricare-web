"use client";

import { useMemo } from "react";
import Image from "next/image";
import { cn } from "@/utils/cn";
import { getAvatarUri, type AvatarVariant } from "@/utils/avatar";

const SIZE_MAP = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 64,
  xl: 96,
} as const;

type AvatarProps = {
  seed: string;
  variant?: AvatarVariant;
  size?: keyof typeof SIZE_MAP;
  className?: string;
  alt?: string;
};

export function Avatar({
  seed,
  variant = "parent",
  size = "md",
  className,
  alt,
}: AvatarProps) {
  const px = SIZE_MAP[size];
  const uri = useMemo(() => getAvatarUri(seed, variant), [seed, variant]);

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-primary-container/20 border-2 border-white shadow-[0_2px_8px_rgba(45,138,126,0.1)] flex-shrink-0 transition-shadow duration-300 hover:shadow-[0_4px_16px_rgba(45,138,126,0.15)]",
        className
      )}
      style={{ width: px, height: px }}
    >
      <Image
        src={uri}
        alt={alt ?? seed}
        fill
        sizes={`${px}px`}
        className="object-cover"
      />
    </div>
  );
}
