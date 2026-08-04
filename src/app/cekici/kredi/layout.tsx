import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kredi",
  robots: { index: false, follow: false },
};

export default function CekiciKrediLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
