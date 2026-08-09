import Link from "next/link";
import {
  YasalBolum,
  YasalListe,
  YasalSayfaShell,
} from "@/components/yasal/YasalSayfaShell";
import { sayfaMetadata } from "@/lib/seo";
import { YASAL_SIRKET } from "@/lib/yasal-sirket";

export const metadata = sayfaMetadata({
  title: "Mesafeli Hizmet Sözleşmesi",
  description: `${YASAL_SIRKET.platformAdi} mesafeli hizmet sözleşmesi.`,
  path: "/mesafeli-hizmet-sozlesmesi",
});

export default function MesafeliHizmetSozlesmesiPage() {
  return (
    <YasalSayfaShell baslik="Mesafeli Hizmet Sözleşmesi">
      <YasalBolum baslik="1. Satıcı bilgileri">
        <p>
          Unvan: {YASAL_SIRKET.unvan}
          <br />
          Adres: {YASAL_SIRKET.adres}
          <br />
          Vergi No: {YASAL_SIRKET.vergiNo}
          <br />
          E-posta: {YASAL_SIRKET.eposta}
          <br />
          Web: {YASAL_SIRKET.web}
        </p>
      </YasalBolum>

      <YasalBolum baslik="2. Alıcı">
        <p>
          Platforma kayıt olan ve kredi veya abonelik satın alan hizmet veren (çekici,
          lastikçi, anahtarcı vb.) gerçek veya tüzel kişi.
        </p>
      </YasalBolum>

      <YasalBolum baslik="3. Sözleşme konusu">
        <p>
          İşbu sözleşme, elektronik ortamda satın alınan dijital kredi paketlerinin
          ve aylık aboneliklerin Platform hesabına tanımlanması ve bu kredilerle talep
          bilgilerine erişim, teklif verme ve iletişim hizmetlerinin sunulmasına
          ilişkindir. Fiziksel yol yardımı hizmeti bu sözleşmenin konusu değildir.
        </p>
      </YasalBolum>

      <YasalBolum baslik="4. Bedel ve ödeme">
        <p>
          Paket ve abonelik fiyatları ödeme sayfasında KDV dahil/hariç olarak
          gösterilir. Ödeme kredi/banka kartı ile Garanti BBVA sanal POS altyapısı
          üzerinden tahsil edilir. Hizmet (kredi / abonelik tanımı) ödemenin
          onaylanmasıyla derhal ifa edilir. Aylık abonelik, Alıcı iptal edene kadar
          her ay aynı bedelle yenilenir; iptal işlemi Platform üzerinden
          yapılabilir.
        </p>
      </YasalBolum>

      <YasalBolum baslik="5. Cayma hakkı">
        <p>
          Tüketici, dijital içeriğin ifasına onay vererek ve cayma hakkının
          kullanılamayacağını kabul ederek işlemi tamamlar (Yönetmelik m.15/1-ğ).
          Kredi satın alımı ve abonelik bedeli için iade yapılmaz. Detaylar{" "}
          <Link href="/iptal-ve-iade" className="text-amber-700 underline">
            İptal ve İade Politikası
          </Link>
          ndadır.
        </p>
      </YasalBolum>

      <YasalBolum baslik="6. Teslimat">
        <p>
          Kredi ve abonelik, ödeme onayı sonrası dakikalar içinde kullanıcı paneline
          yansır. Gecikme halinde {YASAL_SIRKET.eposta} üzerinden bildirim
          yapılmalıdır.
        </p>
      </YasalBolum>

      <YasalBolum baslik="7. Ayıp ve sorumluluk">
        <YasalListe
          items={[
            "Teknik arıza nedeniyle kredi tanımlanmazsa eksik ifa giderilir.",
            "Platform kesintisi mücbir sebep sayılabilir; süre uzatılmaz, nakit iade yapılmaz.",
            "Hizmet verenin müşteriye verdiği saha hizmetinden Şirket sorumlu değildir.",
          ]}
        />
      </YasalBolum>

      <YasalBolum baslik="8. Kişisel veriler ve iletişim">
        <p>
          <Link href="/gizlilik-politikasi" className="text-amber-700 underline">
            Gizlilik Politikası (KVKK)
          </Link>{" "}
          ve{" "}
          <Link href="/kullanim-kosullari" className="text-amber-700 underline">
            Kullanım Koşulları
          </Link>{" "}
          işbu sözleşmenin ayrılmaz parçasıdır. Alıcı; kredi ve Platform
          hizmetinin ifası için telefon numarasının müşterilerle paylaşılmasını;
          SMS, sabit hat üzerinden sesli mesaj/arama ve kampanya/bilgilendirme
          ticari elektronik iletilerinin gönderilmesini kabul eder. Ticari
          ileti onayının geri alınması, işbu sözleşmenin ifasına ilişkin zorunlu
          bildirimleri engellemez.
        </p>
      </YasalBolum>

      <YasalBolum baslik="9. Uyuşmazlık">
        <p>
          Tüketici şikâyetleri için Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri
          yetkilidir. Ticari işlemlerde İstanbul mahkemeleri uygulanır.
        </p>
      </YasalBolum>
    </YasalSayfaShell>
  );
}
