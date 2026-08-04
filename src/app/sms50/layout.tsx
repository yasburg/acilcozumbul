import type { Metadata } from "next";

/** SMS kampanya kısa linkleri — test/kampanya; indeks dışı */
export const metadata: Metadata = {
  title: "Kampanya",
  robots: { index: false, follow: false },
};

export default function Sms50Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
