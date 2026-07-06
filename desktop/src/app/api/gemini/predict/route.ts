/**
 * POST /api/gemini/predict
 *
 * Trigger Gemini prediction untuk assessment.
 * 1. Load assessment + child data dari Supabase
 * 2. Hitung Z-Score (TB/U, BB/U, BB/TB)
 * 3. Kirim ke Gemini → interpretasi + rekomendasi
 * 4. Update predictions table
 * 5. Trigger blockchain anchor (async, fire & forget)
 */
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import {
  calculateZScoreHA,
  calculateZScoreWA,
  calculateZScoreWH,
  classifyStunting,
  determineRiskLevel,
} from "@/lib/zscore";

export async function POST(request: Request): Promise<NextResponse> {
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
    const { assessmentId } = (await request.json()) as {
      assessmentId: string;
    };
    if (!assessmentId) {
      return NextResponse.json(
        { error: "assessmentId required" },
        { status: 400 },
      );
    }

    // ── Load assessment + child ──────────────────────────────────────────
    const { data: assessment, error: asmError } = await supabase
      .from("assessments")
      .select(
        `id, weight, height, head_circumference, bf_exclusive, mpasi_age, meal_freq, illness_history,
         child:children(id, name, birth_date, gender)`,
      )
      .eq("id", assessmentId)
      .single();

    if (asmError || !assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const child = assessment.child as unknown as {
      id: string;
      name: string;
      birth_date: string;
      gender: "MALE" | "FEMALE";
    };

    // ── Calculate age in months ──────────────────────────────────────────
    const birth = new Date(child.birth_date);
    const now = new Date();
    const ageMonths =
      (now.getFullYear() - birth.getFullYear()) * 12 +
      (now.getMonth() - birth.getMonth());

    // ── Calculate Z-Scores ───────────────────────────────────────────────
    const zscoreHa = calculateZScoreHA(assessment.height, ageMonths, child.gender);
    const zscoreWa = calculateZScoreWA(assessment.weight, ageMonths, child.gender);
    const zscoreWh = calculateZScoreWH(assessment.weight, assessment.height, child.gender);
    const stuntStatus = classifyStunting(zscoreHa);
    const riskLevel = determineRiskLevel(stuntStatus);

    // ── Gemini ───────────────────────────────────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback: save z-score only, skip Gemini
      const { error: updateError } = await supabase
        .from("predictions")
        .update({
          stunt_status: stuntStatus,
          prediction_status: "COMPLETED",
          zscore_wa: zscoreWa,
          zscore_ha: zscoreHa,
          zscore_wh: zscoreWh,
          risk_level: riskLevel,
          summary: "Z-score calculated. Gemini API key not configured.",
          next_assessment_date: getNextAssessmentDate(riskLevel),
        })
        .eq("assessment_id", assessmentId);

      if (updateError) throw updateError;

      return NextResponse.json({
        status: "completed",
        zscoreHa,
        zscoreWa,
        zscoreWh,
        stuntStatus,
        riskLevel,
        gemini: false,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = buildPredictionPrompt({
      childName: child.name,
      ageMonths,
      gender: child.gender,
      weight: assessment.weight,
      height: assessment.height,
      headCircumference: assessment.head_circumference,
      bfExclusive: assessment.bf_exclusive,
      mpasiAge: assessment.mpasi_age,
      mealFreq: assessment.meal_freq,
      illnessHistory: assessment.illness_history,
      zscoreHa,
      zscoreWa,
      zscoreWh,
      stuntStatus,
      riskLevel,
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // ── Parse JSON dari response ────────────────────────────────────────
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let parsed: GeminiPredictionResponse;

    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]) as GeminiPredictionResponse;
    } else {
      // Fallback: bikin default response pake z-score
      parsed = {
        summary: text.slice(0, 500),
        recommendations: [
          "Konsultasikan dengan dokter atau tenaga kesehatan terdekat",
          "Pantau pertumbuhan anak secara rutin setiap bulan",
          "Pastikan asupan gizi seimbang dengan protein hewani",
        ],
      };
    }

    // ── Save to predictions ─────────────────────────────────────────────
    const nextDate = getNextAssessmentDate(riskLevel);
    const { error: updateError } = await supabase
      .from("predictions")
      .update({
        stunt_status: stuntStatus,
        prediction_status: "COMPLETED",
        zscore_wa: zscoreWa,
        zscore_ha: zscoreHa,
        zscore_wh: zscoreWh,
        risk_level: riskLevel,
        summary: parsed.summary,
        recommendations: parsed.recommendations,
        next_assessment_date: nextDate,
        gemini_raw: { raw: text },
      })
      .eq("assessment_id", assessmentId);

    if (updateError) throw updateError;

    // ── Trigger blockchain anchor (async) ────────────────────────────────
    fetch(
      `${new URL(request.url).origin}/api/blockchain/anchor`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      },
    ).catch(() => {
      console.error("[gemini/predict] Failed to trigger blockchain anchor");
    });

    return NextResponse.json({
      status: "completed",
      zscoreHa,
      zscoreWa,
      zscoreWh,
      stuntStatus,
      riskLevel,
      summary: parsed.summary,
      recommendations: parsed.recommendations,
      nextAssessmentDate: nextDate,
      gemini: true,
    });
  } catch (error) {
    console.error("[gemini/predict] Error:", error);
    return NextResponse.json(
      { error: "Prediction failed", detail: String(error) },
      { status: 500 },
    );
  }
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type GeminiPredictionResponse = {
  summary: string;
  recommendations: string[];
};

// ─── Prompt Builder ────────────────────────────────────────────────────────────

function buildPredictionPrompt(data: {
  childName: string;
  ageMonths: number;
  gender: string;
  weight: number;
  height: number;
  headCircumference: number | null;
  bfExclusive: boolean;
  mpasiAge: number | null;
  mealFreq: number | null;
  illnessHistory: string | null;
  zscoreHa: number;
  zscoreWa: number;
  zscoreWh: number;
  stuntStatus: string;
  riskLevel: number;
}): string {
  return `Anda adalah ahli gizi anak (pediatric nutritionist) dari sistem GiziChain — skrining stunting untuk anak 0-60 bulan.

Berdasarkan data berikut, berikan interpretasi dan rekomendasi.

DATA ANAK:
- Nama: ${data.childName}
- Usia: ${data.ageMonths} bulan
- Jenis Kelamin: ${data.gender === "MALE" ? "Laki-laki" : "Perempuan"}

DATA ANTROPOMETRI:
- Berat Badan: ${data.weight} kg
- Tinggi Badan: ${data.height} cm
- Lingkar Kepala: ${data.headCircumference ?? "Tidak diukur"} cm
- ASI Eksklusif: ${data.bfExclusive ? "Ya" : "Tidak"}
- Usia MPASI: ${data.mpasiAge ?? "N/A"} bulan
- Frekuensi Makan: ${data.mealFreq ?? "N/A"} kali/hari
- Riwayat Sakit: ${data.illnessHistory ?? "Tidak ada"}

Z-SCORE (WHO 2006):
- TB/U (Height-for-Age): ${data.zscoreHa} SD — indikator stunting
- BB/U (Weight-for-Age): ${data.zscoreWa} SD — indikator underweight
- BB/TB (Weight-for-Height): ${data.zscoreWh} SD — indikator wasting
- Status Stunting: ${data.stuntStatus}
- Risk Level: ${data.riskLevel}/4

INSTRUKSI:
1. Berikan interpretasi singkat (2-3 kalimat) dalam Bahasa Indonesia
2. Gunakan istilah "berisiko stunting" bukan "menderita stunting" — karena ini skrining awal
3. Sertakan 3-5 rekomendasi spesifik sesuai usia anak dan status gizi
4. Cantumkan disclaimer: ini bukan diagnosis medis

FORMAT OUTPUT (JSON saja, tanpa markdown):
{
  "summary": "string — interpretasi 2-3 kalimat",
  "recommendations": ["rekomendasi 1", "rekomendasi 2", "rekomendasi 3"]
}`;
}

// ─── Helper ────────────────────────────────────────────────────────────────────

function getNextAssessmentDate(riskLevel: number): string {
  const date = new Date();
  switch (riskLevel) {
    case 4:
      date.setMonth(date.getMonth() + 1); // 1 bulan
      break;
    case 3:
      date.setMonth(date.getMonth() + 2); // 2 bulan
      break;
    case 2:
      date.setMonth(date.getMonth() + 3); // 3 bulan
      break;
    default:
      date.setMonth(date.getMonth() + 6); // 6 bulan
  }
  return date.toISOString().split("T")[0];
}
