import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Empty({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-10 text-center max-w-sm mx-auto gap-6 animate-fade-up",
        className
      )}
      {...props}
    />
  );
}

export function EmptyHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col items-center gap-3", className)} {...props} />;
}

export function EmptyMedia({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-24 h-24 rounded-full bg-primary-container/30 flex items-center justify-center mb-3 shadow-warm",
        className
      )}
      {...props}
    />
  );
}

export function EmptyTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-xl font-bold text-on-surface tracking-tight", className)} {...props} />;
}

export function EmptyDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-on-surface-variant leading-relaxed", className)} {...props} />;
}

export function EmptyContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full flex justify-center", className)} {...props} />;
}
