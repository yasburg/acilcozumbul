import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { CerezOnayBanner } from "@/components/CerezOnayBanner";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import {
  GoogleTagManager,
  GoogleTagManagerNoscript,
  GTM_ID,
} from "@/components/GoogleTagManager";
import { MetaPixel } from "@/components/MetaPixel";
import { TikTokPixel } from "@/components/TikTokPixel";
import { PostHogProvider } from "@/components/PostHogProvider";
import {
  SEO_ACIKLAMA,
  SEO_ANAHTARLAR,
  SEO_BASLIK,
  SITE_ADI,
  SITE_URL,
  sayfaUrl,
} from "@/lib/seo";
import { ACB_BRAND, isAcbBrand } from "@/lib/brand";
import {
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_ID,
  gtagConsentBootstrapInline,
} from "@/lib/gtag";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

const brandIcon = ACB_BRAND.logoIcon;
const brandOg = isAcbBrand
  ? ACB_BRAND.logoSocial
  : "/acilcozumbul-logo-yazili.png";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO_BASLIK,
    template: `%s | ${SITE_ADI}`,
  },
  description: SEO_ACIKLAMA,
  keywords: [...SEO_ANAHTARLAR],
  authors: [{ name: SITE_ADI, url: SITE_URL }],
  creator: SITE_ADI,
  publisher: SITE_ADI,
  applicationName: SITE_ADI,
  category: "travel",
  classification: "Yol yardım ve çekici platformu",
  alternates: {
    canonical: "/",
    languages: { "tr-TR": "/" },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: SITE_ADI,
    title: SEO_BASLIK,
    description: SEO_ACIKLAMA,
    images: [
      {
        url: sayfaUrl(brandOg),
        alt: `${SITE_ADI} — acil çekici ve yol yardım`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: SEO_BASLIK,
    description: SEO_ACIKLAMA,
    images: [sayfaUrl(brandOg)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: brandIcon, type: "image/png", sizes: "1276x1276" },
      { url: "/acilcozumbul-logo-icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: brandIcon, type: "image/png", sizes: "1276x1276" }],
    shortcut: brandIcon,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_ADI,
  },
  formatDetection: {
    telephone: true,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  /* maximumScale/userScalable=false mobilde ~300ms dokunma gecikmesi + PSI INP cezası */
  themeColor: ACB_BRAND.themeColor,
};

const googleConsentGerekli = Boolean(
  GA_MEASUREMENT_ID || GOOGLE_ADS_ID || GTM_ID
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} h-full${isAcbBrand ? " brand-acb" : ""}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Consent bootstrap: next/script beforeInteractive React 19’da
          client’ta script uyarıları veriyor; head’de düz script güvenli.
        */}
        {googleConsentGerekli ? (
          <script
            id="google-consent-default"
            dangerouslySetInnerHTML={{
              __html: gtagConsentBootstrapInline(),
            }}
          />
        ) : null}
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <GoogleTagManagerNoscript />
        <GoogleTagManager />
        <GoogleAnalytics />
        <MetaPixel />
        <TikTokPixel />
        <PostHogProvider>{children}</PostHogProvider>
        <CerezOnayBanner />
      </body>
    </html>
  );
}
