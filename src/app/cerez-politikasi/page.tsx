import type { Metadata } from "next";
import Link from "next/link";
import {
  YasalBolum,
  YasalListe,
  YasalSayfaShell,
} from "@/components/yasal/YasalSayfaShell";
import { YASAL_SIRKET } from "@/lib/yasal-sirket";

export const metadata: Metadata = {
  title: "Çerez Politikası",
  description: `${YASAL_SIRKET.platformAdi} çerez kullanımı`,
};

export default function CerezPolitikasiPage() {
  return (
    <YasalSayfaShell baslik="Çerez Politikası">
      <YasalBolum baslik="1. Çerez nedir?">
        <p>
          Çerezler, {YASAL_SIRKET.platformDomain} ziyaretinizde cihazınıza kaydedilen
          küçük metin dosyalarıdır. Oturumun sürdürülmesi, güvenlik ve tercihlerinizin
          hatırlanması için kullanılabilir.
        </p>
      </YasalBolum>

      <YasalBolum baslik="2. Kullandığımız çerez türleri">
        <p className="font-medium text-slate-800">Zorunlu çerezler</p>
        <YasalListe
          items={[
            "Oturum ve kimlik doğrulama (çekici paneli, müşteri talep akışı)",
            "Güvenlik ve CSRF koruması",
            "Çerez tercihinizin kaydı (onay banner’ı sonrası)",
          ]}
        />
        <p className="font-medium text-slate-800 mt-4">İsteğe bağlı çerezler</p>
        <YasalListe
          items={[
            "Performans ve kullanım analitiği (yalnızca «Tümünü kabul et» seçeneğinde)",
            "Tercih hatırlama (isteğe bağlı iyileştirmeler)",
          ]}
        />
        <p>
          «Zorunlu olmayanları reddet» seçeneği ile yalnızca zorunlu çerezler
          kullanılır.
        </p>
      </YasalBolum>

      <YasalBolum baslik="3. Tercih yönetimi">
        <p>
          Siteye ilk girişinizde çerez banner’ı görüntülenir: Tümünü kabul et, Zorunlu
          olmayanları reddet veya Vazgeç (banner’ı kapatır; tercih kaydedilmez,
          sonraki oturumda tekrar sorulabilir). Tercihinizi tarayıcı ayarlarından da
          silebilirsiniz.
        </p>
      </YasalBolum>

      <YasalBolum baslik="4. Üçüncü taraf çerezleri">
        <p>
          Harita (ör. konum gösterimi) veya ödeme sayfası gibi entegrasyonlarda üçüncü
          tarafların çerezleri devreye girebilir; bu hizmetlerin kendi politikaları
          geçerlidir.
        </p>
      </YasalBolum>

      <YasalBolum baslik="5. KVKK">
        <p>
          Çerezler aracılığıyla işlenen kişisel veriler{" "}
          <Link href="/gizlilik-politikasi" className="text-amber-700 underline">
            Gizlilik Politikası (KVKK)
          </Link>{" "}
          kapsamındadır. Sorularınız için {YASAL_SIRKET.eposta}.
        </p>
      </YasalBolum>
    </YasalSayfaShell>
  );
}
