/** TÜİK ADNKS yaklaşık il nüfusları (2023) — pazarlama tahmini için */
export const TURKIYE_IL_NUFUS: Record<string, number> = {
  Adana: 2_274_106,
  Adıyaman: 635_169,
  Afyonkarahisar: 751_344,
  Ağrı: 511_238,
  Aksaray: 438_504,
  Amasya: 339_529,
  Ankara: 5_803_482,
  Antalya: 2_696_249,
  Ardahan: 92_819,
  Artvin: 169_403,
  Aydın: 1_161_702,
  Balıkesir: 1_257_590,
  Bartın: 203_351,
  Batman: 647_205,
  Bayburt: 86_047,
  Bilecik: 228_673,
  Bingöl: 282_789,
  Bitlis: 359_747,
  Bolu: 320_824,
  Burdur: 273_799,
  Bursa: 3_214_571,
  Çanakkale: 559_383,
  Çankırı: 195_789,
  Çorum: 524_130,
  Denizli: 1_059_025,
  Diyarbakır: 1_804_880,
  Düzce: 409_865,
  Edirne: 414_881,
  Elazığ: 604_411,
  Erzincan: 239_223,
  Erzurum: 749_754,
  Eskişehir: 915_418,
  Gaziantep: 2_164_134,
  Giresun: 450_862,
  Gümüşhane: 144_544,
  Hakkari: 287_625,
  Hatay: 1_544_640,
  Iğdır: 209_555,
  Isparta: 449_777,
  İstanbul: 15_655_924,
  İzmir: 4_479_525,
  Kahramanmaraş: 1_177_436,
  Karabük: 252_058,
  Karaman: 260_838,
  Kars: 274_829,
  Kastamonu: 383_373,
  Kayseri: 1_445_683,
  Kırıkkale: 277_046,
  Kırklareli: 377_156,
  Kırşehir: 247_179,
  Kilis: 156_739,
  Kocaeli: 2_102_907,
  Konya: 2_320_241,
  Kütahya: 575_897,
  Malatya: 812_580,
  Manisa: 1_468_279,
  Mardin: 888_874,
  Mersin: 1_938_389,
  Muğla: 1_066_736,
  Muş: 399_202,
  Nevşehir: 315_994,
  Niğde: 372_249,
  Ordu: 775_800,
  Osmaniye: 559_405,
  Rize: 350_420,
  Sakarya: 1_098_115,
  Samsun: 1_377_546,
  Siirt: 347_412,
  Sinop: 220_799,
  Sivas: 650_289,
  Şanlıurfa: 2_237_941,
  Şırnak: 570_745,
  Tekirdağ: 1_167_059,
  Tokat: 606_547,
  Trabzon: 824_352,
  Tunceli: 86_612,
  Uşak: 375_454,
  Van: 1_128_749,
  Yalova: 304_780,
  Yozgat: 420_517,
  Zonguldak: 591_635,
};

/** Nüfusun binde 0,44’ü (= %0,044) — günlük talep tahmini */
export const YOL_YARDIM_TALEP_NUFUS_ORANI = 0.00044;

export function ilNufusBul(sehir: string): number | null {
  const s = sehir.trim();
  if (!s) return null;
  if (TURKIYE_IL_NUFUS[s] != null) return TURKIYE_IL_NUFUS[s];
  const bulunan = Object.keys(TURKIYE_IL_NUFUS).find(
    (il) => il.localeCompare(s, "tr", { sensitivity: "accent" }) === 0
  );
  return bulunan ? TURKIYE_IL_NUFUS[bulunan] : null;
}

/** Son ünlüye göre ’da / ’de / ’ta / ’te */
export function sehirdeYazi(sehir: string): string {
  const n = sehir.trim();
  const unluler = n.toLocaleLowerCase("tr-TR").match(/[aeıioöuü]/g);
  const son = unluler?.[unluler.length - 1] ?? "a";
  const ince = son === "e" || son === "i" || son === "ö" || son === "ü";
  const sert = /[pçtkfşhs]$/i.test(n);
  if (sert) return ince ? `${n}’te` : `${n}’ta`;
  return ince ? `${n}’de` : `${n}’da`;
}

/** Günlük talep tahmini: nüfus × %0,044, 10’a yukarı yuvarlanır */
export function sehirYolYardimTalepTahmini(sehir: string): number | null {
  const nufus = ilNufusBul(sehir);
  if (nufus == null) return null;
  const ham = nufus * YOL_YARDIM_TALEP_NUFUS_ORANI;
  return Math.max(10, Math.ceil(ham / 10) * 10);
}

export type SehirYolYardimTalepParcalari = {
  sehirde: string;
  adet: number;
  adetYazi: string;
};

export function sehirYolYardimTalepParcalari(
  sehir: string
): SehirYolYardimTalepParcalari | null {
  const adet = sehirYolYardimTalepTahmini(sehir);
  if (adet == null) return null;
  return {
    sehirde: sehirdeYazi(sehir),
    adet,
    adetYazi: adet.toLocaleString("tr-TR"),
  };
}

/** Düz metin (test / SMS); UI’da parçalı render tercih edilir */
export function sehirYolYardimTalepMetni(sehir: string): string | null {
  const p = sehirYolYardimTalepParcalari(sehir);
  if (!p) return null;
  return `${p.sehirde} günde yaklaşık ${p.adetYazi} yol yardım talebi oluyor.`;
}

/** Nüfusa göre en büyük N il (TÜİK listesinden) */
export function enBuyukIller(adet = 5): string[] {
  return Object.entries(TURKIYE_IL_NUFUS)
    .sort((a, b) => b[1] - a[1])
    .slice(0, adet)
    .map(([il]) => il);
}

/**
 * Şehir seçim sırası: en büyük 5 il üstte (listede varsa),
 * kalanlar Türkçe alfabetik.
 */
export function illerSecimSirasi(iller: readonly string[]): string[] {
  const set = new Set(iller);
  const ust = enBuyukIller(5).filter((il) => set.has(il));
  const ustSet = new Set(ust);
  const diger = iller
    .filter((il) => !ustSet.has(il))
    .sort((a, b) => a.localeCompare(b, "tr"));
  return [...ust, ...diger];
}
