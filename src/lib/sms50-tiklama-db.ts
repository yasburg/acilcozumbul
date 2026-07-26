import { createHash } from "crypto";
import { getSupabaseAdmin, supabaseDbAktif } from "./supabase/admin";
import {
  SMS50_KAMPANYA_KODU,
  SMS50_TEST_VARYANT,
  SMS50_VARYANTLAR,
  type Sms50Varyant,
  sms50KisaUrl,
} from "./sms50-kampanya";
import { smsKampanyaTokenTablosuVar } from "./sms50-token";

let tiklamaTabloVar: boolean | null = null;

export async function smsKampanyaTiklamaTablosuVar(): Promise<boolean> {
  if (tiklamaTabloVar !== null) return tiklamaTabloVar;
  if (!supabaseDbAktif()) {
    tiklamaTabloVar = false;
    return false;
  }
  const { error } = await getSupabaseAdmin()
    .from("sms_kampanya_tiklama")
    .select("id")
    .limit(1);
  tiklamaTabloVar = !error;
  return tiklamaTabloVar;
}

export async function kaydetSmsKampanyaTiklama(opts: {
  varyant: Sms50Varyant;
  kampanyaKodu?: string;
  userAgent?: string | null;
  ip?: string | null;
}): Promise<void> {
  if (!(await smsKampanyaTiklamaTablosuVar())) return;
  const ipHash = opts.ip
    ? createHash("sha256").update(opts.ip).digest("hex").slice(0, 16)
    : null;
  const { error } = await getSupabaseAdmin()
    .from("sms_kampanya_tiklama")
    .insert({
      varyant: opts.varyant,
      kampanya_kodu: opts.kampanyaKodu ?? SMS50_KAMPANYA_KODU,
      user_agent: opts.userAgent?.slice(0, 500) ?? null,
      ip_hash: ipHash,
    });
  if (error) {
    console.error("[sms50] tıklama kaydı", error.message);
  }
}

export type Sms50VaryantOzet = {
  varyant: Sms50Varyant;
  kisaUrl: string;
  gonderilen: number;
  /** Benzersiz tıklayan (token: telefon; değilse ip_hash) */
  tiklama: number;
  ctr: number | null;
  /** SMS50’ye bağlanan kayıt (token kayit_at veya gönderilen∩çekici) */
  kayit: number;
  /** kayıt ÷ gönderilen */
  kayitOranGonderim: number | null;
  /** kayıt ÷ tıklama */
  kayitOranTiklama: number | null;
  sonTiklama: string | null;
};

export function sms50Oran(pay: number, payda: number): number | null {
  if (!(payda > 0)) return null;
  return pay / payda;
}

/**
 * Aynı kişinin tekrar tıklamasını tek say — ip_hash; yoksa satır id.
 * Token’lı gönderimde `getSms50VaryantOzetleri` telefon ile daha doğru sayar.
 */
export function sms50BenzersizTiklamaSay(
  rows: {
    id?: string | null;
    varyant?: string | null;
    ip_hash?: string | null;
  }[]
): Map<string, number> {
  const anahtarlar = new Map<string, Set<string>>();
  for (const row of rows) {
    const v = String(row.varyant ?? "");
    if (!v) continue;
    const ip = row.ip_hash ? String(row.ip_hash) : "";
    const key = ip ? `ip:${ip}` : `row:${String(row.id ?? "")}`;
    if (key === "row:") continue;
    let set = anahtarlar.get(v);
    if (!set) {
      set = new Set();
      anahtarlar.set(v, set);
    }
    set.add(key);
  }
  const out = new Map<string, number>();
  for (const [v, set] of anahtarlar) out.set(v, set.size);
  return out;
}

/** 0=Pazartesi … 6=Pazar (Europe/Istanbul) */
export function sms50TiklamaGunSaat(iso: string): {
  gun: number;
  saat: number;
} | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(d);
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hourRaw = parts.find((p) => p.type === "hour")?.value;
  const gunMap: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  const gun = gunMap[wd];
  const saat = hourRaw != null ? Number(hourRaw) : NaN;
  if (gun == null || !Number.isFinite(saat) || saat < 0 || saat > 23) {
    return null;
  }
  return { gun, saat };
}

export type Sms50TiklamaSaatIzgarasi = {
  /** grid[gun][saat] — 7×24 */
  grid: number[][];
  gunToplam: number[];
  saatToplam: number[];
  toplam: number;
  maxHucre: number;
};

export const SMS50_HAFTA_TUMU = "tumu";

export type Sms50TiklamaSatir = {
  olusturulma?: string | null;
  varyant?: string | null;
};

export type Sms50HaftaSecenegi = {
  /** `tumu` veya Pazartesi YYYY-MM-DD (Europe/Istanbul) */
  id: string;
  /** Veri olan ilk hafta = 1; Tümü için null */
  sira: number | null;
  etiket: string;
};

/** Tıklamanın Istanbul takviminde düştüğü haftanın Pazartesi’si (YYYY-MM-DD) */
export function sms50IstanbulPazartesiYmd(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(d);
  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "";
  const gunMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const gun = gunMap[wd];
  if (!y || !m || !day || gun == null) return null;
  const daysFromMonday = gun === 0 ? 6 : gun - 1;
  /* Takvim günü aritmetiği (Istanbul Y-M-D) */
  const utcMs = Date.UTC(y, m - 1, day) - daysFromMonday * 86_400_000;
  const mon = new Date(utcMs);
  const yy = mon.getUTCFullYear();
  const mm = String(mon.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(mon.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function sms50YmdEkle(ymd: string, gun: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const utcMs = Date.UTC(y!, m! - 1, d!) + gun * 86_400_000;
  const x = new Date(utcMs);
  return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, "0")}-${String(x.getUTCDate()).padStart(2, "0")}`;
}

function sms50YmdKisaTr(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!, 12));
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  }).format(dt);
}

export function sms50HaftaAralikEtiket(pazartesiYmd: string): string {
  const pazar = sms50YmdEkle(pazartesiYmd, 6);
  return `${sms50YmdKisaTr(pazartesiYmd)} – ${sms50YmdKisaTr(pazar)}`;
}

function sms50SatirGrafikte(row: Sms50TiklamaSatir): boolean {
  return String(row.varyant ?? "").toLowerCase() !== SMS50_TEST_VARYANT;
}

/** Tümü + veri olan haftalar (yeniden eskiye); sıra = kampanyadaki 1. haftadan */
export function sms50HaftaSecenekleri(
  rows: Sms50TiklamaSatir[]
): Sms50HaftaSecenegi[] {
  const keys = new Set<string>();
  for (const row of rows) {
    if (!sms50SatirGrafikte(row)) continue;
    const key = sms50IstanbulPazartesiYmd(String(row.olusturulma ?? ""));
    if (key) keys.add(key);
  }
  const asc = [...keys].sort();
  const haftalar: Sms50HaftaSecenegi[] = asc.map((id, i) => ({
    id,
    sira: i + 1,
    etiket: `${i + 1}. hafta · ${sms50HaftaAralikEtiket(id)}`,
  }));
  return [
    { id: SMS50_HAFTA_TUMU, sira: null, etiket: "Tümü" },
    ...haftalar.reverse(),
  ];
}

export function sms50SatirlariHaftaFiltrele(
  rows: Sms50TiklamaSatir[],
  haftaId: string
): Sms50TiklamaSatir[] {
  if (haftaId === SMS50_HAFTA_TUMU || !haftaId) return rows;
  return rows.filter((row) => {
    if (!sms50SatirGrafikte(row)) return true; /* z zaten izgarada atılır */
    return (
      sms50IstanbulPazartesiYmd(String(row.olusturulma ?? "")) === haftaId
    );
  });
}

/** Test varyantı (z) hariç gün×saat ızgarası */
export function sms50TiklamaSatirlarindanIzgara(
  rows: Sms50TiklamaSatir[]
): Sms50TiklamaSaatIzgarasi {
  const grid = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 0)
  );
  const gunToplam = Array.from({ length: 7 }, () => 0);
  const saatToplam = Array.from({ length: 24 }, () => 0);
  let toplam = 0;
  let maxHucre = 0;

  for (const row of rows) {
    if (!sms50SatirGrafikte(row)) continue;
    const gs = sms50TiklamaGunSaat(String(row.olusturulma ?? ""));
    if (!gs) continue;
    grid[gs.gun]![gs.saat]! += 1;
    gunToplam[gs.gun]! += 1;
    saatToplam[gs.saat]! += 1;
    toplam += 1;
    maxHucre = Math.max(maxHucre, grid[gs.gun]![gs.saat]!);
  }

  return { grid, gunToplam, saatToplam, toplam, maxHucre };
}

export async function getSms50TiklamaSatirlari(
  kampanyaKodu = SMS50_KAMPANYA_KODU
): Promise<Sms50TiklamaSatir[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("sms_kampanya_tiklama")
    .select("olusturulma, varyant")
    .eq("kampanya_kodu", kampanyaKodu);
  if (error) throw error;
  return data ?? [];
}

export async function getSms50TiklamaSaatIzgarasi(
  kampanyaKodu = SMS50_KAMPANYA_KODU
): Promise<Sms50TiklamaSaatIzgarasi> {
  const rows = await getSms50TiklamaSatirlari(kampanyaKodu);
  return sms50TiklamaSatirlarindanIzgara(rows);
}

export async function getSms50VaryantOzetleri(
  kampanyaKodu = SMS50_KAMPANYA_KODU
): Promise<Sms50VaryantOzet[]> {
  const sb = getSupabaseAdmin();

  const [tiklamaRes, gonderimRes, tokenTablo] = await Promise.all([
    sb
      .from("sms_kampanya_tiklama")
      .select("id, varyant, olusturulma, ip_hash")
      .eq("kampanya_kodu", kampanyaKodu),
    sb
      .from("panel_toplu_sms_listeler")
      .select("id, varyant, basarili, olusturulma")
      .eq("kampanya_kodu", kampanyaKodu),
    smsKampanyaTokenTablosuVar(),
  ]);

  if (tiklamaRes.error) throw tiklamaRes.error;
  /* kampanya_kodu kolonu yoksa gönderim özeti boş kalsın */
  const gonderimRows = gonderimRes.error ? [] : (gonderimRes.data ?? []);
  const tiklamaRows = tiklamaRes.data ?? [];

  /** Ortak link / token’sız: IP ile benzersiz */
  const tiklamaSayIp = sms50BenzersizTiklamaSay(tiklamaRows);
  const sonTiklama = new Map<string, string>();
  for (const row of tiklamaRows) {
    const v = String(row.varyant ?? "");
    const t = String(row.olusturulma ?? "");
    const onceki = sonTiklama.get(v);
    if (!onceki || t > onceki) sonTiklama.set(v, t);
  }

  /** Kişiye özel link: aynı telefon tekrar tıklasa 1 */
  const tiklamaSayToken = new Map<string, number>();
  const tokenVaryantVar = new Set<string>();

  const gonderilen = new Map<string, number>();
  const listeIdsByVaryant = new Map<string, string[]>();
  for (const row of gonderimRows) {
    const v = String(row.varyant ?? "");
    if (!v) continue;
    gonderilen.set(v, (gonderilen.get(v) ?? 0) + (Number(row.basarili) || 0));
    const id = String(row.id ?? "");
    if (!id) continue;
    const arr = listeIdsByVaryant.get(v) ?? [];
    arr.push(id);
    listeIdsByVaryant.set(v, arr);
  }

  /** varyant → kayıtlı telefon seti */
  const kayitTelefonlar = new Map<string, Set<string>>();
  function kayitEkle(varyant: string, telefon: string) {
    const t = telefon.trim();
    if (!t || !varyant) return;
    let set = kayitTelefonlar.get(varyant);
    if (!set) {
      set = new Set();
      kayitTelefonlar.set(varyant, set);
    }
    set.add(t);
  }

  if (tokenTablo) {
    const { data: tokenRows, error: tokenErr } = await sb
      .from("sms_kampanya_link_token")
      .select("varyant, telefon, kayit_at, ilk_tiklama")
      .eq("kampanya_kodu", kampanyaKodu);
    if (!tokenErr) {
      const tiklayanTelefon = new Map<string, Set<string>>();
      for (const row of tokenRows ?? []) {
        const v = String(row.varyant ?? "");
        if (!v) continue;
        tokenVaryantVar.add(v);
        const tel = String(row.telefon ?? "").trim();
        if (row.kayit_at) kayitEkle(v, tel);
        if (row.ilk_tiklama && tel) {
          let set = tiklayanTelefon.get(v);
          if (!set) {
            set = new Set();
            tiklayanTelefon.set(v, set);
          }
          set.add(tel);
        }
      }
      for (const [v, set] of tiklayanTelefon) {
        tiklamaSayToken.set(v, set.size);
      }
    }
  }

  /* Ortak (token’sız) link: o harfle gönderilmiş telefonlar ∩ çekiciler */
  const tumListeIdleri = [...new Set([...listeIdsByVaryant.values()].flat())];
  if (tumListeIdleri.length > 0) {
    const telefonByListe = new Map<string, string[]>();
    const CHUNK = 100;
    for (let i = 0; i < tumListeIdleri.length; i += CHUNK) {
      const parti = tumListeIdleri.slice(i, i + CHUNK);
      const { data: aliciRows, error: aliciErr } = await sb
        .from("panel_toplu_sms_liste_alicilar")
        .select("liste_id, telefon, basarili")
        .in("liste_id", parti)
        .eq("basarili", true);
      if (aliciErr) break;
      for (const row of aliciRows ?? []) {
        const lid = String(row.liste_id ?? "");
        const tel = String(row.telefon ?? "").trim();
        if (!lid || !tel) continue;
        const arr = telefonByListe.get(lid) ?? [];
        arr.push(tel);
        telefonByListe.set(lid, arr);
      }
    }

    const adayTelefonlar = [
      ...new Set([...telefonByListe.values()].flat()),
    ];
    const kayitliSet = new Set<string>();
    const TEL_CHUNK = 200;
    for (let i = 0; i < adayTelefonlar.length; i += TEL_CHUNK) {
      const parti = adayTelefonlar.slice(i, i + TEL_CHUNK);
      const { data: cekiciler } = await sb
        .from("cekiciler")
        .select("telefon")
        .in("telefon", parti);
      for (const c of cekiciler ?? []) {
        if (c.telefon) kayitliSet.add(String(c.telefon));
      }
    }

    for (const [varyant, listeIds] of listeIdsByVaryant) {
      for (const lid of listeIds) {
        for (const tel of telefonByListe.get(lid) ?? []) {
          if (kayitliSet.has(tel)) kayitEkle(varyant, tel);
        }
      }
    }
  }

  return SMS50_VARYANTLAR.map((varyant) => {
    const g = gonderilen.get(varyant) ?? 0;
    /* Token’lı harfte telefon; değilse IP benzersiz tıklama */
    const t = tokenVaryantVar.has(varyant)
      ? (tiklamaSayToken.get(varyant) ?? 0)
      : (tiklamaSayIp.get(varyant) ?? 0);
    const k = kayitTelefonlar.get(varyant)?.size ?? 0;
    return {
      varyant,
      kisaUrl: sms50KisaUrl(varyant),
      gonderilen: g,
      tiklama: t,
      ctr: sms50Oran(t, g),
      kayit: k,
      kayitOranGonderim: sms50Oran(k, g),
      kayitOranTiklama: sms50Oran(k, t),
      sonTiklama: sonTiklama.get(varyant) ?? null,
    };
  });
}
