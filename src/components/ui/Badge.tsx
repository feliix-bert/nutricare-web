import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link" | "success" | "warning";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pulse?: boolean;
}

export function Badge({ className, variant = "default", pulse, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(
        "inline-flex h-6 shrink-0 items-center justify-center rounded-full border border-transparent px-3 py-0.5 text-xs font-semibold gap-1.5 transition-colors",
        variant === "default" && "bg-primary-container text-primary-on-container",
        variant === "secondary" && "bg-secondary-container text-secondary-on-container",
        variant === "destructive" && "bg-danger-light text-danger-dark",
        variant === "outline" && "border-outline-variant text-on-surface",
        variant === "ghost" && "text-on-surface-variant",
        variant === "link" && "text-primary underline",
        variant === "success" && "bg-secondary-container text-secondary-on-container",
        variant === "warning" && "bg-tertiary-container text-tertiary-on-container",
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {props.children}
    </span>
  );
}
