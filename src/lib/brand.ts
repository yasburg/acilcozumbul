/** Staging ACB rebrand — production’da false kalır. */
export const isAcbBrand = process.env.NEXT_PUBLIC_APP_ENV === "staging";

export const ACB_BRAND = {
  /** Beyaz zemin — header / MobileShell */
  logoYazili: "/brand/acb/ACB-Logo-White-Background-Tescil.png",
  logoYaziliBoyut: { width: 827, height: 827 } as const,
  logoIcon: "/brand/acb/ACB-Logo-App.png",
  /** Favicon / PWA — ayrı dosya adları (eski 192 immutable cache’i kırar) */
  logoFavicon32: "/brand/acb/favicon-32.png",
  logoFavicon192: "/brand/acb/favicon-192.png",
  logoFavicon512: "/brand/acb/favicon-512.png",
  logoSocial: "/brand/acb/ACB-Logo-Social-Media.png",
  /** Square mark used in header morph + footer */
  logoOpening: "/brand/acb/opening-logo.png",
  animationPingpong: "/brand/acb/ACB-Animation-pingpong.svg",
  themeColor: "#089B2D",
  backgroundColor: "#EAF0CE",
} as const;
