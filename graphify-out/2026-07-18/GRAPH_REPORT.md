# Graph Report - acilcozumbul  (2026-07-18)

## Corpus Check
- 333 files · ~367,712 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1395 nodes · 4332 edges · 64 communities (55 shown, 9 thin omitted)
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
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_server.ts|server.ts]]
- [[_COMMUNITY_HizmetVerenSayimGostergesi.tsx|HizmetVerenSayimGostergesi.tsx]]
- [[_COMMUNITY_cekici-sifre-otp.ts|cekici-sifre-otp.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]

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

## Communities (64 total, 9 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.11
Nodes (35): GET(), POST(), POST(), POST(), GET(), GECERLI, POST(), getCekiciById() (+27 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.22
Nodes (12): GET(), haftaBaslangici(), GET(), GET(), GET(), GET(), GET(), getSmsLog() (+4 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.16
Nodes (19): garantiHashHesapla(), garantiXmlDeger(), GARANTI_HATA_KODLARI, garantiKodNormalize(), garantiMesajGenelMi(), garantiMusteriHataMesaji(), garantiYetersizBakiyeMetniMi(), GENEL_MESAJ_ORNEKLERI (+11 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.05
Nodes (64): GET(), GET(), PUT(), GET(), GET(), GET(), PATCH(), POST() (+56 more)

### Community 4 - "seo.ts"
Cohesion: 0.17
Nodes (16): GET(), POST(), GET(), GET(), GET(), PATCH(), DELETE(), GET() (+8 more)

### Community 5 - "mappers.ts"
Cohesion: 0.06
Nodes (71): eslintConfig, main(), POST(), POST(), GET(), POST(), POST(), GET() (+63 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.07
Nodes (43): noktaOku(), POST(), GET(), GET(), CekiciRotaPanelProps, embedDirectionsUrl(), googleMapsDirUrl(), MusteriCekiciTakipHarita() (+35 more)

### Community 7 - "ui.tsx"
Cohesion: 0.15
Nodes (9): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), KayitKontenjanBilgi(), Props, YasalSiteFooter(), KayitKontenjanDurum (+1 more)

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
Cohesion: 0.22
Nodes (12): CekiciKayitLayout(), metadata, HomePage(), metadata, JsonLd(), JsonLdProps, CEKICI_KAYIT_SEO, faqJsonLd() (+4 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.18
Nodes (19): GET(), addSmsKaydi(), escapeXml(), GondericiAdiSorguSonuc, logSmsKaydi(), netgsmGondericiAdlariSorgula(), netgsmKimlik(), netgsmOtpSmsGonder() (+11 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.19
Nodes (17): POST(), hizmetBolgeleriFlatten(), addCekici(), addTalep(), getCekiciByDogrulanmisFaturaEposta(), getCekiciByToken(), cekiciFromRow(), CekiciRow (+9 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.15
Nodes (27): POST(), GET(), baseUrlFrom(), GET(), POST(), GET(), getTalepById(), demoMusteriTalepDurumJson() (+19 more)

### Community 15 - "db.ts"
Cohesion: 0.20
Nodes (15): POST(), POST(), authAnonClient(), authSignIn(), cekiciAuthEmail(), cekiciAuthKullaniciOlustur(), cekiciAuthKullaniciSil(), cekiciAuthSifreDogrula() (+7 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.06
Nodes (29): Adim, DegerlendirmeSatir, Ozet, DemoDurum, DemoSms, kalanSureFormat(), PanelDemoPage(), SIMULE_ADIMLAR (+21 more)

### Community 17 - "route.ts"
Cohesion: 0.21
Nodes (11): metadata, metadata, metadata, metadata, metadata, YasalBolum(), YasalListe(), YasalSayfaShell() (+3 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.11
Nodes (27): ArizaFotografAlani(), GpsHttpsBanner(), KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI, funnelKaydet(), Step, STEP_SIRA (+19 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.19
Nodes (13): useHizmetVerenSayim(), cekiciMusaitMi(), istanbulGunVeDakika(), saatMetniDakika(), cevrimiciJitterFaktor(), cevrimiciJitterUygula(), HIZMET_ETIKET, hizmetVerenEtiket() (+5 more)

### Community 20 - "page.tsx"
Cohesion: 0.10
Nodes (18): BeklePage(), Durum, MemnuniyetState, TeklifOzet, DemoHeaderBadge(), Asama, ASAMA_METIN, IhaleBekleAnimasyon() (+10 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.30
Nodes (13): POST(), POST(), teklifFiyatDegistiMi(), updateTalep(), isDemoTalepId(), demoKatil(), demoTalepBul(), demoTalepGetir() (+5 more)

### Community 24 - "page.tsx"
Cohesion: 0.38
Nodes (5): hedefAltYazi(), KonumGuncellemeGostergesi(), renkKaristir(), TURUNCU, YESIL

### Community 25 - "MobileShell.tsx"
Cohesion: 0.10
Nodes (17): KrediPage(), OdemeOnayPage(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, SmsKaydi, BrandLogoYazili(), MobileShell(), MobileShellProps (+9 more)

### Community 26 - "funnel.ts"
Cohesion: 0.19
Nodes (28): GET(), rotaKoordinatlari(), POST(), listeDurumuBelirle(), toOzet(), OnayIcerik(), KULLANIMA_ACIK_ILLER, sehirBeklemeMesaji() (+20 more)

### Community 27 - "page.tsx"
Cohesion: 0.13
Nodes (24): CekiciTalepClient(), CekiciAyarlarPanel(), DavetKoduAyarlari(), KisiselVeriGizlemeAyarlari(), BADGE, CekiciPanelTabs(), Istatistik, PanelData (+16 more)

### Community 28 - "route.ts"
Cohesion: 0.25
Nodes (12): GET(), cekiciPuanOzeti, fiyatGarantiPuaniHesapla(), normalizeTeklif(), tercihPuaniHesapla(), demoMusteriTekliflerJson(), aktifTeklifler(), enDusukTeklif() (+4 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "route.ts"
Cohesion: 0.29
Nodes (7): GET(), gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi, satirFromCekici()

### Community 32 - "posthog-client.ts"
Cohesion: 0.24
Nodes (8): geist, metadata, RootLayout(), viewport, GoogleAnalytics(), PostHogProvider(), gtagConsentBootstrapInline(), SEO_ANAHTARLAR

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.39
Nodes (7): cekiciToRow(), dataDir, main(), readJson(), supabase, talepToRow(), upsertBatch()

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.32
Nodes (4): metadata, PanelChrome(), LINKS, PanelNav()

### Community 35 - "NasilCalisirSerit.tsx"
Cohesion: 0.19
Nodes (17): MusteriAnaSayfa(), SorunTipiSecimi(), SorunTipiSecimiProps, SORUN_ARAC_MODELI_TIPLERI, SORUN_CAGRI_BUTON, SORUN_FOTOGRAF_TIPLERI, SORUN_HEDEF_KONUM_ATLANIR, sorunAracModeliGerekliMi() (+9 more)

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
Cohesion: 0.29
Nodes (7): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesiProps, HizmetVerenSayimPanel(), PanelGirisForm(), HizmetVerenSayimOzet

### Community 41 - "sitemap.ts"
Cohesion: 0.13
Nodes (17): TalepDurum, BolgeApiData, BolgeAyarlari(), BolgeAyarlariProps, BolgeApiData, MusaitlikAyarlari(), PremiumSmsAyarlari(), CekiciRotaPanel() (+9 more)

### Community 52 - "sms.ts"
Cohesion: 0.10
Nodes (33): GET(), POST(), TalepOzet, cekiciTalepBolgesineUygunMu(), cekiciTalepSorununaUygunMu(), demoPanelVerisi(), mergeCekiciPanelData, anlasamadiSonrasiIhaleyiSurdur() (+25 more)

### Community 53 - "davet-kayit.ts"
Cohesion: 0.10
Nodes (42): bolgeOzet(), GET(), POST(), PUT(), POST(), POST(), cekiciTalepIlIlceyeUygunMu(), filtreleCekicilerBolge() (+34 more)

### Community 54 - "page.tsx"
Cohesion: 0.06
Nodes (97): POST(), GET(), POST(), PUT(), POST(), GET(), istemciIp(), ozelIp() (+89 more)

### Community 55 - "ArizaFotografAlani.tsx"
Cohesion: 0.09
Nodes (16): belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), BelgeYuklemeAlani(), Props, AVANTAJLAR, CekiciKayitLanding(), CekiciKayitLandingProps (+8 more)

### Community 56 - "sorun-akis-aciklama.ts"
Cohesion: 0.36
Nodes (8): kayitliAdSoyadUygula(), depolama(), MusteriProfil, musteriProfilKaydet(), musteriProfilOku(), okuHarita(), ProfilHaritasi, yazHarita()

### Community 58 - "cerez-onay.ts"
Cohesion: 0.19
Nodes (18): CerezOnayBanner(), cerezAnalitikAktif(), cerezBannerGosterilmeli(), cerezBannerKapaliMi(), cerezBannerKapat(), cerezOnayKaydet(), cerezOnayOku(), CerezOnayTercihi (+10 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.60
Nodes (4): HizmetVerenSayimGostergesi(), useAnimatedNumber(), hizmetVerenSatirBul(), gecerliSorunTipi()

### Community 61 - "server.ts"
Cohesion: 0.27
Nodes (9): GET(), PUT(), saatGecerliMi(), GET(), PUT(), POST(), musaitlikOzeti(), normalizeHizmetSorunTipleri() (+1 more)

### Community 62 - "HizmetVerenSayimGostergesi.tsx"
Cohesion: 0.29
Nodes (5): FormAdimi, NASIL_ADIMLAR, NasilAdim, NasilCalisirSerit(), Props

## Knowledge Gaps
- **280 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+275 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `getSupabaseAdmin` to `demo-oturum.ts`, `telefonNormalize`, `seo.ts`, `mappers.ts`, `sms-provider.ts`, `CekiciAyarlarPanel.tsx`, `memnuniyet.ts`, `db.ts`, `davet-kayit.ts`, `page.tsx`, `route.ts`, `route.ts`, `server.ts`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `Card()` connect `hizmet-veren-sayim.ts` to `getSupabaseAdmin`, `ensureSeedData`, `ui.tsx`, `route.ts`, `sitemap.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `ArizaFotografAlani.tsx`, `MobileShell.tsx`, `page.tsx`, `HizmetVerenSayimGostergesi.tsx`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `ensureSeedData()` connect `seo.ts` to `telefonNormalize`, `getSupabaseAdmin`, `mappers.ts`, `ensureSeedData`, `CekiciAyarlarPanel.tsx`, `memnuniyet.ts`, `db.ts`, `sms.ts`, `davet-kayit.ts`, `page.tsx`, `route.ts`, `funnel.ts`, `route.ts`, `server.ts`, `route.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _280 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `demo-oturum.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11212121212121212 - nodes in this community are weakly interconnected._
- **Should `getSupabaseAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.05444978265843056 - nodes in this community are weakly interconnected._
- **Should `mappers.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05875077303648732 - nodes in this community are weakly interconnected._