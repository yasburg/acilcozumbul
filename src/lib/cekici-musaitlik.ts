import type { Cekici } from "./types";

const TZ = "Europe/Istanbul";

/** 1 = Pazartesi … 7 = Pazar (ISO) */
function istanbulGunVeDakika(now: Date): { gun: number; dakika: number } {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);

  const gunMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };

  return { gun: gunMap[weekday] ?? 1, dakika: hour * 60 + minute };
}

function saatMetniDakika(s: string | undefined | null): number | null {
  if (!s?.trim()) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

/** Müsaitlik kapalıysa veya saat dışındaysa SMS gönderilmez */
export function cekiciMusaitMi(cekici: Cekici, now = new Date()): boolean {
  if (!cekici.musaitlikAktif) return true;

  const bas = saatMetniDakika(cekici.musaitlikBaslangic);
  const bit = saatMetniDakika(cekici.musaitlikBitis);
  if (bas == null || bit == null) return true;

  const { gun, dakika } = istanbulGunVeDakika(now);
  const gunler = cekici.musaitlikGunler;
  if (gunler?.length && !gunler.includes(gun)) return false;

  if (bas <= bit) {
    return dakika >= bas && dakika < bit;
  }
  return dakika >= bas || dakika < bit;
}

export function musaitlikOzeti(
  cekici: Pick<
    Cekici,
    | "musaitlikAktif"
    | "musaitlikBaslangic"
    | "musaitlikBitis"
    | "musaitlikGunler"
  >
): string {
  if (!cekici.musaitlikAktif) return "7/24 (kısıt yok)";
  const bas = cekici.musaitlikBaslangic ?? "?";
  const bit = cekici.musaitlikBitis ?? "?";
  const gunEtiket: Record<number, string> = {
    1: "Pzt",
    2: "Sal",
    3: "Çar",
    4: "Per",
    5: "Cum",
    6: "Cmt",
    7: "Paz",
  };
  const gunler =
    cekici.musaitlikGunler?.length
      ? cekici.musaitlikGunler.map((g) => gunEtiket[g] ?? String(g)).join(", ")
      : "Her gün";
  return `${gunler} · ${bas}–${bit}`;
}
