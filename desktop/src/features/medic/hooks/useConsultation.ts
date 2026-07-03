import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchMedicConsultations,
  fetchMessages,
  sendMessage,
  createConsultation,
  closeConsultation,
} from "../services/consultation.service";
import type { SendMessagePayload, CreateConsultationPayload } from "../types/consultation.types";

// ─── Keys ────────────────────────────────────────────────────────────────────

export const consultationKeys = {
  all: ["consultations"] as const,
  messages: (id: string) => ["consultations", "messages", id] as const,
};

// ─── List of consultations (for medic) ──────────────────────────────────────

export const useConsultationList = () => {
  return useQuery({
    queryKey: consultationKeys.all,
    queryFn: fetchMedicConsultations,
  });
};

// ─── Messages for a consultation ─────────────────────────────────────────────

export const useConsultationMessages = (consultationId: string | null) => {
  const queryClient = useQueryClient();

  // Initial fetch
  const query = useQuery({
    queryKey: consultationKeys.messages(consultationId ?? ""),
    queryFn: () => fetchMessages(consultationId!),
    enabled: !!consultationId,
    staleTime: 0,
  });

  // Supabase Realtime subscription
  useEffect(() => {
    if (!consultationId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`consultation-${consultationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "consultation_messages",
          filter: `consultation_id=eq.${consultationId}`,
        },
        () => {
          // Invalidate to refetch latest messages
          queryClient.invalidateQueries({
            queryKey: consultationKeys.messages(consultationId),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [consultationId, queryClient]);

  return query;
};

// ─── Send message mutation ────────────────────────────────────────────────────

export const useSendConsultationMessage = (consultationId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) => sendMessage(payload),
    onSuccess: () => {
      if (consultationId) {
        queryClient.invalidateQueries({
          queryKey: consultationKeys.messages(consultationId),
        });
        // Also refresh consultation list (for last message preview)
        queryClient.invalidateQueries({ queryKey: consultationKeys.all });
      }
    },
  });
};

// ─── Create consultation mutation ────────────────────────────────────────────

export const useCreateConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateConsultationPayload) => createConsultation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.all });
    },
  });
};

// ─── Close consultation mutation ──────────────────────────────────────────────

export const useCloseConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (consultationId: string) => closeConsultation(consultationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.all });
    },
  });
};
