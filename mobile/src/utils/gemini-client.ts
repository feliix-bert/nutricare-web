const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-flash-latest';

type Role = 'user' | 'model';
type Content = { role: Role; parts: { text: string }[] };

type GeminiRequest = {
  system_instruction?: { parts: { text: string }[] };
  contents: Content[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
  };
};

type GeminiResponse = {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
};

export async function generateContent(
  systemInstruction: string,
  messages: { role: Role; text: string }[],
  options?: { temperature?: number; maxOutputTokens?: number },
): Promise<string> {
  const contents: Content[] = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  const body: GeminiRequest = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents,
    generationConfig: {
      temperature: options?.temperature ?? 0.3,
      maxOutputTokens: options?.maxOutputTokens ?? 1024,
    },
  };

  const res = await fetch(`${BASE_URL}/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-goog-api-key': GEMINI_API_KEY },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errBody}`);
  }

  const data: GeminiResponse = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return text;
}
