import React from 'react';
import { Text, View } from 'react-native';

import type { ChatMessage } from '@/features/chat/types/chat.types';
import { formatTime } from '@/utils/format';

type ChatBubbleProps = {
  message: ChatMessage;
};

const ChatBubble = React.memo(({ message }: ChatBubbleProps) => {
  const isAi = message.sender === 'ai';

  return (
    <View className={`flex-row my-2 ${isAi ? 'justify-start' : 'justify-end'}`}>
      {isAi ? (
        <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2.5 self-end">
          <Text className="text-sm">🤖</Text>
        </View>
      ) : null}
      <View
        className={`max-w-[75%] p-4 rounded-2xl ${
          isAi
            ? 'bg-surface-lowest rounded-bl-none border border-outline-variant/20'
            : 'bg-primary rounded-br-none'
        }`}
      >
        <Text className={`text-[15px] leading-6 ${isAi ? 'text-on-surface' : 'text-white'}`}>
          {message.text}
        </Text>
        <Text className={`text-[10px] mt-1.5 text-right ${isAi ? 'text-outline' : 'text-white/70'}`}>
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
});

ChatBubble.displayName = 'ChatBubble';

export { ChatBubble };
