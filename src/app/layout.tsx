import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Acil Çözüm Bul | acilcozumbul.com",
  description: "Yolda mı kaldınız? Hemen çekici bulun.",
  icons: {
    icon: [{ url: "/acilcozumbul-logo-transparan.png", type: "image/png" }],
    apple: "/acilcozumbul-logo-transparan.png",
    shortcut: "/acilcozumbul-logo-transparan.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Acil Çözüm Bul",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geist.variable} h-full`}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
