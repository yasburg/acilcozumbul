import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
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
import {
  GA_MEASUREMENT_ID,
  GOOGLE_ADS_ID,
  gtagConsentBootstrapInline,
} from "@/lib/gtag";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
  adjustFontFallback: true,
  preload: true,
});

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
  classification: "Yol yardım ve çekici pazaryeri",
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
        url: sayfaUrl("/acilcozumbul-logo-yazili.png"),
        alt: `${SITE_ADI} — acil çekici ve yol yardım`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: SEO_BASLIK,
    description: SEO_ACIKLAMA,
    images: [sayfaUrl("/acilcozumbul-logo-yazili.png")],
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
    icon: [{ url: "/acilcozumbul-logo-icon-192.png", type: "image/png", sizes: "192x192" }],
    apple: "/acilcozumbul-logo-icon-192.png",
    shortcut: "/acilcozumbul-logo-icon-192.png",
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
  themeColor: "#ffffff",
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
    <html lang="tr" className={`${geist.variable} h-full`}>
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
