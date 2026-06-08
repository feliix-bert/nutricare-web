import { useState } from "react";
import { Pressable, Text, View, type TextInputProps } from "react-native";
import { Field, FieldLabel, FieldError } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { cn } from "@/utils/cn";

type InputFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  containerClassName?: string;
  showPasswordToggle?: boolean;
  rightElement?: React.ReactNode;
  isInvalid?: boolean;
};

function InputField({
  label,
  error,
  containerClassName,
  showPasswordToggle = false,
  rightElement,
  secureTextEntry,
  className,
  isInvalid,
  ...rest
}: InputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? false);

  const borderClass = error ? "border-danger" : isFocused ? "border-primary" : "border-outline-variant/30";

  return (
    <Field isInvalid={!!error} className={cn("gap-1.5", containerClassName)}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <View className={cn("flex-row items-center border rounded-full px-6 bg-surface-lowest", borderClass)}>
        <Input
          className={cn("flex-1 text-base py-3.5 text-on-surface border-0 h-auto", className)}
          placeholderTextColor="#717879"
          secureTextEntry={isSecure}
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
        {showPasswordToggle ? (
          <Pressable onPress={() => setIsSecure((prev) => !prev)} className="p-1" hitSlop={8}>
            <Text className="text-lg text-outline">{isSecure ? "👁️" : "🙈"}</Text>
          </Pressable>
        ) : null}
        {rightElement}
      </View>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}

export { InputField };
