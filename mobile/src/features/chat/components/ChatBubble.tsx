import React from 'react';
import { Text, View } from 'react-native';

import type { ChatMessage, ConsultationMessage } from '@/features/chat/types/chat-types';
import { cn } from '@/utils/cn';
import { formatTime } from '@/utils/format';

type ChatBubbleProps = {
  message: ChatMessage | ConsultationMessage;
  variant: 'ai' | 'consultation';
  isOwn?: boolean;
  showHeader?: boolean;
};

const ConsultationHeader = ({ name, time }: { name: string; time: string }) => (
  <View className="flex-row items-center gap-2 px-1 mb-1">
    <Text className="text-xs font-medium text-gray-600">{name}</Text>
    <Text className="text-[10px] text-gray-400">{time}</Text>
  </View>
);

const ChatBubble = React.memo(({ message, variant, isOwn, showHeader }: ChatBubbleProps) => {
  if (variant === 'consultation') {
    const msg = message as ConsultationMessage;
    return (
      <View className={`my-1.5 ${isOwn ? 'items-end' : 'items-start'}`}>
        {showHeader && (
          <ConsultationHeader name={msg.userName} time={formatTime(msg.createdAt)} />
        )}
        <View
          className={cn("max-w-[75%] py-2.5 px-3.5 rounded-2x", isOwn 
            ? 'bg-primary rounded-br-none' 
            : 'bg-surface-lowest rounded-bl-none border border-outline-variant/20')}
        >
          <Text className={`text-[15px] leading-5 ${isOwn ? 'text-white' : 'text-on-surface'}`}>
            {msg.content}
          </Text>
        </View>
      </View>
    );
  }

  const isAi = (message as ChatMessage).sender === 'ai';

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
          {(message as ChatMessage).text}
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

