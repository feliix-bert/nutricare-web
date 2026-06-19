import { apiClient } from '@/services/api';
import { delay, USE_MOCK } from '@/services/mock';
import type {
  ChatHistoryResponse,
  ChatMessage,
  ChatRequest,
  ChatResponse,
} from '@/features/chat/types/chat.types';

const QUICK_SUGGESTIONS = [
  'Bagaimana menu tinggi protein hewani?',
  'Kapan harus kontrol ke dokter?',
  'Apa tanda bahaya stunting?',
];

const MOCK_RESPONSES: Record<string, string> = {
  'mencegah stunting':
    'Stunting dapat dicegah dengan memastikan kecukupan gizi pada 1000 Hari Pertama Kehidupan, ASI eksklusif 6 bulan, MPASI kaya protein hewani, imunisasi lengkap, dan sanitasi yang baik.',
  'jadwal mpasi':
    'Untuk usia 6 bulan, mulai MPASI 2 kali sehari dengan tekstur lumat. Tingkatkan bertahap sesuai usia, kemampuan menelan, dan respons anak.',
  'zat besi':
    'Sumber zat besi yang baik antara lain hati ayam, daging merah cincang, ikan, telur, dan ayam. Padukan dengan sumber vitamin C agar penyerapannya lebih optimal.',
  default:
    'Saya dapat membantu menjelaskan hasil skrining, ide menu MPASI, dan langkah pemantauan tumbuh kembang. Hasil ini bersifat edukatif awal dan tidak menggantikan konsultasi dokter anak.',
};

const mockHistories: Record<string, ChatHistoryResponse> = {};

const getMockReply = (message: string) => {
  const lower = message.toLowerCase();
  const matchedKey = Object.keys(MOCK_RESPONSES).find((key) => lower.includes(key));
  return matchedKey ? MOCK_RESPONSES[matchedKey] : MOCK_RESPONSES.default;
};

// ---------------------------------------------------------------------------
// Mock implementations
// ---------------------------------------------------------------------------

const mockSendMessage = async (data: ChatRequest): Promise<ChatResponse> => {
  await delay(900);
  const sessionId = `session_${data.predictionId}`;
  const now = new Date().toISOString();
  const history = mockHistories[data.predictionId] ?? {
    sessionId,
    predictionId: data.predictionId,
    messages: [],
    updatedAt: now,
  };
  const userMessage: ChatMessage = {
    id: `msg_user_${Date.now()}`,
    sender: 'user',
    text: data.message,
    createdAt: now,
  };
  const reply = getMockReply(data.message);
  const aiMessage: ChatMessage = {
    id: `msg_ai_${Date.now()}`,
    sender: 'ai',
    text: reply,
    createdAt: new Date().toISOString(),
  };

  mockHistories[data.predictionId] = {
    ...history,
    messages: [...history.messages, userMessage, aiMessage],
    updatedAt: aiMessage.createdAt,
  };

  return { sessionId, reply, suggestedQuestions: QUICK_SUGGESTIONS };
};

const mockGetChatHistory = async (predictionId: string): Promise<ChatHistoryResponse> => {
  await delay(350);
  return (
    mockHistories[predictionId] ?? {
      sessionId: `session_${predictionId}`,
      predictionId,
      messages: [
        {
          id: 'msg_welcome',
          sender: 'ai',
          text: 'Halo! Saya konsultan AI GiziChain. Silakan tanyakan hal seputar hasil skrining, MPASI, atau pemantauan tumbuh kembang anak.',
          createdAt: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    }
  );
};

// ---------------------------------------------------------------------------
// Real implementations
// ---------------------------------------------------------------------------

const realSendMessage = async (data: ChatRequest): Promise<ChatResponse> => {
  const res = await apiClient.post<ChatResponse>('/api/chat', data);
  return res.data;
};

const realGetChatHistory = async (predictionId: string): Promise<ChatHistoryResponse> => {
  const res = await apiClient.get<ChatHistoryResponse>(`/api/chat/${predictionId}`);
  return res.data;
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const chatService = {
  sendMessage: USE_MOCK ? mockSendMessage : realSendMessage,
  getChatHistory: USE_MOCK ? mockGetChatHistory : realGetChatHistory,
};
