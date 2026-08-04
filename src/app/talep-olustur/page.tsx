import MusteriAnaSayfa from "@/components/musteri/MusteriAnaSayfa";
import { CekiciOturumYonlendir } from "@/components/musteri/CekiciOturumYonlendir";
import { sayfaMetadata } from "@/lib/seo";
import { TALEP_OLUSTUR_YOL } from "@/lib/seo-talep";

/** İşlem sayfası — SEO landing değil; indeks dışı */
export const metadata = sayfaMetadata({
  title: "Talep Oluştur",
  description:
    "Yolda kaldığınızda yakındaki çekici, lastikçi ve yol yardım hizmet verenlerinden teklif alın.",
  path: TALEP_OLUSTUR_YOL,
  noIndex: true,
});

export default function TalepOlusturPage() {
  return (
    <>
      <CekiciOturumYonlendir />
      <MusteriAnaSayfa funnelId="a" />
    </>
  );
}
