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
            "Konum: talep adresi, GPS koordinatları, canlı takip verileri",
            "Araç ve talep: marka/model, arıza türü, fotoğraf, notlar",
            "İşlem ve ödeme: kredi satın alma, fatura bilgileri (çekici ödemeleri)",
            "Teknik: oturum, cihaz, IP, çerezler (Çerez Politikasına bakınız)",
            "İletişim kayıtları: SMS, bildirim tercihleri",
          ]}
        />
      </YasalBolum>

      <YasalBolum baslik="3. İşleme amaçları ve hukuki sebepler">
        <p>
          Verileriniz; talep eşleştirme, teklif iletimi, canlı konum paylaşımı,
          kimlik doğrulama, ödeme ve faturalama, dolandırıcılık önleme, yasal
          yükümlülükler ve meşru menfaat kapsamında işlenir. Hizmet veren profil
          fotoğrafı, yükleme anında verilen açık rıza (KVKK m.5/1) ile kimlik ve
          güven amacıyla işlenir; yalnızca platform incelemesinden sonra
          müşterilere gösterilir. Diğer hukuki sebepler: KVKK m.5/2 (sözleşmenin
          kurulması ve ifası, hukuki yükümlülük, meşru menfaat) ve gerektiğinde
          açık rızanız (m.5/1).
        </p>
      </YasalBolum>

      <YasalBolum baslik="4. Aktarım">
        <p>
          Veriler; hizmet talebinize yanıt veren çekici/hizmet sağlayıcılarına,
          ödeme kuruluşlarına (kredi kartı işlemleri), SMS sağlayıcısına (Netgsm),
          barındırma ve veritabanı altyapısına (Supabase vb.) ve kanunen yetkili
          kamu kurumlarına, amaçla sınırlı ve gerekli güvenlik önlemleriyle
          aktarılabilir. Yurt dışına aktarım varsa KVKK m.9 hükümlerine uyulur.
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
