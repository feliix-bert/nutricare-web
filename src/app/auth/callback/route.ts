/**
 * GET /auth/callback
 *
 * Supabase Auth callback — handles email confirmation, OAuth, and password reset.
 * Exchanges auth code for session, then redirects to the app.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const type = searchParams.get("type"); // recovery, invite, etc.

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect ke halaman tujuan, atau ke reset password page jika type=recovery
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/auth/reset-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
  }

  // Failed — redirect ke login dengan error
  return NextResponse.redirect(`${origin}/auth/sign-in?error=auth_failed`);
}
