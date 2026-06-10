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
    ? "border-danger focus-within:border-danger"
    : isFocused
    ? "border-primary"
    : "border-outline-variant/30 hover:border-outline-variant";

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", containerClassName)}>
      {label && (
        <label className={cn("text-sm font-medium", error ? "text-danger" : "text-on-surface")}>
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex flex-row items-center rounded-full bg-surface-lowest px-4 py-1 border transition-colors",
          borderClass
        )}
      >
        <Input
          type={isSecure ? "password" : type === "password" ? "text" : type}
          className={cn("flex-1 text-base text-on-surface border-0 bg-transparent py-2.5 px-2 shadow-none focus:ring-0 focus:border-0", className)}
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
            className="p-2 text-outline hover:text-on-surface transition-colors focus:outline-none"
            tabIndex={-1}
          >
            {isSecure ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        ) : null}
        {rightElement}
      </div>
      {error && <span className="text-xs font-medium text-danger ml-2">{error}</span>}
    </div>
  );
}
