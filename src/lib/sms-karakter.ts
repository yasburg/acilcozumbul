/**
 * Netgsm toplu SMS (başlıklı, dil=TR) karakter hesabı.
 * @see https://bilgibankasi.netgsm.com.tr/bilgi-bankasi/karakter-mesaj-boyu-hesaplama/
 *
 * 1 SMS = 150 birim (Türkçe destekli).
 * «ç ğ ı ş Ğ İ Ş» 2 birim; diğer karakterler 1 birim.
 */

const NETGSM_TR_CIFTE = new Set([
  "ç",
  "ğ",
  "ı",
  "ş",
  "Ç",
  "Ğ",
  "İ",
  "Ş",
]);

/** 1 SMS (Türkçe) için birim limiti */
export const NETGSM_TOPLU_SMS_BIRIM = 150;

/**
 * Uzun SMS üst sınırı (3 parça). Panel toplu gönderimde maliyet kontrolü.
 */
export const NETGSM_TOPLU_SMS_MAX_BIRIM = NETGSM_TOPLU_SMS_BIRIM * 3;

export function netgsmSmsBirimHesapla(mesaj: string): number {
  let birim = 0;
  for (const ch of mesaj) {
    birim += NETGSM_TR_CIFTE.has(ch) ? 2 : 1;
  }
  return birim;
}

export function netgsmSmsParcaSayisi(birim: number): number {
  if (birim <= 0) return 0;
  return Math.ceil(birim / NETGSM_TOPLU_SMS_BIRIM);
}

export function netgsmSmsMesajGecerliMi(mesaj: string): {
  gecerli: boolean;
  birim: number;
  parca: number;
  kalan: number;
  hata?: string;
} {
  const birim = netgsmSmsBirimHesapla(mesaj);
  const parca = netgsmSmsParcaSayisi(birim);
  const kalan = Math.max(0, NETGSM_TOPLU_SMS_MAX_BIRIM - birim);
  if (!mesaj.trim()) {
    return { gecerli: false, birim, parca, kalan, hata: "Mesaj boş olamaz." };
  }
  if (birim > NETGSM_TOPLU_SMS_MAX_BIRIM) {
    return {
      gecerli: false,
      birim,
      parca,
      kalan: 0,
      hata: `Mesaj çok uzun (max ${NETGSM_TOPLU_SMS_MAX_BIRIM} birim ≈ ${NETGSM_TOPLU_SMS_MAX_BIRIM / NETGSM_TOPLU_SMS_BIRIM} SMS).`,
    };
  }
  return { gecerli: true, birim, parca, kalan };
}

/** maxBirim’e sığan önek (code point güvenli) */
export function netgsmSmsKesimMetni(
  mesaj: string,
  maxBirim = NETGSM_TOPLU_SMS_BIRIM
): string {
  const chars = Array.from(mesaj);
  let birim = 0;
  let end = 0;
  for (; end < chars.length; end++) {
    const ch = chars[end]!;
    const ek = NETGSM_TR_CIFTE.has(ch) ? 2 : 1;
    if (birim + ek > maxBirim) break;
    birim += ek;
  }
  return chars.slice(0, end).join("");
}

/**
 * Mesajı Netgsm birimine göre böler.
 * Mümkünse kelime/satır sonunda keser (min ~%40 doluluk).
 */
export function netgsmSmsOtomatikBol(
  mesaj: string,
  maxBirim = NETGSM_TOPLU_SMS_BIRIM
): string[] {
  const parts: string[] = [];
  let rest = mesaj;
  while (rest.length > 0) {
    if (netgsmSmsBirimHesapla(rest) <= maxBirim) {
      parts.push(rest);
      break;
    }
    let chunk = netgsmSmsKesimMetni(rest, maxBirim);
    if (!chunk) {
      /* tek karakter bile sığmıyorsa (olmamalı) zorla kes */
      chunk = Array.from(rest)[0] ?? "";
    }
    const soft = Math.max(
      chunk.lastIndexOf(" "),
      chunk.lastIndexOf("\n"),
      chunk.lastIndexOf("\t")
    );
    if (soft >= Math.floor(chunk.length * 0.4)) {
      /* Ayırıcıyı ilk parçada tut — join("") ile birleştirince boşluk kaybolmasın */
      chunk = chunk.slice(0, soft + 1);
    }
    parts.push(chunk);
    rest = rest.slice(chunk.length);
  }
  return parts.filter((p) => p.length > 0);
}

/** İki komşu bölümün birleşiminde kesim noktasını (code point index) ayarla */
export function netgsmSmsSinirAyarla(
  sol: string,
  sag: string,
  yeniSolCodePointSayisi: number
): [string, string] {
  const chars = Array.from(sol + sag);
  const n = Math.max(0, Math.min(chars.length, Math.floor(yeniSolCodePointSayisi)));
  return [chars.slice(0, n).join(""), chars.slice(n).join("")];
}

/** Bölüm listesi geçerli mi (her parça ≤150, toplam ≤450, boş yok) */
export function netgsmSmsBolumlerGecerliMi(bolumler: string[]): {
  gecerli: boolean;
  hata?: string;
  toplamBirim: number;
  parcaDetay: { birim: number; fazla: boolean }[];
} {
  const temiz = bolumler.map((b) => b.trim()).filter(Boolean);
  if (temiz.length === 0) {
    return { gecerli: false, hata: "Mesaj boş olamaz.", toplamBirim: 0, parcaDetay: [] };
  }
  const parcaDetay = temiz.map((b) => {
    const birim = netgsmSmsBirimHesapla(b);
    return { birim, fazla: birim > NETGSM_TOPLU_SMS_BIRIM };
  });
  const toplamBirim = parcaDetay.reduce((s, p) => s + p.birim, 0);
  if (parcaDetay.some((p) => p.fazla)) {
    return {
      gecerli: false,
      hata: `Her SMS en fazla ${NETGSM_TOPLU_SMS_BIRIM} birim olmalı. Sınırı kaydırın veya metni kısaltın.`,
      toplamBirim,
      parcaDetay,
    };
  }
  if (temiz.length > 3 || toplamBirim > NETGSM_TOPLU_SMS_MAX_BIRIM) {
    return {
      gecerli: false,
      hata: `En fazla 3 SMS (${NETGSM_TOPLU_SMS_MAX_BIRIM} birim).`,
      toplamBirim,
      parcaDetay,
    };
  }
  return { gecerli: true, toplamBirim, parcaDetay };
}
