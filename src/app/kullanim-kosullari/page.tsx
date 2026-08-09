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

      <YasalBolum baslik="4. Kredi ve abonelik (hizmet verenler)">
        <p>
          Hizmet verenlerin talep detaylarını ve iletişim bilgilerini görmesi, Platform
          üzerinden satın alınan dijital kredi birimleri ve/veya aylık abonelik ile
          mümkündür. Kredi satın alımı ve abonelik,{" "}
          <Link href="/mesafeli-hizmet-sozlesmesi" className="text-amber-700 underline">
            Mesafeli Hizmet Sözleşmesi
          </Link>{" "}
          ve{" "}
          <Link href="/iptal-ve-iade" className="text-amber-700 underline">
            İptal ve İade Politikası
          </Link>{" "}
          kapsamındadır. Hesaba tanımlanan krediler ve abonelik bedeli için iade
          yapılmaz. Aylık abonelik, siz iptal edene kadar her ay yenilenir; iptal
          gelecek yenilemeleri durdurur, ödenmiş dönem iade edilmez.
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

      <YasalBolum baslik="6. Konum, iletişim ve karşılıklı veri paylaşımı">
        <p>
          Talep sürecinde konum, telefon numarası ve hizmetin ifası için gerekli
          diğer bilgiler işlenir. İşleme amaçları ve haklarınız{" "}
          <Link href="/gizlilik-politikasi" className="text-amber-700 underline">
            Gizlilik Politikası (KVKK)
          </Link>{" "}
          metninde açıklanmıştır. Platformu kullanarak bu işlemeye ve aşağıdaki
          paylaşıma onay vermiş olursunuz.
        </p>
        <YasalListe
          items={[
            "Müşterinin talepte verdiği telefon numarası, ad/soyad (veya iletişim adı), adres/konum, araç ve talep bilgileri; eşleşen veya teklifi kabul edilen hizmet veren(ler) ile paylaşılır.",
            "Hizmet verenin telefon numarası, ad/unvan, profil bilgileri, puan/değerlendirme ve hizmete ilişkin gerekli bilgiler müşteri ile paylaşılır.",
            "Karşılıklı telefon paylaşımı; tarafların birbirini araması, SMS göndermesi veya hizmet koordinasyonu için gereklidir ve hizmetin ifasının ayrılmaz parçasıdır.",
            "Paylaşılan bilgiler yalnızca ilgili talep/hizmet kapsamında kullanılmalı; üçüncü kişilere satılmamalı, pazarlama listelerine eklenmemeli veya Platform dışı amaçlarla işlenmemelidir.",
          ]}
        />
      </YasalBolum>

      <YasalBolum baslik="6A. Elektronik iletişim, SMS ve sesli mesaj">
        <p>
          Platformun ve eşleştirilen hizmetin sunulabilmesi için tarafınıza
          aşağıdaki kanallardan iletişim kurulması zorunlu veya gereklidir.
          Verdiğiniz telefon numarasına (cep veya uygunsa sabit hat) şu
          iletişimler gönderilebilir:
        </p>
        <YasalListe
          items={[
            "Doğrulama (OTP), güvenlik ve hesap işlemleri SMS’leri",
            "Talep, teklif, eşleşme, seçim, iptal, memnuniyet ve benzeri hizmet bilgilendirme SMS’leri",
            "Hizmet kullanımı ve bilgilendirme amacıyla sabit hat / santral üzerinden sesli arama veya sesli mesaj (IVR) iletileri",
            "Teknik veya operasyonel bilgilendirmeler (ör. hizmet bölgesi açılışı, kritik sistem duyurusu)",
          ]}
        />
        <p>
          Bu iletişimler, 6698 sayılı KVKK kapsamında sözleşmenin kurulması ve
          ifası ile Platform hizmetinin sunulması amacıyla gerçekleştirilir.
          Telefon numaranızı Platforma vermeniz, hizmetin ifası için SMS ve
          gerekirse sesli mesaj/arama yapılmasına rıza ve kabul anlamına gelir.
        </p>
      </YasalBolum>

      <YasalBolum baslik="6B. Kampanya ve ticari elektronik iletiler (SMS)">
        <p>
          6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ve Ticari
          İletişim ve Ticari Elektronik İletiler Hakkında Yönetmelik uyarınca;
          Platformu kullanan müşteriler ile hizmet verenlere, kampanya, indirim,
          tanıtım, bilgilendirme ve benzeri ticari elektronik iletiler (SMS ve
          ilgili mevzuatta öngörülen diğer elektronik iletişim araçları)
          gönderilebilir.
        </p>
        <YasalListe
          items={[
            "Müşteri: Platform üzerinden talep oluştururken veya yasal metinleri kabul ederken ticari elektronik ileti (kampanya SMS’i vb.) almaya onay vermiş sayılır.",
            "Hizmet veren: Kayıt ve Platform kullanımı sırasında kampanya, kontenjan, kredi, duyuru ve bilgilendirme SMS’leri almaya onay vermiş sayılır.",
            "Onayınızı dilediğiniz zaman SMS’te belirtilen ret yöntemiyle (ör. RET yazarak yanıt), İleti Yönetim Sistemi (İYS) üzerinden veya destek@acilcozumbul.com adresine başvurarak geri alabilirsiniz. Ret, hizmetin ifasına ilişkin zorunlu/işlemsel mesajları etkilemez.",
            "Ticari iletilerde gönderici kimliği ve ret imkânı mevzuata uygun şekilde sunulur.",
          ]}
        />
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
