import {
  ISTANBUL_ASYA_ILCELER,
  ISTANBUL_AVRUPA_ILCELER,
  ISTANBUL_IL,
} from "@/lib/istanbul-ilceler";
import { seoIlceListesi } from "@/lib/seo-geo";
import {
  SEO_HIZMETLER,
  type SeoHizmetSlug,
  type SeoHizmetTanim,
} from "@/lib/seo-hizmetler";
import { ilceSlug, sehirSlug } from "@/lib/seo-slug";

const asyaSet = new Set(ISTANBUL_ASYA_ILCELER);

function yaka(ilceAd: string): "Avrupa" | "Anadolu" {
  return asyaSet.has(ilceAd) ? "Anadolu" : "Avrupa";
}

/** İstanbul’da yaka; diğer illerde şehir bağlamı */
function bolgeIfadesi(sehirAd: string, ilceAd: string): string {
  if (sehirAd === ISTANBUL_IL) {
    return `${sehirAd}’un ${yaka(ilceAd)} yakasında`;
  }
  return `${sehirAd} ilinde`;
}

function kisaBolge(sehirAd: string, ilceAd: string): string {
  if (sehirAd === ISTANBUL_IL) {
    return `${sehirAd} ${yaka(ilceAd)} yakası`;
  }
  return sehirAd;
}

function yakinIlceAdlari(
  sehirAd: string,
  ilceAd: string,
  limit = 4
): string[] {
  if (sehirAd === ISTANBUL_IL) {
    const yakaAd = yaka(ilceAd);
    const havuz =
      yakaAd === "Anadolu" ? ISTANBUL_ASYA_ILCELER : ISTANBUL_AVRUPA_ILCELER;
    return havuz.filter((i) => i !== ilceAd).slice(0, limit);
  }
  return seoIlceListesi(sehirSlug(sehirAd))
    .map((i) => i.ad)
    .filter((ad) => ad !== ilceAd)
    .slice(0, limit);
}

function yakinIlceler(ilceAd: string, limit = 4): string[] {
  return yakinIlceAdlari(ISTANBUL_IL, ilceAd, limit);
}

export type SeoFaq = { soru: string; cevap: string };

/** Ortak SEO gövde — ana sayfa / şehir / ilçe aynı format */
export type SeoLandingIcerik = {
  title: string;
  description: string;
  h1: string;
  ozet: string;
  /** Ana gövde başlığı */
  bolgeBaslik: string;
  paragraflar: string[];
  senaryoBaslik: string;
  senaryolar: string[];
  fiyatBaslik: string;
  fiyatNotu: string;
  guvenBaslik: string;
  guvenNotu: string;
  faqBaslik: string;
  faq: SeoFaq[];
  ctaEtiket: string;
  /** İlçe / bölge link ızgarası (opsiyonel) */
  bolgeListesiBaslik?: string;
  bolgeListesiAlt?: string;
};

/** Ana sayfa metninde linklenecek en büyük nüfuslu şehirler */
export const ANA_SAYFA_ONCU_SEHIRLER = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Konya",
] as const;

export function anaSayfaSehirBaglantilari(): { ad: string; href: string }[] {
  return ANA_SAYFA_ONCU_SEHIRLER.map((ad) => ({
    ad,
    href: `/${sehirSlug(ad)}`,
  }));
}

/** Ana sayfa (`/`) — Türkiye geneli; şehir/ilçe SEO’su path’lerde */
export const ANA_SAYFA_HERO =
  "Türkiye’nin Acil Yol Yardım Pazaryeri | Acil Çözüm Bul";

export function anaSayfaSeoIcerik(): SeoLandingIcerik {
  return {
    title: ANA_SAYFA_HERO,
    description:
      "Yolda kaldığınızda çekici, lastikçi, akü takviyesi, oto anahtarcı ve yakıt yardımı için yakındaki firmalardan ücretsiz teklif alın. Kayıt yok; fiyatı siz seçin.",
    h1: "Türkiye’nin acil yol yardım merkezi",
    ozet:
      "En hızlı ve uygun çözümü yakındaki hizmet verenlerden alın. Şehrinizi veya otomatik konumu seçin; çekici, lastikçi, akü, anahtarcı ve yakıt yardımı için gelen teklifleri karşılaştırıp size uygun olanı seçin.",
    bolgeBaslik: "Nasıl çalışır?",
    paragraflar: [
      "Acil Çözüm Bul bir pazar yeridir: tek bir firmaya bağlı kalmadan, çevrenizdeki kayıtlı ekiplerden fiyat ve tahmini varış süresi teklifi alırsınız. Üyelik veya ön ödeme gerekmez; hizmet bedelini seçtiğiniz firmayla aranızda kararlaştırırsınız.",
      "Önce şehrinizi (veya GPS ile konumunuzu) seçin, ardından ihtiyacınızı belirtin. Talebiniz yakındaki hizmet verenlere iletilir; gelen teklifleri aynı ekranda görürsünüz. Sabit «X dakikada gelir» veya sabit fiyat listesi yayınlamayız — gerçek teklifleri siz seçersiniz.",
      "İstanbul ve diğer illerde ilçe bazlı sayfalar da vardır. Şehir seçince ilgili sayfaya geçersiniz; ilçe seçince bölgeye özel içerik ve talep akışı açılır.",
    ],
    senaryoBaslik: "Ne zaman kullanılır?",
    senaryolar: [
      "Araç çalışmıyor, çekici veya kurtarma gerekiyor",
      "Lastik patladı; yerinde lastikçi veya stepne desteği",
      "Akü bitti; kontak çevirmiyor",
      "Anahtar içeride kaldı / kilit sorunu",
      "Yakıt bitti veya kısa mesafe yol yardım",
      "Kaza sonrası güvenli çekme",
    ],
    fiyatBaslik: "Fiyat nasıl oluşur?",
    fiyatNotu:
      "Mesafe, saat, araç tipi ve müdahale türü teklifleri etkiler. Platform sabit fiyat yayınlamaz; firmaların gönderdiği tekliflerden uygun olanı siz seçersiniz. Ödeme doğrudan seçtiğiniz hizmet verene yapılır.",
    guvenBaslik: "Gizlilik ve güven",
    guvenNotu:
      "Bilgileriniz yalnızca seçtiğiniz hizmet verenle paylaşılır. Herkese açık sayfalarda firma adı, telefon, plaka veya açık adresiniz yayınlanmaz.",
    faqBaslik: "Sık sorulan sorular",
    faq: [
      {
        soru: "Hangi şehirlerde hizmet var?",
        cevap:
          "Kayıtlı hizmet verenlerin bulunduğu bölgelerde teklif alabilirsiniz. Ana sayfadan şehrinizi seçin veya GPS ile konum alın; açık olan şehir ve ilçe sayfalarına yönlendirilirsiniz.",
      },
      {
        soru: "Talep oluşturmak ücretli mi?",
        cevap:
          "Hayır. Talep oluşturmak ve teklifleri görmek ücretsizdir; üyelik gerekmez. Hizmet bedelini seçtiğiniz firmayla doğrudan ödersiniz.",
      },
      {
        soru: "Ne kadar sürede teklif gelir?",
        cevap:
          "Talep oluşturulduğunda çevrenizdeki ve çevrimiçi hizmet verenlere kısa sürede bildirim gider; ilgilenen firmalar teklif gönderir. Gelen teklifleri aynı ekranda anlık görürsünüz.",
      },
      {
        soru: "Tek bir çekici firması mısınız?",
        cevap:
          "Hayır. Birden fazla hizmet verenden teklif alıp karşılaştırırsınız; yalnızca tek numaraya bağlı kalmazsınız.",
      },
    ],
    ctaEtiket: "Şehrini seç, teklif al",
    bolgeListesiBaslik: "Öne çıkan şehirler",
    bolgeListesiAlt:
      "Şehrinizi seçerek bölge sayfasına geçebilir veya konum paylaşarak devam edebilirsiniz.",
  };
}

export function sehirHubIcerik(sehirAd: string): SeoLandingIcerik {
  if (sehirAd === ISTANBUL_IL) return istanbulSehirHubIcerik();

  return {
    title: `${sehirAd} Yol Yardım Hizmetleri | Acil Çözüm Bul`,
    description: `${sehirAd}’da çekici, lastikçi, akü takviyesi, oto anahtarcı ve yakıt yardımı için yakındaki hizmet verenlerden teklif alın. Kayıt yok; fiyatı siz seçin.`,
    h1: `${sehirAd}’da ihtiyacınız olan yol yardım hizmetini bulun`,
    ozet: `${sehirAd} genelinde yolda kalan sürücüleri onaylı çekici, lastikçi ve yol yardım ekipleriyle buluşturuyoruz. Talep açın, gelen tekliflerden size uygun olanı seçin.`,
    bolgeBaslik: `${sehirAd}’da yol yardım nasıl çalışır?`,
    paragraflar: [
      `${sehirAd}’daki ilçelerde hizmet kapsamı, kayıtlı hizmet verenlerin bölge tercihlerine göre değişir. Şehir geneli veya ilçe bazlı sayfalardan ihtiyacınıza uygun hizmeti seçebilirsiniz.`,
      `Süreç basittir: hizmet türünü seçin, telefonunuzu doğrulayın, konumunuzu paylaşın. Yakındaki hizmet verenler fiyat ve tahmini varış süresi teklifi gönderir; seçimi siz yaparsınız.`,
    ],
    senaryoBaslik: "Sık kullanım senaryoları",
    senaryolar: [
      "Otoyolda veya ana arterde araç arızası",
      "Lastik patlaması veya akü bitmesi",
      "Araç kilitli kalması / anahtar sorunu",
      "Yakıt bitmesi veya çekici ihtiyacı",
    ],
    fiyatBaslik: "Fiyat nasıl oluşur?",
    fiyatNotu:
      "Platform sabit fiyat yayınlamaz. Teklif tutarı ve varış süresi hizmet verenlerin gönderdiği tekliflere göre değişir; uygun olanı siz seçersiniz.",
    guvenBaslik: "Gizlilik",
    guvenNotu:
      "Hizmet verenlerin adı, telefonu, plakası veya açık adresi herkese açık SEO sayfalarında yayınlanmaz. Bilgiler yalnızca anlaşma sonrası ilgili taraflar arasında açılır.",
    faqBaslik: "Sık sorulan sorular",
    faq: [
      {
        soru: `${sehirAd}’da hangi hizmetler var?`,
        cevap: `Çekici, mobil lastikçi, akü takviyesi, oto anahtarcı, yakıt yardımı ve genel yol yardım talepleri için teklif alabilirsiniz. İlçe sayfalarından bölgenize özel sayfalara geçebilirsiniz.`,
      },
      {
        soru: "Talep oluşturmak ücretli mi?",
        cevap:
          "Müşteri talep oluşturma ücretsizdir. Hizmet bedeli, seçtiğiniz teklif tutarıdır.",
      },
      {
        soru: "Ne kadar sürede teklif gelir?",
        cevap:
          "Talep oluşturulduğunda çevrenizdeki ve çevrimiçi hizmet verenlere yaklaşık 3 saniye içinde SMS gider; ilgilenen firmalar teklif gönderir. Gelen teklifleri aynı ekranda anlık görürsünüz.",
      },
    ],
    ctaEtiket: `${sehirAd}’da hizmet seç`,
  };
}

/** `/istanbul` hub — şehir odaklı SEO gövdesi */
function istanbulSehirHubIcerik(): SeoLandingIcerik {
  return {
    title:
      "İstanbul Çekici: 7/24 En Yakın İstanbul Çekici ve Kurtarma Hizmetleri",
    description:
      "İstanbul’da çekici, oto kurtarma ve yol yardım için yakındaki hizmet verenlerden ücretsiz teklif alın. Avrupa ve Anadolu yakası; fiyatı siz seçin.",
    h1: "İstanbul Çekici: 7/24 En Yakın İstanbul Çekici ve Kurtarma Hizmetleri",
    ozet:
      "İstanbul’da yolda kaldığınızda tek bir ekipe bağlı kalmadan, yakındaki çekici ve yol yardım ekiplerinden teklif alabilirsiniz. Konumunuzu paylaşın; gelen fiyat ve tahmini varış sürelerini karşılaştırıp size uygun olanı seçin.",
    bolgeBaslik: "İstanbul’da 7/24 çekici ve yol yardım teklifi",
    paragraflar: [
      "İstanbul’un yoğun trafiğinde arıza, kaza veya lastik patlaması her an olabilir. Acil Çözüm Bul, Avrupa ve Anadolu yakasındaki kayıtlı hizmet verenleri sizinle buluşturur. Sabit «X dakikada gelir» vaadi vermeyiz; gerçek teklifleri aynı ekranda görür, seçimi siz yaparsınız.",
      "Kadıköy, Üsküdar, Ümraniye, Ataşehir, Maltepe, Pendik, Kartal, Bakırköy, Beşiktaş, Şişli, Başakşehir, Esenyurt, Beylikdüzü ve diğer ilçelerde talep açabilirsiniz. İlçe sayfalarından bölgenize özel içeriklere geçmek de mümkündür.",
      "Çekici dışında mobil lastikçi, akü takviyesi, oto anahtarcı ve yakıt yardımı talepleri de aynı akışta ilerler. Üyelik veya kayıt gerekmez. Hizmet bedelini nakit olarak veya seçtiğiniz hizmet verenle aranızda kararlaştırdığınız şekilde kendiniz ödersiniz; platform üzerinden tahsilat yapılmaz. Bilgileriniz yalnızca seçtiğiniz hizmet verenle paylaşılır.",
    ],
    senaryoBaslik: "Ne zaman kullanılır?",
    senaryolar: [
      "Otoyol, köprü veya ana arterde araç çalışmıyor",
      "Lastik patladı, stepne yok veya değiştirilemiyor",
      "Akü bitti; kontak çevirmiyor",
      "Anahtar içeride kaldı / kilit sorunu",
      "Yakıt bitti veya kısa mesafe çekici ihtiyacı",
      "Kaza sonrası güvenli çekme veya kurtarma",
    ],
    fiyatBaslik: "Fiyat nasıl oluşur?",
    fiyatNotu:
      "Mesafe, saat, araç tipi ve müdahale türü teklifleri etkiler. Platform sabit fiyat listesi yayınlamaz; hizmet verenlerin gönderdiği tekliflerden uygun olanı siz seçersiniz. Ödeme, nakit veya hizmet verenle aranızda kararlaştırdığınız yöntemle doğrudan kendisine yapılır.",
    guvenBaslik: "Gizlilik ve güven",
    guvenNotu:
      "Bilgileriniz yalnızca seçtiğiniz hizmet verenle paylaşılır. Herkese açık sayfalarda hizmet veren adı, telefonu, plakası veya sizin açık adresiniz yayınlanmaz.",
    faqBaslik: "Sık sorulan sorular",
    faq: [
      {
        soru: "İstanbul’da hangi ilçelere hizmet var?",
        cevap:
          "Kayıtlı hizmet verenlerin bölge tercihine göre Avrupa ve Anadolu yakasının ilçelerinde teklif gelebilir. Aşağıdaki ilçe listesinden bölgenize gidebilir veya konum paylaşarak yakındaki ekiplerin teklif vermesini bekleyebilirsiniz.",
      },
      {
        soru: "Talep oluşturmak ücretli mi?",
        cevap:
          "Hayır. Talep oluşturmak ve teklifleri görmek ücretsizdir; üyelik gerekmez. Hizmet bedelini nakit veya seçtiğiniz hizmet verenle aranızda kararlaştırdığınız şekilde doğrudan kendisine ödersiniz.",
      },
      {
        soru: "Ne kadar sürede teklif gelir?",
        cevap:
          "Talep oluşturulduğunda çevrenizdeki ve çevrimiçi hizmet verenlere yaklaşık 3 saniye içinde SMS gider; ilgilenen firmalar teklif gönderir. Teklif sayısını bölgedeki müsait ekip ve saat etkiler; gelen teklifleri aynı ekranda anlık görürsünüz. Sabit varış süresi garantisi vermeyiz.",
      },
      {
        soru: "Tek bir çekici firması mısınız?",
        cevap:
          "Hayır. Acil Çözüm Bul bir pazar yeridir: birden fazla hizmet verenden teklif alıp karşılaştırırsınız. Böylece yalnızca tek numaraya bağlı kalmazsınız.",
      },
    ],
    ctaEtiket: "İstanbul’da talep oluştur",
    bolgeListesiBaslik: "İstanbul ilçeleri",
    bolgeListesiAlt:
      "İlçenizi seçerek bölgeye özel sayfaya gidebilirsiniz. Metin içinde geçen ilçe adları da aynı şekilde bağlantılıdır.",
  };
}

export function sehirHizmetIcerik(
  sehirAd: string,
  hizmet: SeoHizmetTanim
): SeoLandingIcerik {
  return {
    title: `${sehirAd} ${hizmet.etiketUzun} — Yakındaki Teklifleri Alın`,
    description: `${sehirAd}’da ${hizmet.etiketUzun.toLowerCase()} ihtiyacınız için yakındaki hizmet verenlerden fiyat ve varış süresi teklifi alın. Ücretsiz talep oluşturun.`,
    h1: `${sehirAd}’da ${hizmet.etiketUzun.toLowerCase()} teklifi alın`,
    ozet: `${sehirAd} genelinde ${hizmet.etiketUzun.toLowerCase()} arıyorsanız talep oluşturun; yakındaki hizmet verenler size teklif göndersin.`,
    bolgeBaslik: `${sehirAd} ${hizmet.etiket.toLowerCase()} hakkında`,
    paragraflar: [
      `${sehirAd}’da ${hizmet.etiketUzun.toLowerCase()} çağrıları çoğu zaman acil olduğundan konum paylaşımı ve hızlı teklif karşılaştırması önemlidir. Platform, sabit süre veya fiyat iddiası vermez; gerçek teklifleri size iletir.`,
      `İlçe bazlı sayfalardan (ör. belirli bir ilçede ${hizmet.etiket.toLowerCase()}) daha odaklı arama niyetine uygun içerik ve CTA bulabilirsiniz.`,
    ],
    senaryoBaslik: "Sık kullanım senaryoları",
    senaryolar: hizmetSenaryolari(hizmet.slug),
    fiyatBaslik: "Fiyat nasıl oluşur?",
    fiyatNotu:
      "Fiyat; mesafe, saat, araç tipi ve müdahale türüne göre teklif bazında değişir. En uygun teklifi siz seçersiniz.",
    guvenBaslik: "Gizlilik",
    guvenNotu:
      "Herkese açık sayfalarda hizmet veren kimliği veya müşteri konumu yayınlanmaz.",
    faqBaslik: "Sık sorulan sorular",
    faq: [
      {
        soru: `${sehirAd} ${hizmet.etiket.toLowerCase()} nasıl çağırılır?`,
        cevap: `Bu sayfadaki talebi oluşturun, telefon doğrulayın ve konumunuzu paylaşın. Yakındaki hizmet verenler teklif gönderir; birini seçmeniz yeterli.`,
      },
      {
        soru: "İlçe seçmem gerekir mi?",
        cevap:
          "Şehir geneli talepte konumunuz yeterli olur. İsterseniz ilçe sayfasından bölgeye özel sayfaya geçip oradan da talep başlatabilirsiniz.",
      },
    ],
    ctaEtiket: `${sehirAd}’da ${hizmet.etiket} talebi oluştur`,
  };
}

export function ilceHubIcerik(
  sehirAd: string,
  ilceAd: string
): SeoLandingIcerik {
  const bolge = bolgeIfadesi(sehirAd, ilceAd);
  const yakin = yakinIlceAdlari(sehirAd, ilceAd);
  const yakinMetin =
    yakin.length > 0 ? ` Yakın ilçeler: ${yakin.join(", ")}.` : "";
  return {
    title: `${ilceAd} Yol Yardım Hizmetleri | Acil Çözüm Bul`,
    description: `${ilceAd} (${kisaBolge(sehirAd, ilceAd)}) için çekici, lastikçi, akü, anahtarcı ve yakıt yardımı teklifleri. Ücretsiz talep oluşturun.`,
    h1: `${ilceAd} çekici ve yol yardım: yakındaki ekiplerden teklif alın`,
    ozet: `${ilceAd}, ${bolge} yer alır. Bu sayfadan bölgedeki yol yardım taleplerini başlatabilir; yakındaki hizmet verenlerden teklif alabilirsiniz.`,
    bolgeBaslik: `${ilceAd}’da yol yardım nasıl işler?`,
    paragraflar: [
      `${ilceAd} ve çevresinde arıza, lastik, akü veya çekici ihtiyacı sık görülür. ${sehirAd} genelinde olduğu gibi talep ücretsizdir; gelen tekliflerden size uygun olanı seçersiniz.${yakinMetin}`,
      `Konumunuzu paylaşmanız, ${ilceAd} civarındaki kayıtlı ekiplerin size teklif göndermesini kolaylaştırır. Hizmet veren kimliği public sayfalarda gösterilmez; bilgiler yalnızca seçiminizden sonra açılır.`,
    ],
    senaryoBaslik: "Sık kullanım senaryoları",
    senaryolar: [
      `${ilceAd} içi kısa mesafe çekici veya yerinde müdahale`,
      `${kisaBolge(sehirAd, ilceAd)} ana arterlerinde lastik / akü desteği`,
      "Gece veya trafikte bekleme gerektiren arıza",
    ],
    fiyatBaslik: "Fiyat nasıl oluşur?",
    fiyatNotu:
      "İlçe bazında sabit fiyat listesi yoktur; teklifler anlık müsaitliğe göre gelir.",
    guvenBaslik: "Gizlilik",
    guvenNotu:
      "Platform bir yerel işletme rehberi değildir; pazar yeri olarak teklifleri karşılaştırırsınız.",
    faqBaslik: "Sık sorulan sorular",
    faq: [
      {
        soru: `${ilceAd}’da hangi hizmetleri seçebilirim?`,
        cevap: `Çekici, lastikçi, akü takviyesi, oto anahtarcı, yakıt yardımı ve yol yardım. Aşağıdaki hizmet linklerinden ilgili sayfaya gidin.`,
      },
      {
        soru: "Mahalle sayfası var mı?",
        cevap: `İlk aşamada mahalleler ayrı URL değildir; ${ilceAd} hizmet sayfalarında bölge bağlamı yer alır.`,
      },
    ],
    ctaEtiket: `${ilceAd}’da hizmet seç`,
    bolgeListesiBaslik: "Yakın ilçeler",
    bolgeListesiAlt: `${ilceAd} çevresindeki ilçe sayfalarına geçebilirsiniz.`,
  };
}

export function ilceHizmetIcerik(
  sehirAd: string,
  ilceAd: string,
  hizmet: SeoHizmetTanim
): SeoLandingIcerik {
  const yakin = yakinIlceAdlari(sehirAd, ilceAd, 3);
  const yakinMetin =
    yakin.length > 0 ? ` Yakın bölgeler: ${yakin.join(", ")}.` : "";
  return {
    title: `${ilceAd} ${hizmet.etiketUzun} — Fiyat ve Varış Süresi Teklifi Al`,
    description: `${ilceAd}’da ${hizmet.etiketUzun.toLowerCase()} için yakındaki hizmet verenlerden teklif alın. ${kisaBolge(sehirAd, ilceAd)}. Ücretsiz talep.`,
    h1: `${ilceAd}’da ${hizmet.etiketUzun.toLowerCase()} teklifi alın`,
    ozet: `${ilceAd} (${sehirAd}) bölgesinde ${hizmet.etiketUzun.toLowerCase()} ihtiyacınız için talep oluşturun; gelen tekliflerden size uygun olanı seçin.`,
    bolgeBaslik: `${ilceAd} ${hizmet.etiket.toLowerCase()} hakkında`,
    paragraflar: [
      `${ilceAd} (${kisaBolge(sehirAd, ilceAd)}) bölgesinde ${hizmet.etiket.toLowerCase()} aramaları genelde acil müdahale gerektirir. Konumunuzu paylaştığınızda yakındaki kayıtlı hizmet verenler fiyat ve tahmini varış süresi ile teklif gönderebilir.`,
      `Trafik, saat ve müdahale türü teklifleri etkiler; sabit “X dakikada gelir” iddiası yayınlamayız.${yakinMetin}`,
    ],
    senaryoBaslik: "Sık kullanım senaryoları",
    senaryolar: hizmetSenaryolari(hizmet.slug, ilceAd),
    fiyatBaslik: "Fiyat nasıl oluşur?",
    fiyatNotu:
      "Görünen teklif tutarı hizmet verenin önerisidir. Anlaşma öncesi koşulları netleştirin.",
    guvenBaslik: "Gizlilik",
    guvenNotu:
      "İsim, telefon, plaka veya açık adres bu sayfada yoktur; gizlilik korunur.",
    faqBaslik: "Sık sorulan sorular",
    faq: [
      {
        soru: `${ilceAd} ${hizmet.etiket.toLowerCase()} talebi nasıl açılır?`,
        cevap: `“${ilceAd} ${hizmet.etiket} talebi oluştur” ile formu açın. Hizmet ve bölge bilgisi önceden seçili gelir; telefon doğrulayıp konumunuzu paylaşmanız yeterlidir.`,
      },
      {
        soru: "Şehir geneli sayfadan farkı nedir?",
        cevap: `Bu sayfa ${ilceAd} odaklıdır. ${sehirAd} geneli için şehir hizmet sayfasını kullanabilirsiniz.`,
      },
    ],
    ctaEtiket: `${ilceAd} ${hizmet.etiket} talebi oluştur`,
  };
}

function hizmetSenaryolari(slug: SeoHizmetSlug, ilceAd?: string): string[] {
  const yer = ilceAd ? `${ilceAd}’da ` : "";
  switch (slug) {
    case "cekici":
      return [
        `${yer}araç çalışmıyor / çekilmesi gerekiyor`,
        "Kaza sonrası güvenli çekme",
        "Otopark veya dar sokaktan çıkarma ihtiyacı",
      ];
    case "lastikci":
      return [
        `${yer}lastik patlaması`,
        "Stepne yok veya kullanılamıyor",
        "Yolda lastik değişimi / tamir desteği",
      ];
    case "aku-takviye":
      return [
        `${yer}akü bitti, araç çalışmıyor`,
        "Kısa mesafe takviye ihtiyacı",
        "Soğuk hava / uzun bekleyiş sonrası akü sorunu",
      ];
    case "oto-anahtarci":
      return [
        `${yer}anahtar içeride kaldı`,
        "Kumanda / kontak sorunu",
        "Kapı kilidi açma ihtiyacı",
      ];
    case "yakit-yardimi":
      return [
        `${yer}yakıt bitti`,
        "En yakın istasyona güvenli destek",
        "Yanlış yakıt şüphesinde yönlendirme (teklif kapsamı hizmet verene göre)",
      ];
    case "yol-yardim":
      return [
        `${yer}genel yol yardım`,
        "Arıza teşhisi sonrası yönlendirme",
        "Birden fazla hizmet seçeneğini karşılaştırma",
      ];
  }
}

/** Metin içi ve liste için şehir + ilçe bağlantıları */
export function seoBolgeBaglantilari(
  sehirAd: string,
  opts?: { yakinIlceler?: string[]; sadeceYakin?: boolean }
): { ad: string; href: string }[] {
  const sSlug = sehirSlug(sehirAd);
  const out: { ad: string; href: string }[] = [
    { ad: sehirAd, href: `/${sSlug}` },
  ];

  const ilceler =
    opts?.sadeceYakin && opts.yakinIlceler
      ? opts.yakinIlceler
      : sehirAd === ISTANBUL_IL
        ? [...ISTANBUL_ASYA_ILCELER, ...ISTANBUL_AVRUPA_ILCELER]
        : seoIlceListesi(sSlug).map((i) => i.ad);

  for (const ad of ilceler) {
    out.push({ ad, href: `/${sSlug}/${ilceSlug(ad)}` });
  }
  return out;
}

export function istanbulIlceAdlari(): string[] {
  return seoIlceListesi("istanbul").map((i) => i.ad);
}

export function hizmetTanim(slug: SeoHizmetSlug): SeoHizmetTanim {
  return SEO_HIZMETLER[slug];
}

export { ISTANBUL_IL };
