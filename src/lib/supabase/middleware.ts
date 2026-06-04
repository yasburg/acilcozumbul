import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  panelEpostaIzinli,
  supabaseYapilandirildi,
} from "./env";

export async function updatePanelSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPanelGiris =
    pathname === "/panel" || pathname === "/panel/giris";
  const isPanelPage = pathname.startsWith("/panel");
  const isPanelApi = pathname.startsWith("/api/panel");
  const isCikisApi = pathname === "/api/panel/cikis";
  const isOturumApi = pathname === "/api/panel/oturum";
  const isGirisApi = pathname === "/api/panel/giris";

  if (!isPanelPage && !isPanelApi) {
    return NextResponse.next({ request });
  }

  if (!supabaseYapilandirildi()) {
    if (isPanelApi && !isCikisApi) {
      return NextResponse.json(
        { error: "Supabase yapılandırması eksik." },
        { status: 503 }
      );
    }
    if (isPanelPage && !isPanelGiris) {
      const url = request.nextUrl.clone();
      url.pathname = "/panel";
      url.searchParams.set("hata", "supabase-yok");
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const yetkili = user && panelEpostaIzinli(user.email);

  if (user && !yetkili) {
    await supabase.auth.signOut();
    if (isPanelPage && !isPanelGiris) {
      const url = request.nextUrl.clone();
      url.pathname = "/panel";
      url.searchParams.set("hata", "yetkisiz");
      return NextResponse.redirect(url);
    }
  }

  if (!yetkili && isPanelApi && !isCikisApi && !isOturumApi && !isGirisApi) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  if (!yetkili && isPanelPage && !isPanelGiris) {
    const url = request.nextUrl.clone();
    url.pathname = "/panel";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (yetkili && pathname === "/panel/giris") {
    const url = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get("next");
    url.pathname = next?.startsWith("/panel") ? next : "/panel";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
