import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ödeme",
  robots: { index: false, follow: false },
};

export default function CekiciOdemeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
