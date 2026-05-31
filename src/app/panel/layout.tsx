import { PanelChrome } from "@/components/PanelChrome";

export const metadata = {
  title: "Yönetim Paneli | acilcozumbul.com",
};

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PanelChrome>{children}</PanelChrome>;
}
