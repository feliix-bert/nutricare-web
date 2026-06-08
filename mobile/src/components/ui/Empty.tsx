import { View, Text, type ViewProps, type TextProps } from "react-native";
import { cn } from "@/utils/cn";

function Empty({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      data-slot="empty"
      className={cn(
        "flex w-full flex-1 flex-col items-center justify-center gap-4 rounded-xl border-dashed p-6 text-center",
        className
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View data-slot="empty-header" className={cn("flex max-w-sm flex-col items-center gap-2", className)} {...props} />
  );
}

type EmptyMediaProps = ViewProps & {
  variant?: "default" | "icon";
};

function EmptyMedia({ className, variant = "default", ...props }: EmptyMediaProps) {
  return (
    <View
      data-slot="empty-icon"
      className={cn(
        "mb-2 flex shrink-0 flex-row items-center justify-center",

        variant === "default" && "bg-transparent",
        variant === "icon" && "h-8 w-8 rounded-lg bg-muted text-foreground",
        className
      )}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: TextProps & { className?: string }) {
  return <Text data-slot="empty-title" className={cn("text-sm font-medium tracking-tight", className)} {...props} />;
}

function EmptyDescription({ className, ...props }: TextProps & { className?: string }) {
  return <Text data-slot="empty-description" className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function EmptyContent({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      data-slot="empty-content"
      className={cn("flex w-full max-w-sm flex-col items-center gap-2.5 text-sm", className)}
      {...props}
    />
  );
}

export { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia };
