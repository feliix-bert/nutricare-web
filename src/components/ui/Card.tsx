import { cn } from "@/utils/cn";
import { HTMLAttributes } from "react";

type CardVariant = "default" | "elevated" | "warm" | "glass" | "accent";

export function Card({
  className,
  size = "default",
  variant = "default",
  pressable,
  onClick,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  size?: "default" | "sm";
  variant?: CardVariant;
  pressable?: boolean;
}) {
  const variantStyles: Record<CardVariant, string> = {
    default: "bg-white border border-outline-variant/10 shadow-card",
    elevated: "bg-white border border-outline-variant/8 shadow-elevated",
    warm: "surface-warm shadow-warm",
    glass: "surface-glass shadow-card",
    accent: "bg-primary-container/40 border border-primary/10 shadow-card",
  };

  const cardClass = cn(
    "flex flex-col gap-4 overflow-hidden rounded-[1.75rem]",
    size === "default" ? "p-6" : "gap-3 p-4 rounded-[1.5rem]",
    variantStyles[variant],
    (pressable || onClick) &&
      "cursor-pointer hover-lift press-scale hover:shadow-card-hover",
    className
  );

  return <div className={cardClass} onClick={onClick} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1 pb-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-bold text-on-surface tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-on-surface-variant", className)} {...props} />;
}

export function CardAction({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("self-start justify-self-end ml-auto", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pt-1", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-row items-center border-t border-outline-variant/8 bg-surface-low/50 px-6 pt-4 pb-2 -mx-6 -mb-6 rounded-b-[1.75rem]",
        className
      )}
      {...props}
    />
  );
}
