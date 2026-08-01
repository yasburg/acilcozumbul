import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import { getSupabaseAdmin, supabaseDbAktif } from "@/lib/supabase/admin";
import {
  kayitFunnelAktifListe,
  kayitFunnelMi,
  kayitFunnelYolu,
  type KayitFunnelId,
} from "@/lib/kayit-funnel";
import {
  kayitFunnelBenzersizSession,
  kayitFunnelGunlukHesapla,
  kayitFunnelOlayHacmiHesapla,
  kayitFunnelOzetHesapla,
  kayitFunnelSessionHuniHesapla,
  type KayitFunnelOlaySatir,
} from "@/lib/kayit-funnel-olay";

const SAYFA = 1000;

function gunBaslangicIso(gun: string): string {
  return `${gun}T00:00:00.000Z`;
}

function gunBitisIso(gun: string): string {
  return `${gun}T23:59:59.999Z`;
}

function bugunUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function gunEksi(gun: string, gunSayisi: number): string {
  const d = new Date(`${gun}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - gunSayisi);
  return d.toISOString().slice(0, 10);
}

function parseFunnelFiltre(raw: string | null): KayitFunnelId[] {
  const varsayilan: KayitFunnelId[] = ["a", "b"];
  if (!raw?.trim()) return varsayilan;
  const ids = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(kayitFunnelMi);
  return ids.length ? ids : varsayilan;
}

/** Supabase varsayılan 1000 satır limiti — sayfalayarak tüm satırları al */
async function kayitFunnelOlaylariCek(opts: {
  from: string;
  to: string;
  funnels: string[];
}): Promise<{ rows: KayitFunnelOlaySatir[]; error: string | null }> {
  const rows: KayitFunnelOlaySatir[] = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await getSupabaseAdmin()
      .from("kayit_funnel_olay")
      .select("funnel, olay, session_id, olusturulma")
      .gte("olusturulma", gunBaslangicIso(opts.from))
      .lte("olusturulma", gunBitisIso(opts.to))
      .in("funnel", opts.funnels)
      .order("olusturulma", { ascending: true })
      .range(offset, offset + SAYFA - 1);
    if (error) {
      return {
        rows: [],
        error: error.message.includes("kayit_funnel_olay")
          ? "kayit_funnel_olay tablosu yok. 036/044 migration çalıştırın."
          : error.message,
      };
    }
    const batch = (data ?? []) as KayitFunnelOlaySatir[];
    rows.push(...batch);
    if (batch.length < SAYFA) break;
    offset += SAYFA;
    if (offset > 100_000) break;
  }
  return { rows, error: null };
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !panelEpostaIzinli(user.email)) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  if (!supabaseDbAktif()) {
    return NextResponse.json({ error: "Veritabanı yok." }, { status: 503 });
  }

  const sp = request.nextUrl.searchParams;
  const to = sp.get("to")?.trim() || bugunUtc();
  const from = sp.get("from")?.trim() || gunEksi(to, 6);
  const funnels = parseFunnelFiltre(sp.get("funnels"));

  const aktifIds = kayitFunnelAktifListe().map((f) => f.id);
  const listeFunnelIds =
    aktifIds.length > 0 ? aktifIds : (["a", "b"] as KayitFunnelId[]);

  const { rows: tumTarihRows, error: tumErr } = await kayitFunnelOlaylariCek({
    from,
    to,
    funnels: listeFunnelIds,
  });
  if (tumErr) {
    return NextResponse.json({ error: tumErr }, { status: 503 });
  }

  const rows = tumTarihRows.filter((r) =>
    funnels.includes(r.funnel as KayitFunnelId)
  );

  const tumTanimlar = kayitFunnelAktifListe().map((f) => ({
    id: f.id,
    etiket: f.etiket,
    yol: kayitFunnelYolu(f.id),
  }));
  const liste = kayitFunnelOzetHesapla(tumTarihRows, tumTanimlar);

  const huni = kayitFunnelSessionHuniHesapla(rows);
  const karsilastirma = funnels.map((funnel) => ({
    funnel,
    adimlar: kayitFunnelSessionHuniHesapla(
      rows.filter((r) => r.funnel === funnel)
    ),
  }));

  const session = kayitFunnelBenzersizSession(rows);
  const goruldu = rows.filter((r) => r.olay === "goruldu").length;
  const otpGonder = rows.filter((r) => r.olay === "otp_gonder").length;
  const hesap = rows.filter((r) => r.olay === "hesap").length;
  const panelHazir = rows.filter((r) => r.olay === "panel_hazir").length;

  return NextResponse.json({
    filtre: { from, to, funnels },
    ozet: {
      session,
      goruldu,
      otpGonder,
      hesap,
      panelHazir,
      hesapOran: goruldu > 0 ? hesap / goruldu : null,
      hazirOran: hesap > 0 ? panelHazir / hesap : null,
    },
    huni,
    karsilastirma,
    olayHacmi: kayitFunnelOlayHacmiHesapla(rows),
    gunluk: kayitFunnelGunlukHesapla(rows, { from, to }),
    liste,
  });
}
