import { supabase } from '@/utils/supabase';
import type { PageResponse } from '@/types/api-types';
import type {
  NutritionLog,
  NutritionUploadRequest,
} from '@/features/nutrition/types/nutrition-types';

// ── Supabase row type ─────────────────────────────────────────────────────

type SupabaseNutritionRow = {
  id: string;
  child_id: string;
  photo_url: string;
  food_detected: string[] | null;
  portion_estimate: string | null;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  fiber: number | null;
  adequacy_note: string | null;
  mpasi_recommendation: string | null;
  created_at: string;
};

function toLog(row: SupabaseNutritionRow): NutritionLog {
  return {
    id: row.id,
    childId: row.child_id,
    photoUrl: row.photo_url,
    foodDetected: row.food_detected ?? [],
    portionEstimate: row.portion_estimate ?? '',
    calories: row.calories ?? 0,
    protein: row.protein ?? 0,
    fat: row.fat ?? 0,
    carbs: row.carbs ?? 0,
    fiber: row.fiber ?? 0,
    adequacyNote: row.adequacy_note ?? '',
    mpasiRecommendation: row.mpasi_recommendation ?? '',
    createdAt: row.created_at,
  };
}

export const nutritionService = {
  uploadNutrition: async (data: NutritionUploadRequest): Promise<NutritionLog> => {
    const ext = data.photo.name?.split('.').pop() ?? 'jpg';
    const filePath = `${data.childId}/${Date.now()}.${ext}`;
    const response = await fetch(data.photo.uri);
    const blob = await response.blob();
    const { error: uploadError } = await supabase.storage
      .from('nutrition-photos')
      .upload(filePath, blob, { contentType: data.photo.type ?? 'image/jpeg' });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage
      .from('nutrition-photos')
      .getPublicUrl(filePath);
    return {
      id: '',
      childId: data.childId,
      photoUrl: urlData.publicUrl,
      foodDetected: [],
      portionEstimate: '',
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      adequacyNote: '',
      mpasiRecommendation: '',
      createdAt: new Date().toISOString(),
    };
  },

  getChildNutritionLogs: async (childId: string, page = 0, size = 10): Promise<PageResponse<NutritionLog>> => {
    const from = page * size;
    const to = from + size - 1;
    const { data, error, count } = await supabase
      .from('nutrition_logs')
      .select('*', { count: 'exact' })
      .eq('child_id', childId)
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    const rows = (data ?? []) as unknown as SupabaseNutritionRow[];
    return {
      data: rows.map(toLog),
      page,
      size,
      totalElements: count ?? 0,
      totalPages: count ? Math.ceil(count / size) : 0,
    };
  },

  deleteNutritionLog: async (logId: string): Promise<void> => {
    const { error } = await supabase
      .from('nutrition_logs')
      .delete()
      .eq('id', logId);
    if (error) throw error;
  },
};
