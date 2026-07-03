export type ConsultationStatus = "OPEN" | "CLOSED";

export type Consultation = {
  id: string;
  child_id: string;
  medic_id: string;
  parent_id: string;
  status: ConsultationStatus;
  created_at: string;
  updated_at: string;
  // Joined
  children?: { id: string; name: string; birth_date: string; gender: string };
  users?: { name: string };
};

export type ConsultationMessage = {
  id: string;
  consultation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  // Joined (optional)
  users?: { name: string; role: string };
};

export type SendMessagePayload = {
  consultation_id: string;
  sender_id: string;
  content: string;
};

export type CreateConsultationPayload = {
  child_id: string;
  medic_id: string;
  parent_id: string;
};
