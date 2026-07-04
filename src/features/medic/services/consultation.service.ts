import { createClient } from "@/lib/supabase/client";
import type {
  Consultation,
  ConsultationMessage,
  SendMessagePayload,
  CreateConsultationPayload,
} from "../types/consultation.types";

// ─── Ensure tables exist (run once) ─────────────────────────────────────────
// NOTE: In production, run these as SQL migrations in Supabase dashboard.
// This service assumes the tables already exist.

// ─── Fetch consultations for medic ──────────────────────────────────────────

export const fetchMedicConsultations = async (): Promise<Consultation[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("consultations")
    .select(`
      *,
      children(id, name, birth_date, gender),
      users!consultations_parent_id_fkey(name)
    `)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Consultation[];
};

// ─── Fetch consultations for parent ─────────────────────────────────────────

export const fetchParentConsultations = async (parentId: string): Promise<Consultation[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("consultations")
    .select(`
      *,
      children(id, name, birth_date, gender),
      users!consultations_medic_id_fkey(name)
    `)
    .eq("parent_id", parentId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Consultation[];
};

// ─── Create consultation ─────────────────────────────────────────────────────

export const createConsultation = async (
  payload: CreateConsultationPayload
): Promise<Consultation> => {
  const supabase = createClient();

  // Check if open consultation already exists for this child+medic pair
  const { data: existing } = await supabase
    .from("consultations")
    .select("*")
    .eq("child_id", payload.child_id)
    .eq("status", "OPEN")
    .maybeSingle();

  if (existing) return existing as Consultation;

  const { data, error } = await supabase
    .from("consultations")
    .insert({
      child_id: payload.child_id,
      medic_id: payload.medic_id,
      parent_id: payload.parent_id,
      status: "OPEN",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Consultation;
};

// ─── Fetch messages for a consultation ──────────────────────────────────────

export const fetchMessages = async (
  consultationId: string
): Promise<ConsultationMessage[]> => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("consultation_messages")
    .select(`*, users(name, role)`)
    .eq("consultation_id", consultationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ConsultationMessage[];
};

// ─── Send message ────────────────────────────────────────────────────────────

export const sendMessage = async (
  payload: SendMessagePayload
): Promise<ConsultationMessage> => {
  const supabase = createClient();

  // Update consultation updated_at
  await supabase
    .from("consultations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", payload.consultation_id);

  const { data, error } = await supabase
    .from("consultation_messages")
    .insert({
      consultation_id: payload.consultation_id,
      sender_id: payload.sender_id,
      content: payload.content,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ConsultationMessage;
};

// ─── Close consultation ───────────────────────────────────────────────────────

export const closeConsultation = async (consultationId: string): Promise<void> => {
  const supabase = createClient();
  const { error } = await supabase
    .from("consultations")
    .update({ status: "CLOSED", updated_at: new Date().toISOString() })
    .eq("id", consultationId);

  if (error) throw error;
};
