import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import {
  SMS50_GOVDE_SABLONLARI,
  SMS50_KAMPANYA_KODU,
  SMS50_VARYANTLAR,
  sms50FooterSatirlari,
  sms50KisaUrl,
} from "@/lib/sms50-kampanya";

/** Toplu SMS UI: şablonlar, footer (sunucu env), harf listesi */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !panelEpostaIzinli(user.email)) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  return NextResponse.json({
    kampanya: SMS50_KAMPANYA_KODU,
    varyantlar: SMS50_VARYANTLAR,
    sablonlar: SMS50_GOVDE_SABLONLARI,
    footerSatirlari: sms50FooterSatirlari(),
    ornekLink: sms50KisaUrl("a"),
  });
}
