import { seoTalepOlusturYolu } from "@/lib/seo-talep";

export type RehberFaq = { soru: string; cevap: string };

export type RehberLink = { href: string; label: string };

export type RehberBolum = {
  baslik: string;
  paragraflar: string[];
};

export type RehberYazi = {
  slug: string;
  title: string;
  description: string;
  /** YYYY-MM-DD */
  tarih: string;
  heroSrc: string;
  heroAlt: string;
  /** Üstte “Kısaca (TL;DR)” kutusu — 2–4 cümle */
  kisaca: string;
  bolumler: RehberBolum[];
  faq: RehberFaq[];
  linkler: RehberLink[];
  ctaHref: string;
  ctaLabel: string;
};

function talep(hizmet?: string): string {
  return seoTalepOlusturYolu({
    sehir: "istanbul",
    hizmet,
  });
}

/** Kronolojik dizi: en eski → en yeni (yayın sırası). */
export const REHBER_YAZILARI: RehberYazi[] = [
  {
    slug: "yolda-kaldim-ne-yapmaliyim",
    title: "Yolda kaldım, ne yapmalıyım? Adım adım kontrol listesi",
    description:
      "Yolda kaldığınızda güvenlik, konum ve yardım çağırma sırası — panik olmadan uygulanabilir kontrol listesi.",
    tarih: "2026-04-30",
    heroSrc: "/rehber/yolda-kaldim-ne-yapmaliyim.webp",
    heroAlt: "Güvenli kenara çekilmiş araç ve kontrol listesi illüstrasyonu",
    kisaca:
      "Önce güvenlik, sonra durum tespiti, ardından yardım. Bu sıra hem sizi korur hem de doğru hizmeti (çekici, lastik, akü…) seçmenizi kolaylaştırır. Panik anında önce aracı ve yolcuları güvene alın; konumu netleştirmeden çağrı açmak süreyi uzatır. Acil sağlık veya yangın riski varsa önce 112.",
    bolumler: [
      {
        baslik: "1. Güvenlik — ilk 60 saniye",
        paragraflar: [
          "Mümkünse trafik akışından uzak, görünür bir kenara çekin. Dörtlüleri açın; geceyse yansıtıcı yelek kullanın. Araç hareket ettirilemiyorsa bile far ve sinyal görünürlüğünü artırın.",
          "Otoyolda mümkünse sağ şerit dışına veya acil şeride geçin; yolcuları mümkün olduğunca bariyer tarafında tutun. Trafiğe sırt dönerek yürümekten ve şerit ortasında beklemekten kaçının.",
          "Çocuk ve yaşlı yolcuları araç içinde veya bariyer tarafında tutun; yol kenarında “yardım aramak” için yürüyüş yapmak çoğu zaman riski büyütür. Reflektör varsa kurallara uygun mesafede yerleştirin.",
          "Yangın, duman, yakıt kokusu veya yaralanma varsa öncelik 112’dir. Yol yardım talebi ikinci adımdır; önce can güvenliği.",
        ],
      },
      {
        baslik: "2. Sorunu netleştirin",
        paragraflar: [
          "Patlak lastik, akü, yakıt, kilit, motor arızası veya kaza sonrası çekim ihtiyacı mı? Doğru tür, doğru teklifi getirir. Yanlış hizmet seçmek hem beklemeyi hem maliyeti bozar.",
          "Konumunuzu (ilçe, yakın kavşak, km taşı, çıkış numarası) not edin. Paylaşım izni verdiğinizde hizmet verenler size daha hızlı ulaşır; “bir yerde kaldım” ifadesi yeterli değildir.",
          "Araç tipi (otomobil, SUV, ticari), stepne var mı, gece mi, otoyol mu gibi notlar teklif kalitesini yükseltir. Kısa bir durum cümlesi yazmak, sonradan telefonla tekrar anlatmaktan iyidir.",
          "Emin değilseniz “çekici mi yerinde yardım mı” diye panik karar vermeyin; durumu yazıp birden fazla teklif toplamak çoğu zaman daha güvenlidir.",
        ],
      },
      {
        baslik: "3. Yardım çağırın",
        paragraflar: [
          "Acil Çözüm Bul’da sorun tipini seçip talep açabilir; yakındaki onaylı hizmet verenlerden fiyat ve süre teklifi alabilirsiniz. Talep oluşturmak ücretsizdir.",
          "Tek bir numaraya körlemesine bağlanmak yerine tutar, tahmini varış ve kapsamı yan yana görmek panik fiyatını azaltır. Şüpheli peşinat veya belirsiz “sonra bakarız” ifadelerine itibar etmeyin.",
          "Asistans veya sigorta paketiniz varsa hattınızı da arayabilirsiniz; kapsama km ve olay tipine bağlıdır. Paket yoksa veya geç geliyorsa platform teklifleri alternatif sunar.",
          "Seçim yaptıktan sonra buluşma noktasını netleştirin: “köprü altı”, “acil şerit”, “benzin istasyonu girişi” gibi net tarifler kayıp zamanı kısaltır.",
        ],
      },
      {
        baslik: "4. Beklerken ve seçim sonrası",
        paragraflar: [
          "Beklerken mümkünse yolun güvenli tarafında kalın. Araç içinde bekliyorsanız emniyet kemeri ve görünürlük kurallarını ihmal etmeyin.",
          "Hizmet veren gelmeden önce bagajda bulunan yelek, el feneri, üçgen reflektör gibi ekipmanları hazır tutun. Gece ve yağmurda görünürlük kritiktir.",
          "Ödeme ve kapsamı seçim anında netleştirin: vinç, bekleme, gece farkı dahil mi? Sonradan sürpriz ek ücret istememek için teklifteki ifadeyi okuyun.",
          "İş bittikten sonra kısa bir not tutmak (saat, tutar, plaka) sigorta veya tekrarlayan arıza takibinde işe yarar.",
        ],
      },
      {
        baslik: "5. Sık yapılan hatalar",
        paragraflar: [
          "Güvenliği atlayıp hemen arama yapmak, konumu belirsiz bırakmak ve “en ucuz tek seçenek” baskısına boyun eğmek en sık hatalardır.",
          "Stepnesiz veya jant hasarlı araçta kısa mesafe sürmek hasarı büyütür. Aküde yanlış polariteyle takviye denemek elektronik riski yaratır.",
          "Otoyolda yürüyerek istasyon veya yardım aramak tehlikelidir. Araçtan güvenli tarafta bekleyip yardım çağırın.",
        ],
      },
    ],
    faq: [
      {
        soru: "Önce çekici mi çağırmalıyım?",
        cevap:
          "Her zaman değil. Lastik, akü veya yakıt gibi durumlarda yerinde müdahale yeterli olabilir. Araç yürümüyorsa, güvenlik yoksa veya hasar ağırsa çekici doğru seçimdir.",
      },
      {
        soru: "Konum paylaşmak zorunlu mu?",
        cevap:
          "Hızlı ve doğru eşleşme için konum gerekir; paylaşım talebi açıkça istenir. İlçe ve kavşak tarifi de yardımcı olur.",
      },
      {
        soru: "Acil Çözüm Bul’da talep ücretli mi?",
        cevap:
          "Müşteri talep açmak ücretsizdir. Hizmet bedeli seçtiğiniz hizmet verenle aranızda anlaştığınız tutardır.",
      },
      {
        soru: "112’yi ne zaman aramalıyım?",
        cevap:
          "Yaralanma, yangın, yakıt sızıntısı veya trafik için ciddi tehlike varsa önce 112. Yol yardım ikinci adımdır.",
      },
      {
        soru: "Teklif gelmezse ne yapmalıyım?",
        cevap:
          "Konum ve sorun tipini kontrol edin, not alanını netleştirin, birkaç dakika bekleyin veya türü düzelterek yeniden deneyin.",
      },
    ],
    linkler: [
      { href: "/istanbul/yol-yardim", label: "İstanbul yol yardım" },
      { href: "/istanbul/cekici", label: "İstanbul çekici" },
    ],
    ctaHref: talep(),
    ctaLabel: "Yardım talebi oluştur",
  },
  {
    slug: "platformda-talep-nasil-acilir",
    title: "Acil Çözüm Bul’da talep nasıl açılır? (kısa rehber)",
    description:
      "Sorun seçimi, konum, telefon doğrulama ve teklif seçimi — platformda talep açma adımları.",
    tarih: "2026-05-07",
    heroSrc: "/rehber/platformda-talep-nasil-acilir.webp",
    heroAlt: "Üç adımlı talep oluşturma akış illüstrasyonu",
    kisaca:
      "Üç temel adım: sorun tipi → iletişim/konum → teklif seçimi. Talep oluşturmak ücretsizdir. Yolda kaldıysanız önce güvenlik listesini uygulayın; ardından formu doğru türle doldurun. Not alanına kısa durum yazmak teklif kalitesini yükseltir.",
    bolumler: [
      {
        baslik: "Talep açmadan önce",
        paragraflar: [
          "Yolda kaldıysanız önce [güvenlik ve durum kontrol listesini](/rehber/yolda-kaldim-ne-yapmaliyim) uygulayın; ardından platformda talep açın.",
          "Telefonunuzun şarjı ve sinyal durumu kritiktir. Mümkünse güvenli kenarda, konuşabileceğiniz bir noktada formu doldurun.",
          "Hangi hizmete ihtiyacınız olduğunu kabaca bilin: çekici, lastik, akü, yakıt, anahtar… Emin değilseniz durumu notta anlatın.",
        ],
      },
      {
        baslik: "Adım adım akış",
        paragraflar: [
          "1) Çekici, lastik, akü, yakıt, anahtar vb. seçin. 2) Telefon doğrulaması ve konum. 3) Gelen tekliflerden birini seçin.",
          "SEO sayfalarındaki butonlar formu ilgili şehir/hizmetle ön doldurabilir; yine de konumunuzu doğrulayın.",
          "Konum izni verdiğinizde harita üzerinden ince ayar yapabilirsiniz. Yanlış pin, yanlış varış süresi demektir.",
          "Teklif kartlarında tutar, tahmini süre ve kısa kapsam görünür. Birini seçince iletişim açılır.",
        ],
      },
      {
        baslik: "İyi bir talep notu nasıl yazılır?",
        paragraflar: [
          "Örnek: “TEM Avrupa, km 45, sağ acil şerit, otomobil, gece, stepne yok.” Bu tür notlar doğru ekipmanı getirir.",
          "Otoyol, yağmur, çocuk yolcu, ticari araç, vinç ihtiyacı gibi detayları yazın. Belirsiz “bozuldu” ifadesi yetersizdir.",
          "Sigorta/asistans kullanacaksanız bunu da belirtin; hizmet veren beklentiyi net görür.",
        ],
      },
      {
        baslik: "Teklif seçimi ve sonrası",
        paragraflar: [
          "Sadece fiyata bakmayın; varış süresi ve net kapsam da önemlidir. Şüphede seçmeyin, yeni teklifleri bekleyebilirsiniz.",
          "Seçim sonrası buluşma noktasını netleştirin. Araç plakasını ve belirgin bir işaret (istasyon, tabela) paylaşın.",
          "İşlem bitince tutar ve saat notu tutmak ileride işinize yarar.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "Panik anında adım sırası için [yolda kaldım ne yapmalıyım](/rehber/yolda-kaldim-ne-yapmaliyim) yazısına bakın.",
          "Talep açmak ücretsizdir; asıl maliyet seçtiğiniz hizmetin teklifidir.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Kayıt olmak zorunda mıyım?",
        cevap:
          "Müşteri talep akışı telefon doğrulaması ile ilerler; uzun üyelik formu zorunlu değildir.",
      },
      {
        soru: "Talep oluşturmak ücretli mi?",
        cevap:
          "Hayır. Talep açmak ücretsizdir. Ödeme, seçtiğiniz hizmet verenle anlaştığınız tutardır.",
      },
      {
        soru: "Yanlış hizmet seçersem ne olur?",
        cevap:
          "Teklif gelmeyebilir veya süre uzar. Not ekleyerek veya yeni talepte türü düzelterek ilerleyebilirsiniz.",
      },
      {
        soru: "Birden fazla teklif gelir mi?",
        cevap:
          "Bölgedeki müsaitliğe göre birden fazla teklif gelebilir. İstediğinizi seçer veya bekleyebilirsiniz.",
      },
      {
        soru: "Konum izni vermezsem?",
        cevap:
          "Manuel adres/ilçe ile devam etmek mümkün olsa da doğruluk ve hız düşer. Mümkünse konum paylaşın.",
      },
    ],
    linkler: [
      { href: "/rehber/yolda-kaldim-ne-yapmaliyim", label: "Yolda kaldım listesi" },
      { href: "/", label: "Ana sayfa" },
    ],
    ctaHref: "/",
    ctaLabel: "Talep oluşturmaya başla",
  },
  {
    slug: "otoyolda-ariza",
    title: "Otoyolda arıza: güvenlik ve yardım sırası",
    description:
      "Otoyolda arıza olduğunda şerit, reflektör, yolcu güvenliği ve yardım çağırma sırası.",
    tarih: "2026-05-14",
    heroSrc: "/rehber/otoyolda-ariza.webp",
    heroAlt: "Otoyol kenarı güvenlik ve reflektör illüstrasyonu",
    kisaca:
      "Otoyolda öncelik hayattır. Aracı mümkün olduğunca sağa alın, yolcuları bariyer tarafına geçirin, sonra yardım çağırın. Yürüyerek yardım aramak tehlikelidir. Km taşı ve çıkış numarası varış süresini kısaltır.",
    bolumler: [
      {
        baslik: "İlk 60 saniye",
        paragraflar: [
          "Genel yolda kalma sırası [yolda kaldım kontrol listesinde](/rehber/yolda-kaldim-ne-yapmaliyim) anlatılır; otoyolda tempo daha kritiktir.",
          "Dörtlü, sağa yanaşma, el frenı, yelek. Trafiğe sırt dönerek yürümekten kaçının.",
          "Reflektörü kurallara uygun mesafede yerleştirin (mümkünse). Gece ve yağmurda görünürlük ekipmanı hayati önemdedir.",
          "Araç tamamen durdurulamıyorsa kontrollü şekilde en sağa yönelin; ani şerit değişiminden kaçının.",
        ],
      },
      {
        baslik: "Yolcu ve araç konumlandırma",
        paragraflar: [
          "Yolcuları mümkünse bariyer tarafına alın. Şerit tarafında durmak ikincil kaza riskini artırır.",
          "Çocukları araç içinde emniyet kemeriyle tutmak bazen daha güvenlidir; ortamı değerlendirin.",
          "Bagaj kapağını veya kaputunu gereksiz yere uzun süre açık bırakmayın; görünürlük ve rüzgâr riski oluşabilir.",
        ],
      },
      {
        baslik: "Yardım türü seçimi",
        paragraflar: [
          "Lastik/akü için yerinde yardım mümkün olabilir; güvensiz şeritte çekici ile güvenli noktaya alma daha doğru olabilir.",
          "Konum için km taşı / çıkış numarası çok işe yarar. Yardımı [platformda talep açarak](/rehber/platformda-talep-nasil-acilir) hızlandırabilirsiniz.",
          "Otoyolda “hemen lastik değişeyim” refleksi, arkadan gelen trafiği hesaba katmaz. Güvenli alan yoksa çekimi önceliklendirin.",
        ],
      },
      {
        baslik: "Beklerken güvenlik",
        paragraflar: [
          "Mümkünse araçtan inip bariyer tarafında bekleyin. Şerit kenarında sohbet veya telefonla dolaşmayın.",
          "Hizmet verene net tarif verin: yön (Ankara istikamet), km, en yakın çıkış, belirgin tabela.",
          "Geceyse ek ışık kaynağı ve yelek kullanın; karanlıkta görünmezlik en büyük risktir.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "Önce [yolda kaldım ne yapmalıyım](/rehber/yolda-kaldim-ne-yapmaliyim), sonra [talep nasıl açılır](/rehber/platformda-talep-nasil-acilir).",
          "Otoyol senaryosu, şehir içi yolda kalmadan daha katı güvenlik disiplini ister.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Otoyolda yürüyerek yardım arayabilir miyim?",
        cevap:
          "Tehlikelidir. Araçtan güvenli tarafta bekleyip yardım çağırın.",
      },
      {
        soru: "Acil şeritte lastik değişir mi?",
        cevap:
          "Koşullara bağlıdır. Trafik yoğunluğu ve görünürlük kötüyse çekici ile güvenli noktaya almak daha doğru olabilir.",
      },
      {
        soru: "Km taşını nasıl bulurum?",
        cevap:
          "Sağ kenardaki km işaretlerine ve çıkış tabelalarına bakın. Telefon konumunuz da destek olur.",
      },
      {
        soru: "Yolcular araçta mı kalsın?",
        cevap:
          "Genelde bariyer tarafı daha güvenlidir; çocuklar ve özel durumlarda araç içi tercih edilebilir. Ortamı değerlendirin.",
      },
      {
        soru: "Önce 112 mi?",
        cevap:
          "Yaralanma, yangın veya şeridi kapatan ciddi tehlike varsa evet. Aksi halde güvenlik + yol yardım sırası yeterlidir.",
      },
    ],
    linkler: [
      { href: "/rehber/yolda-kaldim-ne-yapmaliyim", label: "Yolda kaldım listesi" },
      { href: "/rehber/platformda-talep-nasil-acilir", label: "Talep nasıl açılır?" },
      { href: "/istanbul/yol-yardim", label: "İstanbul yol yardım" },
    ],
    ctaHref: talep(),
    ctaLabel: "Otoyol yardımı iste",
  },
  {
    slug: "cekici-mi-tamirci-mi",
    title: "Çekici mi, yerinde tamir mi? Ne zaman hangisi?",
    description:
      "Yerinde müdahale ile çekici arasında karar vermenize yardımcı olan pratik karşılaştırma.",
    tarih: "2026-05-21",
    heroSrc: "/rehber/cekici-mi-tamirci-mi.webp",
    heroAlt: "Çekici ve yerinde tamir seçeneklerini gösteren illüstrasyon",
    kisaca:
      "Lastik, akü, yakıt ve basit arızalarda yerinde yardım sık yeter. Araç yürümüyorsa, güvenlik yoksa veya hasar ağırsa çekici doğru seçimdir. Emin değilseniz durumu talep notuna yazın; farklı türlerden teklif toplayabilirsiniz.",
    bolumler: [
      {
        baslik: "Yerinde yardım lehine",
        paragraflar: [
          "Sorun bilinen tipte (lastik/akü/yakıt/kilit), çalışma alanı güvenli, araç kısa sürede hareket edebilecek. İlk güvenlik adımları için [yolda kaldım listesine](/rehber/yolda-kaldim-ne-yapmaliyim) bakın.",
          "Şehir içi sakin bir kenarda patlak lastik veya akü takviyesi çoğu zaman yerinde çözülür.",
          "Yedek lastik veya lastik tamir imkânı varsa mobil lastikçi çekiciye göre daha hızlı ve ucuz olabilir.",
          "Kapıda kilitli anahtar gibi durumlarda oto anahtarcı, çekici yerine doğrudan çözümdür.",
        ],
      },
      {
        baslik: "Çekici lehine",
        paragraflar: [
          "Motor/şanzıman şüphesi, kaza sonrası çekim, jant kırığı, [otoyolda güvensiz ortam](/rehber/otoyolda-ariza), uzun mesafe servis ihtiyacı.",
          "Araç vitese girmiyor, teker dönmüyor veya yağ/su kaybı şüphesi varsa zorla yürütmek hasarı büyütür.",
          "Stepne yok + jant hasarı kombinasyonunda yerinde lastik yetmeyebilir; servise çekim gerekir.",
          "Emin değilseniz [talep notuna durumu yazın](/rehber/platformda-talep-nasil-acilir); farklı hizmetlerden teklif gelmesini sağlayabilirsiniz.",
        ],
      },
      {
        baslik: "Karar ağacı — pratik sorular",
        paragraflar: [
          "Araç güvenli kenarda mı? Çalışma alanı var mı? Yolcular güvende mi? Bu üç sorudan biri “hayır”sa çekici ağır basar.",
          "Sorun 15–30 dakikada yerinde çözülebilir mi? Değilse çekim + servis planı daha gerçekçidir.",
          "Maliyet odaklı düşünürken sadece çekici ücretine değil, yanlış müdahalenin yaratacağı ek hasara da bakın.",
        ],
      },
      {
        baslik: "Platformda nasıl ilerlenir?",
        paragraflar: [
          "Tür seçiminde kararsızsanız en yakın tahmini seçip notta alternatifleri yazın. Hizmet verenler kapsamı teklifte netleştirir.",
          "Gelen tekliflerde süre ve tutarı birlikte okuyun; “ucuz ama 90 dk” gece otoyolda iyi seçim olmayabilir.",
          "Seçimden sonra hedefi (servis, ev, otopark) net söyleyin; mesafe fiyatı etkiler.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "İlgili okumalar: [yolda kaldım](/rehber/yolda-kaldim-ne-yapmaliyim), [otoyolda arıza](/rehber/otoyolda-ariza), [talep nasıl açılır](/rehber/platformda-talep-nasil-acilir).",
          "Bu zincirde yalnızca daha önce yayınlanan rehberlere bağlantı verilir; böylece okuma yolu geriye doğru tutarlı kalır.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Yanlış hizmet seçersem ne olur?",
        cevap:
          "Teklif gelmez veya süre uzar. Not ekleyerek veya yeni talepte türü düzelterek ilerleyebilirsiniz.",
      },
      {
        soru: "Hem lastikçi hem çekici teklifi alabilir miyim?",
        cevap:
          "Durumu notta yazarsanız farklı türler yanıt verebilir. Karşılaştırıp siz seçersiniz.",
      },
      {
        soru: "Otoyolda yerinde tamir olur mu?",
        cevap:
          "Bazen evet, ama güvenlik yoksa çekici ile güvenli noktaya almak daha doğrudur.",
      },
      {
        soru: "Akü bitti, çekici mi?",
        cevap:
          "Çoğu zaman takviye yeter. Tekrarlayan bitme veya şarj sistemi şüphesinde servise çekim gerekebilir.",
      },
      {
        soru: "Kaza sonrası yerinde tamir olur mu?",
        cevap:
          "Genelde hayır. Güvenlik, tutanak ve çekim önceliklidir; yürüyemeyen araç zorlanmamalıdır.",
      },
    ],
    linkler: [
      { href: "/rehber/yolda-kaldim-ne-yapmaliyim", label: "Yolda kaldım listesi" },
      { href: "/rehber/otoyolda-ariza", label: "Otoyolda arıza" },
      { href: "/rehber/platformda-talep-nasil-acilir", label: "Talep nasıl açılır?" },
      { href: "/istanbul/cekici", label: "İstanbul çekici" },
      { href: "/istanbul/yol-yardim", label: "İstanbul yol yardım" },
    ],
    ctaHref: talep(),
    ctaLabel: "Uygun teklifleri gör",
  },
  {
    slug: "cekici-ne-kadar",
    title: "Çekici ne kadar tutar? 2026 fiyat rehberi",
    description:
      "Çekici ücretini neler etkiler, sabit fiyat neden yanıltıcıdır ve teklifleri nasıl karşılaştırırsınız — 2026 pratik rehber.",
    tarih: "2026-05-28",
    heroSrc: "/rehber/cekici-ne-kadar.webp",
    heroAlt: "Yol kenarında bekleyen araç ve çekici hizmeti illüstrasyonu",
    kisaca:
      "Çekici fiyatı mesafe, saat, araç tipi ve yol koşullarına göre değişir. Tek bir “standart ücret” yoktur; net tutar teklifle oluşur. Sabit internet rakamları çoğu zaman ortalama veya reklam bandıdır. Bu yazıda fiyatı etkileyen faktörleri ve güvenli karşılaştırma yolunu özetliyoruz.",
    bolumler: [
      {
        baslik: "Fiyatı belirleyen başlıca etkenler",
        paragraflar: [
          "Mesafe (çekim noktası → hedef), gece/tatil saati, otomobil mi ticari araç mı, otoyol/şehir içi, vinç ihtiyacı ve bekleme süresi ücreti etkiler.",
          "Önce [çekici mi yerinde yardım mı](/rehber/cekici-mi-tamirci-mi) gerektiğini netleştirin; yanlış tür hem süreyi hem maliyeti bozar.",
          "Bazı firmalar “başlangıç + km” tarifesi kullanır; bazısı iş başına tek fiyat verir. Platformda her hizmet veren kendi teklifini yazar — böylece aynı iş için birden fazla rakamı yan yana görürsünüz.",
          "Araç aktarma, kapalı kasa, lüks veya alçak profil lastikli araçlar ek ekipman gerektirebilir; bunu notta yazın.",
        ],
      },
      {
        baslik: "Sabit fiyat vaatlerine dikkat",
        paragraflar: [
          "Internette gördüğünüz tek rakamlar çoğu zaman ortalama veya reklam bandıdır; konumunuz netleşmeden kesin olamaz.",
          "Güvenli yaklaşım: [güvenlik ve konum adımlarını](/rehber/yolda-kaldim-ne-yapmaliyim) tamamlayıp [talep açın](/rehber/platformda-talep-nasil-acilir); süre ve tutarı yan yana karşılaştırın.",
          "“Herkese aynı fiyat” veya “garanti en ucuz” iddiaları panik anında ikna edici görünebilir; kapsamı okumadan kabul etmeyin.",
        ],
      },
      {
        baslik: "Teklifte nelere bakmalısınız?",
        paragraflar: [
          "Tutarın neyi kapsadığı: vinç, bekleme, gece farkı, ikinci kişi. Belirsiz ifade risklidir.",
          "Tahmini varış süresi. En ucuz teklif çok geç geliyorsa otoyol kenarında iyi seçim olmayabilir.",
          "Hedef adres netliği. Servis mi otopark mı? Mesafe değişince fiyat da değişebilir; baştan söyleyin.",
        ],
      },
      {
        baslik: "Hızlı kontrol listesi",
        paragraflar: [
          "Hedef adres (servis / otopark / ev) net mi? Araç tipi doğru mu? Gece mi? Otoyol kenarı mı?",
          "Kabaca band görmek için çekici fiyat hesaplama aracımızı kullanabilir, sonra şehir sayfasından veya talep formundan gerçek teklif toplayabilirsiniz.",
          "Sigorta/asistans iddiası varsa poliçe limitinizi kontrol edin; platform teklifi alternatif olarak kalabilir.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "İlgili okumalar: [yolda kaldım](/rehber/yolda-kaldim-ne-yapmaliyim), [çekici mi tamirci mi](/rehber/cekici-mi-tamirci-mi), [talep nasıl açılır](/rehber/platformda-talep-nasil-acilir).",
          "Bu zincirde yalnızca daha önce yayınlanan rehberlere bağlantı verilir; böylece okuma yolu geriye doğru tutarlı kalır.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Çekici ücreti önceden sabit midir?",
        cevap:
          "Hayır. Mesafe ve koşullara göre değişir; net tutar hizmet verenin teklifinde görünür.",
      },
      {
        soru: "En ucuz teklifi seçmek doğru mu?",
        cevap:
          "Sadece fiyata bakmayın; varış süresi ve net kapsam (vinç, bekleme) da önemlidir.",
      },
      {
        soru: "Platform kullanım ücreti var mı?",
        cevap:
          "Müşteri talep açmak ücretsizdir. Hizmet bedeli seçtiğiniz hizmet verenle aranızda anlaştığınız tutardır.",
      },
      {
        soru: "Gece daha pahalı mı?",
        cevap:
          "Sıklıkla fark olur ama sabit kural değildir; o anki arz-talep ve teklifler belirler.",
      },
      {
        soru: "Km ücreti nasıl işler?",
        cevap:
          "Firmaya göre değişir. Bazısı başlangıç + km, bazısı iş başına tek fiyat verir. Teklif kartında net tutarı görün.",
      },
      {
        soru: "Bekleme ücreti nedir?",
        cevap:
          "Hizmet verenin sizin hazır olmanızı veya ek işlem beklemesini kapsayan süre farkıdır. Teklifte belirtilip belirtilmediğine bakın.",
      },
    ],
    linkler: [
      { href: "/rehber/yolda-kaldim-ne-yapmaliyim", label: "Yolda kaldım listesi" },
      { href: "/rehber/cekici-mi-tamirci-mi", label: "Çekici mi, tamirci mi?" },
      { href: "/rehber/platformda-talep-nasil-acilir", label: "Talep nasıl açılır?" },
      { href: "/cekici-fiyat-hesaplama", label: "Çekici fiyat hesaplama" },
      { href: "/istanbul/cekici", label: "İstanbul çekici" },
    ],
    ctaHref: talep("cekici"),
    ctaLabel: "Çekici teklifi al",
  },
  {
    slug: "ucretsiz-cekici-var-mi",
    title: "Ücretsiz çekici var mı? Sigorta ve yol yardım paketleri",
    description:
      "Ücretsiz çekici mitleri, sigorta / asistans paketleri ve platformda ücretin nasıl oluştuğu.",
    tarih: "2026-06-04",
    heroSrc: "/rehber/ucretsiz-cekici-var-mi.webp",
    heroAlt: "Sigorta ve çekici hizmeti ilişki illüstrasyonu",
    kisaca:
      "“Herkese ücretsiz çekici” yoktur. Poliçeniz veya asistans paketiniz kapsıyorsa maliyet oradan dönebilir; aksi halde hizmet bedeli teklifle belirlenir. Km limiti, olay türü ve araç tipi kapsama dahildir. Talep açmak yine ücretsizdir.",
    bolumler: [
      {
        baslik: "Sigorta / asistans gerçekliği",
        paragraflar: [
          "Kapsam km limiti, araç tipi ve olay türüne bağlıdır. Poliçe metnine bakın veya sigortacınızı arayın.",
          "Paket yoksa piyasadan teklif almak gerekir — [çekici ücreti neye göre değişir](/rehber/cekici-ne-kadar) yazısı faktörleri özetler.",
          "“Ücretsiz çekici” reklamları çoğu zaman asistans satışına veya koşullu kampanyaya aittir; sizin olayınızı otomatik kapsamaz.",
          "Kaza, arıza ve şehirler arası taşıma farklı kalemler olabilir; poliçede ayrı ayrı yazılır.",
        ],
      },
      {
        baslik: "Kapsamı kontrol listesi",
        paragraflar: [
          "Yıllık km hakkı kaldı mı? Olay tipi (arıza/kaza) dahil mi? Çekilecek mesafe limit içinde mi?",
          "İkame araç, otel, vinç gibi ek haklar ayrı olabilir. Sadece “çekici var” demek yetmez.",
          "Asistans hattı yoğunsa veya geç geliyorsa alternatif teklif toplamak zaman kazandırır.",
        ],
      },
      {
        baslik: "Platformda ücret",
        paragraflar: [
          "Talep açmak ücretsizdir. Ödediğiniz tutar seçtiğiniz hizmet verenin teklifidir. Adımlar için [talep nasıl açılır](/rehber/platformda-talep-nasil-acilir) rehberine bakın.",
          "Yanlış hizmet türü seçmeyin: önce [çekici mi yerinde yardım mı](/rehber/cekici-mi-tamirci-mi) kararını netleştirin.",
          "Asistans kullanırken bile konum ve hedef adresi netleştirin; çifte çağrı ve çakışmayı önler.",
        ],
      },
      {
        baslik: "Ne zaman kendi cebinizden ödersiniz?",
        paragraflar: [
          "Limit aşımı, kapsam dışı olay, poliçe dışı araç kullanımı veya paket süresi dolmuşsa maliyet size kalır.",
          "Bu durumda birden fazla teklifi karşılaştırmak “tek arama panik fiyatını” düşürür.",
          "Fatura/makbuz isteyin; sigorta sonradan iade süreçlerinde belge ister.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "İlgili okumalar: [çekici ne kadar](/rehber/cekici-ne-kadar), [çekici mi tamirci mi](/rehber/cekici-mi-tamirci-mi), [talep nasıl açılır](/rehber/platformda-talep-nasil-acilir).",
          "Bu zincirde yalnızca daha önce yayınlanan rehberlere bağlantı verilir; böylece okuma yolu geriye doğru tutarlı kalır.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Asistansım var, yine teklif alabilir miyim?",
        cevap:
          "Evet. Asistans hattınız yoksa veya geç geliyorsa alternatif teklifleri karşılaştırabilirsiniz.",
      },
      {
        soru: "Kasko her çekiciyi karşılar mı?",
        cevap:
          "Hayır. Poliçeye, limite ve olay tipine bağlıdır. Metni okuyun veya sigortacınıza sorun.",
      },
      {
        soru: "Platform ücretsiz çekici mi veriyor?",
        cevap:
          "Hayır. Platform talep eşleştirir; hizmet bedeli teklifle oluşur. Talep açmak ücretsizdir.",
      },
      {
        soru: "Km hakkım bittiyse ne olur?",
        cevap:
          "Aşan kısım veya tamamı size kalabilir. Net bilgi için asistans hattınızı arayın; paralel teklif de toplayın.",
      },
      {
        soru: "Fatura almalı mıyım?",
        cevap:
          "Evet. Sigorta iadesi veya itiraz süreçlerinde belge işinize yarar.",
      },
    ],
    linkler: [
      { href: "/rehber/cekici-ne-kadar", label: "Çekici ne kadar?" },
      { href: "/rehber/cekici-mi-tamirci-mi", label: "Çekici mi, tamirci mi?" },
      { href: "/rehber/platformda-talep-nasil-acilir", label: "Talep nasıl açılır?" },
      { href: "/cekici-fiyat-hesaplama", label: "Fiyat hesaplama" },
    ],
    ctaHref: talep("cekici"),
    ctaLabel: "Çekici teklifi al",
  },
  {
    slug: "cekici-cagirirken-dikkat",
    title: "Çekici çağırırken dikkat: dolandırıcılık ve pahalı tuzaklar",
    description:
      "Yolda kalınca sık görülen pahalı tuzaklar ve güvenli teklif seçme ipuçları.",
    tarih: "2026-06-11",
    heroSrc: "/rehber/cekici-cagirirken-dikkat.webp",
    heroAlt: "Güvenli çekici çağırma uyarı illüstrasyonu",
    kisaca:
      "Panik anında peşin kapora, belirsiz fiyat ve “tek seçenek” baskısı klasik tuzaklardır. Yazılı veya ekran üzerinde net teklif isteyin. Konum alıp kaybolma ve yolda fiyat artırma kırmızı bayraktır. Birden fazla teklifi yan yana görmek korur.",
    bolumler: [
      {
        baslik: "Kırmızı bayraklar",
        paragraflar: [
          "Gelmeden yüksek peşinat, konum alıp kaybolma, yolda fiyat ikiye katlama, zorla servise yönlendirme.",
          "Kartla ödeme dayatması veya “sadece nakit, makbuz yok” baskısı. Sabit “herkese ücretsiz” vaatleri de şüpheli olabilir — [ücretsiz çekici / sigorta](/rehber/ucretsiz-cekici-var-mi) yazısına bakın.",
          "“Başka çaren yok, hemen karar ver” dili panik satışıdır. Birkaç dakika teklif karşılaştırmak çoğu zaman mümkündür.",
          "Araç evraklarınızı veya telefonunuzu “emanet” istemek kabul edilemez bir işarettir.",
        ],
      },
      {
        baslik: "Daha güvenli yol",
        paragraflar: [
          "Önce [güvenlik adımlarını](/rehber/yolda-kaldim-ne-yapmaliyim) tamamlayın, sonra [talep açıp](/rehber/platformda-talep-nasil-acilir) birden fazla teklifi görün.",
          "Fiyat bandını anlamak için [çekici ne kadar](/rehber/cekici-ne-kadar) rehberindeki faktörleri okuyun; seçmeden önce tutar ve süreyi netleştirin.",
          "Teklifte kapsamı sorun: vinç, bekleme, gece farkı. Belirsiz cevapları eleyin.",
          "Buluşma noktasını kalabalık/görünür bir yerde tutmaya çalışın; mümkünse yalnız karar vermeyin.",
        ],
      },
      {
        baslik: "Ödeme ve belge",
        paragraflar: [
          "Mümkünse makbuz/fiş isteyin. Anlaşılan tutarı seçim anında kilitleyin.",
          "İş bitmeden büyük nakit peşinat vermeyin. Şüphede seçimi iptal edip başka teklife bakın.",
          "Sigorta için fotoğraf ve tutanak ihtiyacınız varsa çekimden önce netleştirin.",
        ],
      },
      {
        baslik: "İletişim hijyeni",
        paragraflar: [
          "Konumunuzu rastgele mesajlaşmalarda değil, seçtiğiniz hizmet verenle paylaşın.",
          "Gelen aramalarda platformdaki teklif tutarıyla uyumu kontrol edin; “ben başka firmayım” sürprizlerine dikkat.",
          "Aile veya yolcuya durumunuzu kısaca bildirin; yalnızlık paniğini azaltır.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "İlgili okumalar: [yolda kaldım](/rehber/yolda-kaldim-ne-yapmaliyim), [çekici ne kadar](/rehber/cekici-ne-kadar), [ücretsiz çekici var mı](/rehber/ucretsiz-cekici-var-mi), [talep nasıl açılır](/rehber/platformda-talep-nasil-acilir).",
          "Bu zincirde yalnızca daha önce yayınlanan rehberlere bağlantı verilir; böylece okuma yolu geriye doğru tutarlı kalır.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Platform hizmet verenleri garanti midir?",
        cevap:
          "Kayıt ve süreç kuralları vardır; nihai hizmet anlaşması sizin seçiminizledir. Şüphede seçmeyin.",
      },
      {
        soru: "Peşinat istemek her zaman dolandırıcılık mı?",
        cevap:
          "Yüksek ve gelmeden peşinat kırmızı bayraktır. Net teklif ve makbuz olmadan ödemeyin.",
      },
      {
        soru: "Yolda fiyat artarsa ne yapmalıyım?",
        cevap:
          "Anlaşılan teklifi hatırlatın. Kabul etmiyorsanız işlemi durdurup alternatif arayın; güvende kalın.",
      },
      {
        soru: "Tek seçenek baskısı normal mi?",
        cevap:
          "Hayır. Panik satışıdır. Mümkünse birkaç teklifi karşılaştırın.",
      },
      {
        soru: "Nakit dışında ödeme olur mu?",
        cevap:
          "Hizmet verene göre değişir. Ödeme şeklini seçmeden önce netleştirin; makbuz isteyin.",
      },
    ],
    linkler: [
      { href: "/rehber/yolda-kaldim-ne-yapmaliyim", label: "Yolda kaldım listesi" },
      { href: "/rehber/cekici-ne-kadar", label: "Çekici ne kadar?" },
      { href: "/rehber/ucretsiz-cekici-var-mi", label: "Ücretsiz çekici / sigorta" },
      { href: "/rehber/platformda-talep-nasil-acilir", label: "Talep nasıl açılır?" },
      { href: "/istanbul/cekici", label: "İstanbul çekici" },
    ],
    ctaHref: talep("cekici"),
    ctaLabel: "Güvenli teklif al",
  },
  {
    slug: "cekici-teklif-nasil-karsilastirilir",
    title: "Çekici tekliflerini nasıl karşılaştırırsın?",
    description:
      "Fiyat, varış süresi ve kapsam — çekici tekliflerini adil karşılaştırmak için kısa rehber.",
    tarih: "2026-06-18",
    heroSrc: "/rehber/cekici-teklif-nasil-karsilastirilir.webp",
    heroAlt: "Birden fazla teklif kartını karşılaştırma illüstrasyonu",
    kisaca:
      "En düşük fiyat her zaman en iyi seçim değildir. Varış süresi, net kapsam ve iletişim netliği birlikte bakılmalıdır. Aynı talep için birden fazla teklifi yan yana görmek adil karşılaştırma sağlar. Belirsiz ifadeleri eleyin.",
    bolumler: [
      {
        baslik: "Bakılacak üç sütun",
        paragraflar: [
          "Tutar: neyin dahil olduğu (vinç, bekleme, gece farkı). Fiyatı etkileyen faktörler için [çekici ne kadar](/rehber/cekici-ne-kadar) yazısına bakın.",
          "Süre: tahmini varış. Konum doğruluğu süreyi doğrudan etkiler.",
          "Netlik: belirsiz “sonra bakarız” ifadeleri risklidir — [çağırırken dikkat](/rehber/cekici-cagirirken-dikkat) listesindeki kırmızı bayrakları hatırlayın.",
          "İletişim: sorularınıza net cevap geliyor mu? Kaçamak dil kötü işarettir.",
        ],
      },
      {
        baslik: "Adil karşılaştırma yöntemi",
        paragraflar: [
          "Aynı hedef adresi tüm teklifler için geçerli kılın. Mesafe farklıysa fiyat da farklılaşır.",
          "Gece/tatil farkını ayrı satır gibi düşünün; gündüz bandıyla kıyaslamayın.",
          "“Ucuz ama eksik kapsam” teklifini, “biraz pahalı ama vinç dahil” teklifle aynı sepete koymayın.",
        ],
      },
      {
        baslik: "Platform avantajı",
        paragraflar: [
          "Acil Çözüm Bul’da aynı talep için birden fazla teklif yan yana gelir; birini seçince iletişim açılır. [Talep nasıl açılır](/rehber/platformda-talep-nasil-acilir) adımlarını izleyin.",
          "Sigorta/asistans iddiası varsa [ücretsiz çekici var mı](/rehber/ucretsiz-cekici-var-mi) rehberiyle çapraz kontrol edin.",
          "Teklifleri reddetmek mümkündür; beğenmezseniz seçmeyin.",
        ],
      },
      {
        baslik: "Karar örnekleri",
        paragraflar: [
          "Otoyol kenarı, gece, yağmur: süre ve güvenlik ağırlıklı seçin.",
          "Şehir içi sakin kenar, gündüz, net lastik/akü: fiyat + kapsam dengesi yeter.",
          "Kaza sonrası vinç ihtiyacı: en ucuz düz çekim teklifi yetersiz kalabilir.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "İlgili okumalar: [çekici ne kadar](/rehber/cekici-ne-kadar), [çekici çağırırken dikkat](/rehber/cekici-cagirirken-dikkat), [ücretsiz çekici](/rehber/ucretsiz-cekici-var-mi), [talep nasıl açılır](/rehber/platformda-talep-nasil-acilir).",
          "Bu zincirde yalnızca daha önce yayınlanan rehberlere bağlantı verilir; böylece okuma yolu geriye doğru tutarlı kalır.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Teklifleri reddedebilir miyim?",
        cevap:
          "Evet. Beğenmezseniz seçmeyebilir veya yeni teklifleri bekleyebilirsiniz.",
      },
      {
        soru: "Sadece fiyata bakmak yanlış mı?",
        cevap:
          "Eksik bir yaklaşımdır. Süre ve kapsam olmadan ucuz teklif pahalıya patlayabilir.",
      },
      {
        soru: "Teklif süresi dolunca ne olur?",
        cevap:
          "Müsaitlik değişebilir. Yeni teklifleri bekleyin veya talebi güncelleyin.",
      },
      {
        soru: "İki teklif aynı fiyattaysa?",
        cevap:
          "Varış süresi, kapsam netliği ve iletişim kalitesine bakın.",
      },
      {
        soru: "Konum yanlışsa karşılaştırma bozulur mu?",
        cevap:
          "Evet. Önce konumu düzeltin; aksi halde süre ve tutar yanıltıcı olur.",
      },
    ],
    linkler: [
      { href: "/rehber/cekici-ne-kadar", label: "Çekici ne kadar?" },
      { href: "/rehber/cekici-cagirirken-dikkat", label: "Çağırırken dikkat" },
      { href: "/rehber/ucretsiz-cekici-var-mi", label: "Ücretsiz çekici / sigorta" },
      { href: "/rehber/platformda-talep-nasil-acilir", label: "Talep nasıl açılır?" },
      { href: "/istanbul/cekici", label: "İstanbul çekici" },
    ],
    ctaHref: talep("cekici"),
    ctaLabel: "Teklifleri karşılaştır",
  },
  {
    slug: "hizmet-veren-nasil-secilir",
    title: "Tekliften hizmet veren nasıl seçilir?",
    description:
      "Fiyat, süre ve netlik — gelen teklifler arasından hizmet veren seçme kriterleri.",
    tarih: "2026-06-25",
    heroSrc: "/rehber/hizmet-veren-nasil-secilir.webp",
    heroAlt: "Teklif kartlarından hizmet veren seçimi illüstrasyonu",
    kisaca:
      "Seçim sizin kontrolünüzdedir. Fiyat + varış süresi + teklif netliğini birlikte okuyun; seçince iletişim açılır. Belirsiz teklifleri eleyin. Aciliyet yüksekse süre, bütçe kritikse kapsamı okuyarak fiyat ağırlıklı bakın.",
    bolumler: [
      {
        baslik: "Karar çerçevesi",
        paragraflar: [
          "Aciliyet yüksekse süre ağırlıklı bakın. Bütçe kritikse fiyatı, ama kapsamı okuyarak seçin — [teklif karşılaştırma](/rehber/cekici-teklif-nasil-karsilastirilir) üç sütununu kullanın.",
          "Belirsiz teklifleri eleyin; [çağırırken dikkat](/rehber/cekici-cagirirken-dikkat) kırmızı bayraklarına bakın. Gerekirse yeni teklifleri bekleyin.",
          "Araç tipiniz ve vinç ihtiyacı net değilse seçmeden önce sorun; yanlış ekipman zaman kaybettirir.",
        ],
      },
      {
        baslik: "Seçim anı kontrol listesi",
        paragraflar: [
          "Tutar ekranda net mi? Süre makul mü? Hedef adres doğrulandı mı?",
          "Ödeme şekli ve makbuz konusunda kısa bir netlik alın.",
          "Şüphe varsa seçmeyin. Seçim bir zorunluluk değil, sizin kararınızdır.",
        ],
      },
      {
        baslik: "Seçim sonrası",
        paragraflar: [
          "Konum ve iletişim paylaşılır. Buluşma noktasını netleştirin. Fiyat beklentisi için [çekici ne kadar](/rehber/cekici-ne-kadar) faktörlerini hatırlayın.",
          "Talep henüz yoksa [platformda talep açma](/rehber/platformda-talep-nasil-acilir) adımlarıyla başlayın.",
          "Gecikme olursa sakin iletişim kurun; gerekirse alternatif teklife bakma seçeneğini değerlendirin.",
        ],
      },
      {
        baslik: "İyi seçimin belirtileri",
        paragraflar: [
          "Net tutar, net süre, net kapsam, saygılı iletişim.",
          "Konumunuza uygun ekipman bilgisi (çekici tipi, vinç).",
          "Zorlama olmadan sorularınıza cevap verilmesi.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "İlgili okumalar: [teklif karşılaştırma](/rehber/cekici-teklif-nasil-karsilastirilir), [çekici çağırırken dikkat](/rehber/cekici-cagirirken-dikkat), [çekici ne kadar](/rehber/cekici-ne-kadar), [talep nasıl açılır](/rehber/platformda-talep-nasil-acilir).",
          "Bu zincirde yalnızca daha önce yayınlanan rehberlere bağlantı verilir; böylece okuma yolu geriye doğru tutarlı kalır.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Seçtikten sonra vazgeçebilir miyim?",
        cevap:
          "Duruma göre süreç değişebilir; mümkün olduğunca seçmeden önce karşılaştırın.",
      },
      {
        soru: "En hızlı teklifi mi seçmeliyim?",
        cevap:
          "Aciliyet yüksekse süre kritiktir; yine de kapsamı okuyun.",
      },
      {
        soru: "En ucuz her zaman iyi midir?",
        cevap:
          "Hayır. Eksik kapsam veya çok geç varış toplam maliyeti artırabilir.",
      },
      {
        soru: "Hizmet verenle nasıl konuşmalıyım?",
        cevap:
          "Kısa ve net: konum, araç tipi, hedef, özel durum. Duygusal tartışmadan kaçının.",
      },
      {
        soru: "Seçim zorunlu mu?",
        cevap:
          "Hayır. Beğenmezseniz seçmeyebilir veya yeni teklif bekleyebilirsiniz.",
      },
    ],
    linkler: [
      { href: "/rehber/cekici-teklif-nasil-karsilastirilir", label: "Teklif karşılaştırma" },
      { href: "/rehber/cekici-cagirirken-dikkat", label: "Çağırırken dikkat" },
      { href: "/rehber/cekici-ne-kadar", label: "Çekici ne kadar?" },
      { href: "/rehber/platformda-talep-nasil-acilir", label: "Talep nasıl açılır?" },
      { href: "/istanbul/yol-yardim", label: "İstanbul yol yardım" },
    ],
    ctaHref: talep(),
    ctaLabel: "Teklif al ve seç",
  },
  {
    slug: "mobil-lastikci-ne-zaman-cagirilir",
    title: "Mobil lastikçi ne zaman çağırılır?",
    description:
      "Patlak, jant hasarı, stepne yok — mobil lastikçi mi yoksa çekici mi gerektiğini netleştiren rehber.",
    tarih: "2026-07-02",
    heroSrc: "/rehber/mobil-lastikci-ne-zaman-cagirilir.webp",
    heroAlt: "Patlak lastik ve mobil lastikçi yardım illüstrasyonu",
    kisaca:
      "Lastik sorunlarının çoğu yerinde çözülebilir. Stepne yoksa, jant eğrildiyse veya güvenli müdahale alanı yoksa çekici gerekebilir. Önce güvenli kenara çekin; sonra mobil lastikçi veya çekici teklifi toplayın.",
    bolumler: [
      {
        baslik: "Mobil lastikçi uygun olduğunda",
        paragraflar: [
          "Hava inmesi, çivi/vida, yedek lastikle yol alınamayacak durumlar ve stepnesiz araçlarda sık tercih edilir.",
          "Önce [güvenli kenara çekin](/rehber/yolda-kaldim-ne-yapmaliyim); servise gitmeden yerinde tamir veya değiştirme teklifi alabilirsiniz.",
          "Şehir içi sakin kenarda, gündüz ve görünür ortamda lastikçi çoğu zaman en hızlı çözümdür.",
          "Lastik ebadı ve marka tercihini notta yazın; stok durumu süreyi etkiler.",
        ],
      },
      {
        baslik: "Çekici düşünülmesi gerekenler",
        paragraflar: [
          "Ciddi jant/lastik hasarı, aracın hareket ettirilememesi, otoyolda güvensiz çalışma alanı — [çekici mi yerinde yardım mı](/rehber/cekici-mi-tamirci-mi) kararını netleştirin.",
          "Kararsızsanız [talepte durumu yazın](/rehber/platformda-talep-nasil-acilir); hem lastikçi hem çekici teklifleri gelebilir, [teklifleri karşılaştırarak](/rehber/cekici-teklif-nasil-karsilastirilir) siz seçersiniz.",
          "İki lastik birden veya SUV/ticari araçlarda ekipman ihtiyacı artabilir.",
        ],
      },
      {
        baslik: "Yerinde müdahale güvenliği",
        paragraflar: [
          "Şerit kenarında diz çöküp lastik sökmek ikincil kaza riski taşır. Güvenli alan yoksa çekimi önceliklendirin.",
          "Dörtlü, yelek ve reflektör kullanın. Yolcuları trafik tarafından uzak tutun.",
          "Gece ve yağmurda görünürlük düşer; süre + güvenlik dengesi fiyatın önüne geçebilir.",
        ],
      },
      {
        baslik: "Teklif alırken sorulacaklar",
        paragraflar: [
          "Tamir mi değişim mi? Lastik araçta mı yoksa sipariş mi? Tahmini tutar ve varış?",
          "Jant hasarı şüphesinde çekici alternatifi netleştirilsin.",
          "Ödeme ve garanti/işçilik kapsamını kısa netleştirin.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "İlgili okumalar: [yolda kaldım](/rehber/yolda-kaldim-ne-yapmaliyim), [çekici mi tamirci mi](/rehber/cekici-mi-tamirci-mi), [teklif karşılaştırma](/rehber/cekici-teklif-nasil-karsilastirilir), [talep nasıl açılır](/rehber/platformda-talep-nasil-acilir).",
          "Bu zincirde yalnızca daha önce yayınlanan rehberlere bağlantı verilir; böylece okuma yolu geriye doğru tutarlı kalır.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Stepnem yok, ne yapmalıyım?",
        cevap:
          "Güvenli kenarda bekleyip mobil lastikçi veya çekici teklifi alın. Çalışma alanı güvensizse çekiciyi önceliklendirin.",
      },
      {
        soru: "Çivili lastik yamalanır mı?",
        cevap:
          "Konuma ve hasara bağlıdır. Lastikçi yerinde değerlendirir; uygun değilse değişim veya çekim gerekir.",
      },
      {
        soru: "İki lastik birden patlarsa?",
        cevap:
          "Yerinde çözüm zorlaşabilir. Stepne yoksa çekici daha gerçekçi olabilir.",
      },
      {
        soru: "Otoyolda lastikçi gelir mi?",
        cevap:
          "Gelebilir; güvenlik yoksa önce güvenli noktaya çekim daha doğrudur.",
      },
      {
        soru: "Lastik ebadını bilmiyorum?",
        cevap:
          "Kapı etiketi veya lastik yanak yazısına bakın; bilmiyorsanız model/yıl yazın.",
      },
    ],
    linkler: [
      { href: "/rehber/yolda-kaldim-ne-yapmaliyim", label: "Yolda kaldım listesi" },
      { href: "/rehber/cekici-mi-tamirci-mi", label: "Çekici mi, tamirci mi?" },
      { href: "/rehber/cekici-teklif-nasil-karsilastirilir", label: "Teklif karşılaştırma" },
      { href: "/rehber/platformda-talep-nasil-acilir", label: "Talep nasıl açılır?" },
      { href: "/istanbul/lastikci", label: "İstanbul mobil lastikçi" },
    ],
    ctaHref: talep("lastikci"),
    ctaLabel: "Lastikçi teklifi al",
  },
  {
    slug: "lastik-patladi-stepne-yok",
    title: "Lastik patladı, stepne yok — seçenekler",
    description:
      "Stepnesiz araçta patlak lastik: mobil lastikçi, çekici ve yol güvenliği seçenekleri.",
    tarih: "2026-07-09",
    heroSrc: "/rehber/lastik-patladi-stepne-yok.webp",
    heroAlt: "Patlak lastik ve stepne olmayan araç yardım seçenekleri",
    kisaca:
      "Stepne yoksa yerinde tamir/değişim veya çekici ile güvenli noktaya alma gerekir. Güvenli şeritte bekleyip mobil lastikçi çağırmak sık çözümdür. Kısa mesafe stepnesiz sürmek jant ve lastik hasarını büyütür.",
    bolumler: [
      {
        baslik: "İlk güvenlik",
        paragraflar: [
          "İlk güvenlik için [yolda kaldım listesini](/rehber/yolda-kaldim-ne-yapmaliyim) uygulayın. Dörtlü ve görünür kenar şarttır.",
          "Patlak lastikle “biraz daha gideyim” refleksi jantı eğer; maliyet büyür.",
          "Otoyoldaysanız [otoyol güvenlik sırasını](/rehber/otoyolda-ariza) hatırlayın.",
        ],
      },
      {
        baslik: "Seçenek A — mobil lastikçi",
        paragraflar: [
          "Tamir veya yeni lastik ile yerinde çözüm. Çalışma alanı güvenli olmalıdır. Ne zaman lastikçi çağıracağınızı [mobil lastikçi rehberinde](/rehber/mobil-lastikci-ne-zaman-cagirilir) özetledik.",
          "Ebat ve varsa tercih (yaz/kış) bilgisini notta yazın.",
          "Stok yoksa süre uzayabilir; alternatif teklif veya çekim planı hazır tutun.",
        ],
      },
      {
        baslik: "Seçenek B — çekici",
        paragraflar: [
          "Jant hasarı, güvensiz konum veya lastik bulunamıyorsa servise çekim. Karar çerçevesi: [çekici mi tamirci mi](/rehber/cekici-mi-tamirci-mi).",
          "Yardımı [talep açarak](/rehber/platformda-talep-nasil-acilir) toplayın; süre ve tutarı yan yana görün.",
          "Hedef servisi önceden düşünmek mesafe fiyatını netleştirir.",
        ],
      },
      {
        baslik: "Karar verirken",
        paragraflar: [
          "Güvenli alan + bulunabilir lastik → lastikçi. Güvensiz alan veya jant hasarı → çekici.",
          "Gece/yağmurda süre ve güvenlik fiyatın önüne geçebilir.",
          "Teklifleri [karşılaştırma çerçevesiyle](/rehber/cekici-teklif-nasil-karsilastirilir) okuyun.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "İlgili okumalar: [mobil lastikçi ne zaman](/rehber/mobil-lastikci-ne-zaman-cagirilir), [çekici mi tamirci mi](/rehber/cekici-mi-tamirci-mi), [yolda kaldım](/rehber/yolda-kaldim-ne-yapmaliyim), [talep nasıl açılır](/rehber/platformda-talep-nasil-acilir).",
          "Bu zincirde yalnızca daha önce yayınlanan rehberlere bağlantı verilir; böylece okuma yolu geriye doğru tutarlı kalır.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Kısa mesafe stepnesiz sürülür mü?",
        cevap:
          "Önerilmez; jant ve lastik hasarını büyütür, güvenlik riski artar.",
      },
      {
        soru: "Run-flat lastikte ne olur?",
        cevap:
          "Sınırlı mesafede kontrollü gidiş mümkün olabilir; üretici limitine uyun ve en kısa sürede yardım alın.",
      },
      {
        soru: "Lastikçi lastik bulamazsa?",
        cevap:
          "Çekim veya başka noktadan lastik tedariki gündeme gelir. Alternatif teklifleri değerlendirin.",
      },
      {
        soru: "Jant eğrildiyse lastikçi yeter mi?",
        cevap:
          "Çoğu zaman hayır. Servise çekim gerekebilir.",
      },
      {
        soru: "İki teker birden mi inmiş?",
        cevap:
          "Yerinde çözüm zorlaşır; çekici daha gerçekçi olabilir.",
      },
    ],
    linkler: [
      { href: "/rehber/mobil-lastikci-ne-zaman-cagirilir", label: "Mobil lastikçi ne zaman?" },
      { href: "/rehber/cekici-mi-tamirci-mi", label: "Çekici mi, tamirci mi?" },
      { href: "/rehber/yolda-kaldim-ne-yapmaliyim", label: "Yolda kaldım listesi" },
      { href: "/rehber/platformda-talep-nasil-acilir", label: "Talep nasıl açılır?" },
      { href: "/istanbul/lastikci", label: "İstanbul lastikçi" },
    ],
    ctaHref: talep("lastikci"),
    ctaLabel: "Lastik yardımı iste",
  },
  {
    slug: "aku-bitince-ne-yapilir",
    title: "Akü bitince ne yapılır? Takviye mi, değişim mi?",
    description:
      "Akü bitmesinde takviye, şarj ve değişim seçenekleri; kış riskleri ve yol yardım çağırma zamanı.",
    tarih: "2026-07-16",
    heroSrc: "/rehber/aku-bitince-ne-yapilir.webp",
    heroAlt: "Kaput açık araçta akü takviyesi illüstrasyonu",
    kisaca:
      "Çoğu yolda kalma aküde takviye ile çözülür. Tekrarlayan bitmelerde akü ömrü veya şarj sistemi kontrol edilmelidir. Yanlış polarite elektronik riski yaratır; emin değilseniz profesyonel çağırın.",
    bolumler: [
      {
        baslik: "İlk kontroller",
        paragraflar: [
          "Farları ve elektronik yükü kapatın. Klemensler gevşek/korozyonlu mu bakın (güvenli şekilde). Araç konumunu [güvenlik listesine](/rehber/yolda-kaldim-ne-yapmaliyim) göre netleştirin.",
          "Yardımcı araçla takviye biliyorsanız doğru polariteye dikkat edin; emin değilseniz profesyonel çağırın.",
          "Kaput açılırken trafik tarafında durmayın; görünür kenarda çalışın.",
        ],
      },
      {
        baslik: "Takviye, şarj, değişim",
        paragraflar: [
          "Tek seferlik bitmede takviye sık yeter. Araç çalıştıktan sonra kısa mesafe yetmeyebilir; alternatörün şarj etmesi için sürüş gerekebilir.",
          "Aynı gün tekrar bitiyorsa akü testi veya değişim planlayın — [talep notuna](/rehber/platformda-talep-nasil-acilir) bunu belirtin.",
          "Çekim mi takviye mi belirsizse [çekici mi tamirci mi](/rehber/cekici-mi-tamirci-mi) rehberine bakın.",
        ],
      },
      {
        baslik: "Teklifleri okuma",
        paragraflar: [
          "Teklifleri [karşılaştırma çerçevesiyle](/rehber/cekici-teklif-nasil-karsilastirilir) (süre + tutar + netlik) değerlendirin.",
          "Akü değişimi teklifinde marka/amper ve işçilik kapsamını sorun.",
          "Sadece “takviye” yazan teklifle “akü + takviye” teklifini aynı sepete koymayın.",
        ],
      },
      {
        baslik: "Önleme notları",
        paragraflar: [
          "Eski aküyü periyodik ölçütün. Uzun park ve kısa mesafeler riski artırır.",
          "Işık, multimedya ve ısıtıcı yükünü motor kapalıyken uzun süre açık bırakmayın.",
          "Kışa girerken zayıf akü erken bitirir; ayrı bir kış yazımız da var.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "İlgili okumalar: [yolda kaldım](/rehber/yolda-kaldim-ne-yapmaliyim), [çekici mi tamirci mi](/rehber/cekici-mi-tamirci-mi), [teklif karşılaştırma](/rehber/cekici-teklif-nasil-karsilastirilir), [talep nasıl açılır](/rehber/platformda-talep-nasil-acilir).",
          "Bu zincirde yalnızca daha önce yayınlanan rehberlere bağlantı verilir; böylece okuma yolu geriye doğru tutarlı kalır.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Akü takviyesi ücretli midir?",
        cevap:
          "Hizmet veren kendi teklifini yazar. Tutarı seçmeden önce teklif kartında görürsünüz.",
      },
      {
        soru: "Takviye sonrası hemen uzun yol yapılır mı?",
        cevap:
          "Mümkünse önce şarj için sürüş ve gözlem yapın. Tekrar bitme varsa servise gidin.",
      },
      {
        soru: "Aküyü kendim değiştirir miyim?",
        cevap:
          "Deneyiminiz yoksa profesyonel çağırın. Yanlış bağlantı pahalı hasar yaratır.",
      },
      {
        soru: "Start-stop araçlarda fark var mı?",
        cevap:
          "Evet; özel akü tipi gerekebilir. Modelinizi notta yazın.",
      },
      {
        soru: "Çekici ne zaman gerekir?",
        cevap:
          "Takviye ile çalışmıyorsa, şarj sistemi şüphesi varsa veya güvenli müdahale alanı yoksa.",
      },
    ],
    linkler: [
      { href: "/rehber/yolda-kaldim-ne-yapmaliyim", label: "Yolda kaldım listesi" },
      { href: "/rehber/cekici-mi-tamirci-mi", label: "Çekici mi, tamirci mi?" },
      { href: "/rehber/cekici-teklif-nasil-karsilastirilir", label: "Teklif karşılaştırma" },
      { href: "/rehber/platformda-talep-nasil-acilir", label: "Talep nasıl açılır?" },
      { href: "/istanbul/aku-takviye", label: "İstanbul akü takviye" },
    ],
    ctaHref: talep("aku-takviye"),
    ctaLabel: "Akü yardımı iste",
  },
  {
    slug: "kis-aku-ve-yol-yardim",
    title: "Kışın akü bitmesi ve yol yardım ipuçları",
    description:
      "Soğuk havada akü riskleri, önlemler ve yolda kaldığınızda akü/yol yardım çağrısı.",
    tarih: "2026-07-23",
    heroSrc: "/rehber/kis-aku-ve-yol-yardim.webp",
    heroAlt: "Kış sabahı akü ve yol yardım illüstrasyonu",
    kisaca:
      "Soğuk, zayıf aküyü erken bitirir. Kış öncesi test ve kısa mesafelerde ek yükten kaçınmak işe yarar; yolda kalınca takviye talebi açın. Takviye sonrası tekrar bitme olasılığına karşı servis planı yapın.",
    bolumler: [
      {
        baslik: "Kış neden aküyü zorlar?",
        paragraflar: [
          "Soğuk kimyasal reaksiyonu yavaşlatır; zayıf akü crank gücünü kaybeder.",
          "Koltuk ısıtıcı, cam rezistansı ve fan ilk saniyelerde ek yük bindirir.",
          "Kısa şehir içi sürüşler aküyü tam şarj etmeyebilir.",
        ],
      },
      {
        baslik: "Önlem",
        paragraflar: [
          "Eski aküyü kış öncesi ölçütün. Uzun süre kapalı kalan araçlarda risk artar.",
          "Koltuk ısıtıcı / cam rezistansı gibi yükleri çalıştırma anında minimize edin.",
          "Gerekirse akıllı bakım şarjı veya periyodik çalıştırma planlayın.",
        ],
      },
      {
        baslik: "Yolda kaldıysanız",
        paragraflar: [
          "Bitince adımlar [akü bitince ne yapılır](/rehber/aku-bitince-ne-yapilir) yazısında; önce [güvenlik listesini](/rehber/yolda-kaldim-ne-yapmaliyim) uygulayın.",
          "Takviye sonrası tekrar bitme olasılığına karşı servis planı yapın. Yardımı [talep açarak](/rehber/platformda-talep-nasil-acilir) toplayın; seçimde [hizmet veren seçimi](/rehber/hizmet-veren-nasil-secilir) kriterlerini kullanın.",
          "Gece ve buzlu zeminde görünürlük + kayma riski artar; acele etmeyin.",
        ],
      },
      {
        baslik: "Lastik ve yakıt yan notları",
        paragraflar: [
          "Kışın sadece akü bitmez; lastik basıncı düşer, dizelde jelleşme riski artabilir.",
          "Yine de akü en sık nedenlerden biridir; panikte doğru türü seçin.",
          "Çoklu sorun şüphesinde durumu notta yazın.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "İlgili okumalar: [akü bitince ne yapılır](/rehber/aku-bitince-ne-yapilir), [yolda kaldım](/rehber/yolda-kaldim-ne-yapmaliyim), [hizmet veren seçimi](/rehber/hizmet-veren-nasil-secilir), [talep nasıl açılır](/rehber/platformda-talep-nasil-acilir).",
          "Bu zincirde yalnızca daha önce yayınlanan rehberlere bağlantı verilir; böylece okuma yolu geriye doğru tutarlı kalır.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Kışın sadece akü mü biter?",
        cevap:
          "Hayır; lastik basıncı ve yakıt jeli gibi konular da artar. Ama akü en sık nedenlerden biridir.",
      },
      {
        soru: "Aküyü kışın daha sık test ettirmeli miyim?",
        cevap:
          "Evet, özellikle 3–4 yaş üstü akülerde kış öncesi test önerilir.",
      },
      {
        soru: "Garajda yatan araç riskli mi?",
        cevap:
          "Uzun kapalı kalma şarjı düşürür. Periyodik çalıştırma veya bakım şarjı düşünün.",
      },
      {
        soru: "Takviye sonrası soğukta tekrar biter mi?",
        cevap:
          "Zayıf aküde evet. Aynı gün tekrar bitiyorsa değişim/test planlayın.",
      },
      {
        soru: "Dizel araçlarda ek risk var mı?",
        cevap:
          "Evet; soğukta yakıt ve glow sistemi de zorlanabilir. Durumu notta yazın.",
      },
    ],
    linkler: [
      { href: "/rehber/aku-bitince-ne-yapilir", label: "Akü bitince ne yapılır?" },
      { href: "/rehber/yolda-kaldim-ne-yapmaliyim", label: "Yolda kaldım listesi" },
      { href: "/rehber/hizmet-veren-nasil-secilir", label: "Hizmet veren seçimi" },
      { href: "/rehber/platformda-talep-nasil-acilir", label: "Talep nasıl açılır?" },
      { href: "/istanbul/aku-takviye", label: "İstanbul akü takviye" },
    ],
    ctaHref: talep("aku-takviye"),
    ctaLabel: "Kış akü yardımı",
  },
  {
    slug: "aracda-anahtar-unuttum",
    title: "Araçta anahtar unuttum / kilitli kaldı — ne yapılır?",
    description:
      "Kapıda kilitli kalan anahtar veya kayıp kumanda durumunda oto anahtarcı süreci ve güvenlik uyarıları.",
    tarih: "2026-07-30",
    heroSrc: "/rehber/aracda-anahtar-unuttum.webp",
    heroAlt: "Kilitli araç kapısı ve anahtar silüeti illüstrasyonu",
    kisaca:
      "Zorla açma denemeleri boya ve mekanizmaya zarar verebilir. Onaylı oto anahtarcı ile kontrollü müdahale daha güvenlidir. Çocuk veya hayvan içerideyse öncelik acil yardım hatlarıdır.",
    bolumler: [
      {
        baslik: "Yapılmaması gerekenler",
        paragraflar: [
          "Tel, tornavida veya “internet hileleri” ile kapı/cam zorlamak hasar ve güvenlik riski yaratır.",
          "Çocuk veya hayvan içerideyse öncelik acil yardım hatlarıdır; ardından anahtarcı. Genel panik sırası için [yolda kaldım listesine](/rehber/yolda-kaldim-ne-yapmaliyim) bakın.",
          "Sosyal medyadan “açma videosu” uygulamak kilidi bozabilir ve sigorta sorununa yol açabilir.",
        ],
      },
      {
        baslik: "Süreç nasıl işler?",
        paragraflar: [
          "Konum ve araç modelini paylaşın. Anahtarcı varış ve ücret teklifi gönderir; siz onaylarsınız — [talep nasıl açılır](/rehber/platformda-talep-nasil-acilir).",
          "Yedek anahtar uzaktaysa bazen çekici + servis kombinasyonu daha mantıklı olabilir; [çekici mi yerinde yardım mı](/rehber/cekici-mi-tamirci-mi) ve [teklif karşılaştırma](/rehber/cekici-teklif-nasil-karsilastirilir) çerçevelerini kullanın.",
          "Anahtarsız giriş / alarm sistemlerinde süre modelden modele değişir; durumu notta yazın.",
        ],
      },
      {
        baslik: "Maliyet ve süre",
        paragraflar: [
          "Gece, otopark katı, lüks segment ve özel kilitler fiyatı etkiler.",
          "Sadece “kapı açma” ile “yedek anahtar kodlama” farklı işlerdir; teklifte hangisi olduğunu netleştirin.",
          "Şüpheli peşinat taleplerine [çağırırken dikkat](/rehber/cekici-cagirirken-dikkat) listesiyle bakın.",
        ],
      },
      {
        baslik: "Sonrası için önlem",
        paragraflar: [
          "Yedek anahtarı erişilebilir ama güvenli bir yerde tutun.",
          "Kumanda pilini periyodik değiştirin; zayıf pil kilit sürprizi yaratır.",
          "Valet/anahtarsız senaryolarda ikinci faktör (telefon anahtarı vb.) varsa aktif edin.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "İlgili okumalar: [yolda kaldım](/rehber/yolda-kaldim-ne-yapmaliyim), [çekici mi tamirci mi](/rehber/cekici-mi-tamirci-mi), [teklif karşılaştırma](/rehber/cekici-teklif-nasil-karsilastirilir), [talep nasıl açılır](/rehber/platformda-talep-nasil-acilir).",
          "Bu zincirde yalnızca daha önce yayınlanan rehberlere bağlantı verilir; böylece okuma yolu geriye doğru tutarlı kalır.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Anahtarsız giriş sistemlerinde süreç farklı mı?",
        cevap:
          "Model ve güvenlik donanımına göre süre değişebilir; durumu talep notuna yazın.",
      },
      {
        soru: "Cam kırarak açmak doğru mu?",
        cevap:
          "Son çare ve risklidir. Çocuk/hayvan acilinde resmi yardım hatlarını izleyin.",
      },
      {
        soru: "Yedek anahtar uzaktaysa?",
        cevap:
          "Anahtarcı veya çekici+servis seçeneklerini süre/maliyet ile karşılaştırın.",
      },
      {
        soru: "Otoparkta kaldıysam?",
        cevap:
          "Kat/alan bilgisini net yazın; sinyal ve erişim süresi etkilenebilir.",
      },
      {
        soru: "Ücret önceden belli olur mu?",
        cevap:
          "Teklif kartında görünür. Model ve işlem tipine göre değişir.",
      },
    ],
    linkler: [
      { href: "/rehber/yolda-kaldim-ne-yapmaliyim", label: "Yolda kaldım listesi" },
      { href: "/rehber/cekici-mi-tamirci-mi", label: "Çekici mi, tamirci mi?" },
      { href: "/rehber/cekici-teklif-nasil-karsilastirilir", label: "Teklif karşılaştırma" },
      { href: "/rehber/platformda-talep-nasil-acilir", label: "Talep nasıl açılır?" },
      { href: "/istanbul/oto-anahtarci", label: "İstanbul oto anahtarcı" },
    ],
    ctaHref: talep("oto-anahtarci"),
    ctaLabel: "Anahtarcı teklifi al",
  },
  {
    slug: "benzin-bitti-yolda",
    title: "Yolda benzin / mazot bitince yakıt yardımı",
    description:
      "Yakıt bitmesinde güvenli bekleyiş, yakıt yardımı çağırma ve çekiciye ne zaman ihtiyaç duyulduğu.",
    tarih: "2026-08-06",
    heroSrc: "/rehber/benzin-bitti-yolda.webp",
    heroAlt: "Boş yakıt göstergesi ve yol kenarı yardım illüstrasyonu",
    kisaca:
      "Yakıt bitmesi sık görülen bir yolda kalma nedenidir. Küçük miktar yakıt getirisi çoğu zaman yeter; araç tamamen riskli konumdaysa çekici düşünülür. Yanlış yakıt tipi pahalı hasara yol açar — benzin/dizel bilgisini doğru verin.",
    bolumler: [
      {
        baslik: "Güvenli bekleyiş",
        paragraflar: [
          "Mümkünse bankete çekin, dörtlüleri açın. Otoyolda yürüyerek istasyona gitmeyin — [otoyolda arıza](/rehber/otoyolda-ariza) güvenlik sırasını izleyin.",
          "Yakıt tipini (benzin/dizel) doğru bildirin — yanlış yakıt pahalı hasara yol açar. Genel adımlar: [yolda kaldım](/rehber/yolda-kaldim-ne-yapmaliyim).",
          "Geceyse yelek ve görünürlük kritiktir; şerit kenarında dolaşmayın.",
        ],
      },
      {
        baslik: "Yakıt yardımı vs çekici",
        paragraflar: [
          "Kısa mesafe ve güvenli bekleyişte yakıt yardımı genelde hızlı çözümdür.",
          "Araç şeridi kapatıyorsa veya yakıt getirisi mümkün değilse çekici ile güvenli noktaya alma tercih edilebilir — [çekici mi tamirci mi](/rehber/cekici-mi-tamirci-mi).",
          "Talebi [platformdan açın](/rehber/platformda-talep-nasil-acilir); tutar ve süreyi yan yana görün.",
        ],
      },
      {
        baslik: "Teklifte netleştirilecekler",
        paragraflar: [
          "Getirilecek miktar, yakıt tipi, işçilik/varış ücreti ayrı mı?",
          "Ödeme şekli ve makbuz. “Sadece yakıt parası” ile “hizmet + yakıt” ayrımını sorun.",
          "Dizelde jelleşme şüphesi varsa durumu yazın; sadece litre getirisi yetmeyebilir.",
        ],
      },
      {
        baslik: "Sonrası",
        paragraflar: [
          "İstasyona varınca depoyu makul seviyeye tamamlayın; tekrar bitirme riskini azaltın.",
          "Yakıt göstergesi/sensör arızası şüphesinde servis kontrolü yaptırın.",
          "Uzun yolda yedek plan: istasyon aralığını ve rezerv uyarılarını ciddiye alın.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "İlgili okumalar: [yolda kaldım](/rehber/yolda-kaldim-ne-yapmaliyim), [otoyolda arıza](/rehber/otoyolda-ariza), [çekici mi tamirci mi](/rehber/cekici-mi-tamirci-mi), [talep nasıl açılır](/rehber/platformda-talep-nasil-acilir).",
          "Bu zincirde yalnızca daha önce yayınlanan rehberlere bağlantı verilir; böylece okuma yolu geriye doğru tutarlı kalır.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Ne kadar yakıt getirilir?",
        cevap:
          "Genelde istasyona gidecek kadar. Miktar ve ücret teklifte belirtilir.",
      },
      {
        soru: "Yanlış yakıt doldurulursa?",
        cevap:
          "Çalıştırmayın, servis/çekici planlayın. Pahalı hasar riski vardır.",
      },
      {
        soru: "LPG’li araçlarda süreç farklı mı?",
        cevap:
          "Benzin bitmesi senaryosu modele göre değişir; durumu notta yazın.",
      },
      {
        soru: "Otoyolda yürüyüp alayım mı?",
        cevap:
          "Hayır. Tehlikelidir. Yardım çağırın.",
      },
      {
        soru: "Çekici mi yakıt mı?",
        cevap:
          "Güvenli bekleyişte yakıt çoğu zaman yeter; şerit riski varsa çekici.",
      },
    ],
    linkler: [
      { href: "/rehber/yolda-kaldim-ne-yapmaliyim", label: "Yolda kaldım listesi" },
      { href: "/rehber/otoyolda-ariza", label: "Otoyolda arıza" },
      { href: "/rehber/cekici-mi-tamirci-mi", label: "Çekici mi, tamirci mi?" },
      { href: "/rehber/platformda-talep-nasil-acilir", label: "Talep nasıl açılır?" },
      { href: "/istanbul/yakit-yardimi", label: "İstanbul yakıt yardımı" },
      { href: "/istanbul/cekici", label: "İstanbul çekici" },
    ],
    ctaHref: talep("yakit-yardimi"),
    ctaLabel: "Yakıt yardımı iste",
  },
  {
    slug: "gece-cekici-bulma",
    title: "Gece veya tatilde çekici / yol yardım nasıl bulunur?",
    description:
      "Gece, bayram ve tatil saatlerinde yol yardım bulma: süre, fiyat farkı ve güvenli çağrı ipuçları.",
    tarih: "2026-08-13",
    heroSrc: "/rehber/gece-cekici-bulma.webp",
    heroAlt: "Gece otoyol kenarında yol yardım illüstrasyonu",
    kisaca:
      "Gece ve tatilde müsait hizmet veren sayısı azalabilir; süre ve fiyat bandı gündüze göre farklı olabilir. Birden fazla teklif toplamak avantajdır. Konumu net paylaşın; peşinat tuzaklarına dikkat edin.",
    bolumler: [
      {
        baslik: "Ne beklemeli?",
        paragraflar: [
          "Varış süresi uzayabilir. Panik fiyatına tek aramayla bağlanmak yerine birkaç teklifi yan yana görün — [teklif karşılaştırma](/rehber/cekici-teklif-nasil-karsilastirilir).",
          "Konumu net paylaşın; gece görünürlük ve güvenli kenar kritiktir ([yolda kaldım](/rehber/yolda-kaldim-ne-yapmaliyim)). Fiyat farkı için [çekici ne kadar](/rehber/cekici-ne-kadar) faktörlerine bakın.",
          "Bayram ve uzun tatillerde arz daha da incelir; erken talep açmak faydalıdır.",
        ],
      },
      {
        baslik: "Güvenlik",
        paragraflar: [
          "Araçta beklerken mümkünse yolun güvenli tarafında kalın. Şüpheli “hemen geliyorum, kapora” taleplerine itibar etmeyin — [çağırırken dikkat](/rehber/cekici-cagirirken-dikkat).",
          "Yelek, dörtlü ve mümkünse ek ışık kullanın.",
          "Yalnızsanız bir yakına konumunuzu bildirin.",
        ],
      },
      {
        baslik: "Teklif seçimi gece farkı",
        paragraflar: [
          "Gündüz bandıyla kıyaslayıp “çok pahalı” demeden önce arz-talebi hesaba katın.",
          "Süre kritikse en ucuz yerine makul süreli net teklifi seçin.",
          "Kapsamı okuyun: gece farkı dahil mi, ayrı mı?",
        ],
      },
      {
        baslik: "İletişim ipuçları",
        paragraflar: [
          "Telefon şarjınızı koruyun; gerekirse güç bankası kullanın.",
          "Buluşma noktasını ışıklı/görünür tarif edin.",
          "Gecikmede sakin güncelleme isteyin; panik pazarlığına girmeyin.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "İlgili okumalar: [çekici çağırırken dikkat](/rehber/cekici-cagirirken-dikkat), [çekici ne kadar](/rehber/cekici-ne-kadar), [teklif karşılaştırma](/rehber/cekici-teklif-nasil-karsilastirilir), [yolda kaldım](/rehber/yolda-kaldim-ne-yapmaliyim).",
          "Bu zincirde yalnızca daha önce yayınlanan rehberlere bağlantı verilir; böylece okuma yolu geriye doğru tutarlı kalır.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Gece her zaman daha pahalı mı?",
        cevap:
          "Sıklıkla fark olur ama sabit kural değildir; teklifler o anki arz-talebe göre gelir.",
      },
      {
        soru: "Tatilde hiç çekici bulunmaz mı?",
        cevap:
          "Bulunabilir ama süre uzayabilir. Erken talep ve net konum kritiktir.",
      },
      {
        soru: "Tek aramayla bağlanmak daha hızlı mı?",
        cevap:
          "Bazen evet gibi görünür; panik fiyatı riski yüksektir. Birkaç teklif genelde daha güvenlidir.",
      },
      {
        soru: "Kadın sürücü yalnızsa ek öneri?",
        cevap:
          "Görünür/ışıklı nokta, yakına bilgi, şüpheli peşinatları reddetmek.",
      },
      {
        soru: "Asistans geceleri çalışır mı?",
        cevap:
          "Pakete göre 7/24 olabilir. Yoğunsa platform teklifleri alternatif olur.",
      },
    ],
    linkler: [
      { href: "/rehber/cekici-cagirirken-dikkat", label: "Çağırırken dikkat" },
      { href: "/rehber/cekici-ne-kadar", label: "Çekici ne kadar?" },
      { href: "/rehber/cekici-teklif-nasil-karsilastirilir", label: "Teklif karşılaştırma" },
      { href: "/rehber/yolda-kaldim-ne-yapmaliyim", label: "Yolda kaldım listesi" },
      { href: "/istanbul/cekici", label: "İstanbul çekici" },
    ],
    ctaHref: talep("cekici"),
    ctaLabel: "Gece çekici teklifi al",
  },
  {
    slug: "kaza-sonrasi-cekici",
    title: "Kaza sonrası çekici: ne zaman, nasıl çağırılır?",
    description:
      "Kaza sonrası güvenlik, tutanak ve çekici çağırma zamanı — sakin adımlarla ilerleme rehberi.",
    tarih: "2026-08-20",
    heroSrc: "/rehber/kaza-sonrasi-cekici.webp",
    heroAlt: "Kaza sonrası çekici ihtiyacı illüstrasyonu (şiddet içermez)",
    kisaca:
      "Önce güvenlik ve gerekirse acil yardım. Araç yürüyemiyorsa veya trafik riski varsa çekici devreye girer. Hasar tipini (çekilebilir/vinç) ve hedefi netleştirin; sigorta kapsamını poliçeden kontrol edin.",
    bolumler: [
      {
        baslik: "Öncelik sırası",
        paragraflar: [
          "Yaralı varsa 112. Trafik güvenliği, fotoğraf/tutanak ihtiyaçları. Genel güvenlik için [yolda kaldım listesine](/rehber/yolda-kaldim-ne-yapmaliyim) bakın.",
          "Araç hareket ettirilemiyorsa veya şeridi kapatıyorsa çekici çağırın — [çekici mi yerinde yardım mı](/rehber/cekici-mi-tamirci-mi) netleştirin.",
          "Yürüyebilen araçta bile güvenlik riski varsa zorlamayın.",
        ],
      },
      {
        baslik: "Belge ve sigorta",
        paragraflar: [
          "Fotoğraf, ifade ve tutanak ihtiyaçlarınızı çekimden önce mümkün olduğunca tamamlayın (güvenlik elverdiği ölçüde).",
          "Sigorta kapsamı için [ücretsiz çekici var mı](/rehber/ucretsiz-cekici-var-mi) yazısına bakın.",
          "Anlaşmalı servis/çekici dayatması varsa poliçe koşullarınızı sorun; alternatif teklif hakkı olabilir.",
        ],
      },
      {
        baslik: "Çekici çağırırken",
        paragraflar: [
          "Hasar tipini (çekilebilir / vinç) not edin. Hedef: yetkili servis, sigorta anlaşmalı yer veya otopark.",
          "Tekliflerde süre ve tutarı birlikte değerlendirin ([teklif karşılaştırma](/rehber/cekici-teklif-nasil-karsilastirilir)); gece ise [gece çekici](/rehber/gece-cekici-bulma) notlarını da okuyun.",
          "Airbag açılmış veya şasi hasarı şüphesinde vinç ihtiyacı artabilir.",
        ],
      },
      {
        baslik: "Çekim sonrası",
        paragraflar: [
          "Teslim yerini ve kilometreyi not edin. Fatura/makbuz saklayın.",
          "Kişisel eşyaları mümkünse önceden alın.",
          "Sigorta dosya numaranızı hizmet verenle paylaşmanız istenebilir; zorunlu alanları bilinçli doldurun.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "İlgili okumalar: [ücretsiz çekici / sigorta](/rehber/ucretsiz-cekici-var-mi), [çekici mi tamirci mi](/rehber/cekici-mi-tamirci-mi), [teklif karşılaştırma](/rehber/cekici-teklif-nasil-karsilastirilir), [gece çekici](/rehber/gece-cekici-bulma).",
          "Bu zincirde yalnızca daha önce yayınlanan rehberlere bağlantı verilir; böylece okuma yolu geriye doğru tutarlı kalır.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Sigorta çekiciyi karşılar mı?",
        cevap:
          "Poliçeye göre değişir. Ayrıntı için “Ücretsiz çekici var mı?” yazısına bakın.",
      },
      {
        soru: "Yaralı varken önce çekici mi?",
        cevap:
          "Hayır. Önce 112 ve güvenlik. Çekici ikinci plandadır.",
      },
      {
        soru: "Vinç ne zaman gerekir?",
        cevap:
          "Teker dönmüyorsa, araç hendekteyse veya standart çekim güvenli değilse.",
      },
      {
        soru: "Anlaşmalı servise zorunlu mu?",
        cevap:
          "Poliçeye bağlıdır. Koşulları sorun; alternatif haklar olabilir.",
      },
      {
        soru: "Gece kaza oldu, ne farklı?",
        cevap:
          "Görünürlük ve arz azalır. [Gece çekici](/rehber/gece-cekici-bulma) notlarını uygulayın.",
      },
    ],
    linkler: [
      { href: "/rehber/ucretsiz-cekici-var-mi", label: "Ücretsiz çekici / sigorta" },
      { href: "/rehber/cekici-mi-tamirci-mi", label: "Çekici mi, tamirci mi?" },
      { href: "/rehber/cekici-teklif-nasil-karsilastirilir", label: "Teklif karşılaştırma" },
      { href: "/rehber/gece-cekici-bulma", label: "Gece çekici bulma" },
      { href: "/istanbul/cekici", label: "İstanbul çekici" },
    ],
    ctaHref: talep("cekici"),
    ctaLabel: "Çekici teklifi al",
  },
  {
    slug: "sehirlerarasi-arac-tasima",
    title: "Şehirler arası araç taşıma / nakliye rehberi",
    description:
      "Şehirler arası araç nakliyesinde süreç, dikkat noktaları ve talep oluşturma ipuçları.",
    tarih: "2026-08-27",
    heroSrc: "/rehber/sehirlerarasi-arac-tasima.webp",
    heroAlt: "Şehirler arası araç taşıma illüstrasyonu",
    kisaca:
      "Nakliye, acil yolda kalmadan farklı planlanır: alınış/teslim noktası, tarih esnekliği ve araç durumu net olmalıdır. Çalışmayan araç da taşınabilir; durumu teklif aşamasında belirtin. Sigorta/sorumluluk çerçevesini sorun.",
    bolumler: [
      {
        baslik: "Bilgi hazırlığı",
        paragraflar: [
          "Çıkış ve varış illeri, araç tipi, çalışır durumda mı, kapalı kasa tercihi.",
          "Acil çekim ile planlı nakliyeyi karıştırmayın — süre ve fiyat modeli farklıdır. Acil senaryoda [çekici mi tamirci mi](/rehber/cekici-mi-tamirci-mi) ve [çekici ne kadar](/rehber/cekici-ne-kadar) daha uygundur.",
          "Alınış ve teslim için net adres, yetkili kişi ve saat aralığı hazırlayın.",
        ],
      },
      {
        baslik: "Teklif alırken",
        paragraflar: [
          "Teslim süresi, sigorta/sorumluluk çerçevesi ve ek ücret koşullarını sorun. [Teklif karşılaştırma](/rehber/cekici-teklif-nasil-karsilastirilir) ve [hizmet veren seçimi](/rehber/hizmet-veren-nasil-secilir) kriterleri burada da işe yarar.",
          "İstanbul çıkışlı işler için şehir sayfasından veya [talep formundan](/rehber/platformda-talep-nasil-acilir) talep açabilirsiniz.",
          "Açık kasa / kapalı kasa / kayar sistem farklarını sorun; araç yüksekliği ve alçak profil kritik olabilir.",
        ],
      },
      {
        baslik: "Fiyatı etkileyenler",
        paragraflar: [
          "Mesafe, sezon, tekli/çoklu taşıma, ekspres teslim, çalışmayan araç, feribot/geçiş ücretleri.",
          "“En ucuz” teklifte teslim süresinin uzayabileceğini bilin.",
          "Yazılı teklif ve kapsam maddelerini saklayın.",
        ],
      },
      {
        baslik: "Teslim günü",
        paragraflar: [
          "Araç durumu fotoğraflansın. Yakıt, eşya ve evrak kontrolü yapın.",
          "Hasar tutanağı prosedürünü baştan sorun.",
          "Ödeme kırıılımını (kapora/teslim) netleştirin; şüpheli peşinatlara dikkat.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "İlgili okumalar: [çekici ne kadar](/rehber/cekici-ne-kadar), [teklif karşılaştırma](/rehber/cekici-teklif-nasil-karsilastirilir), [hizmet veren seçimi](/rehber/hizmet-veren-nasil-secilir), [talep nasıl açılır](/rehber/platformda-talep-nasil-acilir).",
          "Bu zincirde yalnızca daha önce yayınlanan rehberlere bağlantı verilir; böylece okuma yolu geriye doğru tutarlı kalır.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Çalışmayan araç taşınır mı?",
        cevap:
          "Çoğu zaman evet; durumu teklif aşamasında belirtin.",
      },
      {
        soru: "Ne kadar sürer?",
        cevap:
          "Mesafeye, güzergâha ve ekspres tercihe göre değişir. Teklifte süre sorun.",
      },
      {
        soru: "Kapalı kasa şart mı?",
        cevap:
          "Şart değil ama hava/koşullara göre tercih edilebilir. Fiyatı etkiler.",
      },
      {
        soru: "Sigorta kimde?",
        cevap:
          "Taşıyıcının sorumluluk/sigorta çerçevesini teklif aşamasında sorun ve belgeleyin.",
      },
      {
        soru: "Acil yolda kalmayla aynı mı?",
        cevap:
          "Hayır. Nakliye planlıdır; acil çekim farklı fiyatlama ve süre modeli kullanır.",
      },
    ],
    linkler: [
      { href: "/rehber/cekici-ne-kadar", label: "Çekici ne kadar?" },
      { href: "/rehber/cekici-teklif-nasil-karsilastirilir", label: "Teklif karşılaştırma" },
      { href: "/rehber/hizmet-veren-nasil-secilir", label: "Hizmet veren seçimi" },
      { href: "/rehber/platformda-talep-nasil-acilir", label: "Talep nasıl açılır?" },
      { href: "/istanbul/arac-tasima", label: "İstanbul araç nakliye" },
    ],
    ctaHref: talep("arac-tasima"),
    ctaLabel: "Nakliye teklifi al",
  },
  {
    slug: "istanbul-cekici-rehberi",
    title: "İstanbul’da çekici: Avrupa / Anadolu yakası pratik rehber",
    description:
      "İstanbul’da çekici ve yol yardım: yaka, trafik ve ilçe bazlı pratik yönlendirme.",
    tarih: "2026-09-03",
    heroSrc: "/rehber/istanbul-cekici-rehberi.webp",
    heroAlt: "İstanbul Avrupa ve Anadolu yakası çekici rehberi illüstrasyonu",
    kisaca:
      "İstanbul’da süre trafiğe ve yakaya göre değişir. İlçe hub sayfalarından yerel bağlantılara inebilir; talepte konumu net paylaşın. Köprü/tünel geçişleri teklif ve süreyi etkiler. Gece ve yoğun saatte planı buna göre yapın.",
    bolumler: [
      {
        baslik: "Yaka ve trafik",
        paragraflar: [
          "Yoğun saatte varış süresi uzar. Köprü/tünel geçişleri teklif ve süreyi etkiler — [çekici ne kadar](/rehber/cekici-ne-kadar) faktörlerini hatırlayın.",
          "Avrupa veya Anadolu yakası fark etmeksizin şehir ve ilçe sayfalarından ilerleyebilirsiniz. Gece için [gece çekici](/rehber/gece-cekici-bulma) notlarına bakın.",
          "TEM, E-5, çevreyolu ve sahil hatlarında km/çıkış tarifi çok işe yarar.",
        ],
      },
      {
        baslik: "İlçe örnekleri",
        paragraflar: [
          "Kadıköy, Üsküdar, Beşiktaş, Bakırköy, Başakşehir gibi ilçe sayfalarında yerel hizmet linkleri bulunur.",
          "Talep açarken [platform adımlarını](/rehber/platformda-talep-nasil-acilir) izleyin; seçimde [hizmet veren seçimi](/rehber/hizmet-veren-nasil-secilir) ve [çağırırken dikkat](/rehber/cekici-cagirirken-dikkat) rehberlerini kullanın.",
          "Havalimanı, AVM otoparkı veya site içi erişim kısıtlarını notta yazın.",
        ],
      },
      {
        baslik: "Hizmet türü seçimi",
        paragraflar: [
          "Lastik/akü/yakıt çoğu zaman yerinde çözülür; yürümeyen araç veya kaza sonrası çekici gerekir.",
          "Yaka değişimli hedef (ör. Anadolu’dan Avrupa servise) mesafeyi ve ücreti büyütür; baştan söyleyin.",
          "Şehirler arası nakliye ile acil çekimi karıştırmayın.",
        ],
      },
      {
        baslik: "Pratik ipuçları",
        paragraflar: [
          "Yoğun saatte “en ucuz” yerine süre odaklı seçim daha mantıklı olabilir.",
          "Konumu pin + metin tarif ile çift doğrulayın.",
          "Sigorta/asistans varsa paralel hattı da arayın; kapsam [ücretsiz çekici](/rehber/ucretsiz-cekici-var-mi) yazısında.",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "İlgili okumalar: [çekici ne kadar](/rehber/cekici-ne-kadar), [gece çekici](/rehber/gece-cekici-bulma), [hizmet veren seçimi](/rehber/hizmet-veren-nasil-secilir), [çekici çağırırken dikkat](/rehber/cekici-cagirirken-dikkat).",
          "Bu zincirde yalnızca daha önce yayınlanan rehberlere bağlantı verilir; böylece okuma yolu geriye doğru tutarlı kalır.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Hangi sayfadan başlamalıyım?",
        cevap:
          "Genel için /istanbul/cekici; bilinen ilçe için /istanbul/[ilce]/cekici.",
      },
      {
        soru: "Avrupa’dan Anadolu’ya çekim pahalı mı?",
        cevap:
          "Mesafe ve geçişler nedeniyle genelde şehir içi kısa çekimden pahalıdır; teklifte net görünür.",
      },
      {
        soru: "Trafik teklifi değiştirir mi?",
        cevap:
          "Süre tahminini etkiler. Yoğun saatte süre odaklı seçim yapın.",
      },
      {
        soru: "İlçe sayfası zorunlu mu?",
        cevap:
          "Zorunlu değil; konumu doğru verdiğiniz sürece şehir talebi de çalışır.",
      },
      {
        soru: "Gece İstanbul’da fark var mı?",
        cevap:
          "Arz ve fiyat bandı değişebilir. Gece rehberindeki güvenlik notlarını uygulayın.",
      },
    ],
    linkler: [
      { href: "/rehber/cekici-ne-kadar", label: "Çekici ne kadar?" },
      { href: "/rehber/gece-cekici-bulma", label: "Gece çekici bulma" },
      { href: "/rehber/hizmet-veren-nasil-secilir", label: "Hizmet veren seçimi" },
      { href: "/rehber/cekici-cagirirken-dikkat", label: "Çağırırken dikkat" },
      { href: "/istanbul", label: "İstanbul hub" },
      { href: "/istanbul/cekici", label: "İstanbul çekici" },
      { href: "/istanbul/kadikoy/cekici", label: "Kadıköy çekici" },
      { href: "/istanbul/besiktas/cekici", label: "Beşiktaş çekici" },
    ],
    ctaHref: talep("cekici"),
    ctaLabel: "İstanbul çekici teklifi",
  },
  {
    slug: "ankara-izmir-cekici",
    title: "Ankara ve İzmir’de çekici / yol yardım: ne beklemeli?",
    description:
      "Ankara ve İzmir’de çekici-yol yardım süreci, hub sayfaları ve talep ipuçları.",
    tarih: "2026-09-10",
    heroSrc: "/rehber/ankara-izmir-cekici.webp",
    heroAlt: "Ankara ve İzmir çekici hizmeti illüstrasyonu",
    kisaca:
      "Büyük şehirlerde süreç İstanbul’a benzer: konum + sorun tipi + teklif karşılaştırması. Yerel hub’lardan başlayın. Ankara’da merkezi ilçe yoğunluğu, İzmir’de sahil ve çevre yolu tarifi önemli olabilir.",
    bolumler: [
      {
        baslik: "Ankara",
        paragraflar: [
          "Şehir ve ilçe sayfalarından hizmet seçin. Çankaya ve merkezi ilçelerde talep yoğunluğu yüksek olabilir.",
          "Genel güvenlik ve talep sırası İstanbul’dakiyle aynıdır: [yolda kaldım](/rehber/yolda-kaldim-ne-yapmaliyim), sonra [talep açma](/rehber/platformda-talep-nasil-acilir).",
          "Eskişehir yolu, Konya yolu ve çevre koridorlarında km/çıkış tarifi faydalıdır.",
          "Kışın akü bitmeleri artabilir; [kış akü](/rehber/kis-aku-ve-yol-yardim) notlarını hatırlayın.",
        ],
      },
      {
        baslik: "İzmir",
        paragraflar: [
          "Sahil ve çevre yollarda konum tarifini netleştirin. Konak / Bornova / Karşıyaka hub’larından ilerleyebilirsiniz.",
          "Fiyat ve teklif için [çekici ne kadar](/rehber/cekici-ne-kadar) ile [teklif karşılaştırma](/rehber/cekici-teklif-nasil-karsilastirilir) rehberlerini kullanın. İstanbul özelinde [İstanbul çekici rehberi](/rehber/istanbul-cekici-rehberi) de benzer yapıyı gösterir.",
          "Yokuşlu/site içi erişim ve feribot hattı yakınları gibi detayları notta yazın.",
        ],
      },
      {
        baslik: "Ortak süreç",
        paragraflar: [
          "Güvenlik → sorun tipi → talep → teklif karşılaştırma → seçim. Bu sıra şehirden bağımsızdır.",
          "Yanlış tür seçmemek için [çekici mi tamirci mi](/rehber/cekici-mi-tamirci-mi) çerçevesini kullanın.",
          "Gece ve tatilde [gece çekici](/rehber/gece-cekici-bulma) beklentilerini uygulayın.",
        ],
      },
      {
        baslik: "Diğer büyük şehirler",
        paragraflar: [
          "Bursa, Antalya gibi hub’larda da aynı talep mantığı geçerlidir; müsaitlik arzına göre değişir.",
          "Küçük illerde süre uzayabilir; konumu erken ve net paylaşın.",
          "Şehirler arası nakliye ayrı planlanır — [nakliye rehberi](/rehber/sehirlerarasi-arac-tasima).",
        ],
      },
      {
        baslik: "Önceki rehberler",
        paragraflar: [
          "İlgili okumalar: [İstanbul çekici rehberi](/rehber/istanbul-cekici-rehberi), [çekici ne kadar](/rehber/cekici-ne-kadar), [teklif karşılaştırma](/rehber/cekici-teklif-nasil-karsilastirilir), [talep nasıl açılır](/rehber/platformda-talep-nasil-acilir).",
          "Bu zincirde yalnızca daha önce yayınlanan rehberlere bağlantı verilir; böylece okuma yolu geriye doğru tutarlı kalır.",
          "Acil durumda uzun uzun okumak zorunda değilsiniz: Kısaca kutusundaki özetle başlayıp ihtiyacınız olan bölüme atlayın, ardından talep oluşturun.",
        ],
      },
    ],
    faq: [
      {
        soru: "Küçük illerde de var mı?",
        cevap:
          "Şehir hub’ları geniş illerde açıktır; müsait hizmet veren arzına göre değişir.",
      },
      {
        soru: "Ankara ile İstanbul süreci aynı mı?",
        cevap:
          "Temel akış aynıdır; trafik ve yerel mesafe dinamikleri farklıdır.",
      },
      {
        soru: "İzmir’de sahil yolunda ne yazmalıyım?",
        cevap:
          "Yön, yakın kavşak/çıkış, belirgin tabela ve ilçe bilgisini yazın.",
      },
      {
        soru: "Hangi CTA’yı kullanmalıyım?",
        cevap:
          "Bulunduğunuz şehre uygun hub veya talep formundan ilerleyin; şehir parametresi teklifleri yerelleştirir.",
      },
      {
        soru: "Sigorta Ankara/İzmir’de farklı mı?",
        cevap:
          "Poliçe kuralları ulusaldır; uygulama için sigortacınıza sorun. Genel çerçeve ücretsiz çekici yazısındadır.",
      },
    ],
    linkler: [
      { href: "/rehber/istanbul-cekici-rehberi", label: "İstanbul çekici rehberi" },
      { href: "/rehber/cekici-ne-kadar", label: "Çekici ne kadar?" },
      { href: "/rehber/cekici-teklif-nasil-karsilastirilir", label: "Teklif karşılaştırma" },
      { href: "/rehber/platformda-talep-nasil-acilir", label: "Talep nasıl açılır?" },
      { href: "/ankara/cekici", label: "Ankara çekici" },
      { href: "/izmir/cekici", label: "İzmir çekici" },
      { href: "/bursa/cekici", label: "Bursa çekici" },
      { href: "/antalya/cekici", label: "Antalya çekici" },
    ],
    ctaHref: seoTalepOlusturYolu({ sehir: "ankara", hizmet: "cekici" }),
    ctaLabel: "Ankara çekici teklifi",
  },
];

/** Index ve listeler için: en yeni → en eski. */
export function rehberYaziListesi(): RehberYazi[] {
  return [...REHBER_YAZILARI].reverse();
}

/** Yayın sırası: en eski → en yeni (= dizi sırası). */
export function rehberYaziListesiKronolojik(): RehberYazi[] {
  return REHBER_YAZILARI;
}

export function rehberYaziGetir(slug: string): RehberYazi | undefined {
  return REHBER_YAZILARI.find((y) => y.slug === slug);
}

export function rehberSluglari(): string[] {
  return REHBER_YAZILARI.map((y) => y.slug);
}
