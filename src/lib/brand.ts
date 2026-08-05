/** Staging ACB rebrand — production’da false kalır. */
export const isAcbBrand = process.env.NEXT_PUBLIC_APP_ENV === "staging";

export const ACB_BRAND = {
  logoYazili: "/brand/acb/ACB-Logo.png",
  logoIcon: "/brand/acb/ACB-Logo-App.png",
  logoSocial: "/brand/acb/ACB-Logo-Social-Media.png",
  animationPingpong: "/brand/acb/ACB-Animation-pingpong.svg",
  themeColor: "#089B2D",
  backgroundColor: "#EAF0CE",
} as const;
