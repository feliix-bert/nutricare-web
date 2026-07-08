import { supabase } from '@/utils/supabase';
import { generateContent } from '@/utils/gemini-client';
import { generateId } from '@/utils/random';
import type {
  GeminiPredictRequest,
  GeminiPredictResponse,
  GeminiNutritionRequest,
  GeminiNutritionResponse,
} from '@/features/gemini/types/gemini-types';
import type { StuntStatus } from '@/utils/who-zscore';
import { computeHaz, computeWaz, computeWhz, classifyStunting, computeAgeMonths } from '@/utils/who-zscore';

type PredictionInsertRow = {
  id: string;
  assessment_id: string;
  stunt_status: StuntStatus;
  prediction_status: 'COMPLETED';
  zscore_wa: number;
  zscore_ha: number;
  zscore_wh: number;
  risk_level: number;
  summary: string;
  recommendations: string[];
  next_assessment_date: string;
  disclaimer: string;
  ai_limited: boolean;
};

// ── Rekomendasi lokal berdasarkan status stunting ─────────────────────────
function buildLocalAnalysis(
  status: StuntStatus,
  haz: number,
): { summary: string; recommendations: string[] } {
  const hazStr = haz.toFixed(2);
  switch (status) {
    case 'SEVERELY_STUNTED':
      return {
        summary: `Z-score TB/U ${hazStr} SD — anak sangat berisiko stunting berat. Segera konsultasikan dengan dokter spesialis anak.`,
        recommendations: [
          'Segera bawa anak ke dokter spesialis anak atau ahli gizi untuk evaluasi mendalam.',
          'Tingkatkan asupan protein hewani (telur, ikan, daging) setiap hari tanpa jeda.',
          'Pastikan anak mendapat makanan padat gizi minimal 5–6 kali sehari.',
          'Lakukan pemeriksaan lanjut untuk mendeteksi penyebab gangguan pertumbuhan.',
        ],
      };
    case 'STUNTED':
      return {
        summary: `Z-score TB/U ${hazStr} SD — anak berisiko stunting. Diperlukan intervensi gizi segera.`,
        recommendations: [
          'Konsultasikan dengan dokter anak atau kader posyandu terdekat.',
          'Berikan makanan padat gizi: telur, ikan, kacang-kacangan, dan sayuran setiap hari.',
          'Pantau pertumbuhan tinggi badan setiap bulan di posyandu.',
          'Pastikan anak bebas dari infeksi berulang yang dapat menghambat pertumbuhan.',
        ],
      };
    case 'AT_RISK':
      return {
        summary: `Z-score TB/U ${hazStr} SD — anak berisiko mengalami stunting. Perlu perhatian khusus pada asupan gizi.`,
        recommendations: [
          'Tingkatkan frekuensi makan menjadi 5–6 kali sehari termasuk selingan bergizi.',
          'Perbanyak konsumsi protein hewani dan lemak sehat setiap hari.',
          'Pantau berat dan tinggi badan setiap bulan di posyandu.',
          'Diskusikan pola makan anak bersama tenaga kesehatan terdekat.',
        ],
      };
    default: // NORMAL
      return {
        summary: `Z-score TB/U ${hazStr} SD — pertumbuhan normal sesuai standar WHO. Pertahankan pola asuh gizi yang baik.`,
        recommendations: [
          'Pertahankan pola makan bergizi seimbang setiap hari.',
          'Terus berikan ASI atau susu formula sesuai usia anak.',
          'Pastikan anak aktif bergerak dan mendapat stimulasi tumbuh kembang.',
          'Lanjutkan pemeriksaan rutin setiap 3 bulan di posyandu.',
        ],
      };
  }
}

function systemInstruction(role: string): string {
  const { loadSkills } = require('@/data/skills') as { loadSkills: () => string };
  return `Kamu adalah asisten ${role} dari platform TumbuhSehat. Berikut adalah dokumen referensi yang harus kamu gunakan:\n${loadSkills()}`;
}

async function callGeminiJson(systemRole: string, prompt: string): Promise<string> {
  const text = await generateContent(systemInstruction(systemRole), [{ role: 'user', text: prompt }], { temperature: 0.3, maxOutputTokens: 1024 });
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Failed to parse JSON response from Gemini');
  return match[0];
}

export const geminiService = {
  /**
   * Hitung Z-score lokal (WHO LMS) + INSERT prediction langsung COMPLETED.
   * Tidak memanggil Gemini — rekomendasi dihasilkan secara lokal berdasarkan status.
   * Untuk interpretasi & tanya-jawab AI, gunakan fitur Chat AI di tab Konsultasi.
   */
  predict: async (data: GeminiPredictRequest): Promise<GeminiPredictResponse> => {
    const { assessmentId } = data;

    const { data: assess, error: aErr } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();
    if (aErr || !assess) throw new Error('Assessment not found');

    const { data: child, error: cErr } = await supabase
      .from('children')
      .select('name, birth_date, gender')
      .eq('id', assess.child_id)
      .single();
    if (cErr || !child) throw new Error('Child not found');

    const ageMonths = computeAgeMonths(child.birth_date);
    const haz = computeHaz(assess.height, ageMonths, child.gender);
    const waz = computeWaz(assess.weight, ageMonths, child.gender);
    const whz = computeWhz(assess.weight, assess.height, child.gender);
    const status = classifyStunting(haz);
    const riskLevel = haz <= -3 ? 3 : haz <= -2.5 ? 2 : haz <= -2 ? 1 : 0;

    const disclaimer =
      'Hasil ini bersifat skrining awal dan bukan diagnosis medis. Konsultasikan dengan dokter atau tenaga kesehatan.';
    const defaultNextDate = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
    const predictionId = generateId();

    // Rekomendasi dihasilkan lokal — tidak ada Gemini call di sini
    const { summary, recommendations } = buildLocalAnalysis(status, haz);

    const row: PredictionInsertRow = {
      id: predictionId,
      assessment_id: assessmentId,
      stunt_status: status,
      prediction_status: 'COMPLETED',
      zscore_wa: Math.round(waz * 100) / 100,
      zscore_ha: Math.round(haz * 100) / 100,
      zscore_wh: Math.round(whz * 100) / 100,
      risk_level: riskLevel,
      summary,
      recommendations,
      next_assessment_date: defaultNextDate,
      disclaimer,
      ai_limited: false,
    };

    const { error: insertErr } = await supabase.from('predictions').insert(row);
    if (insertErr) throw new Error(`Failed to save prediction: ${insertErr.message}`);

    return { predictionId, status: 'COMPLETED' };
  },

  analyzeNutrition: async (data: GeminiNutritionRequest): Promise<GeminiNutritionResponse> => {
    const prompt = `Analisis foto makanan anak berikut untuk data gizi:

Photo URL: ${data.photoUrl}

Berdasarkan foto, berikan analisis JSON tanpa markdown:
{
  "foodDetected": ["..."],
  "portionEstimate": "...",
  "calories": 0,
  "protein": 0,
  "fat": 0,
  "carbs": 0,
  "fiber": 0,
  "adequacyNote": "...",
  "mpasiRecommendation": "..."
}`;

    const raw = await callGeminiJson('analis gizi anak', prompt);
    return JSON.parse(raw) as GeminiNutritionResponse;
  },
};
