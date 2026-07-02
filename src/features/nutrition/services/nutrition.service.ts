import { createClient } from "@/lib/supabase/client";
import type { NutritionLog } from "@/stores/nutritionStore";

const mapLog = (row: {
  id: string;
  child_id: string;
  photo_url: string | null;
  food_detected: string[] | null;
  portion_estimate: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fiber: number | null;
  adequacy_note: string | null;
  mpasi_recommendation: string | null;
  created_at: string;
}): NutritionLog => ({
  id: row.id,
  childId: row.child_id,
  photoUrl: row.photo_url ?? "",
  foodDetected: row.food_detected ?? [],
  portionEstimate: row.portion_estimate ?? "",
  calories: row.calories ?? 0,
  protein: row.protein ?? 0,
  carbs: row.carbs ?? 0,
  fat: row.fat ?? 0,
  fiber: row.fiber ?? 0,
  adequacyNote: row.adequacy_note ?? "",
  mpasiRecommendation: row.mpasi_recommendation ?? "",
  createdAt: row.created_at,
});

export const nutritionService = {
  uploadNutritionPhoto: async (childId: string, photo: File): Promise<NutritionLog> => {
    const supabase = createClient();

    // 1. Upload photo to Supabase Storage
    const fileExt = photo.name.split(".").pop();
    const filePath = `${childId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("food-photos")
      .upload(filePath, photo);

    if (uploadError) throw uploadError;

    // 2. Get public URL
    const { data: urlData } = supabase.storage.from("food-photos").getPublicUrl(filePath);
    const photoUrl = urlData.publicUrl;

    // 3. Call Gemini nutrition analysis via Next.js API
    // API route handles both Gemini analysis AND saving to nutrition_logs
    const res = await fetch(`/api/gemini/nutrition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, photoUrl }),
    });

    if (!res.ok) throw new Error("Nutrition analysis failed");

    // 4. Fetch the saved log (most recent for this child + photoUrl)
    const { data: log, error } = await supabase
      .from("nutrition_logs")
      .select("*")
      .eq("child_id", childId)
      .eq("photo_url", photoUrl)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    return mapLog(log);
  },

  getNutritionHistory: async (childId: string, page = 0, size = 10) => {
    const supabase = createClient();
    const from = page * size;
    const to = from + size - 1;

    const { data, error, count } = await supabase
      .from("nutrition_logs")
      .select("*", { count: "exact" })
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: (data ?? []).map(mapLog),
      totalElements: count ?? 0,
    };
  },
};
