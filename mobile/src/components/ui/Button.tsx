import { ActivityIndicator, Pressable, Text } from "react-native";

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
  textClassName?: string;
  children: React.ReactNode;
};

const VARIANT_STYLES = {
  primary: {
    container: "bg-primary",
    text: "text-white",
    indicator: "#FFFFFF",
  },
  secondary: {
    container: "bg-primary-light",
    text: "text-primary",
    indicator: "#0A7E6E",
  },
  outline: {
    container: "bg-transparent border-2 border-primary",
    text: "text-primary",
    indicator: "#0A7E6E",
  },
  ghost: {
    container: "bg-transparent",
    text: "text-primary",
    indicator: "#0A7E6E",
  },
};

const SIZE_STYLES = {
  sm: { container: "py-2.5 px-5 rounded-xl", text: "text-sm" },
  md: { container: "py-4 px-8 rounded-xl", text: "text-base" },
  lg: { container: "py-5 px-10 rounded-xl", text: "text-lg" },
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
