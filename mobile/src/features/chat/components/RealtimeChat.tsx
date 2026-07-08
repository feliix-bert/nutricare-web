import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';

import { IconSymbol } from '@/components/ui/icon-symbol';
import type { ConsultationMessage } from '@/features/chat/types/chat-types';
import { useRealtimeChat } from '@/features/chat/hooks/useRealtimeChat';
import { useChatScroll } from '@/features/chat/hooks/useChatScroll';
import { ChatBubble } from './ChatBubble';

interface RealtimeChatProps {
  roomName: string;
  username: string;
  userId: string;
  onMessage?: (messages: ConsultationMessage[]) => void;
  messages?: ConsultationMessage[];
}

export const RealtimeChat = ({
  roomName,
  username,
  userId,
  onMessage,
  messages: initialMessages = [],
}: RealtimeChatProps) => {
  const { messages: realtimeMessages, sendMessage, isConnected } = useRealtimeChat({ roomName, username, userId });
  const { flatListRef, scrollToEnd } = useChatScroll();
  const [newMessage, setNewMessage] = useState('');

  const allMessages = useMemo(() => {
    const merged = [...initialMessages, ...realtimeMessages];
    const unique = merged.filter(
      (msg, index, self) => index === self.findIndex((m) => m.id === msg.id)
    );
    return unique.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [initialMessages, realtimeMessages]);

  useEffect(() => {
    if (onMessage) onMessage(allMessages);
  }, [allMessages, onMessage]);

  useEffect(() => {
    scrollToEnd();
  }, [allMessages, scrollToEnd]);

  const handleSend = useCallback(() => {
    const text = newMessage.trim();
    if (!text || !isConnected) return;
    sendMessage(text);
    setNewMessage('');
  }, [newMessage, isConnected, sendMessage]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlashList
          ref={flatListRef}
          data={allMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          renderItem={({ item, index }) => {
            const prev = index > 0 ? allMessages[index - 1] : null;
            const showHeader = !prev || prev.userName !== item.userName;
            return (
              <ChatBubble
                message={item}
                variant="consultation"
                isOwn={item.userName === username}
                showHeader={showHeader}
              />
            );
          }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-sm text-gray-400">Belum ada pesan. Mulai percakapan!</Text>
            </View>
          }
        />

        <View className="flex-row items-center gap-2 p-3 border-t border-gray-200 bg-white">
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Ketik pesan..."
            placeholderTextColor="#9ca3af"
            editable={isConnected}
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm text-gray-900"
            onSubmitEditing={handleSend}
          />
          {isConnected && newMessage.trim() ? (
            <Pressable
              onPress={handleSend}
              className="w-10 h-10 rounded-full bg-primary items-center justify-center"
            >
              <IconSymbol name="paperplane.fill" size={16} color="#ffffff" />
            </Pressable>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
