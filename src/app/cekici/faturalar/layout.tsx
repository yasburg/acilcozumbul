import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Faturalarım",
  robots: { index: false, follow: false },
};

export default function FaturalarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
