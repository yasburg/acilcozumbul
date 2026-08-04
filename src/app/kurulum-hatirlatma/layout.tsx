import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kurulum hatırlatma",
  robots: { index: false, follow: false },
};

export default function KurulumHatirlatmaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
