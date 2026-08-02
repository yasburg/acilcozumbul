import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import { getSupabaseAdmin, supabaseDbAktif } from "@/lib/supabase/admin";
import { PANEL_TALEP_MIN_OLUSTURULMA } from "@/lib/panel-talep";
import {
  talepTeklifAnalizOzetHesapla,
  talepTeklifSureKovalariHesapla,
  talepTeklifSureSatirlariHesapla,
} from "@/lib/talep-teklif-analiz";

const SAYFA = 1000;
const TEKLIF_CHUNK = 100;
const MAX_TALEP = 5000;

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

type TalepSatir = {
  id: string;
  olusturulma: string;
  durum: string;
  konum_il: string | null;
};

async function talepleriCek(
  fromIso: string,
  toIso: string
): Promise<TalepSatir[]> {
  const rows: TalepSatir[] = [];
  let offset = 0;
  for (;;) {
    const { data, error } = await getSupabaseAdmin()
      .from("talepler")
      .select("id, olusturulma, durum, konum_il")
      .gte("olusturulma", fromIso)
      .lte("olusturulma", toIso)
      .order("olusturulma", { ascending: false })
      .range(offset, offset + SAYFA - 1);
    if (error) throw error;
    const batch = (data ?? []) as TalepSatir[];
    rows.push(...batch);
    if (batch.length < SAYFA) break;
    offset += SAYFA;
    if (rows.length >= MAX_TALEP) break;
  }
  return rows.slice(0, MAX_TALEP);
}

async function teklifTarihleriCek(
  talepIds: string[]
): Promise<Map<string, { tarih: string }[]>> {
  const map = new Map<string, { tarih: string }[]>();
  for (let i = 0; i < talepIds.length; i += TEKLIF_CHUNK) {
    const chunk = talepIds.slice(i, i + TEKLIF_CHUNK);
    const { data, error } = await getSupabaseAdmin()
      .from("teklifler")
      .select("talep_id, tarih")
      .in("talep_id", chunk);
    if (error) throw error;
    for (const row of (data ?? []) as { talep_id: string; tarih: string }[]) {
      const list = map.get(row.talep_id) ?? [];
      list.push({ tarih: row.tarih });
      map.set(row.talep_id, list);
    }
  }
  return map;
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
  let from = sp.get("from")?.trim() || gunEksi(to, 6);

  let fromIso = gunBaslangicIso(from);
  if (fromIso < PANEL_TALEP_MIN_OLUSTURULMA) {
    fromIso = PANEL_TALEP_MIN_OLUSTURULMA;
    from = PANEL_TALEP_MIN_OLUSTURULMA.slice(0, 10);
  }
  const toIso = gunBitisIso(to);

  try {
    const talepler = await talepleriCek(fromIso, toIso);
    const teklifMap = await teklifTarihleriCek(talepler.map((t) => t.id));
    const satirlar = talepTeklifSureSatirlariHesapla(
      talepler.map((t) => ({
        id: t.id,
        olusturulma: t.olusturulma,
        durum: t.durum,
        sehir: t.konum_il,
      })),
      teklifMap
    );
    const ozet = talepTeklifAnalizOzetHesapla(satirlar);
    const { kovalar, teklifsiz } = talepTeklifSureKovalariHesapla(satirlar);

    return NextResponse.json({
      filtre: {
        from,
        to,
        minOlusturulma: PANEL_TALEP_MIN_OLUSTURULMA,
      },
      ozet,
      kovalar,
      teklifsiz,
      satirlar,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Analiz yüklenemedi.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
