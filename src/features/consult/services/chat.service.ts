import { createClient } from "@/lib/supabase/client";
import type {
  ChatRouteRequest,
  ChatRouteResponse,
  ChatHistoryResponse,
} from "@/features/consult/types/consult.types";

export const chatService = {
  /**
   * Send message to Gemini via Next.js API route
   * The API route handles loading prediction context + chat history
   */
  sendMessage: async (
    payload: ChatRouteRequest,
  ): Promise<ChatRouteResponse> => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Chat request failed");
    return res.json();
  },

  /**
   * Load chat history from Supabase
   */
  getHistory: async (predictionId: string): Promise<ChatHistoryResponse> => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("prediction_id", predictionId)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
    if (!data) {
      return {
        sessionId: "",
        predictionId,
        messages: [],
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      sessionId: data.id,
      predictionId: data.prediction_id,
      messages: (data.messages as ChatHistoryResponse["messages"]) ?? [],
      updatedAt: data.updated_at,
    };
  },
};
