import { cn } from "@/utils/cn";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
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
    container: "bg-primary hover:brightness-95 active:scale-95 transition-all shadow-sm border border-black/5 text-white",
    text: "text-white drop-shadow-sm",
    indicator: "text-white",
  },
  secondary: {
    container: "bg-secondary hover:brightness-95 active:scale-95 transition-all shadow-sm border border-black/5 text-white",
    text: "text-white drop-shadow-sm",
    indicator: "text-white",
  },
  outline: {
    container: "bg-transparent border border-primary hover:bg-primary-container/10 active:scale-95 transition-all",
    text: "text-primary",
    indicator: "text-[#3e646a]",
  },
  ghost: {
    container: "bg-transparent hover:bg-surface-dim active:scale-95 transition-all",
    text: "text-primary",
    indicator: "text-[#3e646a]",
  },
};

const SIZE_STYLES = {
  sm: { container: "py-2 px-5 rounded-full", text: "text-sm" },
  md: { container: "py-3 px-8 rounded-full", text: "text-base" },
  lg: { container: "py-4 px-10 rounded-full", text: "text-lg" },
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
        "flex flex-row items-center justify-center gap-2",
        VARIANT_STYLES[variant].container,
        SIZE_STYLES[size].container,
        isDisabled && "opacity-50 cursor-not-allowed active:scale-100",
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
