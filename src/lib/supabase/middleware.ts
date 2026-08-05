import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  panelEpostaIzinli,
  panelMuhasebeAnaSayfa,
  panelMuhasebeApiIzinli,
  panelMuhasebeSayfaIzinli,
  panelRol,
  supabaseYapilandirildi,
} from "./env";

/** getUser / signOut ile yazılan oturum çerezlerini yeni yanıta taşı */
function oturumCerezleriniKopyala(
  kaynak: NextResponse,
  hedef: NextResponse
): NextResponse {
  kaynak.cookies.getAll().forEach(({ name, value }) => {
    hedef.cookies.set(name, value);
  });
  return hedef;
}

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

  const rol = panelRol(user?.email);
  const yetkili = Boolean(user && panelEpostaIzinli(user.email));
  const muhasebe = rol === "muhasebe";

  if (user && !yetkili) {
    await supabase.auth.signOut();
    if (isPanelPage && !isPanelGiris) {
      const url = request.nextUrl.clone();
      url.pathname = "/panel";
      url.searchParams.set("hata", "yetkisiz");
      return oturumCerezleriniKopyala(response, NextResponse.redirect(url));
    }
  }

  if (!yetkili && isPanelApi && !isCikisApi && !isOturumApi && !isGirisApi) {
    return oturumCerezleriniKopyala(
      response,
      NextResponse.json({ error: "Giriş gerekli." }, { status: 401 })
    );
  }

  if (!yetkili && isPanelPage && !isPanelGiris) {
    const url = request.nextUrl.clone();
    url.pathname = "/panel";
    url.searchParams.set("next", pathname);
    return oturumCerezleriniKopyala(response, NextResponse.redirect(url));
  }

  if (yetkili && muhasebe && isPanelApi && !panelMuhasebeApiIzinli(pathname)) {
    return oturumCerezleriniKopyala(
      response,
      NextResponse.json(
        { error: "Bu işlem için yetkiniz yok." },
        { status: 403 }
      )
    );
  }

  if (yetkili && muhasebe && isPanelPage) {
    const ana = panelMuhasebeAnaSayfa();
    if (pathname === "/panel" || pathname === "/panel/giris") {
      const url = request.nextUrl.clone();
      const next = request.nextUrl.searchParams.get("next");
      const hedef =
        next && panelMuhasebeSayfaIzinli(next) ? next : ana;
      url.pathname = hedef;
      url.search = "";
      return oturumCerezleriniKopyala(response, NextResponse.redirect(url));
    }
    if (!panelMuhasebeSayfaIzinli(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = ana;
      url.search = "";
      return oturumCerezleriniKopyala(response, NextResponse.redirect(url));
    }
  }

  if (yetkili && !muhasebe && pathname === "/panel/giris") {
    const url = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get("next");
    url.pathname = next?.startsWith("/panel") ? next : "/panel";
    url.search = "";
    return oturumCerezleriniKopyala(response, NextResponse.redirect(url));
  }

  return response;
}
