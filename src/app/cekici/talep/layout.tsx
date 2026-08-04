import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talep",
  robots: { index: false, follow: false },
};

export default function CekiciTalepLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
