import type { Metadata } from "next";
import Link from "next/link";
import {
  YasalBolum,
  YasalListe,
  YasalSayfaShell,
} from "@/components/yasal/YasalSayfaShell";
import { YASAL_SIRKET } from "@/lib/yasal-sirket";

export const metadata: Metadata = {
  title: "İptal ve İade Politikası",
  description: `${YASAL_SIRKET.platformAdi} iptal ve iade — kredi tabanlı`,
};

export default function IptalVeIadePage() {
  return (
    <YasalSayfaShell baslik="İptal ve İade Politikası">
      <YasalBolum baslik="1. Genel">
        <p>
          Bu politika, {YASAL_SIRKET.platformAdi} üzerinden hizmet verenlerin satın
          aldığı dijital kredi paketleri ve Platform aracılığıyla sunulan dijital
          hizmetlere uygulanır. Platform, yol yardımı talebi ile saha hizmeti arasında
          aracılık yapar; çekici/lastikçi ile müşteri arasındaki fiziksel hizmet
          bedeli bu politikanın dışındadır.
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

      <YasalBolum baslik="3. Ödeme iptali">
        <p>
          Banka veya ödeme kuruluşu tarafından onaylanmamış işlemlerde kredi tanımlanmaz.
          Teknik hata ile çift tahsilat tespit edilirse düzeltme veya kredi iadesi
          yapılabilir; nakit iade yalnızca kanuni zorunluluk halinde değerlendirilir.
        </p>
      </YasalBolum>

      <YasalBolum baslik="4. Müşteri talepleri">
        <p>
          Müşteri tarafında Platform kullanımı talep oluşturma aşamasında ücretsizdir.
          Oluşturulan talebin iptali uygulama içinden mümkün olabilir; bu, saha
          hizmeti sözleşmesini sona erdirmez. Hizmet veren ile anlaşılan işlerde
          ücret ve iptal koşulları taraflar arasındadır.
        </p>
      </YasalBolum>

      <YasalBolum baslik="5. Hesap fesih">
        <p>
          Hizmet veren hesabının kapatılması halinde kullanılmayan kredi bakiyesi
          iade edilmez;{" "}
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

      <YasalBolum baslik="6. İletişim">
        <p>
          İptal ve iade talepleri: {YASAL_SIRKET.eposta}. Şirket: {YASAL_SIRKET.unvan},
          Vergi No: {YASAL_SIRKET.vergiNo}.
        </p>
      </YasalBolum>
    </YasalSayfaShell>
  );
}
