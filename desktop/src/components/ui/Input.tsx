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
        {leftElement && <div className="absolute left-3">{leftElement}</div>}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            "w-full rounded-lg border border-outline-variant bg-transparent px-4 py-3 text-sm text-on-surface transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
            disabled && "bg-surface-dim opacity-50 cursor-not-allowed",
            isInvalid && "border-danger focus:border-danger focus:ring-danger",
            leftElement && "pl-10",
            rightElement && "pr-12",
            className
          )}
          {...props}
        />
        {rightElement && <div className="absolute right-3">{rightElement}</div>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
