import Link from "next/link";
import {
  YasalBolum,
  YasalListe,
  YasalSayfaShell,
} from "@/components/yasal/YasalSayfaShell";
import { sayfaMetadata } from "@/lib/seo";
import { YASAL_SIRKET } from "@/lib/yasal-sirket";

export const metadata = sayfaMetadata({
  title: "Kullanım Koşulları",
  description: `${YASAL_SIRKET.platformAdi} kullanım koşulları — çekici ve yol yardım platformu kuralları.`,
  path: "/kullanim-kosullari",
});

export default function KullanimKosullariPage() {
  return (
    <YasalSayfaShell baslik="Kullanım Koşulları">
      <YasalBolum baslik="1. Taraflar ve kapsam">
        <p>
          Bu Kullanım Koşulları, {YASAL_SIRKET.unvan} (&quot;Şirket&quot;,
          &quot;biz&quot;) tarafından işletilen {YASAL_SIRKET.web} alan adlı{" "}
          {YASAL_SIRKET.platformAdi} platformunun (&quot;Platform&quot;) kullanımına
          ilişkindir. Platformu ziyaret eden, talep oluşturan veya hizmet veren
          (çekici, lastikçi, anahtarcı vb.) tüm kullanıcılar bu koşulları kabul etmiş
          sayılır.
        </p>
      </YasalBolum>

      <YasalBolum baslik="2. Hizmetin niteliği">
        <p>
          Platform, yol yardımı ve acil yol hizmetleri talebi ile bu taleplere teklif
          veren bağımsız hizmet sağlayıcıları arasında iletişim ve eşleştirme sağlayan
          bir aracı hizmettir. Şirket, çekici veya diğer saha hizmetlerini bizzat
          sunmaz; hizmetin ifası kullanıcı ile hizmet veren arasındaki anlaşmaya
          tabidir.
        </p>
      </YasalBolum>

      <YasalBolum baslik="3. Hesap ve doğrulama">
        <YasalListe
          items={[
            "Müşteriler talep oluşturmak için geçerli telefon doğrulaması yapmalıdır.",
            "Hizmet verenler kayıt sırasında doğru kimlik ve iletişim bilgisi vermekle yükümlüdür.",
            "Hesap güvenliğinden kullanıcı sorumludur; şifre ve oturum bilgileri üçüncü kişilerle paylaşılmamalıdır.",
          ]}
        />
      </YasalBolum>

      <YasalBolum baslik="4. Kredi sistemi (hizmet verenler)">
        <p>
          Hizmet verenlerin talep detaylarını ve iletişim bilgilerini görmesi, Platform
          üzerinden satın alınan dijital kredi birimleri ile mümkündür. Kredi
          satın alımı,{" "}
          <Link href="/mesafeli-hizmet-sozlesmesi" className="text-amber-700 underline">
            Mesafeli Hizmet Sözleşmesi
          </Link>{" "}
          ve{" "}
          <Link href="/iptal-ve-iade" className="text-amber-700 underline">
            İptal ve İade Politikası
          </Link>{" "}
          kapsamındadır. Kullanılmış veya hesaba tanımlanmış krediler için iade
          yapılmaz.
        </p>
      </YasalBolum>

      <YasalBolum baslik="5. Kullanıcı yükümlülükleri">
        <YasalListe
          items={[
            "Yanıltıcı adres, araç veya iletişim bilgisi vermemek",
            "Platformu yasa dışı, taciz edici veya haksız rekabet amaçlı kullanmamak",
            "Anlaşılan hizmet bedelini ve hizmet koşullarını hizmet veren ile doğrudan netleştirmek",
            "Kişisel verilerin korunmasına ve üçüncü kişilerin haklarına riayet etmek",
          ]}
        />
      </YasalBolum>

      <YasalBolum baslik="5A. Hizmet veren profil fotoğrafı">
        <YasalListe
          items={[
            "Hizmet verenler Hesabım üzerinden profil fotoğrafı yükleyebilir; fotoğraf yalnızca yüzü göstermelidir ve arka plan sade olmalıdır.",
            "Yüklenen fotoğraf platform incelemesine tabidir; onaylanmadan müşterilere gösterilmez.",
            "Uygun olmayan fotoğraflar reddedilebilir; red nedeni hesap sayfasında gösterilir. Yeniden yükleme mümkündür.",
            "Yükleme, Gizlilik Politikası kapsamında açık rıza ve onay sonrası müşteriye gösterim kabulünü içerir.",
          ]}
        />
      </YasalBolum>

      <YasalBolum baslik="6. Konum ve iletişim verisi">
        <p>
          Talep sürecinde konum ve telefon numarası işlenir. İşleme amaçları ve
          haklarınız{" "}
          <Link href="/gizlilik-politikasi" className="text-amber-700 underline">
            Gizlilik Politikası (KVKK)
          </Link>{" "}
          metninde açıklanmıştır. Platformu kullanarak bu işlemeye onay vermiş
          olursunuz.
        </p>
      </YasalBolum>

      <YasalBolum baslik="7. Sorumluluk sınırı">
        <p>
          Şirket, hizmet verenlerin performansı, gecikmesi, hasar veya anlaşmazlıklarından
          doğrudan sorumlu tutulamaz. Mümkün olan ölçüde Platform kesintisiz
          sunulmaya çalışılır; bakım ve mücbir sebeplerde hizmet askıya alınabilir.
        </p>
      </YasalBolum>

      <YasalBolum baslik="8. Fikri mülkiyet">
        <p>
          Platform tasarımı, yazılımı, markası ve içerikleri Şirkete aittir. İzinsiz
          kopyalama, tersine mühendislik veya ticari kullanım yasaktır.
        </p>
      </YasalBolum>

      <YasalBolum baslik="9. Değişiklik ve uygulanacak hukuk">
        <p>
          Koşullar güncellenebilir; güncel metin Platformda yayımlanır. Uyuşmazlıklarda
          Türkiye Cumhuriyeti kanunları uygulanır; İstanbul (Çağlayan) mahkeme ve
          icra daireleri yetkilidir.
        </p>
      </YasalBolum>
    </YasalSayfaShell>
  );
}
