export type ChatSender = 'user' | 'ai';

export type ChatMessage = {
  id: string;
  sender: ChatSender;
  text: string;
  createdAt: string;
};

export type ConsultationMessage = {
  id: string;
  content: string;
  userName: string;
  createdAt: string;
  senderId: string;
};

export type ChatRequest = {
  predictionId: string;
  message: string;
};

// ── Server raw response types ────────────────────────────────────────────

export type ServerChatMessage = {
  role: string;
  content: string;
  timestamp: string;
};

export type ServerChatResponse = {
  sessionId: string;
  predictionId: string;
  role: string;
  content: string;
  timestamp: string;
};

export type ServerChatHistoryResponse = {
  sessionId: string;
  predictionId: string;
  messages: ServerChatMessage[];
};

// ── Mobile DTOs ──────────────────────────────────────────────────────────

export type ChatResponse = {
  sessionId: string;
  reply: string;
  suggestedQuestions: string[];
};

export type ChatHistoryResponse = {
  sessionId: string;
  predictionId: string;
  messages: ChatMessage[];
  updatedAt: string;
};
