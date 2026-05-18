import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const errorDescription = searchParams.get("error_description");

  if (errorDescription) {
    const url = new URL("/", origin);
    url.searchParams.set("auth_error", errorDescription);
    return NextResponse.redirect(url);
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocal = process.env.NODE_ENV === "development";
      const safeNext = next.startsWith("/") ? next : "/dashboard";
      if (isLocal) {
        return NextResponse.redirect(`${origin}${safeNext}`);
      }
      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${safeNext}`);
      }
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
    const url = new URL("/", origin);
    url.searchParams.set("auth_error", error.message);
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(new URL("/", origin));
}
