import { cn } from "@/utils/cn";
import { HTMLAttributes } from "react";

export function Card({
  className,
  size = "default",
  pressable,
  onClick,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  size?: "default" | "sm";
  pressable?: boolean;
}) {
  const cardClass = cn(
    "flex flex-col gap-4 overflow-hidden rounded-[2.5rem] bg-white p-6 shadow-[0_8px_32px_rgba(134,196,205,0.08)] border border-white/50",
    size === "sm" && "gap-3 p-4 rounded-[2rem]",
    (pressable || onClick) && "cursor-pointer hover:bg-surface-low transition-all duration-300 active:scale-[0.98] hover:shadow-[0_12px_40px_rgba(134,196,205,0.12)] hover:-translate-y-1",
    className
  );

  return <div className={cardClass} onClick={onClick} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1 rounded-t-[32px] pb-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-bold text-on-surface", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-outline", className)} {...props} />;
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
        "flex flex-row items-center rounded-b-[32px] border-t border-surface-container bg-surface-low px-6 pt-4 pb-2 -mx-6 -mb-6",
        className
      )}
      {...props}
    />
  );
}
