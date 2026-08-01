import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import { smsBaseUrl } from "@/lib/sms-base-url";
import { kayitFunnelAktifListe } from "@/lib/kayit-funnel";
import { sms50LinkHaritasi } from "@/lib/sms50-kampanya";
import {
  getSms50KayitFunnelHaritasi,
  sms50KayitFunnelHaritaAyarla,
} from "@/lib/sms50-kayit-funnel-harita-db";

async function panelKullanici() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !panelEpostaIzinli(user.email)) return null;
  return user;
}

export async function GET() {
  const user = await panelKullanici();
  if (!user) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const harita = await getSms50KayitFunnelHaritasi();
  const satirlar = sms50LinkHaritasi(smsBaseUrl(), harita);
  const funneller = kayitFunnelAktifListe().map((f) => ({
    id: f.id,
    etiket: f.etiket,
  }));

  return NextResponse.json({ satirlar, funneller });
}

export async function PATCH(request: NextRequest) {
  const user = await panelKullanici();
  if (!user) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  let body: { varyant?: string; kayitFunnel?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON." }, { status: 400 });
  }

  const varyant = typeof body.varyant === "string" ? body.varyant.trim() : "";
  const kayitFunnel =
    typeof body.kayitFunnel === "string" ? body.kayitFunnel.trim() : "";

  if (!varyant || !kayitFunnel) {
    return NextResponse.json(
      { error: "varyant ve kayitFunnel gerekli." },
      { status: 400 }
    );
  }

  try {
    const sonuc = await sms50KayitFunnelHaritaAyarla(varyant, kayitFunnel);
    const harita = await getSms50KayitFunnelHaritasi();
    const satir = sms50LinkHaritasi(smsBaseUrl(), harita).find(
      (s) => s.varyant === sonuc.varyant
    );
    return NextResponse.json({ ok: true, ...sonuc, satir });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Güncellenemedi.";
    const status =
      msg.includes("Geçersiz") || msg.includes("tablosu yok") ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
