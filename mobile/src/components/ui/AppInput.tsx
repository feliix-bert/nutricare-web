import { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';

type AppInputProps = TextInputProps & {
  label?: string;
  error?: string;
  containerClassName?: string;
  showPasswordToggle?: boolean;
};

export const AppInput = ({
  label,
  error,
  containerClassName = '',
  showPasswordToggle = false,
  secureTextEntry,
  className = '',
  ...rest
}: AppInputProps) => {
  const scheme = useColorScheme() ?? 'light';
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? false);

  const placeholderColor = scheme === 'dark' ? '#9BA1A6' : '#687076';

  return (
    <View className={`gap-1.5 ${containerClassName}`}>
      {label && (
        <Text className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center border-2 rounded-xl px-4 bg-gray-50 dark:bg-gray-800 ${
          error
            ? 'border-danger'
            : isFocused
            ? 'border-primary'
            : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        <TextInput
          className={`flex-1 text-base py-3.5 text-gray-900 dark:text-gray-100 ${className}`}
          placeholderTextColor={placeholderColor}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {showPasswordToggle && (
          <Pressable
            onPress={() => setIsSecure((prev) => !prev)}
            className="p-1"
            hitSlop={8}
          >
            <Text className="text-lg text-gray-500">
              {isSecure ? '👁️' : '🙈'}
            </Text>
          </Pressable>
        )}
      </View>
      {error && (
        <Text className="text-xs font-medium text-danger">
          {error}
        </Text>
      )}
    </View>
  );
};
