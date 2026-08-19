import { CekiciWhatsappDestekFab } from "@/components/cekici/CekiciWhatsappDestekFab";

export default function CekiciLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <CekiciWhatsappDestekFab />
    </>
  );
}
