import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { chatService } from "@/features/consult/services/chat.service";
import { createClient } from "@/lib/supabase/client";
import type {
  ChatRouteResponse,
  PredictionContext,
} from "@/features/consult/types/consult.types";

export const chatHistoryQueryKey = (predictionId: string) =>
  ["chat", "history", predictionId] as const;

// ---------------------------------------------------------------------------
// Hook: load riwayat chat berdasarkan predictionId
// ---------------------------------------------------------------------------

export const useChatHistory = (predictionId: string | null) =>
  useQuery({
    queryKey: chatHistoryQueryKey(predictionId ?? ""),
    queryFn: () => chatService.getHistory(predictionId!),
    enabled: !!predictionId,
    staleTime: 0,
  });

// ---------------------------------------------------------------------------
// Hook: build PredictionContext dari predictionId (mode prediksi)
// ---------------------------------------------------------------------------

type SendMessagePayload = {
  predictionId?: string;
  childId: string;
  message: string;
  context: PredictionContext;
};

export const useSendMessage = (predictionId: string | null, childId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: SendMessagePayload,
    ): Promise<ChatRouteResponse> => {
      // Load actual chat history from cache (only for prediction mode)
      const historyData = predictionId
        ? queryClient.getQueryData<{
            messages: { role: "user" | "assistant"; content: string }[];
          }>(chatHistoryQueryKey(predictionId))
        : null;

      const history =
        historyData?.messages?.map((m) => ({
          role: m.role as "user" | "assistant",
          content: typeof m.content === "string" ? m.content : "",
        })) ?? [];

      return chatService.sendMessage({
        predictionId: payload.predictionId,
        childId: payload.childId,
        message: payload.message,
        history,
        context: payload.context,
      });
    },
    onSuccess: () => {
      if (predictionId) {
        void queryClient.invalidateQueries({
          queryKey: chatHistoryQueryKey(predictionId),
        });
      }
    },
  });
};

// ---------------------------------------------------------------------------
// Hook: build PredictionContext dari predictionId
// ---------------------------------------------------------------------------

export const usePredictionContextQuery = (predictionId: string | null) =>
  useQuery({
    queryKey: ["prediction-context", predictionId],
    queryFn: async () => {
      const supabase = createClient();

      const { data: prediction } = await supabase
        .from("predictions")
        .select(
          `
          id,
          stunt_status,
          zscore_ha,
          zscore_wa,
          zscore_wh,
          summary,
          recommendations,
          assessment:assessments(
            child:children(
              id, name, birth_date, gender
            )
          )
        `,
        )
        .eq("id", predictionId!)
        .single();

      if (!prediction) throw new Error("Prediction not found");

      const assessment = prediction.assessment as unknown as {
        child: { id: string; name: string; birth_date: string; gender: string };
      };
      const child = assessment.child;

      const birth = new Date(child.birth_date);
      const now = new Date();
      const ageMonths =
        (now.getFullYear() - birth.getFullYear()) * 12 +
        (now.getMonth() - birth.getMonth());

      const ctx: PredictionContext = {
        predictionId: prediction.id,
        childName: child.name,
        ageMonths: Math.max(0, ageMonths),
        gender: child.gender as "MALE" | "FEMALE",
        status: prediction.stunt_status as PredictionContext["status"],
        zscoreHa: prediction.zscore_ha ?? 0,
        zscoreWa: prediction.zscore_wa ?? 0,
        zscoreWh: prediction.zscore_wh ?? 0,
        summary: prediction.summary ?? "",
        recommendations: (prediction.recommendations as string[]) ?? [],
      };

      return ctx;
    },
    enabled: !!predictionId,
    staleTime: 5 * 60 * 1000,
  });

// ---------------------------------------------------------------------------
// Hook: build context minimal dari childId saja (mode umum — tanpa prediksi)
// ---------------------------------------------------------------------------

export const useChildBasicContextQuery = (childId: string | null) =>
  useQuery({
    queryKey: ["child-basic-context", childId],
    queryFn: async () => {
      const supabase = createClient();

      const { data: child } = await supabase
        .from("children")
        .select("id, name, birth_date, gender")
        .eq("id", childId!)
        .single();

      if (!child) throw new Error("Child not found");

      const birth = new Date(child.birth_date);
      const now = new Date();
      const ageMonths =
        (now.getFullYear() - birth.getFullYear()) * 12 +
        (now.getMonth() - birth.getMonth());

      // Kembalikan PredictionContext kosong — AI tetap bisa menjawab pertanyaan gizi umum
      const ctx: PredictionContext = {
        predictionId: "",
        childName: child.name,
        ageMonths: Math.max(0, ageMonths),
        gender: child.gender as "MALE" | "FEMALE",
        status: "NORMAL",
        zscoreHa: 0,
        zscoreWa: 0,
        zscoreWh: 0,
        summary: "",
        recommendations: [],
      };

      return ctx;
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
