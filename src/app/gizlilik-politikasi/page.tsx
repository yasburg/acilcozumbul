import Link from "next/link";
import {
  YasalBolum,
  YasalListe,
  YasalSayfaShell,
} from "@/components/yasal/YasalSayfaShell";
import { sayfaMetadata } from "@/lib/seo";
import { YASAL_SIRKET } from "@/lib/yasal-sirket";

export const metadata = sayfaMetadata({
  title: "Gizlilik Politikası (KVKK)",
  description: `${YASAL_SIRKET.platformAdi} KVKK gizlilik politikası — kişisel verilerin korunması.`,
  path: "/gizlilik-politikasi",
});

export default function GizlilikPolitikasiPage() {
  return (
    <YasalSayfaShell baslik="Gizlilik Politikası (KVKK)">
      <YasalBolum baslik="1. Veri sorumlusu">
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında
          veri sorumlusu: {YASAL_SIRKET.unvan}, {YASAL_SIRKET.adres}, Vergi No:{" "}
          {YASAL_SIRKET.vergiNo}. İletişim:{" "}
          <a href={`mailto:${YASAL_SIRKET.eposta}`} className="text-amber-700">
            {YASAL_SIRKET.eposta}
          </a>
          .
        </p>
      </YasalBolum>

      <YasalBolum baslik="2. İşlenen veri kategorileri">
        <YasalListe
          items={[
            "Kimlik ve iletişim: ad, soyad, telefon, e-posta (hizmet verenlerde)",
            "Hizmet veren profil fotoğrafı (yüz görüntüsü) — yükleme sırasında verilen açık rıza ile; onay sonrası müşteri ekranında gösterilir",
            "Hizmet veren puanı, değerlendirme ve performans göstergeleri",
            "Konum: talep adresi, GPS koordinatları, canlı takip verileri",
            "Araç ve talep: marka/model, arıza türü, fotoğraf, notlar",
            "İşlem ve ödeme: kredi satın alma, fatura bilgileri (çekici ödemeleri)",
            "Teknik: oturum, cihaz, IP, çerezler (Çerez Politikasına bakınız)",
            "İletişim kayıtları: SMS, sesli mesaj/arama kayıt özetleri, ticari ileti ve bildirim tercihleri",
          ]}
        />
      </YasalBolum>

      <YasalBolum baslik="3. İşleme amaçları ve hukuki sebepler">
        <p>
          Verileriniz; talep eşleştirme, teklif iletimi, canlı konum paylaşımı,
          müşteri ile hizmet veren arasında karşılıklı iletişim (telefon, SMS),
          kimlik doğrulama, ödeme ve faturalama, dolandırıcılık önleme, yasal
          yükümlülükler, hizmet kalitesi (puanlama) ve meşru menfaat kapsamında
          işlenir. Hizmet veren profil fotoğrafı, yükleme anında verilen açık
          rıza (KVKK m.5/1) ile kimlik ve güven amacıyla işlenir; yalnızca
          platform incelemesinden sonra müşterilere gösterilir. Kampanya ve
          ticari elektronik iletiler için hukuki sebep, 6563 sayılı Kanun
          uyarınca verdiğiniz önceden onay / incel rızadır. Diğer hukuki
          sebepler: KVKK m.5/2 (sözleşmenin kurulması ve ifası, hukuki
          yükümlülük, meşru menfaat) ve gerektiğinde açık rızanız (m.5/1).
        </p>
      </YasalBolum>

      <YasalBolum baslik="4. Aktarım ve taraflar arası paylaşım">
        <p>
          Platform bir aracılık hizmetidir. Hizmetin ifası için aşağıdaki
          paylaşımlar yapılır:
        </p>
        <YasalListe
          items={[
            "Müşteri → hizmet veren: telefon numarası, ad/iletişim adı, adres ve konum, araç/talep bilgileri ve hizmetin yerine getirilmesi için gerekli diğer bilgiler; eşleşen veya seçilen hizmet verene aktarılır.",
            "Hizmet veren → müşteri: telefon numarası, ad/unvan, profil bilgileri, puan/değerlendirme ve hizmet koordinasyonu için gerekli bilgiler müşteriye aktarılır.",
            "Altyapı sağlayıcıları: ödeme kuruluşları (kredi kartı işlemleri), SMS ve sesli mesaj/arama altyapısı (ör. Netgsm), barındırma ve veritabanı (Supabase vb.).",
            "Kanunen yetkili kamu kurumları: amaçla sınırlı ve gerekli güvenlik önlemleriyle.",
          ]}
        />
        <p>
          Bu aktarımlar, sözleşmenin ifası ve hizmetin sunulması için gereklidir.
          Yurt dışına aktarım varsa KVKK m.9 hükümlerine uyulur.
        </p>
      </YasalBolum>

      <YasalBolum baslik="4A. SMS, sesli mesaj ve ticari elektronik iletiler">
        <p>
          Verdiğiniz telefon numarasına; doğrulama, talep/teklif bilgilendirme,
          eşleşme ve hizmet kullanımı için SMS iletilebilir; ayrıca sabit hat /
          santral üzerinden sesli arama veya sesli mesaj (IVR) gönderilebilir.
          Bunlar hizmetin ifası kapsamındadır.
        </p>
        <p>
          Ayrıca müşteri ve hizmet verenlere kampanya, indirim, tanıtım ve
          bilgilendirme amaçlı ticari elektronik iletiler (SMS vb.)
          gönderilebilir. Bu iletiler, Kullanım Koşulları’nın kabulü ve Platform
          kullanımı sırasındaki onayınıza dayanır (6563 sayılı Kanun ve ilgili
          Yönetmelik). Onayınızı SMS ret yöntemi, İYS veya{" "}
          {YASAL_SIRKET.eposta} üzerinden geri alabilirsiniz; ret, zorunlu
          işlemsel mesajları etkilemez.
        </p>
      </YasalBolum>

      <YasalBolum baslik="5. Saklama süresi">
        <p>
          Veriler, işleme amacının gerektirdiği süre boyunca saklanır; yasal zamanaşımı
          ve muhasebe yükümlülükleri sonrasında silinir, yok edilir veya anonimleştirilir.
        </p>
      </YasalBolum>

      <YasalBolum baslik="6. KVKK kapsamındaki haklarınız">
        <YasalListe
          items={[
            "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
            "İşlenmişse buna ilişkin bilgi talep etme",
            "İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme",
            "Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme",
            "Eksik veya yanlış işlenmişse düzeltilmesini isteme",
            "KVKK m.7 kapsamında silinmesini veya yok edilmesini isteme",
            "Otomatik sistemlerle analiz sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz",
            "Kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme",
            "Ticari elektronik ileti onayınızı geri alma (SMS ret, İYS veya e-posta)",
          ]}
        />
        <p>
          Başvurularınızı {YASAL_SIRKET.eposta} adresine iletebilirsiniz. Talebiniz
          en geç 30 gün içinde sonuçlandırılır. Ret halinde Kişisel Verileri Koruma
          Kuruluna şikâyet hakkınız saklıdır.
        </p>
      </YasalBolum>

      <YasalBolum baslik="7. Güvenlik">
        <p>
          Verilerin korunması için erişim kontrolü, şifreleme, güvenli iletişim (HTTPS)
          ve yetkilendirme uygulanır. Veri ihlali durumunda yasal bildirim yükümlülükleri
          yerine getirilir.
        </p>
      </YasalBolum>

      <YasalBolum baslik="8. Çocuklar">
        <p>
          Platform 18 yaş altına yönelik değildir. Bilerek 18 yaş altından veri
          toplanmaz.
        </p>
      </YasalBolum>

      <YasalBolum baslik="9. İlgili metinler">
        <p>
          Çerez kullanımı için{" "}
          <Link href="/cerez-politikasi" className="text-amber-700 underline">
            Çerez Politikası
          </Link>
          ; Platform kullanımı için{" "}
          <Link href="/kullanim-kosullari" className="text-amber-700 underline">
            Kullanım Koşulları
          </Link>{" "}
          geçerlidir.
        </p>
      </YasalBolum>
    </YasalSayfaShell>
  );
}
