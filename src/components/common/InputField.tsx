import { useState, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff } from "lucide-react";

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  showPasswordToggle?: boolean;
  rightElement?: ReactNode;
  isInvalid?: boolean;
}

export function InputField({
  label,
  error,
  containerClassName,
  showPasswordToggle = false,
  rightElement,
  type,
  className,
  isInvalid,
  ...rest
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(type === "password");

  const borderClass = error
    ? "border-danger/40 focus-within:border-danger/60"
    : isFocused
    ? "border-primary/40 shadow-[0_0_0_4px_rgba(45,138,126,0.06)]"
    : "border-outline-variant/20 hover:border-outline-variant/35";

  return (
    <div className={cn("flex flex-col gap-2 w-full", containerClassName)}>
      {label && (
        <label
          className={cn(
            "text-sm font-semibold tracking-tight",
            error ? "text-danger" : "text-on-surface"
          )}
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex flex-row items-center rounded-2xl bg-surface-warm px-4 py-1 border transition-all duration-300",
          borderClass
        )}
      >
        <Input
          type={isSecure ? "password" : type === "password" ? "text" : type}
          className={cn(
            "flex-1 text-base text-on-surface border-0 bg-transparent py-3 px-2 shadow-none focus:ring-0 focus:border-0 focus:shadow-none",
            className
          )}
          isInvalid={isInvalid ?? !!error}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {showPasswordToggle && type === "password" ? (
          <button
            type="button"
            onClick={() => setIsSecure((prev) => !prev)}
            className="p-2 text-outline hover:text-primary transition-colors duration-200 focus:outline-none rounded-full hover:bg-primary-container/30"
            tabIndex={-1}
          >
            {isSecure ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        ) : null}
        {rightElement}
      </div>
      {error && (
        <span className="text-xs font-medium text-danger ml-1 animate-fade-up">{error}</span>
      )}
    </div>
  );
}
