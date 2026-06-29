import { apiClient } from '@/services/api';
import { delay, USE_MOCK } from '@/services/mock';
import type {
  ChatHistoryResponse,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ServerChatResponse,
  ServerChatHistoryResponse,
  ServerChatMessage,
} from '@/features/chat/types/chat.types';

// ── Transform helpers ────────────────────────────────────────────────────

function toChatMessage(msg: ServerChatMessage, index: number): ChatMessage {
  return {
    id: `msg_${msg.role}_${index}_${msg.timestamp}`,
    sender: msg.role === 'assistant' ? 'ai' : 'user',
    text: msg.content,
    createdAt: msg.timestamp,
  };
}

function toChatResponse(server: ServerChatResponse): ChatResponse {
  return { sessionId: server.sessionId, reply: server.content, suggestedQuestions: [] };
}

function toChatHistoryResponse(server: ServerChatHistoryResponse): ChatHistoryResponse {
  return {
    sessionId: server.sessionId,
    predictionId: server.predictionId,
    messages: (server.messages ?? []).map(toChatMessage),
    updatedAt: server.messages?.[server.messages.length - 1]?.timestamp ?? '',
  };
}

const QUICK_SUGGESTIONS = [
  'Bagaimana menu tinggi protein hewani?',
  'Kapan harus kontrol ke dokter?',
  'Apa tanda bahaya stunting?',
];

const CHAT_INTENTS: Record<string, string> = {
  'mencegah stunting': 'Stunting dapat dicegah dengan memastikan kecukupan gizi pada 1000 Hari Pertama Kehidupan, ASI eksklusif 6 bulan, MPASI kaya protein hewani, imunisasi lengkap, dan sanitasi yang baik.',
  'jadwal mpasi': 'Untuk usia 6 bulan, mulai MPASI 2 kali sehari dengan tekstur lumat. Tingkatkan bertahap sesuai usia, kemampuan menelan, dan respons anak.',
  'zat besi': 'Sumber zat besi yang baik antara lain hati ayam, daging merah cincang, ikan, telur, dan ayam. Padukan dengan sumber vitamin C agar penyerapannya lebih optimal.',
  default: 'Saya dapat membantu menjelaskan hasil skrining, ide menu MPASI, dan langkah pemantauan tumbuh kembang. Hasil ini bersifat edukatif awal dan tidak menggantikan konsultasi dokter anak.',
};

const chatHistories: Record<string, ChatHistoryResponse> = {};

function getChatReply(message: string) {
  const lower = message.toLowerCase();
  const matchedKey = Object.keys(CHAT_INTENTS).find((key) => lower.includes(key));
  return matchedKey ? CHAT_INTENTS[matchedKey] : CHAT_INTENTS.default;
}

// ── Service ──────────────────────────────────────────────────────────────

export const chatService = {
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    if (USE_MOCK) {
      await delay(900);
      const sessionId = `session_${data.predictionId}`;
      const now = new Date().toISOString();
      const history = chatHistories[data.predictionId] ?? {
        sessionId, predictionId: data.predictionId, messages: [], updatedAt: now,
      };
      const userMessage: ChatMessage = { id: `msg_user_${Date.now()}`, sender: 'user', text: data.message, createdAt: now };
      const reply = getChatReply(data.message);
      const aiMessage: ChatMessage = { id: `msg_ai_${Date.now()}`, sender: 'ai', text: reply, createdAt: new Date().toISOString() };
      chatHistories[data.predictionId] = { ...history, messages: [...history.messages, userMessage, aiMessage], updatedAt: aiMessage.createdAt };
      return { sessionId, reply, suggestedQuestions: QUICK_SUGGESTIONS };
    }
    const res = await apiClient.post<ServerChatResponse>('/api/chat', data);
    return toChatResponse(res.data);
  },

  getChatHistory: async (predictionId: string): Promise<ChatHistoryResponse> => {
    if (USE_MOCK) {
      await delay(350);
      return chatHistories[predictionId] ?? {
        sessionId: `session_${predictionId}`,
        predictionId,
        messages: [{ id: 'msg_welcome', sender: 'ai', text: 'Halo! Saya konsultan AI GiziChain. Silakan tanyakan hal seputar hasil skrining, MPASI, atau pemantauan tumbuh kembang anak.', createdAt: new Date().toISOString() }],
        updatedAt: new Date().toISOString(),
      };
    }
    const res = await apiClient.get<ServerChatHistoryResponse>(`/api/chat/${predictionId}`);
    return toChatHistoryResponse(res.data);
  },
};
