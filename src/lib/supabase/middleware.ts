import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAppRoute =
    path.startsWith("/dashboard") ||
    path.startsWith("/trips") ||
    path.startsWith("/settings") ||
    path.startsWith("/billing") ||
    path.startsWith("/explore") ||
    path.startsWith("/favorites");

  if (!user && isAppRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/sign-in";
    redirectUrl.searchParams.set(
      "next",
      path + request.nextUrl.search,
    );
    return NextResponse.redirect(redirectUrl);
  }

  if (
    user &&
    (path.startsWith("/auth/sign-in") || path.startsWith("/auth/sign-up"))
  ) {
    const next = request.nextUrl.searchParams.get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      return NextResponse.redirect(new URL(next, request.url));
    }
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
