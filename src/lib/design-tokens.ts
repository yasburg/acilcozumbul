/** ACB design tokens — keep in sync with `globals.css` `:root` vars. */
export const ACB_TOKENS = {
  green: "#089B2D",
  greenHover: "#077F25",
  dark: "#1B2D2A",
  soft: "#EAF8EE",
  /** @deprecated use green — kept as alias for single-accent palette */
  orange: "#089B2D",
  orangeHover: "#077F25",
  white: "#FFFFFF",
  touchMinPx: 44,
  ctaMinPx: 52,
  radiusSm: "0.75rem",
  radius: "1rem",
  radiusLg: "1.25rem",
  springEase: "cubic-bezier(0.32, 0.72, 0, 1)",
  pressMs: 100,
} as const;

export const ACB_CTA = {
  acilYardim: "YARDIM AL",
  yardimBul: "YARDIM BUL",
  konumKullan: "Konumumu Kullan",
  konumOtomatikAl: "Konumu otomatik al",
  haritadanSec: "Haritadan Seç",
  adresAra: "Adres veya konum ara",
  cekiciAra: "ÇEKİCİ ARA",
  yardimIste: "Yardım İste",
  teklifiKabul: "TEKLİFİ KABUL ET",
  cekiciyiAra: "Çekiciyi Ara",
  fiyatHesapla: "Fiyat Hesapla",
  nasilCalisir: "Nasıl Çalışır?",
} as const;
