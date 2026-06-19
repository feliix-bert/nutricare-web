import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';

type ChatInputProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

const ChatInput = React.memo(({ onSend, disabled, placeholder = 'Tanya konsultasi gizi di sini...' }: ChatInputProps) => {
  const [value, setValue] = useState('');
  const canSend = !!value.trim() && !disabled;

  const handleSend = () => {
    const message = value.trim();
    if (!message) return;
    onSend(message);
    setValue('');
  };

  return (
    <View className="p-4 border-t border-surface-container bg-surface-lowest flex-row items-center gap-3">
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor="#717879"
        editable={!disabled}
        className="flex-1 bg-surface-low rounded-full px-5 py-3 text-on-surface text-[15px]"
        onSubmitEditing={handleSend}
      />
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        className={`w-11 h-11 rounded-full items-center justify-center ${
          canSend ? 'bg-primary' : 'bg-surface-low opacity-60'
        }`}
      >
        <IconSymbol name="paperplane.fill" size={18} color={canSend ? '#ffffff' : '#717879'} />
      </Pressable>
    </View>
  );
});

ChatInput.displayName = 'ChatInput';

export { ChatInput };
