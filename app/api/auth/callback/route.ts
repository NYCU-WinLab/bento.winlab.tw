import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);
      // Redirect to error page or back to me page
      return NextResponse.redirect(`${origin}/me?error=auth_failed`);
    }
  }

  // If linking identity, redirect back to /me page
  // Otherwise redirect to the specified next URL or home
  const redirectUrl = next.startsWith("/") ? `${origin}${next}` : `${origin}/`;
  return NextResponse.redirect(redirectUrl);
}
