import type { Metadata } from "next";

/** Talep bekleme / ihale — indeks dışı */
export const metadata: Metadata = {
  title: "Teklifler bekleniyor",
  robots: { index: false, follow: false },
};

export default function BekleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
