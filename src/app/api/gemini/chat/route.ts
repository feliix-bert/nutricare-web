/**
 * POST /api/gemini/chat
 *
 * Chatbot konsultasi — konteks dari prediction + riwayat chat.
 * 1. Load prediction context + chat history dari Supabase
 * 2. Kirim ke Gemini
 * 3. Simpan messages ke chat_sessions
 */
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Parse ───────────────────────────────────────────────────────────
    const body = (await request.json()) as {
      predictionId: string;
      message: string;
      history: ChatMessage[];
      context: {
        childName: string;
        ageMonths: number;
        gender: string;
        status: string;
        zscoreHa: number;
        zscoreWa: number;
        zscoreWh: number;
        summary: string;
        recommendations: string[];
      };
    };

    const { predictionId, message, history, context } = body;

    if (!predictionId || !message) {
      return NextResponse.json(
        { error: "predictionId and message required" },
        { status: 400 },
      );
    }

    // ── Verify prediction exists ────────────────────────────────────────
    const { data: prediction } = await supabase
      .from("predictions")
      .select("prediction_status")
      .eq("id", predictionId)
      .single();

    if (!prediction) {
      return NextResponse.json(
        { error: "Prediction not found" },
        { status: 404 },
      );
    }

    if (prediction.prediction_status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Prediction not yet completed" },
        { status: 400 },
      );
    }

    // ── Gemini ──────────────────────────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 503 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { maxOutputTokens: 1024 },
    });

    const systemPrompt = buildChatSystemPrompt(context);
    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        {
          role: "model",
          parts: [
            {
              text: "Saya siap membantu! Silakan tanya seputar tumbuh kembang dan gizi anak.",
            },
          ],
        },
        // ── Riwayat chat dari session ──────────────────────────────────
        ...history.map((h) => ({
          role: h.role as "user" | "model",
          parts: [{ text: h.content }],
        })),
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const reply = response.text();

    // ── Generate suggested questions from prediction context ────────────
    const suggestedQuestions = getSuggestedQuestions(
      context.status,
      context.ageMonths,
    );

    // ── Save to chat_sessions ────────────────────────────────────────────
    const newMessages: ChatMessage[] = [
      ...history,
      { role: "user", content: message },
      { role: "assistant", content: reply },
    ];

    const { data: existingSession } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("prediction_id", predictionId)
      .single();

    if (existingSession) {
      await supabase
        .from("chat_sessions")
        .update({
          messages: newMessages,
        })
        .eq("prediction_id", predictionId);
    } else {
      await supabase.from("chat_sessions").insert({
        prediction_id: predictionId,
        messages: newMessages,
      });
    }

    return NextResponse.json({
      reply,
      suggestedQuestions,
    });
  } catch (error) {
    console.error("[gemini/chat] Error:", error);
    return NextResponse.json(
      { error: "Chat failed", detail: String(error) },
      { status: 500 },
    );
  }
}

// ─── Suggested questions ───────────────────────────────────────────────────────

function getSuggestedQuestions(
  status: string,
  _ageMonths: number,
): string[] {
  const base = [
    "Apa saja makanan yang baik untuk tumbuh kembang anak?",
    "Bagaimana cara memantau pertumbuhan anak di rumah?",
    "Kapan harus konsultasi ke dokter?",
  ];

  if (status === "STUNTED" || status === "SEVERELY_STUNTED") {
    return [
      "Apa penyebab stunting pada anak?",
      "Apakah stunting bisa disembuhkan?",
      "Makanan apa yang bisa mengejar pertumbuhan anak?",
      ...base,
    ];
  }

  if (status === "AT_RISK") {
    return [
      "Bagaimana cara mencegah stunting?",
      "Apa saja tanda awal stunting?",
      "Berapa tinggi ideal anak seusia saya?",
      ...base,
    ];
  }

  return [
    "Bagaimana cara menjaga status gizi anak tetap normal?",
    "Apa saja stimulasi yang baik untuk tumbuh kembang?",
    ...base,
  ];
}

// ─── System prompt ─────────────────────────────────────────────────────────────

function buildChatSystemPrompt(context: {
  childName: string;
  ageMonths: number;
  gender: string;
  status: string;
  zscoreHa: number;
  zscoreWa: number;
  zscoreWh: number;
  summary: string;
  recommendations: string[];
}): string {
  return `Anda adalah asisten konsultasi gizi anak dari GiziChain — sistem skrining stunting.

Tugas Anda membantu orang tua memahami kondisi gizi anak mereka berdasarkan hasil skrining. Gunakan Bahasa Indonesia yang ramah dan mudah dipahami.

KONTEKS SKRINING:
- Nama Anak: ${context.childName}
- Usia: ${context.ageMonths} bulan
- Jenis Kelamin: ${context.gender === "MALE" ? "Laki-laki" : "Perempuan"}
- Status Stunting: ${context.status}
- Z-Score TB/U: ${context.zscoreHa} SD
- Z-Score BB/U: ${context.zscoreWa} SD
- Z-Score BB/TB: ${context.zscoreWh} SD

RINGKASAN SKRINING:
${context.summary}

REKOMENDASI:
${context.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}

ATURAN:
1. Jawab berdasarkan konteks skrining anak ini
2. Jika ditanya di luar topik gizi/tumbuh kembang, arahkan kembali
3. Gunakan "berisiko stunting" bukan "menderita stunting" — ini skrining awal
4. Jika ragu, sarankan konsultasi ke tenaga kesehatan
5. Jangan memberikan diagnosis medis
6. Sertakan disclaimer jika perlu`;
}
