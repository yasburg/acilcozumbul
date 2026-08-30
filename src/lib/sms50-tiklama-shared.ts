/**
 * SMS50 tıklama grafiğinin tarayıcıda çalışabilen tarih ve ızgara yardımcıları.
 * Veritabanı erişimi içeren sms50-tiklama-db modülünden özellikle ayrıdır.
 */

/** Elle test / smoke linki; üretim grafiğine dahil edilmez. */
const SMS50_TEST_VARYANT = "z";

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
  id: string;
  sira: number | null;
  etiket: string;
};

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
  const utcMs = Date.UTC(y, m - 1, day) - daysFromMonday * 86_400_000;
  const mon = new Date(utcMs);
  return `${mon.getUTCFullYear()}-${String(mon.getUTCMonth() + 1).padStart(2, "0")}-${String(mon.getUTCDate()).padStart(2, "0")}`;
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
  return `${sms50YmdKisaTr(pazartesiYmd)} – ${sms50YmdKisaTr(sms50YmdEkle(pazartesiYmd, 6))}`;
}

function sms50SatirGrafikte(row: Sms50TiklamaSatir): boolean {
  return String(row.varyant ?? "").toLowerCase() !== SMS50_TEST_VARYANT;
}

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
  const haftalar = asc.map((id, i) => ({
    id,
    sira: i + 1,
    etiket: `${i + 1}. hafta · ${sms50HaftaAralikEtiket(id)}`,
  }));
  return [{ id: SMS50_HAFTA_TUMU, sira: null, etiket: "Tümü" }, ...haftalar.reverse()];
}

export function sms50SatirlariHaftaFiltrele(
  rows: Sms50TiklamaSatir[],
  haftaId: string
): Sms50TiklamaSatir[] {
  if (haftaId === SMS50_HAFTA_TUMU || !haftaId) return rows;
  return rows.filter((row) => {
    if (!sms50SatirGrafikte(row)) return true;
    return sms50IstanbulPazartesiYmd(String(row.olusturulma ?? "")) === haftaId;
  });
}

export function sms50TiklamaSatirlarindanIzgara(
  rows: Sms50TiklamaSatir[]
): Sms50TiklamaSaatIzgarasi {
  const grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
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
