# Graph Report - acilcozumbul  (2026-07-19)

## Corpus Check
- 344 files · ~373,373 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1461 nodes · 4546 edges · 81 communities (70 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9e475ee5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_demo-oturum.ts|demo-oturum.ts]]
- [[_COMMUNITY_telefonNormalize|telefonNormalize]]
- [[_COMMUNITY_cekici-email-otp.ts|cekici-email-otp.ts]]
- [[_COMMUNITY_getSupabaseAdmin|getSupabaseAdmin]]
- [[_COMMUNITY_seo.ts|seo.ts]]
- [[_COMMUNITY_mappers.ts|mappers.ts]]
- [[_COMMUNITY_ensureSeedData|ensureSeedData]]
- [[_COMMUNITY_ui.tsx|ui.tsx]]
- [[_COMMUNITY_TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com|TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com]]
- [[_COMMUNITY_scripts|scripts]]
- [[_COMMUNITY_google-maps.ts|google-maps.ts]]
- [[_COMMUNITY_CekiciPanelTabs.tsx|CekiciPanelTabs.tsx]]
- [[_COMMUNITY_sms-provider.ts|sms-provider.ts]]
- [[_COMMUNITY_CekiciAyarlarPanel.tsx|CekiciAyarlarPanel.tsx]]
- [[_COMMUNITY_memnuniyet.ts|memnuniyet.ts]]
- [[_COMMUNITY_db.ts|db.ts]]
- [[_COMMUNITY_hizmet-veren-sayim.ts|hizmet-veren-sayim.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_MusteriAnaSayfa.tsx|MusteriAnaSayfa.tsx]]
- [[_COMMUNITY_ensureSeedData|ensureSeedData]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_davet-panel.ts|davet-panel.ts]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_YasalSayfaShell.tsx|YasalSayfaShell.tsx]]
- [[_COMMUNITY_funnel.ts|funnel.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_cekici-email-otp.ts|cekici-email-otp.ts]]
- [[_COMMUNITY_cekici-puan.ts|cekici-puan.ts]]
- [[_COMMUNITY_konum-oneri.ts|konum-oneri.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_posthog-client.ts|posthog-client.ts]]
- [[_COMMUNITY_migrate-json-to-supabase.mjs|migrate-json-to-supabase.mjs]]
- [[_COMMUNITY_PanelChrome.tsx|PanelChrome.tsx]]
- [[_COMMUNITY_NasilCalisirSerit.tsx|NasilCalisirSerit.tsx]]
- [[_COMMUNITY_Supabase veritabanı|Supabase veritabanı]]
- [[_COMMUNITY_Video demo modu|Video demo modu]]
- [[_COMMUNITY_env.ts|env.ts]]
- [[_COMMUNITY_README|README.md]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_sitemap.ts|sitemap.ts]]
- [[_COMMUNITY_Yapılacaklar|Yapılacaklar]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_AGENTS|AGENTS.md]]
- [[_COMMUNITY_next.config.ts|next.config.ts]]
- [[_COMMUNITY_postcss.config.mjs|postcss.config.mjs]]
- [[_COMMUNITY_getCekiciById|getCekiciById]]
- [[_COMMUNITY_davet-kayit.ts|davet-kayit.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_google-maps.ts|google-maps.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_cerez-onay.ts|cerez-onay.ts]]
- [[_COMMUNITY_payment.ts|payment.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_kredi-odeme.ts|kredi-odeme.ts]]
- [[_COMMUNITY_davet-panel.ts|davet-panel.ts]]
- [[_COMMUNITY_davet-panel.ts|davet-panel.ts]]
- [[_COMMUNITY_CerezOnayBanner.tsx|CerezOnayBanner.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_teklif-db.ts|teklif-db.ts]]
- [[_COMMUNITY_musteri-profil.ts|musteri-profil.ts]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_Ölçeklenebilirlik regression smoke checklist|Ölçeklenebilirlik regression smoke checklist]]
- [[_COMMUNITY_verify-teklif-backfill.mjs|verify-teklif-backfill.mjs]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_sitemap.ts|sitemap.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_SorunTipiSecimi.tsx|SorunTipiSecimi.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]

## God Nodes (most connected - your core abstractions)
1. `getSupabaseAdmin()` - 126 edges
2. `ensureSeedData()` - 93 edges
3. `getCurrentCekici()` - 66 edges
4. `telefonNormalize()` - 53 edges
5. `Card()` - 45 edges
6. `getCekiciById()` - 37 edges
7. `updateCekici()` - 34 edges
8. `telefonGecerliMi()` - 32 edges
9. `Btn()` - 31 edges
10. `getTalepById()` - 25 edges

## Surprising Connections (you probably didn't know these)
- `middleware()` --calls--> `updatePanelSession()`  [EXTRACTED]
  middleware.ts → src/lib/supabase/middleware.ts
- `main()` --calls--> `garantiKrediOdemesiYap()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/payment.ts
- `main()` --calls--> `garantiSmokeKartOku()`  [INFERRED]
  scripts/garanti-smoke.ts → src/lib/garanti/smoke-kart.ts
- `main()` --calls--> `garantiYapilandirildi()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/config.ts
- `main()` --calls--> `garantiYapilandirmaOzeti()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/config.ts

## Import Cycles
- None detected.

## Communities (81 total, 11 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.24
Nodes (22): GET(), rotaKoordinatlari(), listeDurumuBelirle(), toOzet(), demoListeDurumuBelirle(), demoToOzet(), DEMO_PUAN, demoCekiciTalepGetJson() (+14 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.15
Nodes (15): adimAciklamaMetni(), Props, SorunAkisOzeti(), SorunAkisOzetiIcerik(), SorunSecimi(), SorunSecimiProps, TextArea(), CEKICI_ADIMLAR (+7 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.16
Nodes (19): garantiHashHesapla(), garantiXmlDeger(), GARANTI_HATA_KODLARI, garantiKodNormalize(), garantiMesajGenelMi(), garantiMusteriHataMesaji(), garantiYetersizBakiyeMetniMi(), GENEL_MESAJ_ORNEKLERI (+11 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.12
Nodes (32): GET(), GET(), PATCH(), POST(), davetKayitBaslangicKredisiFromSonuc(), davetKayitBonusTamamla(), davetKayitHazirla(), DavetKayitSonuc (+24 more)

### Community 4 - "seo.ts"
Cohesion: 0.16
Nodes (13): POST(), GET(), POST(), POST(), GET(), GET(), PUT(), saatGecerliMi() (+5 more)

### Community 5 - "mappers.ts"
Cohesion: 0.26
Nodes (13): PATCH(), POST(), sonKullanmaAyir(), tcKimlikGecerliMi(), vergiNoGecerliMi(), istemciIpAl(), tlTutarKurus(), faturaAlanlariniDogrula() (+5 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.19
Nodes (17): CekiciRotaPanelProps, embedDirectionsUrl(), googleMapsDirUrl(), MusteriCekiciTakipHarita(), MusteriCekiciTakipHaritaProps, TakipVerisi, appleMapsRotaUrl(), googleMapsRotaUrl() (+9 more)

### Community 7 - "ui.tsx"
Cohesion: 0.07
Nodes (24): Adim, DegerlendirmeSatir, Ozet, BOS_FORM, KampanyaSatir, KullanimSatir, Ozet, Ozet (+16 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (34): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+26 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.09
Nodes (37): GET(), GET(), GET(), POST(), addSmsKaydi(), getCekicilerBildirimAdaylari(), anlasamadiSonrasiIhaleyiSurdur(), MUSTERI_OTP_TIPLERI (+29 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.19
Nodes (8): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesiProps, HizmetVerenSayimPanel(), PanelGirisForm(), useHizmetVerenSayim(), HizmetVerenSayimOzet

### Community 12 - "sms-provider.ts"
Cohesion: 0.29
Nodes (11): IZINLI, POST(), POST(), FunnelOlay, funnelOlayKaydet(), funnelOlaySay(), FunnelOzet, funnelOzetHesapla() (+3 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.21
Nodes (6): gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi, satirFromCekici()

### Community 14 - "memnuniyet.ts"
Cohesion: 0.18
Nodes (18): GET(), cekiciAuthKullaniciSil(), cekiciBelgeleriniSil(), silCekiciCascade(), kaybedenTeklifleriIsaretle(), getSupabaseAdmin(), supabaseDbAktif(), davetKoduSutunuVar() (+10 more)

### Community 15 - "db.ts"
Cohesion: 0.29
Nodes (5): FormAdimi, NASIL_ADIMLAR, NasilAdim, NasilCalisirSerit(), Props

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.23
Nodes (10): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, posthogCerezSenkronize(), posthogKampanyaKaydet(), posthogOlayBirKez(), posthogOlayYakala(), posthogUtmOzellikleri() (+2 more)

### Community 17 - "route.ts"
Cohesion: 0.14
Nodes (16): metadata, CekiciKayitLayout(), metadata, HomePage(), metadata, JsonLd(), JsonLdProps, SssBolumu() (+8 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.11
Nodes (26): ArizaFotografAlani(), GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI, funnelKaydet(), Step (+18 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.15
Nodes (24): POST(), GET(), baseUrlFrom(), GET(), cekiciHizmetPuani, DegerlendirmeRow, getDegerlendirmeByTalepId(), getDegerlendirmelerByCekiciId() (+16 more)

### Community 20 - "page.tsx"
Cohesion: 0.12
Nodes (15): BekleIcerik(), Durum, MemnuniyetState, TeklifOzet, DemoHeaderBadge(), Asama, ASAMA_METIN, IhaleBekleAnimasyon() (+7 more)

### Community 21 - "davet-panel.ts"
Cohesion: 0.83
Nodes (3): fotografBase64Ayikla(), talepFotografYukle(), uzanti()

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.09
Nodes (44): GET(), GET(), POST(), POST(), POST(), GET(), GECERLI, POST() (+36 more)

### Community 24 - "page.tsx"
Cohesion: 0.14
Nodes (22): eslintConfig, main(), GET(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig (+14 more)

### Community 25 - "YasalSayfaShell.tsx"
Cohesion: 0.21
Nodes (11): metadata, metadata, metadata, metadata, metadata, YasalBolum(), YasalListe(), YasalSayfaShell() (+3 more)

### Community 26 - "funnel.ts"
Cohesion: 0.18
Nodes (19): POST(), TalepOzet, cekiciTalepBolgesineUygunMu(), cekiciTalepSorununaUygunMu(), updateTalep(), demoTeklifEkle(), cekiciTeklifVerebilirMi(), SMS_BILDIRIM_KREDI (+11 more)

### Community 27 - "page.tsx"
Cohesion: 0.19
Nodes (18): CekiciTalepClient(), TalepDurum, KisiselVeriGizlemeAyarlari(), CekiciPanelTabs(), TalepKarti(), useKazananKonumPaylas(), useKisiselVeriGizle(), adGoster() (+10 more)

### Community 28 - "cekici-email-otp.ts"
Cohesion: 0.26
Nodes (17): GET(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder(), EmailOtpKayit, EmailOtpRow, fromRow() (+9 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "konum-oneri.ts"
Cohesion: 0.24
Nodes (13): GET(), mesafeKmHaversine(), googleMapsApiKey(), googleAcikHedefOnerileri(), GooglePlaceRow, placesTextSearch(), HedefOneriSecenekleri, KonumOneri (+5 more)

### Community 32 - "posthog-client.ts"
Cohesion: 0.83
Nodes (3): GET(), istemciIp(), ozelIp()

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.31
Nodes (10): bildirimRowsFromTalepler(), cekiciToRow(), dataDir, haricRowsFromTalepler(), main(), readJson(), supabase, talepToRow() (+2 more)

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.32
Nodes (4): metadata, PanelChrome(), LINKS, PanelNav()

### Community 35 - "NasilCalisirSerit.tsx"
Cohesion: 0.19
Nodes (17): GET(), HizmetVerenSayimGostergesi(), useAnimatedNumber(), cekiciMusaitMi(), istanbulGunVeDakika(), saatMetniDakika(), cevrimiciJitterFaktor(), cevrimiciJitterUygula() (+9 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "env.ts"
Cohesion: 0.18
Nodes (14): config, middleware(), POST(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli(), supabaseEksikEnvAlanlari() (+6 more)

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.26
Nodes (16): POST(), MusteriAnaSayfa(), addTalep(), SORUN_ARAC_MODELI_TIPLERI, SORUN_CAGRI_BUTON, SORUN_FOTOGRAF_TIPLERI, SORUN_HEDEF_KONUM_ATLANIR, sorunAracModeliGerekliMi() (+8 more)

### Community 41 - "sitemap.ts"
Cohesion: 0.14
Nodes (17): BolgeApiData, BolgeAyarlari(), BolgeAyarlariProps, BolgeApiData, GUNLER, MusaitlikAyarlari(), Durum, PremiumSmsAyarlari() (+9 more)

### Community 52 - "getCekiciById"
Cohesion: 0.38
Nodes (11): GET(), GET(), cekiciPuanOzetleri(), isDemoTalepId(), demoTalepGetir(), demoMusteriTalepDurumJson(), demoMusteriTekliflerJson(), aktifTeklifler() (+3 more)

### Community 53 - "davet-kayit.ts"
Cohesion: 0.06
Nodes (68): GET(), POST(), bolgeOzet(), GET(), POST(), PUT(), GET(), PUT() (+60 more)

### Community 54 - "page.tsx"
Cohesion: 0.06
Nodes (99): POST(), POST(), POST(), GET(), POST(), PUT(), POST(), POST() (+91 more)

### Community 55 - "google-maps.ts"
Cohesion: 0.25
Nodes (12): noktaOku(), POST(), durationSaniyedenDk(), googleMapsYapilandirildi(), RotaSureKaynagi, surusSuresiDk(), surusSuresiLegacyMatrix(), surusSuresiOsrm() (+4 more)

### Community 56 - "route.ts"
Cohesion: 0.29
Nodes (9): POST(), POST(), KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI, KrediPaket, krediPaketBul(), krediPaketOdenecekTL(), KrediPaketTl (+1 more)

### Community 57 - "route.ts"
Cohesion: 0.26
Nodes (9): GET(), GET(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), krediOdemeFromRow(), KrediOdemeRow, krediOdemeToRow() (+1 more)

### Community 58 - "cerez-onay.ts"
Cohesion: 0.25
Nodes (14): GoogleAnalytics(), cerezAnalitikAktif(), GTAG_CONSENT_DENIED, GTAG_CONSENT_GRANTED, gtagAdsFiyatTeklifiDonusumu(), gtagAdsKaydolmaDonusumu(), gtagCagir(), gtagCekiciKayitOnayGoruntule() (+6 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.08
Nodes (23): BelgeYuklemeAlani(), CekiciAyarlarPanel(), AVANTAJLAR, CekiciKayitLanding(), CekiciKayitLandingProps, GUVEN_MADDELERI, IS_AKISI, YORUMLAR (+15 more)

### Community 61 - "kredi-odeme.ts"
Cohesion: 0.12
Nodes (9): OdemeOnayPage(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, SmsKaydi, BrandLogoYazili(), MobileShell(), MobileShellProps, OdemeOnayKayit (+1 more)

### Community 62 - "davet-panel.ts"
Cohesion: 0.24
Nodes (6): GET(), DavetKullanimRow, DavetKullanimSatir, DavetLiderSatir, DavetPanelOzet, getDavetPanelVerisi()

### Community 63 - "davet-panel.ts"
Cohesion: 0.23
Nodes (15): anlasilanIsSay(), cekiciPuanOzeti, computePuanFromTables(), fiyatGarantiPuaniHesapla(), normalizeTeklif(), ozetFromCounts(), teklifFiyatDegistiMi(), tercihPuaniHesapla() (+7 more)

### Community 64 - "CerezOnayBanner.tsx"
Cohesion: 0.26
Nodes (9): CerezOnayBanner(), Gorunum, tercihKaydet(), cerezBannerGosterilmeli(), cerezBannerKapaliMi(), cerezBannerKapat(), cerezOnayKaydet(), cerezOnayOku() (+1 more)

### Community 65 - "route.ts"
Cohesion: 0.36
Nodes (8): GET(), haftaBaslangici(), istanbulAyAnahtari(), kazananTeklifFiyati(), GET(), getSmsLog(), getTaleplerByKazananCekici(), countHaricByCekici()

### Community 66 - "route.ts"
Cohesion: 0.44
Nodes (7): PUT(), davetKayitBaslangicKredisi(), davetKoduGecerliMi(), davetKoduNormalize(), davetKoduOner(), YASAKLI_KODLAR, setCekiciDavetKodu()

### Community 67 - "route.ts"
Cohesion: 0.33
Nodes (6): GET(), KayitKontenjanBilgi(), Props, KayitKontenjanDurum, kayitKontenjanHesapla(), countCekiciler()

### Community 68 - "page.tsx"
Cohesion: 0.27
Nodes (6): KrediPage(), belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), formatKredi(), BelgeDurum

### Community 69 - "teklif-db.ts"
Cohesion: 0.11
Nodes (33): GET(), GET(), bugunBaslangicIso(), countSmsLog(), countTalepler(), getTalepler(), getTaleplerBugun(), getTaleplerMemnuniyetBekleyen() (+25 more)

### Community 70 - "musteri-profil.ts"
Cohesion: 0.36
Nodes (8): kayitliAdSoyadUygula(), depolama(), MusteriProfil, musteriProfilKaydet(), musteriProfilOku(), okuHarita(), ProfilHaritasi, yazHarita()

### Community 71 - "layout.tsx"
Cohesion: 0.28
Nodes (7): geist, metadata, RootLayout(), viewport, PostHogProvider(), gtagConsentBootstrapInline(), SEO_ANAHTARLAR

### Community 74 - "route.ts"
Cohesion: 0.32
Nodes (9): POST(), OnayIcerik(), KayitIcerik(), KULLANIMA_ACIK_ILLER, sehirBeklemeMesaji(), sehirKullanimAcikMi(), demoKatil(), demoKatilMesaji() (+1 more)

### Community 75 - "route.ts"
Cohesion: 0.53
Nodes (4): POST(), olusturBekleyenRozetOdeme(), rozetIndirimYuzde(), odemeToRow()

### Community 76 - "page.tsx"
Cohesion: 0.40
Nodes (5): DemoDurum, DemoSms, kalanSureFormat(), PanelDemoPage(), SIMULE_ADIMLAR

### Community 79 - "SorunTipiSecimi.tsx"
Cohesion: 0.67
Nodes (3): SorunTipiSecimi(), SorunTipiSecimiProps, SorunTipi

## Knowledge Gaps
- **283 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+278 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `memnuniyet.ts` to `getSupabaseAdmin`, `seo.ts`, `mappers.ts`, `google-maps.ts`, `sms-provider.ts`, `ensureSeedData`, `davet-panel.ts`, `route.ts`, `funnel.ts`, `cekici-email-otp.ts`, `route.ts`, `davet-kayit.ts`, `page.tsx`, `route.ts`, `route.ts`, `davet-panel.ts`, `davet-panel.ts`, `route.ts`, `route.ts`, `route.ts`, `teklif-db.ts`, `route.ts`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `Card()` connect `ui.tsx` to `route.ts`, `page.tsx`, `ensureSeedData`, `sitemap.ts`, `CekiciPanelTabs.tsx`, `page.tsx`, `CekiciAyarlarPanel.tsx`, `page.tsx`, `db.ts`, `hizmet-veren-sayim.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `page.tsx`, `route.ts`, `kredi-odeme.ts`, `davet-panel.ts`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `telefonNormalize()` connect `page.tsx` to `route.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `musteri-profil.ts`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _283 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getSupabaseAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.12427409988385599 - nodes in this community are weakly interconnected._
- **Should `ui.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06887755102040816 - nodes in this community are weakly interconnected._
- **Should `TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._