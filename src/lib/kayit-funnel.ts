/** Kayıt A/B funnel katalogu — yönlendirmeler ve metinler burada */

export const KAYIT_FUNNEL_HARFLER = [
  "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
  "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
] as const;

export type KayitFunnelId = (typeof KAYIT_FUNNEL_HARFLER)[number];

export type KayitHizmetOnsecim =
  | "cekici"
  | "lastik"
  | "anahtar"
  | "birden_fazla"
  | null;

export type KayitFunnelTip = "kontrol" | "phone_first";

export type KayitFunnelTanim = {
  id: KayitFunnelId;
  etiket: string;
  tip: KayitFunnelTip;
  aktif: boolean;
  /** Reklam eşleşmesi */
  hizmetOnsecim: KayitHizmetOnsecim;
  ustBaslik: string;
  baslik: string;
  altMetin: string;
  tesvikBaslik?: string;
  tesvikMetin?: string;
};

/** SMS / eski linklerin varsayılan hedefi */
export const KAYIT_FUNNEL_VARSAYILAN: KayitFunnelId = "a";

export const KAYIT_FUNNELS: Record<KayitFunnelId, KayitFunnelTanim> = {
  a: {
    id: "a",
    etiket: "Kontrol (eski uzun form)",
    tip: "kontrol",
    aktif: true,
    hizmetOnsecim: null,
    ustBaslik: "İSTANBUL’DA HİZMET VERENLERE",
    baslik: "Ücretsiz kayıt",
    altMetin: "Mevcut kayıt akışı (kontrol grubu).",
  },
  b: {
    id: "b",
    etiket: "Phone-first · Çekici",
    tip: "phone_first",
    aktif: true,
    hizmetOnsecim: "cekici",
    ustBaslik: "İSTANBUL’DA ÇEKİCİLERE ÖZEL",
    baslik: "Yakınlarda çekici arayanlar telefonunuza SMS olarak gelsin.",
    altMetin:
      "Müşteri talep oluşturur. Fiyatınızı ve kaç dakikada varacağınızı yazarsınız. Müşteri sizi seçerse telefon ve konum açılır.",
  },
  c: {
    id: "c",
    etiket: "Phone-first · Lastikçi",
    tip: "phone_first",
    aktif: true,
    hizmetOnsecim: "lastik",
    ustBaslik: "İSTANBUL’DA MOBİL LASTİKÇİLERE ÖZEL",
    baslik: "Yakınınızdaki mobil lastik taleplerini telefonunuzdan görün.",
    altMetin:
      "Bölgenizde lastik talebi açıldığında bildirim alırsınız. Fiyatınızı yazın; müşteri sizi seçerse telefon ve konum açılır.",
    tesvikBaslik: "İstanbul erken kayıt avantajı",
    tesvikMetin: "İlk 20 talep bildirimi ücretsiz",
  },
  d: {
    id: "d",
    etiket: "Phone-first · Anahtarcı",
    tip: "phone_first",
    aktif: true,
    hizmetOnsecim: "anahtar",
    ustBaslik: "İSTANBUL’DA ARAÇ ANAHTARCILARINA ÖZEL",
    baslik: "Bölgenizde araç anahtarı işi açıldığında teklif verin.",
    altMetin:
      "Yeni talep gelince SMS alın. Fiyat ve varış sürenizi yazın; seçilirseniz müşteri bilgileri açılır.",
    tesvikBaslik: "İstanbul erken kayıt avantajı",
    tesvikMetin: "İlk 20 talep bildirimi ücretsiz",
  },
  e: placeholder("e"),
  f: placeholder("f"),
  g: placeholder("g"),
  h: placeholder("h"),
  i: placeholder("i"),
  j: placeholder("j"),
  k: placeholder("k"),
  l: placeholder("l"),
  m: placeholder("m"),
  n: placeholder("n"),
  o: placeholder("o"),
  p: placeholder("p"),
  q: placeholder("q"),
  r: placeholder("r"),
  s: placeholder("s"),
  t: placeholder("t"),
  u: placeholder("u"),
  v: placeholder("v"),
  w: placeholder("w"),
  x: placeholder("x"),
  y: placeholder("y"),
  z: placeholder("z"),
};

function placeholder(id: KayitFunnelId): KayitFunnelTanim {
  return {
    id,
    etiket: `Yuva ${id.toUpperCase()} (boş)`,
    tip: "phone_first",
    aktif: false,
    hizmetOnsecim: null,
    ustBaslik: "İSTANBUL",
    baslik: "Yakında",
    altMetin: "",
  };
}

export function kayitFunnelMi(v: string): v is KayitFunnelId {
  return /^[a-z]$/.test(v) && (KAYIT_FUNNEL_HARFLER as readonly string[]).includes(v);
}

export function kayitFunnelGetir(v: string): KayitFunnelTanim | null {
  if (!kayitFunnelMi(v)) return null;
  return KAYIT_FUNNELS[v];
}

export function kayitFunnelYolu(v: KayitFunnelId): string {
  return `/kayit/${v}`;
}

/** Aktif ölçülebilir funneller (panel tablosu) */
export function kayitFunnelAktifListe(): KayitFunnelTanim[] {
  return KAYIT_FUNNEL_HARFLER.map((id) => KAYIT_FUNNELS[id]).filter((f) => f.aktif);
}

/**
 * Hizmet önseçimine göre kurulum adım 3 için sorun tipi önerisi.
 */
export function kayitHizmetSorunOnerisi(
  h: KayitHizmetOnsecim
): string[] {
  switch (h) {
    case "cekici":
      return ["cekici", "ariza", "kaza"];
    case "lastik":
      return ["lastik"];
    case "anahtar":
      return ["kilit"];
    case "birden_fazla":
      return ["cekici", "lastik", "kilit", "aku", "yakit", "ariza", "kaza"];
    default:
      return [];
  }
}
