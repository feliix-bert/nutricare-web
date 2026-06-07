import { Pressable, Text, View } from "react-native";
import { cn } from "@/utils/cn";

function Card({
  className,
  size = "default",
  pressable,
  onPress,
  ...props
}: React.ComponentProps<typeof View> & {
  size?: "default" | "sm";
  pressable?: boolean;
  onPress?: () => void;
}) {
  const cardClass = cn(
    "flex flex-col gap-4 overflow-hidden rounded-xl bg-white py-4",
    size === "sm" && "gap-3 py-3",
    className
  );

  if (pressable !== false && onPress) {
    return <Pressable className={cardClass} onPress={onPress} {...(props as any)} />;
  }

  return <View className={cardClass} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn("flex flex-col gap-1 rounded-t-xl px-4", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text className={cn("text-base leading-snug font-bold text-gray-900", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text className={cn("text-sm text-gray-500", className)} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn("self-start justify-self-end ml-auto", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn("px-4", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn(
        "flex flex-row items-center rounded-b-xl border-t border-gray-100 bg-gray-50/50 px-4 pt-4",
        className
      )}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardAction, CardContent };
