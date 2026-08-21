/** Fish Audio ajanı — kısa Türkçe konuşma, özet + arka planda talep. */

export const SESLI_YARDIM_ILK_MESAJ =
  "Merhaba, Acil Çözüm Bul çağrı merkezi. Yolda mı kaldınız, kısaca ne oldu?";

export const SESLI_YARDIM_SISTEM_PROMPT = `Sen Acil Çözüm Bul çağrı merkezi asistanısın. Yolda kalan sürücüyle Türkçe, kısa ve sakin konuşursun. Cümleler tek nefeste bitsin.

Hedef: sorunu anlayıp guncelle_talep_ozet ile paneli doldurmak; yeterli olunca create_acil_talep ile yardımı arka planda başlatmak. Form doldurtma. Bir turda en fazla iki kısa soru.

Akış:
1) İlk sözün yalnızca karşılama olsun. Araç çağırma. Sonra get_current_location çağır; fail olursa şehir ve cadde sor, adresi guncelle_talep_ozet.adres olarak ver.
2) Her yeni bilgiyi hemen guncelle_talep_ozet ile gönder (bildiğin tüm alanları tekrar yaz). sorun_tipi yalnızca: cekici, ariza, lastik, aku, yakit, kaza, kilit, arac-tasima, diger.
3) lastik ise lastik_durumu: yama veya degisim. yakit ise yakit_tipi: benzin, dizel, lpg veya elektrik. kilit ise kilit_durumu: iceride, kayip, kirik, kumanda, kontak veya diger.
4) cekici, ariza, kaza veya arac-tasima ise hedef yoksa hedef_bilinmiyor=true. Araç durumu opsiyonel: calisiyor, calismiyor_bosa_aliniyor, calismiyor_bosa_alinamiyor.
5) Konum + zorunlu alanlar dolunca bekletmeden create_acil_talep çağır. Telefon ve ad isteme.
6) "Yakındaki ekiplere ilettim, teklifler gelecek" de. Acil başka şey yoksa kapat.

Yasak: fiyat uydurma, İngilizce, uzun liste okuma, kayıt dayatma.`;

const TALEP_ALANLARI = [
  {
    name: "sorun_tipi",
    description:
      "cekici | ariza | lastik | aku | yakit | kaza | kilit | arac-tasima | diger",
  },
  { name: "sorun_detay", description: "Müşterinin anlattığı kısa sorun özeti." },
  { name: "lastik_durumu", description: "lastik ise: yama veya degisim" },
  {
    name: "yakit_tipi",
    description: "yakit ise: benzin, dizel, lpg veya elektrik",
  },
  {
    name: "kilit_durumu",
    description: "kilit ise: iceride, kayip, kirik, kumanda, kontak veya diger",
  },
  {
    name: "arac_tipi",
    description:
      "sedan, hatchback, suv, station, coupe, minivan, pickup, motosiklet veya diger",
  },
  {
    name: "arac_durumu",
    description:
      "calisiyor, calismiyor_bosa_aliniyor veya calismiyor_bosa_alinamiyor",
  },
  { name: "adres", description: "GPS yoksa müşterinin söylediği konum." },
  { name: "hedef_adres", description: "Aracın çekileceği yer, varsa." },
  { name: "hedef_bilinmiyor", description: "Hedef yoksa true." },
];

export const SESLI_YARDIM_ARACLARI = [
  {
    name: "get_current_location",
    description:
      "Müşterinin telefon GPS konumunu ve açık adresini al. Karşılamadan sonra bir kez çağır.",
    arguments: [] as { name: string; description: string }[],
    expects_response: true,
  },
  {
    name: "guncelle_talep_ozet",
    description:
      "Toplanan talep alanlarını yan panele yaz. Her yeni bilgiden sonra çağır; bildiğin tüm alanları gönder.",
    arguments: TALEP_ALANLARI,
    expects_response: false,
    execution_mode: "fire_and_forget" as const,
    timeout_seconds: 15,
  },
  {
    name: "create_acil_talep",
    description:
      "Zorunlu bilgiler tamam olunca acil yardım talebini arka planda oluştur. Telefon isteme.",
    arguments: TALEP_ALANLARI,
    expects_response: true,
    execution_mode: "background" as const,
    timeout_seconds: 60,
  },
] as const;
