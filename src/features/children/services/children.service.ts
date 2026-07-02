import { createClient } from "@/lib/supabase/client";
import type { Child, ChildDetail, ChildRequest, ChildUpdateRequest } from "@/features/children/types/child.types";

/** Calculate age in months from birth date */
const calcAgeMonths = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const now = new Date();
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
};

/** Helper to wrap Supabase queries with a timeout to prevent infinite hanging */
const withTimeout = <T>(promise: PromiseLike<T>, ms = 8000): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
};

const mapChild = (row: {
  id: string;
  name: string;
  birth_date: string;
  gender: string;
  created_at: string;
  updated_at: string;
}): Child => ({
  id: row.id,
  name: row.name,
  birthDate: row.birth_date,
  gender: row.gender as Child["gender"],
  ageMonths: calcAgeMonths(row.birth_date),
  latestPrediction: null, // filled separately if needed
});

export const childrenService = {
  getChildren: async (page = 0, size = 10) => {
    const supabase = createClient();
    const from = page * size;
    const to = from + size - 1;

    const { data, error, count } = await withTimeout(
      (async () => {
        return await supabase
          .from("children")
          .select("*")
          .order("created_at", { ascending: false })
          .range(from, to);
      })()
    );

    if (error) throw error;

    const children = (data ?? []).map(mapChild);

    return {
      data: children,
      page,
      size,
      totalElements: count ?? 0,
      totalPages: count ? Math.ceil(count / size) : 0,
    };
  },

  getChild: async (childId: string): Promise<ChildDetail> => {
    const supabase = createClient();

    const { data: child, error } = await withTimeout(
      (async () => {
        return await supabase
          .from("children")
          .select("*")
          .eq("id", childId)
          .single();
      })()
    );

    if (error) throw error;

    // Fetch assessments + predictions
    const { data: assessments } = await withTimeout(
      (async () => {
        return await supabase
          .from("assessments")
          .select(
            `
            id,
            weight,
            height,
            created_at,
            predictions ( stunt_status, risk_level )
          `
          )
          .eq("child_id", childId)
          .order("created_at", { ascending: false });
      })()
    );

    return {
      ...mapChild(child),
      assessments: (assessments ?? []).map((a: any) => {
        const pred = Array.isArray(a.predictions) ? a.predictions[0] : a.predictions;
        return {
          id: a.id,
          weight: a.weight,
          height: a.height,
          createdAt: a.created_at,
          prediction: {
            status: (pred?.stunt_status as ChildDetail["assessments"][number]["prediction"]["status"]) ?? "NORMAL",
            riskLevel: pred?.risk_level ?? 0,
          },
        };
      }),
    };
  },

  createChild: async (data: ChildRequest): Promise<Child> => {
    const supabase = createClient();

    // Generate short anon_id (nanoid-style)
    const anonId = Math.random().toString(36).substring(2, 12);

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: child, error } = await supabase
      .from("children")
      .insert({
        user_id: user.id,
        name: data.name,
        birth_date: data.birthDate,
        gender: data.gender,
        anon_id: anonId,
      })
      .select()
      .single();

    if (error) throw error;

    return mapChild(child);
  },

  updateChild: async (childId: string, data: ChildUpdateRequest): Promise<Child> => {
    const supabase = createClient();

    const { data: child, error } = await supabase
      .from("children")
      .update({
        name: data.name,
        birth_date: data.birthDate,
      })
      .eq("id", childId)
      .select()
      .single();

    if (error) throw error;

    return mapChild(child);
  },
};
