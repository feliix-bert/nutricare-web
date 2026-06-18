import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean;
  rightElement?: ReactNode;
  leftElement?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, disabled = false, isInvalid = false, leftElement, rightElement, ...props }, ref) => {
    return (
      <div className="relative flex w-full items-center">
        {leftElement && <div className="absolute left-3.5">{leftElement}</div>}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full rounded-2xl border border-outline-variant/25 bg-surface-warm px-4 py-3.5 text-sm text-on-surface",
            "transition-all duration-300 ease-out",
            "placeholder:text-outline/50",
            "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:shadow-[0_0_0_4px_rgba(45,138,126,0.06)]",
            "hover:border-outline-variant/40",
            disabled && "bg-surface-dim opacity-50 cursor-not-allowed",
            isInvalid && "border-danger/40 focus:border-danger/60 focus:ring-danger/10",
            leftElement && "pl-11",
            rightElement && "pr-12",
            className
          )}
          {...props}
        />
        {rightElement && <div className="absolute right-3.5">{rightElement}</div>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
