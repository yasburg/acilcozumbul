import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/route-handler";
import {
  panelEpostaIzinli,
  panelMuhasebeAnaSayfa,
  panelRol,
  supabaseYapilandirildi,
  supabaseYapilandirmaHataMesaji,
} from "@/lib/supabase/env";
import { epostaGecerliMi, epostaNormalize } from "@/lib/eposta";

export async function POST(request: NextRequest) {
  if (!supabaseYapilandirildi()) {
    return NextResponse.json(
      {
        error:
          supabaseYapilandirmaHataMesaji() ||
          "Supabase yapılandırması eksik.",
      },
      { status: 503 }
    );
  }

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

  const { supabase, applyCookies } = createSupabaseRouteHandlerClient(request);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: eposta,
    password: sifre,
  });

  if (error || !data.user) {
    const mesaj =
      error?.message === "Invalid login credentials"
        ? "E-posta veya şifre hatalı. Supabase Authentication’da bu kullanıcı tanımlı mı?"
        : error?.message ?? "Giriş başarısız.";
    return NextResponse.json({ error: mesaj }, { status: 401 });
  }

  if (!panelEpostaIzinli(data.user.email)) {
    await supabase.auth.signOut();
    return NextResponse.json(
      { error: "Bu hesabın yönetim paneline erişim yetkisi yok." },
      { status: 403 }
    );
  }

  return applyCookies(
    NextResponse.json({
      ok: true,
      eposta: data.user.email,
      rol: panelRol(data.user.email),
      anaSayfa:
        panelRol(data.user.email) === "muhasebe"
          ? panelMuhasebeAnaSayfa()
          : "/panel",
    })
  );
}
