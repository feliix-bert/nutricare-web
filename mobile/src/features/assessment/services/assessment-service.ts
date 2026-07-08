import { supabase } from '@/utils/supabase';
import type { PageResponse } from '@/types/api-types';
import type {
  AssessmentRequestDTO,
  AssessmentResponseDTO,
  AssessmentPredictionDTO,
  BlockchainAnchorDTO,
} from '@/features/assessment/types/assessment-types';
import type { StuntStatus } from '@/features/children/types/child-types';

// ── Supabase row types ────────────────────────────────────────────────────

type SupabaseAssessmentRow = {
  id: string;
  child_id: string;
  weight: number | null;
  height: number | null;
  head_circumference: number | null;
  bf_exclusive: boolean | null;
  mpasi_age: number | null;
  meal_freq: number | null;
  illness_history: string | null;
  created_at: string;
};

type SupabasePredictionRow = {
  id: string;
  assessment_id: string;
  stunt_status: StuntStatus;
  prediction_status: 'PENDING' | 'COMPLETED' | 'FAILED';
  zscore_wa: number | null;
  zscore_ha: number | null;
  zscore_wh: number | null;
  risk_level: number | null;
  summary: string | null;
  recommendations: string[] | null;
  next_assessment_date: string | null;
  ai_limited: boolean | null;
  created_at: string;
};

// ── Transform helpers ────────────────────────────────────────────────────

function toPrediction(row: SupabasePredictionRow | null): AssessmentPredictionDTO {
  if (!row) {
    return {
      id: '',
      status: 'NORMAL' as StuntStatus,
      predictionStatus: 'PENDING',
      zscoreWa: 0,
      zscoreHa: 0,
      zscoreWh: 0,
      riskLevel: 0,
      summary: '',
      recommendations: [],
      nextAssessmentDate: '',
      disclaimer: '',
      aiLimited: false,
    };
  }
  return {
    id: row.id,
    status: row.stunt_status,
    predictionStatus: row.prediction_status,
    zscoreWa: row.zscore_wa ?? 0,
    zscoreHa: row.zscore_ha ?? 0,
    zscoreWh: row.zscore_wh ?? 0,
    riskLevel: row.risk_level ?? 0,
    summary: row.summary ?? '',
    recommendations: row.recommendations ?? [],
    nextAssessmentDate: row.next_assessment_date ?? '',
    disclaimer: '',
    aiLimited: row.ai_limited ?? false,
  };
}

function toAssessment(
  row: SupabaseAssessmentRow & { prediction?: SupabasePredictionRow | null },
  child?: { id: string; name: string }
): AssessmentResponseDTO {
  return {
    id: row.id,
    child: child ?? { id: row.child_id, name: '' },
    weight: row.weight ?? undefined,
    height: row.height ?? undefined,
    headCircumference: row.head_circumference ?? undefined,
    bfExclusive: row.bf_exclusive ?? undefined,
    mpasiAge: row.mpasi_age ?? undefined,
    mealFreq: row.meal_freq ?? undefined,
    illnessHistory: row.illness_history ?? undefined,
    createdAt: row.created_at,
    prediction: toPrediction(row.prediction ?? null),
  };
}

// ── Service ──────────────────────────────────────────────────────────────

/**
 * Supabase returns ONE-TO-MANY relations as arrays even when cardinality is 1.
 * prediction:predictions(*) → [{...}] not {...}. Normalize here.
 */
function firstOrNull<T>(val: T | T[] | null | undefined): T | null {
  if (val == null) return null;
  return Array.isArray(val) ? (val[0] ?? null) : val;
}

export const assessmentService = {
  createAssessment: async (data: AssessmentRequestDTO): Promise<AssessmentResponseDTO> => {
    const { data: inserted, error } = await supabase
      .from('assessments')
      .insert({
        child_id: data.childId,
        weight: data.weight,
        height: data.height,
        head_circumference: data.headCircumference || null,
        bf_exclusive: data.bfExclusive,
        mpasi_age: data.mpasiAge || null,
        meal_freq: data.mealFreq,
        illness_history: data.illnessHistory || null,
      })
      .select()
      .single();
    if (error) throw error;
    return toAssessment(inserted as unknown as SupabaseAssessmentRow, { id: data.childId, name: '' });
  },

  getAssessment: async (assessmentId: string): Promise<AssessmentResponseDTO> => {
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        prediction:predictions(*)
      `)
      .eq('id', assessmentId)
      .single();
    if (error) throw error;
    // Supabase returns prediction as array (one-to-many) — normalize to single row
    const row = data as unknown as SupabaseAssessmentRow & { prediction: SupabasePredictionRow[] | SupabasePredictionRow | null };
    return toAssessment({ ...row, prediction: firstOrNull(row.prediction) });
  },

  getPrediction: async (assessmentId: string): Promise<AssessmentPredictionDTO> => {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('assessment_id', assessmentId)
      .single();
    if (error) {
      return {
        id: '', status: 'NORMAL', predictionStatus: 'PENDING',
        zscoreWa: 0, zscoreHa: 0, zscoreWh: 0, riskLevel: 0,
        summary: '', recommendations: [], nextAssessmentDate: '', disclaimer: '',
      };
    }
    return toPrediction(data as unknown as SupabasePredictionRow);
  },

  getChildAssessments: async (childId: string, page = 0, size = 10): Promise<PageResponse<AssessmentResponseDTO>> => {
    const from = page * size;
    const to = from + size - 1;
    const { data, error, count } = await supabase
      .from('assessments')
      .select(`
        *,
        prediction:predictions(*)
      `, { count: 'exact' })
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    const rows = (data ?? []) as unknown as (SupabaseAssessmentRow & { prediction: SupabasePredictionRow[] | SupabasePredictionRow | null })[];
    return {
      data: rows.map((r) => toAssessment({ ...r, prediction: firstOrNull(r.prediction) })),
      page,
      size,
      totalElements: count ?? 0,
      totalPages: count ? Math.ceil(count / size) : 0,
    };
  },
};
