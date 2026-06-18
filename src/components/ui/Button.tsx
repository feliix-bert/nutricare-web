import { cn } from "@/utils/cn";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "glow";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  textClassName?: string;
  children: ReactNode;
};

const VARIANT_STYLES = {
  primary: {
    container:
      "gradient-primary text-white shadow-[0_2px_12px_rgba(45,138,126,0.25)] hover:shadow-[0_4px_20px_rgba(45,138,126,0.35)] hover:brightness-105 active:scale-[0.97] transition-all duration-300",
    text: "text-white",
    indicator: "text-white",
  },
  secondary: {
    container:
      "bg-secondary text-white shadow-[0_2px_12px_rgba(107,158,107,0.2)] hover:shadow-[0_4px_20px_rgba(107,158,107,0.3)] hover:brightness-105 active:scale-[0.97] transition-all duration-300",
    text: "text-white",
    indicator: "text-white",
  },
  outline: {
    container:
      "bg-transparent border-2 border-primary/30 hover:border-primary hover:bg-primary-container/20 active:scale-[0.97] transition-all duration-300",
    text: "text-primary",
    indicator: "text-primary",
  },
  ghost: {
    container:
      "bg-transparent hover:bg-surface-high active:scale-[0.97] transition-all duration-300",
    text: "text-primary",
    indicator: "text-primary",
  },
  glow: {
    container:
      "gradient-primary text-white shadow-glow hover:shadow-[0_0_30px_rgba(45,138,126,0.25),0_0_80px_rgba(45,138,126,0.12)] hover:brightness-105 active:scale-[0.97] transition-all duration-300",
    text: "text-white",
    indicator: "text-white",
  },
};

const SIZE_STYLES = {
  sm: { container: "py-2.5 px-5 rounded-full", text: "text-sm" },
  md: { container: "py-3.5 px-8 rounded-full", text: "text-base" },
  lg: { container: "py-4.5 px-10 rounded-full", text: "text-lg" },
};

export const Button = ({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  textClassName = "",
  children,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      className={cn(
        "flex flex-row items-center justify-center gap-2 cursor-pointer",
        VARIANT_STYLES[variant].container,
        SIZE_STYLES[size].container,
        isDisabled && "opacity-50 cursor-not-allowed active:scale-100 hover:brightness-100",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className={cn("animate-spin w-5 h-5", VARIANT_STYLES[variant].indicator)} />
      ) : (
        <span
          className={cn(
            "font-semibold tracking-wide",
            VARIANT_STYLES[variant].text,
            SIZE_STYLES[size].text,
            textClassName
          )}
        >
          {children}
        </span>
      )}
    </button>
  );
};
