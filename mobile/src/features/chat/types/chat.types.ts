export type ChatSender = 'user' | 'ai';

export type ChatMessage = {
  id: string;
  sender: ChatSender;
  text: string;
  createdAt: string;
};

export type ChatRequest = {
  predictionId: string;
  message: string;
};

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
