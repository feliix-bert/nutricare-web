import { useCallback, useRef } from "react";
import { FlashListRef } from "@shopify/flash-list";
import type { ConsultationMessage } from "@/features/chat/types/chat-types";

export function useChatScroll() {
  const flatListRef = useRef<FlashListRef<ConsultationMessage>>(null);

  const scrollToEnd = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  return { flatListRef, scrollToEnd };
}
