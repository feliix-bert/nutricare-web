import { Pressable, Text, TextProps, View, ViewProps } from "react-native";
import { cn } from "@/utils/cn";
import { type ComponentProps } from "react";

function Card({
  className,
  size = "default",
  pressable,
  onPress,
  ...props
}: ViewProps & {
  size?: "default" | "sm";
  pressable?: boolean;
  onPress?: () => void;
}) {
  const cardClass = cn(
    "flex flex-col gap-4 overflow-hidden rounded-[32px] bg-surface-lowest p-6 border border-outline-variant/15 shadow-[0_4px_20px_-2px_rgba(62,100,106,0.04)]",
    size === "sm" && "gap-3 p-4",
    className
  );

  if (pressable !== false && onPress) {
    return <Pressable className={cardClass} onPress={onPress} {...(props as any)} />;
  }

  return <View className={cardClass} {...props} />;
}

function CardHeader({ className, ...props }: ViewProps) {
  return <View className={cn("flex flex-col gap-1 rounded-t-[32px] pb-2", className)} {...props} />;
}

function CardTitle({ className, ...props }: TextProps) {
  return <Text className={cn("text-lg font-bold text-on-surface", className)} {...props} />;
}

// ... CardDescription and CardAction ...
function CardDescription({ className, ...props }: TextProps) {
  return <Text className={cn("text-sm text-outline", className)} {...props} />;
}

function CardAction({ className, ...props }: ViewProps) {
  return <View className={cn("self-start justify-self-end ml-auto", className)} {...props} />;
}

function CardContent({ className, ...props }: ViewProps) {
  return <View className={cn("pt-1", className)} {...props} />;
}

function CardFooter({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        "flex flex-row items-center rounded-b-[32px] border-t border-surface-container bg-surface-low px-6 pt-4 pb-2 -mx-6 -mb-6",
        className
      )}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardAction, CardContent };
