export interface SorunTipi {
  id: string;
  label: string;
  icon: string;
}

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
