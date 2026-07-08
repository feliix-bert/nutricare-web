import React, { useCallback, useState, useRef, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { router } from "expo-router";

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Button } from "@/components/ui/Button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/Empty";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { ChatBubble } from "@/features/chat/components/ChatBubble";
import { ChatInput } from "@/features/chat/components/ChatInput";
import { SuggestedChips } from "@/features/chat/components/SuggestedChips";
import { useActivePredictionForChat } from "@/features/chat/hooks/useActivePredictionForChat";
import { useChatHistory, useSendChatMessage } from "@/features/chat/hooks/useChat";
import type { ChatMessage } from "@/features/chat/types/chat-types";

const QUICK_PROMPTS = [
  "Mencegah stunting",
  "Jadwal MPASI",
  "Kebutuhan zat besi",
];

const inputBarKeyboardStyle = { paddingBottom: 16 };
const inputBarDefaultStyle = { paddingBottom: 88 };

export const ConsultScreen = () => {
  const { predictionId, isLoading: isFindingPrediction } = useActivePredictionForChat();

  const { data: historyData, isLoading: isLoadingHistory } = useChatHistory(predictionId ?? '');
  const { mutate: sendMessage, isPending: isSending } = useSendChatMessage(predictionId ?? '');

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlashListRef<ChatMessage> | null>(null);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (historyData?.messages && historyData.messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [historyData?.messages]);

  const handleSend = useCallback((text: string) => {
    if (!text.trim() || isSending || !predictionId) return;

    sendMessage(text, {
      onSuccess: () => {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    });
  }, [isSending, predictionId, sendMessage]);

  const renderMessageItem = useCallback(
    ({ item }: { item: ChatMessage }) => <ChatBubble message={item} variant="ai" />,
    []
  );

  if (isFindingPrediction) {
    return <LoadingOverlay />;
  }

  // S4.7 Guard: Jika belum ada prediction completed
  if (!predictionId) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center px-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia>
              <Text className="text-5xl">🤖</Text>
            </EmptyMedia>
            <EmptyTitle>AI Konsultan Belum Aktif</EmptyTitle>
            <EmptyDescription>
              Untuk menggunakan fitur chat dengan AI, pastikan Anda telah melakukan skrining pertumbuhan anak minimal satu kali dan hasilnya telah selesai dianalisis.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onPress={() => router.push("/(app)/(tabs)")} variant="primary" size="md" className="px-8 mt-4">
              Kembali ke Beranda
            </Button>
          </EmptyContent>
        </Empty>
      </SafeAreaView>
    );
  }

  const messages = historyData?.messages ?? [];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-container-padding py-4 border-b border-surface-container bg-surface-lowest">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-full bg-primary-light items-center justify-center">
            <Text className="text-xl">✨</Text>
          </View>
          <View>
            <Text className="text-base font-bold text-on-surface">Gemini Health Advisor</Text>
            <View className="flex-row items-center gap-1">
              <View className="w-2 h-2 rounded-full bg-secondary" />
              <Text className="text-xs text-outline font-medium">Aktif</Text>
            </View>
          </View>
        </View>
        <View className="w-8 h-8 rounded-full items-center justify-center bg-surface-low">
          <IconSymbol name="info.circle" size={18} color="#717879" />
        </View>
      </View>

      {/* Clinical Warning Banner */}
      <View className="bg-amber-500/5 border-b border-amber-500/15 px-container-padding py-2.5 flex-row items-center gap-2">
        <IconSymbol name="info.circle" size={13} color="#b45309" />
        <Text className="text-[10px] text-amber-800/95 leading-4 font-semibold flex-1">
          Konsultasi AI ini hanya bersifat edukatif awal dan tidak menggantikan diagnosis atau saran keputusan medis
          dari dokter anak.
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        className="flex-1"
      >
        {/* Chat List */}
        {isLoadingHistory ? (
          <View className="flex-1 justify-center items-center">
             <Text className="text-sm text-outline">Memuat percakapan...</Text>
          </View>
        ) : (
          <FlashList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessageItem}
            estimatedItemSize={80}
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              isSending ? (
                <View className="flex-row my-2 justify-start">
                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2.5 self-end">
                    <Text className="text-sm">🤖</Text>
                  </View>
                  <View className="p-4 rounded-2xl bg-surface-lowest rounded-bl-none border border-outline-variant/20">
                    <Text className="text-sm text-outline italic">Mengetik...</Text>
                  </View>
                </View>
              ) : null
            }
          />
        )}

        {/* Quick Prompts Container */}
        {messages.length <= 1 && !isSending && !isLoadingHistory && (
          <SuggestedChips suggestions={QUICK_PROMPTS} onSelect={handleSend} />
        )}

        {/* Chat Input Bar */}
        <View style={keyboardVisible ? inputBarKeyboardStyle : inputBarDefaultStyle}>
          <ChatInput onSend={handleSend} disabled={isSending || isLoadingHistory} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
