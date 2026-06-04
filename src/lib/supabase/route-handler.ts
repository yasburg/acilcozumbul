import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

/** Route Handler'da Supabase oturum çerezlerini doğru yazmak için */
export function createSupabaseRouteHandlerClient(request: NextRequest) {
  const pendingCookies = new Map<string, CookieToSet>();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            pendingCookies.set(name, { name, value, options });
            response = NextResponse.next({ request });
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  return {
    supabase,
    applyCookies(json: NextResponse) {
      pendingCookies.forEach(({ name, value, options }) => {
        json.cookies.set(name, value, options);
      });
      return json;
    },
  };
}
