# Graph Report - acilcozumbul  (2026-07-19)

## Corpus Check
- 344 files · ~372,613 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1455 nodes · 4526 edges · 75 communities (63 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a316b0f1`
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
- [[_COMMUNITY_MobileShell.tsx|MobileShell.tsx]]
- [[_COMMUNITY_funnel.ts|funnel.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_cekici-puan.ts|cekici-puan.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
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
- [[_COMMUNITY_google-maps.ts|google-maps.ts]]
- [[_COMMUNITY_davet-kayit.ts|davet-kayit.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_ArizaFotografAlani.tsx|ArizaFotografAlani.tsx]]
- [[_COMMUNITY_sorun-akis-aciklama.ts|sorun-akis-aciklama.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_cerez-onay.ts|cerez-onay.ts]]
- [[_COMMUNITY_payment.ts|payment.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_kredi-odeme.ts|kredi-odeme.ts]]
- [[_COMMUNITY_HizmetVerenSayimGostergesi.tsx|HizmetVerenSayimGostergesi.tsx]]
- [[_COMMUNITY_davet-panel.ts|davet-panel.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_musteri-profil.ts|musteri-profil.ts]]
- [[_COMMUNITY_NasilCalisirSerit.tsx|NasilCalisirSerit.tsx]]
- [[_COMMUNITY_teklif-db.ts|teklif-db.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_SorunTipiSecimi.tsx|SorunTipiSecimi.tsx]]
- [[_COMMUNITY_Ölçeklenebilirlik regression smoke checklist|Ölçeklenebilirlik regression smoke checklist]]
- [[_COMMUNITY_verify-teklif-backfill.mjs|verify-teklif-backfill.mjs]]
- [[_COMMUNITY_YasalOnayKutusu.tsx|YasalOnayKutusu.tsx]]

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
- `main()` --calls--> `krediTutarKurus()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/kredi-fiyat.ts
- `main()` --calls--> `garantiYapilandirildi()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/config.ts

## Import Cycles
- None detected.

## Communities (75 total, 12 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.09
Nodes (44): GET(), GET(), POST(), POST(), POST(), GET(), GECERLI, POST() (+36 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.26
Nodes (17): GET(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder(), EmailOtpKayit, EmailOtpRow, fromRow() (+9 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.16
Nodes (19): garantiHashHesapla(), garantiXmlDeger(), GARANTI_HATA_KODLARI, garantiKodNormalize(), garantiMesajGenelMi(), garantiMusteriHataMesaji(), garantiYetersizBakiyeMetniMi(), GENEL_MESAJ_ORNEKLERI (+11 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.10
Nodes (41): GET(), GET(), PUT(), GET(), GET(), PATCH(), POST(), davetKayitBaslangicKredisiFromSonuc() (+33 more)

### Community 4 - "seo.ts"
Cohesion: 0.15
Nodes (20): POST(), GET(), POST(), GET(), PUT(), saatGecerliMi(), POST(), POST() (+12 more)

### Community 5 - "mappers.ts"
Cohesion: 0.23
Nodes (13): POST(), POST(), KrediPage(), KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI, KrediPaket, krediPaketBul(), krediPaketOdenecekTL() (+5 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.07
Nodes (46): noktaOku(), POST(), GET(), CekiciRotaPanel(), CekiciRotaPanelProps, embedDirectionsUrl(), RotaSureleri, embedDirectionsUrl() (+38 more)

### Community 7 - "ui.tsx"
Cohesion: 0.07
Nodes (21): DegerlendirmeSatir, Ozet, BOS_FORM, KampanyaSatir, KullanimSatir, Ozet, Ozet, Saglik (+13 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (34): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+26 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.14
Nodes (21): GET(), addSmsKaydi(), escapeXml(), GondericiAdiSorguSonuc, logSmsKaydi(), netgsmGondericiAdlariSorgula(), netgsmKimlik(), netgsmOtpSmsGonder() (+13 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.13
Nodes (21): cekiciTalepBolgesineUygunMu(), cekiciTalepSorununaUygunMu(), filtreleCekicilerSorun(), cekiciAcikTalepUygunMu(), enDusukTeklif(), kaybedenTeklifleriIsaretle(), SMS_BILDIRIM_KREDI, teklifVerilebilirMi() (+13 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.24
Nodes (12): GET(), GET(), GET(), GET(), countSmsLog(), countTalepler(), getSmsLog(), getTaleplerSince() (+4 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.16
Nodes (9): GET(), GET(), getCekiciler(), gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi (+1 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.05
Nodes (67): POST(), POST(), POST(), GET(), GET(), baseUrlFrom(), GET(), POST() (+59 more)

### Community 15 - "db.ts"
Cohesion: 0.21
Nodes (15): PATCH(), GET(), POST(), sonKullanmaAyir(), tcKimlikGecerliMi(), vergiNoGecerliMi(), istemciIpAl(), faturaAlanlariniDogrula() (+7 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.15
Nodes (16): OnayIcerik(), OdemeOnayPage(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, funnelKaydet(), cerezAnalitikAktif(), cerezOnayOku(), OdemeOnayKayit (+8 more)

### Community 17 - "route.ts"
Cohesion: 0.21
Nodes (11): metadata, metadata, metadata, metadata, metadata, YasalBolum(), YasalListe(), YasalSayfaShell() (+3 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.12
Nodes (24): ArizaFotografAlani(), GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI, Step, STEP_SIRA (+16 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.22
Nodes (12): CekiciKayitLayout(), metadata, HomePage(), metadata, JsonLd(), JsonLdProps, CEKICI_KAYIT_SEO, faqJsonLd() (+4 more)

### Community 20 - "page.tsx"
Cohesion: 0.10
Nodes (18): BekleIcerik(), Durum, MemnuniyetState, TeklifOzet, DemoHeaderBadge(), Asama, ASAMA_METIN, IhaleBekleAnimasyon() (+10 more)

### Community 21 - "davet-panel.ts"
Cohesion: 0.17
Nodes (19): eslintConfig, main(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku() (+11 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.41
Nodes (11): GET(), GET(), cekiciPuanOzetleri(), isDemoTalepId(), demoTalepGetir(), DEMO_PUAN, demoMusteriTalepDurumJson(), demoMusteriTekliflerJson() (+3 more)

### Community 24 - "page.tsx"
Cohesion: 0.38
Nodes (5): hedefAltYazi(), KonumGuncellemeGostergesi(), renkKaristir(), TURUNCU, YESIL

### Community 25 - "MobileShell.tsx"
Cohesion: 0.24
Nodes (8): geist, metadata, RootLayout(), viewport, GoogleAnalytics(), PostHogProvider(), gtagConsentBootstrapInline(), SEO_ANAHTARLAR

### Community 26 - "funnel.ts"
Cohesion: 0.22
Nodes (23): GET(), GET(), rotaKoordinatlari(), POST(), listeDurumuBelirle(), toOzet(), KULLANIMA_ACIK_ILLER, sehirBeklemeMesaji() (+15 more)

### Community 27 - "page.tsx"
Cohesion: 0.13
Nodes (25): CekiciTalepClient(), TalepDurum, CekiciAyarlarPanel(), DavetKoduAyarlari(), BADGE, CekiciPanelTabs(), Istatistik, PanelData (+17 more)

### Community 28 - "route.ts"
Cohesion: 0.19
Nodes (18): POST(), getCekicilerBildirimAdaylari(), demoKatil(), demoKatilMesaji(), cekiciBildirimKrediTutari(), cekiciTalepSmsAdayiMi(), cekiciYeterliBildirimKredisi(), normalizeBase() (+10 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

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
Cohesion: 0.18
Nodes (18): GET(), HizmetVerenSayimGostergesi(), useAnimatedNumber(), cekiciMusaitMi(), istanbulGunVeDakika(), saatMetniDakika(), cevrimiciJitterFaktor(), cevrimiciJitterUygula() (+10 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "env.ts"
Cohesion: 0.14
Nodes (15): config, middleware(), POST(), POST(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli() (+7 more)

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.22
Nodes (18): POST(), MusteriAnaSayfa(), addTalep(), SORUN_ARAC_MODELI_TIPLERI, SORUN_CAGRI_BUTON, SORUN_FOTOGRAF_TIPLERI, SORUN_HEDEF_KONUM_ATLANIR, sorunAracModeliGerekliMi() (+10 more)

### Community 41 - "sitemap.ts"
Cohesion: 0.17
Nodes (17): BolgeApiData, BolgeAyarlari(), BolgeAyarlariProps, BolgeApiData, DavetKoduDurum, GUNLER, MusaitlikAyarlari(), Durum (+9 more)

### Community 52 - "google-maps.ts"
Cohesion: 0.22
Nodes (16): PATCH(), POST(), GET(), POST(), getCekiciById(), getTalepById(), saveCekiciler(), updateCekiciBelgeDurum() (+8 more)

### Community 53 - "davet-kayit.ts"
Cohesion: 0.10
Nodes (42): bolgeOzet(), GET(), POST(), PUT(), POST(), cekiciTalepIlIlceyeUygunMu(), filtreleCekicilerBolge(), ilceEslesir() (+34 more)

### Community 54 - "page.tsx"
Cohesion: 0.06
Nodes (93): POST(), POST(), GET(), POST(), PUT(), POST(), POST(), IZINLI (+85 more)

### Community 55 - "ArizaFotografAlani.tsx"
Cohesion: 0.53
Nodes (4): POST(), olusturBekleyenRozetOdeme(), rozetIndirimYuzde(), odemeToRow()

### Community 57 - "route.ts"
Cohesion: 0.11
Nodes (20): GET(), GET(), hizmetBolgeleriFlatten(), getCekiciByDogrulanmisFaturaEposta(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), cekiciFromRow() (+12 more)

### Community 58 - "cerez-onay.ts"
Cohesion: 0.18
Nodes (15): CerezOnayBanner(), cerezBannerGosterilmeli(), cerezBannerKapaliMi(), cerezBannerKapat(), cerezOnayKaydet(), CerezOnayTercihi, GTAG_CONSENT_DENIED, GTAG_CONSENT_GRANTED (+7 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.12
Nodes (12): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), AVANTAJLAR, CekiciKayitLanding(), CekiciKayitLandingProps, GUVEN_MADDELERI (+4 more)

### Community 61 - "kredi-odeme.ts"
Cohesion: 0.13
Nodes (9): Adim, SifremiUnuttumPage(), SmsKaydi, BrandLogoYazili(), MobileShell(), MobileShellProps, PanelGirisFormProps, SifreAlani (+1 more)

### Community 63 - "davet-panel.ts"
Cohesion: 0.15
Nodes (15): adimAciklamaMetni(), Props, SorunAkisOzeti(), SorunAkisOzetiIcerik(), SorunSecimi(), SorunSecimiProps, TextArea(), CEKICI_ADIMLAR (+7 more)

### Community 64 - "page.tsx"
Cohesion: 0.19
Nodes (8): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesiProps, HizmetVerenSayimPanel(), PanelGirisForm(), useHizmetVerenSayim(), HizmetVerenSayimOzet

### Community 65 - "route.ts"
Cohesion: 0.52
Nodes (6): GET(), haftaBaslangici(), istanbulAyAnahtari(), kazananTeklifFiyati(), getTaleplerByKazananCekici(), countHaricByCekici()

### Community 66 - "route.ts"
Cohesion: 0.33
Nodes (6): GET(), KayitKontenjanBilgi(), Props, KayitKontenjanDurum, kayitKontenjanHesapla(), countCekiciler()

### Community 67 - "musteri-profil.ts"
Cohesion: 0.36
Nodes (8): kayitliAdSoyadUygula(), depolama(), MusteriProfil, musteriProfilKaydet(), musteriProfilOku(), okuHarita(), ProfilHaritasi, yazHarita()

### Community 68 - "NasilCalisirSerit.tsx"
Cohesion: 0.29
Nodes (5): FormAdimi, NASIL_ADIMLAR, NasilAdim, NasilCalisirSerit(), Props

### Community 69 - "teklif-db.ts"
Cohesion: 0.22
Nodes (16): GET(), bugunBaslangicIso(), getTalepler(), getTaleplerBugun(), getTaleplerSayfali(), hydrateTalep(), hydrateTalepler(), syncTalepIliskileri() (+8 more)

### Community 70 - "page.tsx"
Cohesion: 0.15
Nodes (12): DELETE(), GET(), belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), DemoDurum, DemoSms, kalanSureFormat() (+4 more)

### Community 71 - "SorunTipiSecimi.tsx"
Cohesion: 0.67
Nodes (3): SorunTipiSecimi(), SorunTipiSecimiProps, SorunTipi

## Knowledge Gaps
- **282 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+277 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `memnuniyet.ts` to `demo-oturum.ts`, `telefonNormalize`, `getSupabaseAdmin`, `seo.ts`, `mappers.ts`, `google-maps.ts`, `CekiciPanelTabs.tsx`, `sms-provider.ts`, `CekiciAyarlarPanel.tsx`, `db.ts`, `route.ts`, `route.ts`, `google-maps.ts`, `davet-kayit.ts`, `page.tsx`, `ArizaFotografAlani.tsx`, `route.ts`, `route.ts`, `route.ts`, `teklif-db.ts`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `Card()` connect `ui.tsx` to `page.tsx`, `route.ts`, `NasilCalisirSerit.tsx`, `page.tsx`, `ensureSeedData`, `sitemap.ts`, `CekiciAyarlarPanel.tsx`, `memnuniyet.ts`, `hizmet-veren-sayim.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `route.ts`, `page.tsx`, `route.ts`, `kredi-odeme.ts`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `getCurrentCekici()` connect `seo.ts` to `demo-oturum.ts`, `route.ts`, `telefonNormalize`, `getSupabaseAdmin`, `mappers.ts`, `ensureSeedData`, `memnuniyet.ts`, `db.ts`, `ensureSeedData`, `davet-kayit.ts`, `davet-panel.ts`, `page.tsx`, `ArizaFotografAlani.tsx`, `funnel.ts`, `route.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _282 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `demo-oturum.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09427609427609428 - nodes in this community are weakly interconnected._
- **Should `getSupabaseAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.09935064935064936 - nodes in this community are weakly interconnected._
- **Should `ensureSeedData` be split into smaller, more focused modules?**
  _Cohesion score 0.07422559906487435 - nodes in this community are weakly interconnected._