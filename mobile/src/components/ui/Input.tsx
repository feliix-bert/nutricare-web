import { TextInput, type TextInputProps } from "react-native";
import { cn } from "@/utils/cn";

type InputProps = TextInputProps & {
  isInvalid?: boolean;
};

function Input({ className, editable = true, isInvalid = false, ...props }: InputProps) {
  return (
    <TextInput
      data-slot="input"
      editable={editable}
      className={cn(
        "w-full rounded-lg border border-input bg-transparent text-sm transition-colors",
        !editable && "bg-input/50 opacity-50",
        isInvalid && "border-destructive",
        className
      )}
      placeholderTextColor="rgba(156, 163, 175, 0.5)"
      {...props}
    />
  );
}

export { Input };
