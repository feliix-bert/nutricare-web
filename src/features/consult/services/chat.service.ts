import { apiClient } from '@/services/api';
import { delay, USE_MOCK } from '@/services/mock';
import type {
  ChatApiRequest,
  ChatApiResponse,
  ChatHistoryResponse,
  ChatMessage,
  PredictionContext,
} from '@/features/consult/types/consult.types';

// ---------------------------------------------------------------------------
// In-memory mock chat store
// ---------------------------------------------------------------------------

type MockSession = {
  sessionId: string;
  predictionId: string;
  messages: ChatMessage[];
  updatedAt: string;
};

const mockSessions: MockSession[] = [];

function findOrCreateSession(predictionId: string): MockSession {
  let session = mockSessions.find((s) => s.predictionId === predictionId);
  if (!session) {
    session = {
      sessionId: `session_${Date.now()}`,
      predictionId,
      messages: [],
      updatedAt: new Date().toISOString(),
    };
    mockSessions.push(session);
  }
  return session;
}

// ---------------------------------------------------------------------------
// Mock: kirim pesan — diteruskan ke Spring Boot (sesuai ARCHITECTURE.md)
// Gemini API dipanggil oleh Spring Boot, bukan oleh Next.js.
// ---------------------------------------------------------------------------

const mockSendMessage = async (
  payload: ChatApiRequest & { context?: PredictionContext },
): Promise<ChatApiResponse> => {
  await delay(800);

  const session = findOrCreateSession(payload.predictionId);

  // Kirim ke Spring Boot /api/chat
  const res = await apiClient.post<ChatApiResponse>('/api/chat', {
    predictionId: payload.predictionId,
    message: payload.message,
  });

  const data = res.data;

  // Simpan ke session mock (untuk riwayat lokal sementara)
  const userMsg: ChatMessage = {
    id: `msg_user_${Date.now()}`,
    role: 'user',
    content: payload.message,
    timestamp: new Date().toISOString(),
  };
  const aiMsg: ChatMessage = {
    id: `msg_ai_${Date.now()}`,
    role: 'assistant',
    content: data.reply,
    timestamp: new Date().toISOString(),
  };
  session.messages.push(userMsg, aiMsg);
  session.updatedAt = new Date().toISOString();

  return data;
};

// ---------------------------------------------------------------------------
// Mock: ambil riwayat chat — diteruskan ke Spring Boot
// ---------------------------------------------------------------------------

const mockGetHistory = async (predictionId: string): Promise<ChatHistoryResponse> => {
  await delay(400);

  // Gunakan sesi lokal jika ada (optimis, sebelum backend merespons)
  const session = mockSessions.find((s) => s.predictionId === predictionId);
  if (session) {
    return {
      sessionId: session.sessionId,
      predictionId: session.predictionId,
      messages: session.messages,
      updatedAt: session.updatedAt,
    };
  }

  // Fallback ke Spring Boot
  const res = await apiClient.get<ChatHistoryResponse>(`/api/chat/${predictionId}`);
  return res.data;
};



// ---------------------------------------------------------------------------
// Real: kirim pesan ke Spring Boot API
// ---------------------------------------------------------------------------

const realSendMessage = async (payload: ChatApiRequest & { context?: PredictionContext }): Promise<ChatApiResponse> => {
  const res = await apiClient.post<ChatApiResponse>('/api/chat', {
    predictionId: payload.predictionId,
    message: payload.message,
  });
  return res.data;
};

// ---------------------------------------------------------------------------
// Real: ambil riwayat chat dari Spring Boot API
// ---------------------------------------------------------------------------

const realGetHistory = async (predictionId: string): Promise<ChatHistoryResponse> => {
  const res = await apiClient.get<ChatHistoryResponse>(`/api/chat/${predictionId}`);
  return res.data;
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const chatService = {
  sendMessage: USE_MOCK ? mockSendMessage : realSendMessage,
  getHistory: USE_MOCK ? mockGetHistory : realGetHistory,
};
