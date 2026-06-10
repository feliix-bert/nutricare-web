import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Empty({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto gap-6", className)}
      {...props}
    />
  );
}

export function EmptyHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col items-center gap-2", className)} {...props} />;
}

export function EmptyMedia({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("w-20 h-20 rounded-full bg-surface-low flex items-center justify-center mb-2", className)}
      {...props}
    />
  );
}

export function EmptyTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-xl font-bold text-on-surface", className)} {...props} />;
}

export function EmptyDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-outline", className)} {...props} />;
}

export function EmptyContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full flex justify-center", className)} {...props} />;
}
