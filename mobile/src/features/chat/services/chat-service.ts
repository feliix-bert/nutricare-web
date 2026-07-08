import { supabase } from '@/utils/supabase';
import { generateContent } from '@/utils/gemini-client';
import { loadSkills, SYSTEM_INSTRUCTION_BASE } from '@/data/skills';
import type {
  ChatHistoryResponse,
  ChatMessage,
  ChatRequest,
  ChatResponse,
} from '@/features/chat/types/chat-types';

type SupabaseChatSession = {
  id: string;
  prediction_id: string;
  parent_id: string;
  messages: Array<{ role: string; content: string; timestamp: string }>;
  created_at: string;
  updated_at: string;
};

function toChatMessage(msg: { role: string; content: string; timestamp: string }, index: number): ChatMessage {
  return {
    id: `msg_${msg.role}_${index}_${msg.timestamp}`,
    sender: msg.role === 'assistant' ? 'ai' : 'user',
    text: msg.content,
    createdAt: msg.timestamp,
  };
}

function toChatHistoryResponse(server: SupabaseChatSession): ChatHistoryResponse {
  return {
    sessionId: server.id,
    predictionId: server.prediction_id,
    messages: (server.messages ?? []).map(toChatMessage),
    updatedAt: server.updated_at,
  };
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'msg_welcome',
  sender: 'ai',
  text: 'Halo! Saya BundaSehat, konsultan gizi anak TumbuhSehat. Silakan tanyakan hal seputar hasil skrining, MPASI, atau pemantauan tumbuh kembang anak.',
  createdAt: new Date().toISOString(),
};

const QUICK_SUGGESTIONS = [
  'Bagaimana menu tinggi protein hewani?',
  'Kapan harus kontrol ke dokter?',
  'Apa tanda bahaya stunting?',
];

let systemInstructionCache: string | null = null;

function getSystemInstruction(): string {
  if (!systemInstructionCache) {
    const docs = loadSkills();
    systemInstructionCache = `${SYSTEM_INSTRUCTION_BASE}\n\n## DOKUMEN REFERENSI:\n${docs}`;
  }
  return systemInstructionCache;
}

export const chatService = {
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const { predictionId, message } = data;

    // Load existing session
    const { data: session } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('prediction_id', predictionId)
      .maybeSingle();

    const existingMessages = (session as SupabaseChatSession | null)?.messages ?? [];
    const sessionId = session?.id ?? `session_${predictionId}`;

    // Build message history for Gemini
    const history: { role: 'user' | 'model'; text: string }[] = existingMessages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      text: m.content,
    }));

    // Add the new user message
    history.push({ role: 'user', text: message });

    // Call Gemini
    const systemInstruction = getSystemInstruction();
    const reply = await generateContent(systemInstruction, history, { temperature: 0.4, maxOutputTokens: 1024 });

    // Update message list with AI reply
    const timestamp = new Date().toISOString();
    const updatedMessages = [
      ...existingMessages,
      { role: 'user', content: message, timestamp },
      { role: 'assistant', content: reply, timestamp },
    ];

    // Persist to Supabase
    await supabase.from('chat_sessions').upsert({
      prediction_id: predictionId,
      messages: updatedMessages,
      updated_at: timestamp,
    }, { onConflict: 'prediction_id' });

    return { sessionId, reply, suggestedQuestions: QUICK_SUGGESTIONS };
  },

  getChatHistory: async (predictionId: string): Promise<ChatHistoryResponse> => {
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('prediction_id', predictionId)
      .maybeSingle();
    if (!data) {
      return {
        sessionId: `session_${predictionId}`,
        predictionId,
        messages: [WELCOME_MESSAGE],
        updatedAt: new Date().toISOString(),
      };
    }
    return toChatHistoryResponse(data as unknown as SupabaseChatSession);
  },
};
