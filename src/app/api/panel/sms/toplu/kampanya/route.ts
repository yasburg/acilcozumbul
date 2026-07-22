import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import {
  SMS50_KAMPANYA_KODU,
  SMS50_VARYANTLAR,
  sms50FooterSatirlari,
  sms50KisaUrl,
} from "@/lib/sms50-kampanya";
import { listeAktifSmsSablonOzetleri } from "@/lib/sms-sablon-db";

/** Toplu SMS UI: şablonlar, footer (sunucu env), harf listesi */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !panelEpostaIzinli(user.email)) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  let sablonlar: Array<{ id: string; etiket: string; govde: string }> = [];
  try {
    sablonlar = await listeAktifSmsSablonOzetleri();
  } catch (e) {
    console.error("[sms/kampanya] şablonlar", e);
  }

  return NextResponse.json({
    kampanya: SMS50_KAMPANYA_KODU,
    varyantlar: SMS50_VARYANTLAR,
    sablonlar,
    footerSatirlari: sms50FooterSatirlari(),
    ornekLink: sms50KisaUrl("a"),
  });
}
