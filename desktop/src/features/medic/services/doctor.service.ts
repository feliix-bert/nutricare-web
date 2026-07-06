import { createClient } from "@/lib/supabase/client";

export type Doctor = {
  id: string;
  name: string;
};

/**
 * Fetch all active users with role MEDIC.
 * Used to populate the doctor picker when creating/editing a child profile.
 */
export const fetchAvailableDoctors = async (): Promise<Doctor[]> => {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, name")
    .eq("role", "MEDIC")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw error;

  return (data ?? []) as Doctor[];
};
