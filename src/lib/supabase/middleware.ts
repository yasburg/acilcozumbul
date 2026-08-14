import { NextResponse, type NextRequest } from "next/server";
import {
  getPanelSession,
  clearPanelSessionCookie,
} from "../panel-auth";
import {
  panelEpostaIzinli,
  panelMuhasebeAnaSayfa,
  panelMuhasebeApiIzinli,
  panelMuhasebeSayfaIzinli,
  panelRol,
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

  const session = await getPanelSession(request);
  const userEmail = session?.email;
  const rol = panelRol(userEmail);
  const yetkili = Boolean(session && panelEpostaIzinli(userEmail));
  const muhasebe = rol === "muhasebe";

  let response = NextResponse.next({ request });

  if (session && !yetkili) {
    if (isPanelPage && !isPanelGiris) {
      const url = request.nextUrl.clone();
      url.pathname = "/panel";
      url.searchParams.set("hata", "yetkisiz");
      return clearPanelSessionCookie(NextResponse.redirect(url));
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

  if (yetkili && muhasebe && isPanelApi && !panelMuhasebeApiIzinli(pathname)) {
    return NextResponse.json(
      { error: "Bu işlem için yetkiniz yok." },
      { status: 403 }
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
      return NextResponse.redirect(url);
    }
    if (!panelMuhasebeSayfaIzinli(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = ana;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (yetkili && !muhasebe && pathname === "/panel/giris") {
    const url = request.nextUrl.clone();
    const next = request.nextUrl.searchParams.get("next");
    url.pathname = next?.startsWith("/panel") ? next : "/panel";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
