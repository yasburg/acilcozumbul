import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hizmet veren kaydı",
};

export default function KayitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
