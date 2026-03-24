import { createClient } from "@/lib/supabase/proxy";
import { type NextRequest, NextResponse } from "next/server";

const publicPaths = ["/login", "/api/auth/callback", "/api/order-items/anonymous"];

export default async function proxy(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const { pathname } = request.nextUrl;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Already logged in, skip login/callback pages
  if (user && (pathname === "/login" || pathname === "/api/auth/callback")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Not logged in — redirect to login for protected pages
  if (!user) {
    const isPublic =
      publicPaths.some((p) => pathname.startsWith(p)) ||
      pathname.startsWith("/api/");

    if (!isPublic) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
