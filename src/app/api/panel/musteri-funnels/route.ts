import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import { getSupabaseAdmin, supabaseDbAktif } from "@/lib/supabase/admin";
import {
  musteriFunnelAktifListe,
  musteriFunnelMi,
  musteriFunnelYolu,
  type MusteriFunnelId,
} from "@/lib/musteri-funnel";
import {
  musteriFunnelBenzersizSession,
  musteriFunnelGunlukHesapla,
  musteriFunnelHuniAdimlariSec,
  musteriFunnelOlayHacmiHesapla,
  musteriFunnelOzetHesapla,
  musteriFunnelSessionHuniHesapla,
  type MusteriFunnelOlaySatir,
} from "@/lib/musteri-funnel-olay";

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

function parseFunnelFiltre(raw: string | null): MusteriFunnelId[] {
  const varsayilan: MusteriFunnelId[] = ["a", "b"];
  if (!raw?.trim()) return varsayilan;
  const ids = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(musteriFunnelMi);
  return ids.length ? ids : varsayilan;
}

async function musteriFunnelOlaylariCek(opts: {
  from: string;
  to: string;
  funnels: string[];
}): Promise<{ rows: MusteriFunnelOlaySatir[]; error: string | null }> {
  const rows: MusteriFunnelOlaySatir[] = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await getSupabaseAdmin()
      .from("musteri_funnel_olay")
      .select("funnel, olay, session_id, olusturulma")
      .gte("olusturulma", gunBaslangicIso(opts.from))
      .lte("olusturulma", gunBitisIso(opts.to))
      .in("funnel", opts.funnels)
      .order("olusturulma", { ascending: true })
      .range(offset, offset + SAYFA - 1);
    if (error) {
      return {
        rows: [],
        error: error.message.includes("musteri_funnel_olay")
          ? "musteri_funnel_olay tablosu yok. 049 migration çalıştırın."
          : error.message,
      };
    }
    const batch = (data ?? []) as MusteriFunnelOlaySatir[];
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

  const aktifIds = musteriFunnelAktifListe().map((f) => f.id);
  const listeFunnelIds =
    aktifIds.length > 0 ? aktifIds : (["a", "b"] as MusteriFunnelId[]);

  const { rows: tumTarihRows, error: tumErr } = await musteriFunnelOlaylariCek({
    from,
    to,
    funnels: listeFunnelIds,
  });
  if (tumErr) {
    return NextResponse.json({ error: tumErr }, { status: 503 });
  }

  const rows = tumTarihRows.filter((r) =>
    funnels.includes(r.funnel as MusteriFunnelId)
  );

  const tumTanimlar = musteriFunnelAktifListe().map((f) => ({
    id: f.id,
    etiket: f.etiket,
    yol: musteriFunnelYolu(f.id),
  }));
  const liste = musteriFunnelOzetHesapla(tumTarihRows, tumTanimlar);

  const huniAdimlari =
    funnels.length === 1
      ? musteriFunnelHuniAdimlariSec(funnels[0])
      : musteriFunnelHuniAdimlariSec(null);
  const huni = musteriFunnelSessionHuniHesapla(rows, huniAdimlari);
  const karsilastirma = funnels.map((funnel) => ({
    funnel,
    adimlar: musteriFunnelSessionHuniHesapla(
      rows.filter((r) => r.funnel === funnel),
      musteriFunnelHuniAdimlariSec(funnel)
    ),
  }));

  const session = musteriFunnelBenzersizSession(rows);
  const goruldu = rows.filter((r) => r.olay === "goruldu").length;
  const otpGonder = rows.filter((r) => r.olay === "otp_gonder").length;
  const talep = rows.filter((r) => r.olay === "talep_olustur").length;

  return NextResponse.json({
    filtre: { from, to, funnels },
    ozet: {
      session,
      goruldu,
      otpGonder,
      talep,
      otpOran: goruldu > 0 ? otpGonder / goruldu : null,
      talepOran: goruldu > 0 ? talep / goruldu : null,
    },
    huni,
    karsilastirma,
    olayHacmi: musteriFunnelOlayHacmiHesapla(rows),
    gunluk: musteriFunnelGunlukHesapla(rows, { from, to }),
    liste,
  });
}
