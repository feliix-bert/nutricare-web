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
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ChatBubble, ChatInput, SuggestedChips } from "@/features/chat";
import type { ChatMessage } from "@/features/chat/types/chat.types";

const QUICK_PROMPTS = ["Mencegah Stunting", "Jadwal MPASI 6 Bulan", "ASI Eksklusif vs MPASI", "Kebutuhan Zat Besi"];

const MOCK_RESPONSES: Record<string, string> = {
  "mencegah stunting":
    "Stunting dapat dicegah dengan memastikan kecukupan gizi pada 1000 Hari Pertama Kehidupan (HPK). Berikan ASI Eksklusif selama 6 bulan pertama, lanjutkan dengan MPASI yang kaya protein hewani (seperti telur, ikan, daging), serta jaga sanitasi lingkungan dan imunisasi lengkap.",
  "jadwal mpasi 6 bulan":
    "Untuk bayi usia 6 bulan, mulailah dengan pemberian MPASI 2 kali sehari dengan porsi 2-3 sendok makan sekali makan. Teksturnya harus lumat/halus (puree). Pastikan menu mengandung zat besi seperti hati ayam atau daging merah cincang halus.",
  "asi eksklusif vs mpasi":
    "ASI Eksklusif diberikan selama 6 bulan pertama tanpa tambahan makanan/minuman lain. Setelah 6 bulan, kebutuhan energi bayi meningkat dan tidak lagi tercukupi hanya dari ASI, sehingga wajib diperkenalkan MPASI secara bertahap sambil tetap meneruskan ASI hingga 2 tahun.",
  "kebutuhan zat besi":
    "Zat besi sangat krusial bagi perkembangan otak bayi dan mencegah anemia. Sumber zat besi hewani terbaik meliputi hati ayam, daging sapi cincang, dan kuning telur. Penyerapan zat besi hewani jauh lebih tinggi dibanding zat besi nabati (seperti bayam).",
  default:
    "Halo Bunda! Saya Gemini AI, konsultan kesehatan anak Anda. Untuk menjaga tumbuh kembang si kecil tetap optimal, pastikan ia mendapatkan makanan padat nutrisi tinggi protein hewani (ikan, telur, ayam) serta lakukan pemantauan berat dan tinggi badan secara berkala ke Posyandu atau melalui GiziChain Vault.",
};

const inputBarKeyboardStyle = { paddingBottom: 16 };
const inputBarDefaultStyle = { paddingBottom: 88 };

export const ConsultScreen = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_1",
      sender: "ai",
      text: "Halo Bunda! Saya konsultan AI GiziChain siap menjawab pertanyaan seputar tumbuh kembang, nutrisi MPASI, dan kesehatan si kecil. Ada yang bisa saya bantu hari ini?",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
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

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    // Simulating AI response
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let responseText = MOCK_RESPONSES.default;

      for (const key of Object.keys(MOCK_RESPONSES)) {
        if (lowerText.includes(key)) {
          responseText = MOCK_RESPONSES[key];
          break;
        }
      }

      const aiMsg: Message = {
        id: `msg_ai_${Date.now()}`,
        sender: "ai",
        text: responseText,
        time: formatTime(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1000);
  };

  const renderMessageItem = useCallback(
    ({ item }: { item: ChatMessage }) => <ChatBubble message={item} />,
    []
  );

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
        <FlashList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          estimatedItemSize={80}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isTyping ? (
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

        {/* Quick Prompts Container */}
        {messages.length === 1 && (
          <SuggestedChips suggestions={QUICK_PROMPTS} onSelect={handleSend} />
        )}

        {/* Chat Input Bar */}
        <View style={keyboardVisible ? inputBarKeyboardStyle : inputBarDefaultStyle}>
          <ChatInput onSend={handleSend} disabled={isTyping} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
