/**
 * POST /api/gemini/nutrition
 *
 * Gemini Vision — analisis foto makanan anak.
 * 1. Download foto dari URL
 * 2. Kirim ke Gemini Vision
 * 3. Parse response → simpan ke nutrition_logs
 */
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 60;

// ─── Config ────────────────────────────────────────────────────────────────────
// Gemini Vision punya batas input lebih kecil. Foto di-resize base64.
const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB

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
      childId: string;
      photoUrl: string;
    };
    const { childId, photoUrl } = body;

    if (!childId || !photoUrl) {
      return NextResponse.json(
        { error: "childId and photoUrl required" },
        { status: 400 },
      );
    }

    // ── Download photo ──────────────────────────────────────────────────
    const photoRes = await fetch(photoUrl);
    if (!photoRes.ok) {
      return NextResponse.json(
        { error: "Failed to download photo" },
        { status: 400 },
      );
    }

    const photoBuffer = await photoRes.arrayBuffer();

    if (photoBuffer.byteLength > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { error: "Photo too large (max 4MB)" },
        { status: 400 },
      );
    }

    // ── Detect mime type ────────────────────────────────────────────────
    const contentType = photoRes.headers.get("content-type") ?? "image/jpeg";
    const base64Photo = Buffer.from(photoBuffer).toString("base64");

    // ── Verify child belongs to user (RLS akan handle, tapi verify dulu) ─
    const { data: child } = await supabase
      .from("children")
      .select("id, name, birth_date")
      .eq("id", childId)
      .single();

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // ── Calculate age ───────────────────────────────────────────────────
    const birth = new Date(child.birth_date);
    const now = new Date();
    const ageMonths =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      (now.getMonth() - birth.getMonth());

    // ── Gemini Vision ───────────────────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 503 },
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { 
        maxOutputTokens: 1024,
        responseMimeType: "application/json"
      },
      // Disable safety blocks to prevent spurious errors on food photos
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT" as any, threshold: "BLOCK_NONE" as any },
        { category: "HARM_CATEGORY_HATE_SPEECH" as any, threshold: "BLOCK_NONE" as any },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT" as any, threshold: "BLOCK_NONE" as any },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT" as any, threshold: "BLOCK_NONE" as any },
      ],
    });

    const prompt = buildNutritionPrompt({
      childName: child.name,
      ageMonths,
    });

    const result = await model.generateContent([
      { inlineData: { mimeType: contentType, data: base64Photo } },
      { text: prompt },
    ]);

    const response = result.response;
    
    // Safety check: if response was blocked
    if (response.promptFeedback && response.promptFeedback.blockReason) {
       throw new Error(`Prompt blocked: ${response.promptFeedback.blockReason}`);
    }
    
    const text = response.text();

    // ── Parse JSON dari response ────────────────────────────────────────
    let parsed: GeminiNutritionResponse = {
      foodDetected: [],
      portionEstimate: "Tidak terdeteksi",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      adequacyNote: "Tidak dapat menganalisis foto",
      mpasiRecommendation: "",
    };

    try {
      // Find JSON block robustly
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // Strip any weird trailing commas before closing braces if possible, though JSON5 is better if we had it.
        // We'll rely on standard JSON parse but wrapped in try-catch
        const rawJson = jsonMatch[0];
        parsed = { ...parsed, ...JSON.parse(rawJson) };
      }
    } catch (parseErr) {
      console.warn("JSON Parse Failed for Gemini Response:", text);
      // Fallback object already assigned
    }

    // ── Save to nutrition_logs ──────────────────────────────────────────
    const { error: insertError } = await supabase
      .from("nutrition_logs")
      .insert({
        child_id: childId,
        photo_url: photoUrl,
        food_detected: Array.isArray(parsed.foodDetected) ? parsed.foodDetected : [],
        portion_estimate: String(parsed.portionEstimate || ""),
        calories: Number(parsed.calories) || 0,
        protein: Number(parsed.protein) || 0,
        carbs: Number(parsed.carbs) || 0,
        fat: Number(parsed.fat) || 0,
        fiber: Number(parsed.fiber) || 0,
        adequacy_note: String(parsed.adequacyNote || ""),
        mpasi_recommendation: String(parsed.mpasiRecommendation || ""),
        gemini_raw: { raw: text },
      });

    if (insertError) throw insertError;

    return NextResponse.json({
      status: "completed",
      foodDetected: parsed.foodDetected,
      portionEstimate: parsed.portionEstimate,
      calories: parsed.calories,
      protein: parsed.protein,
      carbs: parsed.carbs,
      fat: parsed.fat,
      fiber: parsed.fiber,
      adequacyNote: parsed.adequacyNote,
      mpasiRecommendation: parsed.mpasiRecommendation,
    });
  } catch (error) {
    console.error("[gemini/nutrition] Error:", error);
    return NextResponse.json(
      { error: "Nutrition analysis failed", detail: String(error) },
      { status: 500 },
    );
  }
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type GeminiNutritionResponse = {
  foodDetected: string[];
  portionEstimate: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  adequacyNote: string;
  mpasiRecommendation: string;
};

// ─── Prompt Builder ────────────────────────────────────────────────────────────

function buildNutritionPrompt(data: {
  childName: string;
  ageMonths: number;
}): string {
  return `Anda adalah ahli gizi anak. Analisis foto makanan ini untuk balita.

DATA ANAK:
- Nama: ${data.childName}
- Usia: ${data.ageMonths} bulan

Tugas:
1. Identifikasi makanan yang terlihat di foto
2. Estimasi porsi
3. Estimasi nilai gizi (perkiraan wajar, akurasi +/- 30% masih OK)
4. Catat kecukupan gizi untuk usia anak
5. Beri rekomendasi MPASI sesuai usia (jika usia 6-24 bulan)

Jika foto tidak jelas atau bukan makanan, jangan paksa analisis.

FORMAT OUTPUT (JSON saja):
{
  "foodDetected": ["nasi", "sayur bayam", "telur"],
  "portionEstimate": "1 porsi sedang (kira-kira 150g)",
  "calories": 250,
  "protein": 8.5,
  "carbs": 35,
  "fat": 7,
  "fiber": 2.5,
  "adequacyNote": "Kandungan protein cukup baik, serat bisa ditambah",
  "mpasiRecommendation": "Untuk usia 24 bulan, tekstur makanan keluarga sudah sesuai"
}`;
}
