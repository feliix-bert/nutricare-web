import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

import type { ChatRouteRequest, ChatRouteResponse } from '@/features/consult/types/consult.types';

// ---------------------------------------------------------------------------
// Inisialisasi Gemini
// ---------------------------------------------------------------------------

const apiKey = process.env.GEMINI_API_KEY;

// ---------------------------------------------------------------------------
// Helper: bangun system prompt sesuai CONTEXT.md
// ---------------------------------------------------------------------------

function buildSystemPrompt(ctx: ChatRouteRequest['context']): string {
  const genderLabel = ctx.gender === 'MALE' ? 'laki-laki' : 'perempuan';
  const statusLabel: Record<string, string> = {
    NORMAL: 'Normal',
    AT_RISK: 'Berisiko Stunting',
    STUNTED: 'Stunting',
    SEVERELY_STUNTED: 'Stunting Berat',
  };

  return `Kamu adalah konsultan gizi anak berbasis AI bernama "TumbuhSehat Advisor" dalam platform GiziChain.

## IDENTITAS & BATASAN DOMAIN

Kamu HANYA menjawab pertanyaan dalam domain berikut:
- Tumbuh kembang anak usia 0–60 bulan (0–5 tahun)
- Gizi dan pola makan bayi/balita
- Stunting, wasting, underweight berdasarkan standar WHO
- Jadwal imunisasi Kemenkes Indonesia
- Rekomendasi MPASI dan ASI eksklusif

Kamu TIDAK boleh menjawab:
- Pertanyaan medis untuk orang dewasa
- Penyakit yang tidak terkait tumbuh kembang anak
- Topik non-kesehatan (teknologi, politik, keuangan, dll)
- Permintaan yang mengekspos data pasien lain

Jika pertanyaan di luar domain, balas TEPAT dengan kalimat ini (tanpa tambahan apapun):
"Pertanyaan ini di luar cakupan aplikasi. Untuk pertanyaan medis lebih lanjut, silakan konsultasi langsung dengan dokter atau bidan."

## ATURAN KLINIS WAJIB

1. JANGAN menyebut diagnosis definitif. Gunakan frasa "berisiko" bukan "menderita".
2. Kamu bukan kalkulator klinis — z-score sudah dihitung oleh sistem, kamu hanya menginterpretasi.
3. Selalu anjurkan konsultasi ke dokter atau tenaga kesehatan untuk keputusan medis.
4. Gunakan standar WHO Child Growth Standards (2006) dan panduan Kemenkes RI.

## DATA ANAK YANG SEDANG DIKONSULTASIKAN

Nama anak: ${ctx.childName}
Jenis kelamin: ${genderLabel}
Usia: ${ctx.ageMonths} bulan
Status tumbuh kembang: ${statusLabel[ctx.status] ?? ctx.status}
Z-score TB/U (tinggi per usia): ${ctx.zscoreHa.toFixed(2)} SD
Z-score BB/U (berat per usia): ${ctx.zscoreWa.toFixed(2)} SD
Z-score BB/TB (berat per tinggi): ${ctx.zscoreWh.toFixed(2)} SD
Ringkasan: ${ctx.summary}
Rekomendasi sistem: ${ctx.recommendations.join('; ')}

Gunakan data di atas sebagai konteks utama dalam setiap jawaban. Jawab dalam Bahasa Indonesia yang hangat, mudah dipahami orang tua, dan tidak terlalu teknis.`;
}

// ---------------------------------------------------------------------------
// Helper: buat suggested questions berdasarkan status anak
// ---------------------------------------------------------------------------

function buildSuggestedQuestions(status: string): string[] {
  const baseQuestions: Record<string, string[]> = {
    NORMAL: [
      'Bagaimana cara mempertahankan pertumbuhan yang baik ini?',
      'Makanan apa yang baik untuk mendukung perkembangan otak?',
      'Kapan jadwal imunisasi berikutnya yang perlu saya perhatikan?',
    ],
    AT_RISK: [
      'Makanan apa yang bisa meningkatkan berat badan anak?',
      'Berapa kali idealnya anak makan dalam sehari?',
      'Apakah perlu segera ke dokter anak?',
    ],
    STUNTED: [
      'Apa saja makanan tinggi protein yang bisa diberikan?',
      'Bagaimana cara meningkatkan nafsu makan anak?',
      'Apakah stunting bisa diperbaiki pada usia ini?',
    ],
    SEVERELY_STUNTED: [
      'Apa langkah pertama yang harus segera dilakukan?',
      'Makanan penambah berat badan apa yang aman untuk anak?',
      'Seberapa sering saya harus memantau tumbuh kembang anak?',
    ],
  };
  return baseQuestions[status] ?? baseQuestions.AT_RISK;
}

// ---------------------------------------------------------------------------
// POST /api/chat
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Konfigurasi AI tidak tersedia. Hubungi administrator.' },
      { status: 500 },
    );
  }

  let body: ChatRouteRequest;
  try {
    body = (await request.json()) as ChatRouteRequest;
  } catch {
    return NextResponse.json(
      { error: 'Format permintaan tidak valid.' },
      { status: 400 },
    );
  }

  const { message, history, context } = body;

  if (!message?.trim()) {
    return NextResponse.json(
      { error: 'Pesan tidak boleh kosong.' },
      { status: 400 },
    );
  }

  if (!context?.predictionId) {
    return NextResponse.json(
      { error: 'Konteks prediksi diperlukan untuk konsultasi.' },
      { status: 400 },
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: buildSystemPrompt(context),
    });

    // Ambil maks 10 pesan terakhir dari history (sesuai aturan bisnis CONTEXT.md)
    const recentHistory = history.slice(-10);

    const chat = model.startChat({
      history: recentHistory.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(message.trim());
    const reply = result.response.text();

    const suggestedQuestions = buildSuggestedQuestions(context.status);

    const responseBody: ChatRouteResponse = {
      reply,
      suggestedQuestions,
    };

    return NextResponse.json(responseBody, { status: 200 });
  } catch (err: unknown) {
    console.error('[ChatRoute] Gemini error:', err);
    return NextResponse.json(
      { error: 'Layanan AI sedang tidak tersedia. Silakan coba beberapa saat lagi.' },
      { status: 503 },
    );
  }
}
