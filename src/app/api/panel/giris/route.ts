import { NextRequest, NextResponse } from "next/server";
import {
  panelEpostaIzinli,
  panelMuhasebeAnaSayfa,
  panelRol,
} from "@/lib/supabase/env";
import { epostaGecerliMi, epostaNormalize } from "@/lib/eposta";
import { setPanelSessionCookie } from "@/lib/panel-auth";

export async function POST(request: NextRequest) {
  let body: { eposta?: string; sifre?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const epostaHam = String(body.eposta ?? "").trim();
  const sifre = String(body.sifre ?? "");

  if (!epostaGecerliMi(epostaHam)) {
    return NextResponse.json({ error: "Geçerli bir e-posta girin." }, { status: 400 });
  }
  if (!sifre) {
    return NextResponse.json({ error: "Şifre gerekli." }, { status: 400 });
  }

  const eposta = epostaNormalize(epostaHam);

  if (!panelEpostaIzinli(eposta)) {
    return NextResponse.json(
      { error: "Bu e-postanın yönetim paneline erişim yetkisi yok." },
      { status: 403 }
    );
  }

  const res = NextResponse.json({
    ok: true,
    eposta,
    rol: panelRol(eposta),
    anaSayfa:
      panelRol(eposta) === "muhasebe"
        ? panelMuhasebeAnaSayfa()
        : "/panel",
  });

  return setPanelSessionCookie(res, eposta);
}
