import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(
        "inline-flex h-6 shrink-0 items-center justify-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold",
        variant === "default" && "bg-primary-container text-primary-on-container",
        variant === "secondary" && "bg-secondary-container text-secondary-on-container",
        variant === "destructive" && "bg-danger-light text-danger-dark",
        variant === "outline" && "border-outline text-on-surface",
        variant === "ghost" && "text-on-surface-variant",
        variant === "link" && "text-primary underline",
        className
      )}
      {...props}
    />
  );
}
