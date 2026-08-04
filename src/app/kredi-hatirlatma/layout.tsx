import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kredi hatırlatma",
  robots: { index: false, follow: false },
};

export default function KrediHatirlatmaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
