import { cn } from "@/utils/cn";
import { ActivityIndicator, Pressable, PressableProps, Text } from "react-native";
import { ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

type ButtonProps = PressableProps & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  textClassName?: string;
  children: ReactNode;
};

const VARIANT_STYLES = {
  primary: {
    container: "bg-primary-container",
    text: "text-on-surface",
    indicator: "#1c1b1b",
  },
  secondary: {
    container: "bg-secondary-container",
    text: "text-secondary",
    indicator: "#506444",
  },
  outline: {
    container: "bg-transparent border border-primary",
    text: "text-primary",
    indicator: "#3e646a",
  },
  ghost: {
    container: "bg-transparent",
    text: "text-primary",
    indicator: "#3e646a",
  },
};

const SIZE_STYLES = {
  sm: { container: "py-2.5 px-5 rounded-full", text: "text-sm" },
  md: { container: "py-4 px-8 rounded-full", text: "text-base" },
  lg: { container: "py-5 px-10 rounded-full", text: "text-lg" },
};

export const Button = ({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  onPress,
  className = "",
  textClassName = "",
  children,
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      className={cn(
        "flex-row items-center justify-center gap-2",
        VARIANT_STYLES[variant].container,
        SIZE_STYLES[size].container,
        isDisabled && "opacity-50",
        className
      )}
      onPress={isDisabled ? undefined : onPress}
    >
      {loading ? (
        <ActivityIndicator size="small" color={VARIANT_STYLES[variant].indicator} />
      ) : (
        <Text
          className={cn(
            "font-semibold tracking-wide",
            VARIANT_STYLES[variant].text,
            SIZE_STYLES[size].text,
            textClassName
          )}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
};
