# Graph Report - acilcozumbul  (2026-07-18)

## Corpus Check
- 334 files · ~367,979 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1398 nodes · 4340 edges · 62 communities (56 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `02b72008`
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
- [[_COMMUNITY_sms.ts|sms.ts]]
- [[_COMMUNITY_davet-kayit.ts|davet-kayit.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_ArizaFotografAlani.tsx|ArizaFotografAlani.tsx]]
- [[_COMMUNITY_sorun-akis-aciklama.ts|sorun-akis-aciklama.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_cerez-onay.ts|cerez-onay.ts]]
- [[_COMMUNITY_payment.ts|payment.ts]]
- [[_COMMUNITY_server.ts|server.ts]]
- [[_COMMUNITY_HizmetVerenSayimGostergesi.tsx|HizmetVerenSayimGostergesi.tsx]]

## God Nodes (most connected - your core abstractions)
1. `ensureSeedData()` - 93 edges
2. `getSupabaseAdmin()` - 93 edges
3. `getCurrentCekici()` - 66 edges
4. `telefonNormalize()` - 53 edges
5. `Card()` - 45 edges
6. `getCekiciById()` - 37 edges
7. `updateCekici()` - 34 edges
8. `telefonGecerliMi()` - 32 edges
9. `Btn()` - 30 edges
10. `Cekici` - 25 edges

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

## Communities (62 total, 6 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.10
Nodes (40): GET(), POST(), POST(), POST(), GET(), GECERLI, POST(), demoBaslangicDurumu() (+32 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.23
Nodes (18): GET(), POST(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder(), EmailOtpKayit, EmailOtpRow (+10 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.16
Nodes (19): garantiHashHesapla(), garantiXmlDeger(), GARANTI_HATA_KODLARI, garantiKodNormalize(), garantiMesajGenelMi(), garantiMusteriHataMesaji(), garantiYetersizBakiyeMetniMi(), GENEL_MESAJ_ORNEKLERI (+11 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.07
Nodes (51): GET(), GET(), PUT(), GET(), GET(), PATCH(), POST(), BOS_FORM (+43 more)

### Community 4 - "seo.ts"
Cohesion: 0.10
Nodes (34): POST(), GET(), POST(), GET(), GET(), GET(), PUT(), POST() (+26 more)

### Community 5 - "mappers.ts"
Cohesion: 0.15
Nodes (21): eslintConfig, main(), GET(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig (+13 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.08
Nodes (45): noktaOku(), POST(), GET(), CekiciRotaPanel(), CekiciRotaPanelProps, embedDirectionsUrl(), RotaSureleri, embedDirectionsUrl() (+37 more)

### Community 7 - "ui.tsx"
Cohesion: 0.15
Nodes (11): KrediPage(), belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), DemoDurum, DemoSms, kalanSureFormat(), PanelDemoPage() (+3 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (34): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+26 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.15
Nodes (15): adimAciklamaMetni(), Props, SorunAkisOzeti(), SorunAkisOzetiIcerik(), SorunSecimi(), SorunSecimiProps, TextArea(), CEKICI_ADIMLAR (+7 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.24
Nodes (12): POST(), POST(), KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI, KrediPaket, krediPaketBul(), krediPaketOdenecekTL(), KrediPaketTl (+4 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.12
Nodes (28): GET(), GET(), GET(), GET(), addSmsKaydi(), getSmsLog(), escapeXml(), GondericiAdiSorguSonuc (+20 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.08
Nodes (23): GET(), GET(), Saglik, hizmetBolgeleriFlatten(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), cekiciFromRow() (+15 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.16
Nodes (25): POST(), GET(), baseUrlFrom(), GET(), POST(), GET(), DegerlendirmeRow, getDegerlendirmeByTalepId() (+17 more)

### Community 15 - "db.ts"
Cohesion: 0.27
Nodes (12): PATCH(), POST(), sonKullanmaAyir(), tcKimlikGecerliMi(), vergiNoGecerliMi(), istemciIpAl(), tlTutarKurus(), faturaAlanlariniDogrula() (+4 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.08
Nodes (21): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), Adim, SifremiUnuttumPage(), DegerlendirmeSatir, Ozet (+13 more)

### Community 17 - "route.ts"
Cohesion: 0.07
Nodes (33): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, metadata (+25 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.15
Nodes (22): GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI, funnelKaydet(), Step, STEP_SIRA (+14 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.18
Nodes (18): GET(), HizmetVerenSayimGostergesi(), useAnimatedNumber(), cekiciMusaitMi(), istanbulGunVeDakika(), saatMetniDakika(), cevrimiciJitterFaktor(), cevrimiciJitterUygula() (+10 more)

### Community 20 - "page.tsx"
Cohesion: 0.11
Nodes (17): BekleIcerik(), Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps (+9 more)

### Community 21 - "davet-panel.ts"
Cohesion: 0.24
Nodes (6): GET(), DavetKullanimRow, DavetKullanimSatir, DavetLiderSatir, DavetPanelOzet, getDavetPanelVerisi()

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.45
Nodes (8): GET(), DEMO_PUAN, demoMusteriTalepDurumJson(), demoMusteriTekliflerJson(), aktifTeklifler(), enDusukTeklif(), ihaleAcikMi(), teklifleriSirala()

### Community 24 - "page.tsx"
Cohesion: 0.38
Nodes (5): hedefAltYazi(), KonumGuncellemeGostergesi(), renkKaristir(), TURUNCU, YESIL

### Community 25 - "MobileShell.tsx"
Cohesion: 0.10
Nodes (17): OnayIcerik(), OdemeOnayPage(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, SmsKaydi, BrandLogoYazili(), MobileShell(), MobileShellProps (+9 more)

### Community 26 - "funnel.ts"
Cohesion: 0.17
Nodes (37): POST(), GET(), rotaKoordinatlari(), POST(), GET(), listeDurumuBelirle(), toOzet(), cekiciTalepBolgesineUygunMu() (+29 more)

### Community 27 - "page.tsx"
Cohesion: 0.14
Nodes (23): CekiciTalepClient(), TalepDurum, KisiselVeriGizlemeAyarlari(), BADGE, CekiciPanelTabs(), Istatistik, PanelData, Tab (+15 more)

### Community 28 - "route.ts"
Cohesion: 0.13
Nodes (19): GET(), haftaBaslangici(), TalepOzet, cekiciPuanOzeti, fiyatGarantiPuaniHesapla(), normalizeTeklif(), tercihPuaniHesapla(), getTalepler() (+11 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "route.ts"
Cohesion: 0.21
Nodes (6): gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi, satirFromCekici()

### Community 32 - "posthog-client.ts"
Cohesion: 0.50
Nodes (3): ArizaFotografAlani(), ArizaFotografAlaniProps, fotografSikistir()

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.39
Nodes (7): cekiciToRow(), dataDir, main(), readJson(), supabase, talepToRow(), upsertBatch()

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.32
Nodes (4): metadata, PanelChrome(), LINKS, PanelNav()

### Community 35 - "NasilCalisirSerit.tsx"
Cohesion: 0.22
Nodes (18): POST(), MusteriAnaSayfa(), addTalep(), SORUN_ARAC_MODELI_TIPLERI, SORUN_CAGRI_BUTON, SORUN_FOTOGRAF_TIPLERI, SORUN_HEDEF_KONUM_ATLANIR, sorunAracModeliGerekliMi() (+10 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "env.ts"
Cohesion: 0.20
Nodes (14): config, middleware(), POST(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli(), supabaseEksikEnvAlanlari() (+6 more)

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.19
Nodes (8): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesiProps, HizmetVerenSayimPanel(), PanelGirisForm(), useHizmetVerenSayim(), HizmetVerenSayimOzet

### Community 41 - "sitemap.ts"
Cohesion: 0.11
Nodes (22): BolgeApiData, BolgeAyarlari(), BolgeAyarlariProps, BolgeApiData, CekiciAyarlarPanel(), DavetKoduAyarlari(), DavetKoduDurum, GUNLER (+14 more)

### Community 52 - "sms.ts"
Cohesion: 0.22
Nodes (12): POST(), anlasamadiSonrasiIhaleyiSurdur(), MUSTERI_OTP_TIPLERI, MUSTERI_SMS_IPTAL, MusteriSmsTipi, notifyCekiciIptal(), notifyCekiciler(), notifyMusteri() (+4 more)

### Community 53 - "davet-kayit.ts"
Cohesion: 0.09
Nodes (45): bolgeOzet(), GET(), POST(), PUT(), POST(), POST(), cekiciTalepIlIlceyeUygunMu(), cekiciTalepMenzileUygunMu() (+37 more)

### Community 54 - "page.tsx"
Cohesion: 0.05
Nodes (107): POST(), POST(), POST(), GET(), POST(), PUT(), POST(), POST() (+99 more)

### Community 55 - "ArizaFotografAlani.tsx"
Cohesion: 0.16
Nodes (13): BelgeYuklemeAlani(), Props, AVANTAJLAR, CekiciKayitLanding(), CekiciKayitLandingProps, GUVEN_MADDELERI, IS_AKISI, YORUMLAR (+5 more)

### Community 56 - "sorun-akis-aciklama.ts"
Cohesion: 0.36
Nodes (8): kayitliAdSoyadUygula(), depolama(), MusteriProfil, musteriProfilKaydet(), musteriProfilOku(), okuHarita(), ProfilHaritasi, yazHarita()

### Community 57 - "route.ts"
Cohesion: 0.83
Nodes (3): GET(), istemciIp(), ozelIp()

### Community 58 - "cerez-onay.ts"
Cohesion: 0.12
Nodes (26): geist, metadata, RootLayout(), viewport, CerezOnayBanner(), GoogleAnalytics(), PostHogProvider(), cerezAnalitikAktif() (+18 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 61 - "server.ts"
Cohesion: 0.23
Nodes (9): GET(), PUT(), saatGecerliMi(), POST(), POST(), getCurrentCekici(), musaitlikOzeti(), olusturBekleyenRozetOdeme() (+1 more)

### Community 62 - "HizmetVerenSayimGostergesi.tsx"
Cohesion: 0.29
Nodes (5): FormAdimi, NASIL_ADIMLAR, NasilAdim, NasilCalisirSerit(), Props

## Knowledge Gaps
- **280 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+275 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Card()` connect `hizmet-veren-sayim.ts` to `posthog-client.ts`, `getSupabaseAdmin`, `ensureSeedData`, `ui.tsx`, `route.ts`, `sitemap.ts`, `CekiciAyarlarPanel.tsx`, `MusteriAnaSayfa.tsx`, `page.tsx`, `davet-panel.ts`, `ArizaFotografAlani.tsx`, `HizmetVerenSayimGostergesi.tsx`, `MobileShell.tsx`, `page.tsx`, `route.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `ensureSeedData()` connect `seo.ts` to `getSupabaseAdmin`, `NasilCalisirSerit.tsx`, `CekiciPanelTabs.tsx`, `sms-provider.ts`, `memnuniyet.ts`, `db.ts`, `ensureSeedData`, `sms.ts`, `davet-kayit.ts`, `page.tsx`, `route.ts`, `funnel.ts`, `route.ts`, `server.ts`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `getSupabaseAdmin()` connect `page.tsx` to `demo-oturum.ts`, `telefonNormalize`, `getSupabaseAdmin`, `seo.ts`, `NasilCalisirSerit.tsx`, `CekiciPanelTabs.tsx`, `sms-provider.ts`, `CekiciAyarlarPanel.tsx`, `memnuniyet.ts`, `db.ts`, `davet-kayit.ts`, `davet-panel.ts`, `funnel.ts`, `route.ts`, `server.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _280 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `demo-oturum.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0996078431372549 - nodes in this community are weakly interconnected._
- **Should `getSupabaseAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.07323943661971831 - nodes in this community are weakly interconnected._
- **Should `seo.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10412299091544375 - nodes in this community are weakly interconnected._