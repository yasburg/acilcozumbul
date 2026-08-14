import { getSupabaseAdmin } from "./supabase/admin";
import type { Cekici, ProfilFotoDurum } from "./types";

export type ProfilFotoPanelSatir = {
  id: string;
  ad: string;
  telefon: string;
  sehir: string;
  profilFotoDurum: ProfilFotoDurum;
  profilFotoUrl?: string;
  profilFotoRedNedeni?: string;
  profilFotoGonderim?: string;
  /** Aktif / past_due abonelik */
  abone: boolean;
  /** En az bir kredi paketi ödemesi */
  krediAldi: boolean;
};

export type ProfilFotoPanelOzet = {
  bekleyen: number;
  onayli: number;
  reddedilen: number;
};

export type ProfilFotoPanelVerisi = {
  ozet: ProfilFotoPanelOzet;
  bekleyen: ProfilFotoPanelSatir[];
  onayli: ProfilFotoPanelSatir[];
};

export type ProfilFotoPanelZenginlestirme = {
  aboneIds?: ReadonlySet<string>;
  krediAlanIds?: ReadonlySet<string>;
};

function satirFromCekici(
  c: Cekici,
  zengin?: ProfilFotoPanelZenginlestirme
): ProfilFotoPanelSatir {
  return {
    id: c.id,
    ad: c.ad,
    telefon: c.telefon,
    sehir: c.sehir,
    profilFotoDurum: c.profilFotoDurum ?? "yok",
    profilFotoUrl: c.profilFotoUrl,
    profilFotoRedNedeni: c.profilFotoRedNedeni,
    profilFotoGonderim: c.profilFotoGonderim,
    abone: Boolean(zengin?.aboneIds?.has(c.id)),
    krediAldi: Boolean(zengin?.krediAlanIds?.has(c.id)),
  };
}

function gonderimZamani(s: ProfilFotoPanelSatir): number {
  if (!s.profilFotoGonderim) return 0;
  const t = new Date(s.profilFotoGonderim).getTime();
  return Number.isFinite(t) ? t : 0;
}

export function profilFotoPanelVerisi(
  cekiciler: Cekici[],
  zengin?: ProfilFotoPanelZenginlestirme
): ProfilFotoPanelVerisi {
  const bekleyen = cekiciler
    .filter((c) => c.profilFotoDurum === "beklemede")
    .map((c) => satirFromCekici(c, zengin))
    .sort((a, b) => gonderimZamani(b) - gonderimZamani(a));

  const onayli = cekiciler
    .filter((c) => c.profilFotoDurum === "onaylandi")
    .map((c) => satirFromCekici(c, zengin))
    .sort((a, b) => gonderimZamani(b) - gonderimZamani(a));

  const reddedilen = cekiciler.filter(
    (c) => c.profilFotoDurum === "reddedildi"
  ).length;

  return {
    ozet: {
      bekleyen: bekleyen.length,
      onayli: onayli.length,
      reddedilen,
    },
    bekleyen,
    onayli,
  };
}

async function aktifAboneCekiciIds(): Promise<Set<string>> {
  const { data, error } = await getSupabaseAdmin()
    .from("cekici_abonelik")
    .select("cekici_id")
    .in("status", ["active", "past_due"]);
  if (error) throw error;
  return new Set(
    (data ?? []).map((r) => String((r as { cekici_id: string }).cekici_id))
  );
}

async function krediSatinAlanCekiciIds(): Promise<Set<string>> {
  const ids = new Set<string>();
  const sb = getSupabaseAdmin();
  const page = 1000;
  let from = 0;
  for (;;) {
    const { data, error } = await sb
      .from("kredi_odemeler")
      .select("cekici_id")
      .eq("odeme_tipi", "kredi")
      .range(from, from + page - 1);
    if (error) throw error;
    const rows = data ?? [];
    for (const r of rows) {
      const id = String((r as { cekici_id?: string }).cekici_id ?? "");
      if (id) ids.add(id);
    }
    if (rows.length < page) break;
    from += page;
  }
  return ids;
}

/** Panel API — abone + kredi satın alma bilgisiyle. */
export async function profilFotoPanelVerisiYukle(
  cekiciler: Cekici[]
): Promise<ProfilFotoPanelVerisi> {
  const [aboneIds, krediAlanIds] = await Promise.all([
    aktifAboneCekiciIds(),
    krediSatinAlanCekiciIds(),
  ]);
  return profilFotoPanelVerisi(cekiciler, { aboneIds, krediAlanIds });
}
