import type { SmsKaydi } from "./types";

export type SmsSaglikOzet = {
  pencereSaat: number;
  toplam: number;
  basarili: number;
  basarisiz: number;
  hataOraniYuzde: number;
  alarm: boolean;
  alarmEsikYuzde: number;
  netgsmHataKodlari: Record<string, number>;
  sonBasarisiz: Array<{
    gonderim: string;
    telefon: string;
    hata?: string;
    aliciTipi?: string;
  }>;
};

function envInt(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v >= 0 ? v : fallback;
}

export function smsSaglikOzet(
  kayitlar: SmsKaydi[],
  pencereSaat = 24
): SmsSaglikOzet {
  const alarmEsik = envInt("SMS_HATA_ALARM_YUZDE", 20);
  const minOrnek = envInt("SMS_HATA_ALARM_MIN", 10);
  const since = Date.now() - pencereSaat * 60 * 60 * 1000;

  const pencere = kayitlar.filter(
    (k) => new Date(k.gonderim).getTime() >= since
  );
  const basarili = pencere.filter((k) => k.gonderildi).length;
  const basarisiz = pencere.length - basarili;
  const hataOraniYuzde =
    pencere.length > 0
      ? Math.round((basarisiz / pencere.length) * 1000) / 10
      : 0;

  const netgsmHataKodlari: Record<string, number> = {};
  for (const k of pencere) {
    if (k.gonderildi) continue;
    const kod = k.hata?.split(":")[0]?.trim() ?? "bilinmiyor";
    netgsmHataKodlari[kod] = (netgsmHataKodlari[kod] ?? 0) + 1;
  }

  const sonBasarisiz = pencere
    .filter((k) => !k.gonderildi)
    .slice(0, 8)
    .map((k) => ({
      gonderim: k.gonderim,
      telefon: k.cekiciTelefon,
      hata: k.hata,
      aliciTipi: k.aliciTipi,
    }));

  const alarm =
    pencere.length >= minOrnek && hataOraniYuzde >= alarmEsik;

  return {
    pencereSaat,
    toplam: pencere.length,
    basarili,
    basarisiz,
    hataOraniYuzde,
    alarm,
    alarmEsikYuzde: alarmEsik,
    netgsmHataKodlari,
    sonBasarisiz,
  };
}
