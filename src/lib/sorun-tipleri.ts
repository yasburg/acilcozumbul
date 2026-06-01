export interface SorunTipi {
  id: string;
  label: string;
  icon: string;
}

/** SMS / hizmet filtresi için geçerli sorun tipi kimlikleri */
export const TUM_SORUN_TIP_IDLERI = [
  "ariza",
  "lastik",
  "aku",
  "yakit",
  "kaza",
  "kilit",
  "cekici",
  "diger",
] as const;

export type SorunTipiId = (typeof TUM_SORUN_TIP_IDLERI)[number];

export const SORUN_TIPLERI: SorunTipi[] = [
  { id: "ariza", label: "Araç arızası / çalışmıyor", icon: "⚠️" },
  { id: "lastik", label: "Lastik patladı", icon: "🛞" },
  { id: "aku", label: "Akü bitti", icon: "🔋" },
  { id: "yakit", label: "Yakıt bitti", icon: "⛽" },
  { id: "kaza", label: "Kaza / çarpışma", icon: "💥" },
  { id: "kilit", label: "Anahtar kilitlendi", icon: "🔑" },
  { id: "cekici", label: "Çekici / kurtarma lazım", icon: "🚛" },
  { id: "diger", label: "Diğer", icon: "✏️" },
];

export function sorunTipiBul(id: string): SorunTipi | undefined {
  return SORUN_TIPLERI.find((s) => s.id === id);
}

export function gecerliSorunTipi(id: string): id is SorunTipiId {
  return (TUM_SORUN_TIP_IDLERI as readonly string[]).includes(id);
}

export function tumSorunTipIdleri(): SorunTipiId[] {
  return [...TUM_SORUN_TIP_IDLERI];
}

/** Talep kaydındaki sorun tipi (yoksa diğer) */
export function talepSorunTipi(talep: { sorunTipi?: string }): SorunTipiId {
  const id = talep.sorunTipi?.trim();
  if (id && gecerliSorunTipi(id)) return id;
  return "diger";
}

export function sorunMetniOlustur(sorunTipi: string, sorunDetay?: string): string {
  const tip = sorunTipiBul(sorunTipi);
  const baslik = tip?.label ?? sorunTipi;
  if (sorunTipi === "diger" && sorunDetay?.trim()) {
    return sorunDetay.trim();
  }
  if (sorunDetay?.trim()) {
    return `${baslik}: ${sorunDetay.trim()}`;
  }
  return baslik;
}
