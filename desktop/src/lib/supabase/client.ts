import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let browserClient: SupabaseClient<Database> | undefined;

export const createClient = () => {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient<Database>(
    supabaseUrl!,
    supabaseKey!
  );

  return browserClient;
};
