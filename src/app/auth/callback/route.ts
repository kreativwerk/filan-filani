import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Ziele innerhalb des KS-Data-Runner-Portals — nur diese Logins machen
// aus einem 'user' einen 'scout'. Filan-Filani-Logins (next=/app) nicht.
const SCOUT_PREFIXES = ["/dashboard", "/businesses"];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/dashboard";
  const next = nextParam.startsWith("/") ? nextParam : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (SCOUT_PREFIXES.some((p) => next.startsWith(p))) {
        await supabase.rpc("become_scout");
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
