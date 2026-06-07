import { useState } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ")
}

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  containerClassName?: string;
  showPasswordToggle?: boolean;
};

export const Input = ({
  label,
  error,
  containerClassName = "",
  showPasswordToggle = false,
  secureTextEntry,
  className = "",
  ...rest
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? false);

  const borderClass = error
    ? "border-danger"
    : isFocused
      ? "border-primary"
      : "border-gray-100"

  return (
    <View className={cn("gap-1.5", containerClassName)}>
      {label && <Text className="text-sm font-semibold text-gray-900">{label}</Text>}
      <View
        className={cn(
          "flex-row items-center border-2 rounded-xl px-4 bg-gray-50",
          borderClass,
        )}
      >
        <TextInput
          className={cn("flex-1 text-base py-3.5 text-gray-900", className)}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {showPasswordToggle && (
          <Pressable onPress={() => setIsSecure((prev) => !prev)} className="p-1" hitSlop={8}>
            <Text className="text-lg text-gray-400">{isSecure ? "👁️" : "🙈"}</Text>
          </Pressable>
        )}
      </View>
      {error && <Text className="text-xs font-medium text-danger">{error}</Text>}
    </View>
  );
};
