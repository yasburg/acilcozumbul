import Link from "next/link";
import {
  YasalBolum,
  YasalListe,
  YasalSayfaShell,
} from "@/components/yasal/YasalSayfaShell";
import { sayfaMetadata } from "@/lib/seo";
import { YASAL_SIRKET } from "@/lib/yasal-sirket";

export const metadata = sayfaMetadata({
  title: "İptal ve İade Politikası",
  description: `${YASAL_SIRKET.platformAdi} iptal ve iade politikası — kredi ve abonelik.`,
  path: "/iptal-ve-iade",
});

export default function IptalVeIadePage() {
  return (
    <YasalSayfaShell baslik="İptal ve İade Politikası">
      <YasalBolum baslik="1. Genel">
        <p>
          Bu politika, {YASAL_SIRKET.platformAdi} üzerinden hizmet verenlerin satın
          aldığı dijital kredi paketleri, aylık abonelikler ve Platform aracılığıyla
          sunulan dijital hizmetlere uygulanır. Platform, yol yardımı talebi ile saha
          hizmeti arasında aracılık yapar; çekici/lastikçi ile müşteri arasındaki
          fiziksel hizmet bedeli bu politikanın dışındadır.
        </p>
      </YasalBolum>

      <YasalBolum baslik="2. Kredi satın alımı — cayma ve iade yok">
        <p>
          Kredi, anında ifa edilen dijital içerik niteliğindedir. 6502 sayılı Tüketicinin
          Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği m.15/1-ğ uyarınca,
          elektronik ortamda anında ifa edilen dijital içeriklerde, tüketicinin onayı
          ile cayma hakkı kullanılamaz.
        </p>
        <YasalListe
          items={[
            "Hesaba tanımlanan veya kullanılan krediler için para iadesi yapılmaz.",
            "Kısmen kullanılmış kredi bakiyeleri nakde çevrilmez.",
            "Yanlış paket seçiminde, kullanılmamış kredi için istisnai iade Şirket inisiyatifindedir; zorunlu değildir.",
          ]}
        />
      </YasalBolum>

      <YasalBolum baslik="3. Abonelik — cayma ve iade yok">
        <p>
          Aylık abonelik, ödeme onayıyla derhal ifa edilen dijital hizmet ve dönem
          kredisi tanımıdır. Abonelik, siz iptal edene kadar her ay otomatik
          yenilenir. Abonelik bedeli için cayma hakkı kullanılamaz; nakit iade
          yapılmaz.
        </p>
        <YasalListe
          items={[
            "Abonelik istediğiniz zaman iptal edilebilir; iptal gelecek dönem yenilemelerini durdurur, ödenmiş dönem bedelini iade etmez.",
            "Abonelikle tanımlanan dönem kredisi (bonus dahil) dönem sonunda veya iptal sonrası dönem bitiminde sıfırlanır; nakde çevrilmez.",
            "«Kredi satın al» ile ayrıca alınan krediler abonelik iptalinden etkilenmez; bunlar da iade edilmez.",
          ]}
        />
      </YasalBolum>

      <YasalBolum baslik="4. Ödeme iptali">
        <p>
          Banka veya ödeme kuruluşu tarafından onaylanmamış işlemlerde kredi veya
          abonelik tanımlanmaz. Teknik hata ile çift tahsilat tespit edilirse düzeltme
          veya kredi iadesi yapılabilir; nakit iade yalnızca kanuni zorunluluk halinde
          değerlendirilir.
        </p>
      </YasalBolum>

      <YasalBolum baslik="5. Müşteri talepleri">
        <p>
          Müşteri tarafında Platform kullanımı talep oluşturma aşamasında ücretsizdir.
          Oluşturulan talebin iptali uygulama içinden mümkün olabilir; bu, saha
          hizmeti sözleşmesini sona erdirmez. Hizmet veren ile anlaşılan işlerde
          ücret ve iptal koşulları taraflar arasındadır.
        </p>
      </YasalBolum>

      <YasalBolum baslik="6. Hesap fesih">
        <p>
          Hizmet veren hesabının kapatılması halinde kullanılmayan kredi bakiyesi ve
          abonelik dönemi kredisi iade edilmez;{" "}
          <Link href="/kullanim-kosullari" className="text-amber-700 underline">
            Kullanım Koşulları
          </Link>{" "}
          ve{" "}
          <Link href="/mesafeli-hizmet-sozlesmesi" className="text-amber-700 underline">
            Mesafeli Hizmet Sözleşmesi
          </Link>{" "}
          geçerlidir.
        </p>
      </YasalBolum>

      <YasalBolum baslik="7. İletişim">
        <p>
          İptal ve iade talepleri: {YASAL_SIRKET.eposta}. Şirket: {YASAL_SIRKET.unvan},
          Vergi No: {YASAL_SIRKET.vergiNo}.
        </p>
      </YasalBolum>
    </YasalSayfaShell>
  );
}
