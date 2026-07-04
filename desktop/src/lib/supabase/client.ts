import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

import type { SupabaseClient } from "@supabase/supabase-js";

import axios from "axios";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let browserClient: SupabaseClient<Database> | undefined;

// Custom fetch wrapper using axios to bypass Next.js fetch bugs
const axiosFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  try {
    const response = await axios({
      url: url.toString(),
      method: options?.method || "GET",
      data: options?.body,
      headers: options?.headers as any,
      responseType: "arraybuffer", // Handle all response types securely
      validateStatus: () => true, // Let Supabase handle the HTTP status codes
    });

    return new Response(response.data, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as any,
    });
  } catch (error) {
    throw error;
  }
};

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
        lock: async (name, acquire) => {
          return await acquire();
        }
      },
      global: {
        fetch: axiosFetch, // Force Supabase to use Axios (XHR) instead of native fetch
      },
    }
  );

  return browserClient;
};
