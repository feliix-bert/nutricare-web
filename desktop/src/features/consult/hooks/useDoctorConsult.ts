import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchParentConsultations,
  createConsultation,
  fetchMessages,
  sendMessage,
} from "@/features/medic/services/consultation.service";
import type { SendMessagePayload } from "@/features/medic/types/consultation.types";

// ─── Keys ────────────────────────────────────────────────────────────────────

export const parentConsultKeys = {
  list: (parentId: string) => ["parent-consultations", parentId] as const,
  messages: (id: string) => ["parent-consultation-messages", id] as const,
};

// ─── List of consultations for a parent ──────────────────────────────────────

export const useParentConsultations = (parentId: string | null) =>
  useQuery({
    queryKey: parentConsultKeys.list(parentId ?? ""),
    queryFn: () => fetchParentConsultations(parentId!),
    enabled: !!parentId,
  });

// ─── Messages for a consultation (with Realtime) ─────────────────────────────

export const useParentConsultationMessages = (consultationId: string | null) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: parentConsultKeys.messages(consultationId ?? ""),
    queryFn: () => fetchMessages(consultationId!),
    enabled: !!consultationId,
    staleTime: 0,
  });

  useEffect(() => {
    if (!consultationId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`parent-consultation-${consultationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "consultation_messages",
          filter: `consultation_id=eq.${consultationId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: parentConsultKeys.messages(consultationId),
          });
          // Also refresh the consultation list (last message / updated_at)
          queryClient.invalidateQueries({
            queryKey: ["parent-consultations"],
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

// ─── Start a new consultation (or resume existing open one) ──────────────────

export const useStartConsultation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConsultation,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["parent-consultations", variables.parent_id],
      });
    },
  });
};

// ─── Send a message as parent ─────────────────────────────────────────────────

export const useParentSendMessage = (consultationId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) => sendMessage(payload),
    onSuccess: () => {
      if (consultationId) {
        queryClient.invalidateQueries({
          queryKey: parentConsultKeys.messages(consultationId),
        });
      }
    },
  });
};
