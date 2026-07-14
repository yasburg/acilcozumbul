import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hizmet Veren Paneli",
  robots: { index: false, follow: false },
};

export default function CekiciPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
