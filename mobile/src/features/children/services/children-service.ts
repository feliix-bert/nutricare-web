import { supabase } from '@/utils/supabase';
import { generateId } from '@/utils/random';
import type { PageResponse } from '@/types/api-types';
import type { Child, ChildDetail, ChildRequest, ChildUpdateRequest, LatestPrediction } from '@/features/children/types/child-types';

// ── Helpers ───────────────────────────────────────────────────────────────

const calcAgeMonths = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
};

// ── Transform helpers ────────────────────────────────────────────────────

type SupabaseChildRow = {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  birth_date: string;
  anon_id: string | null;
  created_at: string;
};

type SupabaseChildWithAssessments = SupabaseChildRow & {
  assessments: Array<{
    created_at: string;
    prediction: Array<{
      stunt_status: string;
      risk_level: number | null;
      created_at: string;
    }> | null;
  }>;
};

type SupabaseAssessmentRow = {
  id: string;
  weight: number | null;
  height: number | null;
  head_circumference: number | null;
  bf_exclusive: boolean | null;
  mpasi_age: number | null;
  meal_freq: number | null;
  illness_history: string | null;
  created_at: string;
  prediction: SupabasePredictionRow | null;
};

type SupabasePredictionRow = {
  id: string;
  stunt_status: 'NORMAL' | 'AT_RISK' | 'STUNTED' | 'SEVERELY_STUNTED';
  prediction_status: 'PENDING' | 'COMPLETED' | 'FAILED';
  risk_level: number | null;
  zscore_wa: number | null;
  zscore_ha: number | null;
  zscore_wh: number | null;
  summary: string | null;
  recommendations: string[] | null;
  next_assessment_date: string | null;
  created_at: string;
};

function latestPrediction(assessments: SupabaseChildWithAssessments['assessments']) {
  if (!assessments || assessments.length === 0) return null;
  const latest = assessments.reduce((a, b) => (a.created_at > b.created_at ? a : b));
  // Normalize array → single object
  const pred = Array.isArray(latest.prediction)
    ? (latest.prediction[0] ?? null)
    : latest.prediction;
  if (!pred) return null;
  return {
    status: pred.stunt_status,
    riskLevel: pred.risk_level ?? undefined,
    createdAt: pred.created_at,
  };
}

function toChild(row: SupabaseChildRow, prediction?: { status: string; riskLevel?: number; createdAt: string } | null): Child {
  return {
    id: row.id,
    name: row.name,
    birthDate: row.birth_date,
    gender: row.gender,
    ageMonths: calcAgeMonths(row.birth_date),
    anonId: row.anon_id ?? undefined,
    createdAt: row.created_at,
    latestPrediction: prediction
      ? { status: prediction.status as LatestPrediction['status'], riskLevel: prediction.riskLevel, createdAt: prediction.createdAt }
      : null,
  };
}

function toPrediction(p: SupabasePredictionRow | null) {
  if (!p) return undefined;
  return {
    id: p.id,
    status: p.stunt_status as LatestPrediction['status'],
    predictionStatus: p.prediction_status as 'COMPLETED' | 'PENDING' | 'FAILED',
    riskLevel: p.risk_level ?? 0,
    zscoreWa: p.zscore_wa ?? undefined,
    zscoreHa: p.zscore_ha ?? undefined,
    zscoreWh: p.zscore_wh ?? undefined,
    summary: p.summary ?? undefined,
    recommendations: p.recommendations ?? undefined,
    nextAssessmentDate: p.next_assessment_date ?? undefined,
    createdAt: p.created_at,
  };
}

function toAssessment(a: SupabaseAssessmentRow) {
  return {
    id: a.id,
    weight: a.weight ?? 0,
    height: a.height ?? 0,
    headCircumference: a.head_circumference ?? undefined,
    bfExclusive: a.bf_exclusive ?? undefined,
    mpasiAge: a.mpasi_age ?? undefined,
    mealFreq: a.meal_freq ?? undefined,
    illnessHistory: a.illness_history ?? undefined,
    createdAt: a.created_at,
    prediction: toPrediction(a.prediction),
  };
}

function toChildDetail(row: SupabaseChildRow & { assessments: SupabaseAssessmentRow[] }): ChildDetail {
  return {
    id: row.id,
    name: row.name,
    birthDate: row.birth_date,
    gender: row.gender,
    ageMonths: calcAgeMonths(row.birth_date),
    anonId: row.anon_id ?? undefined,
    createdAt: row.created_at,
    latestPrediction: null,
    assessments: (row.assessments ?? []).map(toAssessment),
  };
}

// ── Service ──────────────────────────────────────────────────────────────

export const childrenService = {
  getChildren: async (page = 0, size = 10): Promise<PageResponse<Child>> => {
    const from = page * size;
    const to = from + size - 1;
    const { data, error, count } = await supabase
      .from('children')
      .select(`
        *,
        assessments(created_at, prediction:predictions(stunt_status, risk_level, created_at))
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    return {
      data: (data ?? []).map((row) => {
        const r = row as unknown as SupabaseChildWithAssessments;
        return toChild(r, latestPrediction(r.assessments));
      }),
      page,
      size,
      totalElements: count ?? 0,
      totalPages: count ? Math.ceil(count / size) : 0,
    };
  },

  getChild: async (childId: string): Promise<ChildDetail> => {
    const { data, error } = await supabase
      .from('children')
      .select(`
        *,
        assessments(
          id, weight, height, head_circumference,
          bf_exclusive, mpasi_age, meal_freq, illness_history, created_at,
          prediction:predictions(*)
        )
      `)
      .eq('id', childId)
      .single();
    if (error) throw error;
    return toChildDetail(data as unknown as SupabaseChildRow & { assessments: SupabaseAssessmentRow[] });
  },

  createChild: async (req: ChildRequest): Promise<Child> => {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase
      .from('children')
      .insert({
        name: req.name,
        birth_date: req.birthDate,
        gender: req.gender,
        user_id: session?.user.id,
        anon_id: generateId(),
      })
      .select()
      .single();
    if (error) throw error;
    return toChild(data as unknown as SupabaseChildRow);
  },

  updateChild: async (childId: string, req: ChildUpdateRequest): Promise<Child> => {
    const { data, error } = await supabase
      .from('children')
      .update({ name: req.name, birth_date: req.birthDate })
      .eq('id', childId)
      .select()
      .single();
    if (error) throw error;
    return toChild(data as unknown as SupabaseChildRow);
  },
};
