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
    supabaseKey!,
    {
      auth: {
        // BYPASS: navigator.locks can deadlock in some browsers or after a crash.
        // This causes getSession() and any .from() query to hang indefinitely.
        // We override the lock implementation to just execute the acquire function immediately.
        lock: async (name, acquireTimeout, acquire) => {
          return await acquire();
        }
      },
    }
  );

  return browserClient;
};
