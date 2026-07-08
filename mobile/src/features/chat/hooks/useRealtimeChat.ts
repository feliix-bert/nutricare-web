import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { generateId } from "@/utils/random";
import type { ConsultationMessage } from "@/features/chat/types/chat-types";

interface UseRealtimeChatProps {
  roomName: string;
  username: string;
  userId: string;
}

const EVENT_MESSAGE_TYPE = "message";

export function useRealtimeChat({ roomName, username, userId }: UseRealtimeChatProps) {
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newChannel = supabase.channel(roomName);

    newChannel
      .on("broadcast", { event: EVENT_MESSAGE_TYPE }, (payload) => {
        setMessages((current) => [...current, payload.payload as ConsultationMessage]);
      })
      .subscribe(async (status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    setChannel(newChannel);

    return () => {
      supabase.removeChannel(newChannel);
    };
  }, [roomName, username]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!channel || !isConnected) return;

      const message: ConsultationMessage = {
        id: generateId(),
        content,
        userName: username,
        createdAt: new Date().toISOString(),
        senderId: userId,
      };

      setMessages((current) => [...current, message]);

      await channel.send({
        type: "broadcast",
        event: EVENT_MESSAGE_TYPE,
        payload: message,
      });
    },
    [channel, isConnected, username, userId]
  );

  return { messages, sendMessage, isConnected };
}
