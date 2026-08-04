import MusteriAnaSayfa from "@/components/musteri/MusteriAnaSayfa";
import { CekiciOturumYonlendir } from "@/components/musteri/CekiciOturumYonlendir";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  faqJsonLd,
  organizationJsonLd,
  sayfaMetadata,
  serviceJsonLd,
  webSiteJsonLd,
} from "@/lib/seo";
import {
  ANA_SAYFA_HERO,
  anaSayfaSeoIcerik,
  anaSayfaSehirBaglantilari,
} from "@/lib/seo-icerik";

/** Anonim HTML cache’lenebilir; oturum yönlendirmesi client’ta */
export const dynamic = "force-static";

const anaSayfaIcerik = anaSayfaSeoIcerik();
const sehirBaglantilari = anaSayfaSehirBaglantilari();

export const metadata = sayfaMetadata({
  title: ANA_SAYFA_HERO,
  description: anaSayfaIcerik.description,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webSiteJsonLd(),
          serviceJsonLd(),
          faqJsonLd(anaSayfaIcerik.faq),
        ]}
      />
      <CekiciOturumYonlendir />
      <MusteriAnaSayfa
        funnelId="a"
        seoIcerik={anaSayfaIcerik}
        seoHeroBaslik={ANA_SAYFA_HERO}
        seoBaglantilar={sehirBaglantilari}
        seoBolgeLinkleri={sehirBaglantilari}
      />
    </>
  );
}
