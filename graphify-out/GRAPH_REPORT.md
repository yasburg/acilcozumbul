# Graph Report - acilcozumbul  (2026-07-15)

## Corpus Check
- 309 files · ~359,179 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1285 nodes · 3950 edges · 56 communities (50 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c541a428`
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
- [[_COMMUNITY_CekiciRotaPanel.tsx|CekiciRotaPanel.tsx]]
- [[_COMMUNITY_MusteriAnaSayfa.tsx|MusteriAnaSayfa.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_sorun-akis-aciklama.ts|sorun-akis-aciklama.ts]]
- [[_COMMUNITY_seed.ts|seed.ts]]
- [[_COMMUNITY_MobileShell.tsx|MobileShell.tsx]]
- [[_COMMUNITY_smsBaseUrl|smsBaseUrl]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_cekici-puan.ts|cekici-puan.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_ArizaFotografAlani.tsx|ArizaFotografAlani.tsx]]
- [[_COMMUNITY_migrate-json-to-supabase.mjs|migrate-json-to-supabase.mjs]]
- [[_COMMUNITY_PanelChrome.tsx|PanelChrome.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_Supabase veritabanı|Supabase veritabanı]]
- [[_COMMUNITY_Video demo modu|Video demo modu]]
- [[_COMMUNITY_NasilCalisirSerit.tsx|NasilCalisirSerit.tsx]]
- [[_COMMUNITY_README|README.md]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_talep-fotograf.ts|talep-fotograf.ts]]
- [[_COMMUNITY_Yapılacaklar|Yapılacaklar]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_AGENTS|AGENTS.md]]
- [[_COMMUNITY_next.config.ts|next.config.ts]]
- [[_COMMUNITY_postcss.config.mjs|postcss.config.mjs]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_talep-fotograf.ts|talep-fotograf.ts]]
- [[_COMMUNITY_ArizaFotografAlani.tsx|ArizaFotografAlani.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]

## God Nodes (most connected - your core abstractions)
1. `ensureSeedData()` - 93 edges
2. `getSupabaseAdmin()` - 89 edges
3. `getCurrentCekici()` - 62 edges
4. `telefonNormalize()` - 45 edges
5. `Card()` - 42 edges
6. `getCekiciById()` - 37 edges
7. `updateCekici()` - 31 edges
8. `telefonGecerliMi()` - 29 edges
9. `Btn()` - 28 edges
10. `getTalepById()` - 24 edges

## Surprising Connections (you probably didn't know these)
- `middleware()` --calls--> `updatePanelSession()`  [EXTRACTED]
  middleware.ts → src/lib/supabase/middleware.ts
- `main()` --calls--> `garantiYapilandirildi()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/config.ts
- `main()` --calls--> `garantiSmokeKartOku()`  [INFERRED]
  scripts/garanti-smoke.ts → src/lib/garanti/smoke-kart.ts
- `main()` --calls--> `garantiYapilandirmaOzeti()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/config.ts
- `main()` --calls--> `garantiKrediOdemesiYap()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/payment.ts

## Import Cycles
- None detected.

## Communities (56 total, 6 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.19
Nodes (21): POST(), POST(), GET(), POST(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder() (+13 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.06
Nodes (87): POST(), POST(), GET(), POST(), POST(), IZINLI, POST(), GET() (+79 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.09
Nodes (33): eslintConfig, main(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku() (+25 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.06
Nodes (60): GET(), GET(), GET(), GET(), PATCH(), POST(), GET(), GET() (+52 more)

### Community 4 - "seo.ts"
Cohesion: 0.06
Nodes (43): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, geist (+35 more)

### Community 5 - "mappers.ts"
Cohesion: 0.11
Nodes (33): cekiciTalepIlIlceyeUygunMu(), cekiciTalepMenzileUygunMu(), filtreleCekicilerBolge(), ilceEslesir(), normalize(), talepKonumBolge(), konumCekici(), cekiciHizmetBolgeleri() (+25 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.06
Nodes (107): POST(), GET(), rotaKoordinatlari(), POST(), GET(), listeDurumuBelirle(), toOzet(), POST() (+99 more)

### Community 7 - "ui.tsx"
Cohesion: 0.08
Nodes (18): DegerlendirmeSatir, Ozet, BOS_FORM, KampanyaSatir, KullanimSatir, Ozet, Ozet, Saglik (+10 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (33): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+25 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.14
Nodes (32): POST(), GET(), POST(), bolgeOzet(), GET(), POST(), PUT(), GET() (+24 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.15
Nodes (18): BolgeApiData, BolgeAyarlari(), BolgeAyarlariProps, BolgeApiData, DavetKoduAyarlari(), DavetKoduDurum, GUNLER, MusaitlikAyarlari() (+10 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.08
Nodes (34): GET(), POST(), DELETE(), GET(), DemoDurum, DemoSms, kalanSureFormat(), PanelDemoPage() (+26 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.16
Nodes (20): PATCH(), GET(), POST(), sonKullanmaAyir(), POST(), tcKimlikGecerliMi(), vergiNoGecerliMi(), garantiYapilandirildi() (+12 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.12
Nodes (31): POST(), GET(), baseUrlFrom(), GET(), POST(), cekiciPuanOzeti, fiyatGarantiPuaniHesapla(), normalizeTeklif() (+23 more)

### Community 15 - "db.ts"
Cohesion: 0.14
Nodes (10): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), AVANTAJLAR, CekiciKayitLanding(), CekiciKayitLandingProps, GUVEN_MADDELERI (+2 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.18
Nodes (20): POST(), MusteriAnaSayfa(), SorunSecimi(), SorunSecimiProps, TextArea(), addTalep(), SORUN_ARAC_MODELI_TIPLERI, SORUN_CAGRI_BUTON (+12 more)

### Community 17 - "CekiciRotaPanel.tsx"
Cohesion: 0.08
Nodes (43): noktaOku(), POST(), GET(), GET(), CekiciRotaPanelProps, embedDirectionsUrl(), googleMapsDirUrl(), MusteriCekiciTakipHarita() (+35 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.12
Nodes (26): GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, Step, STEP_SIRA, SssBolumu(), Spinner() (+18 more)

### Community 19 - "route.ts"
Cohesion: 0.22
Nodes (11): adimAciklamaMetni(), Props, SorunAkisOzeti(), SorunAkisOzetiIcerik(), CEKICI_ADIMLAR, SORUN_AKIS_ACIKLAMA, sorunAkisAciklama, SorunAkisAdim (+3 more)

### Community 20 - "page.tsx"
Cohesion: 0.11
Nodes (17): Durum, MemnuniyetState, TeklifOzet, DemoHeaderBadge(), Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps (+9 more)

### Community 21 - "route.ts"
Cohesion: 0.16
Nodes (14): config, middleware(), POST(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli(), supabaseEksikEnvAlanlari() (+6 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "sorun-akis-aciklama.ts"
Cohesion: 0.23
Nodes (7): CekiciTalepClient(), TalepDurum, CekiciRotaPanel(), embedDirectionsUrl(), RotaSureleri, OnayliCekiciRozeti(), useKazananKonumPaylas()

### Community 24 - "seed.ts"
Cohesion: 0.15
Nodes (20): PATCH(), GET(), GET(), hizmetBolgeleriFlatten(), addCekici(), addSmsKaydi(), getCekiciler(), updateCekiciBelgeDurum() (+12 more)

### Community 25 - "MobileShell.tsx"
Cohesion: 0.12
Nodes (11): GirisIcerik(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, Adim, SmsKaydi, BrandLogoYazili(), MobileShell(), MobileShellProps (+3 more)

### Community 26 - "smsBaseUrl"
Cohesion: 0.22
Nodes (12): GET(), haftaBaslangici(), GET(), GET(), GET(), GET(), GET(), getSmsLog() (+4 more)

### Community 27 - "page.tsx"
Cohesion: 0.12
Nodes (13): CekiciAyarlarPanel(), BADGE, CekiciPanelTabs(), Istatistik, PanelData, Tab, TalepOzet, hedefAltYazi() (+5 more)

### Community 28 - "page.tsx"
Cohesion: 0.21
Nodes (6): gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi, satirFromCekici()

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "page.tsx"
Cohesion: 0.33
Nodes (6): GET(), KayitKontenjanBilgi(), Props, KayitKontenjanDurum, kayitKontenjanHesapla(), countCekiciler()

### Community 32 - "ArizaFotografAlani.tsx"
Cohesion: 0.57
Nodes (5): POST(), POST(), krediPaketBul(), krediPaketOdenecekTL(), olusturBekleyenOdeme()

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.39
Nodes (7): cekiciToRow(), dataDir, main(), readJson(), supabase, talepToRow(), upsertBatch()

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.32
Nodes (4): metadata, PanelChrome(), LINKS, PanelNav()

### Community 35 - "page.tsx"
Cohesion: 0.21
Nodes (8): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesiProps, HizmetVerenSayimPanel(), PanelGirisForm(), useHizmetVerenSayim(), HizmetVerenSayimOzet

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "NasilCalisirSerit.tsx"
Cohesion: 0.29
Nodes (5): FormAdimi, NASIL_ADIMLAR, NasilAdim, NasilCalisirSerit(), Props

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.83
Nodes (3): GET(), istemciIp(), ozelIp()

### Community 41 - "talep-fotograf.ts"
Cohesion: 0.67
Nodes (3): SorunTipiSecimi(), SorunTipiSecimiProps, SorunTipi

### Community 52 - "route.ts"
Cohesion: 0.27
Nodes (6): KrediPage(), belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), formatKredi(), BelgeDurum

### Community 53 - "talep-fotograf.ts"
Cohesion: 0.83
Nodes (3): fotografBase64Ayikla(), talepFotografYukle(), uzanti()

### Community 54 - "ArizaFotografAlani.tsx"
Cohesion: 0.50
Nodes (3): ArizaFotografAlani(), ArizaFotografAlaniProps, fotografSikistir()

### Community 57 - "route.ts"
Cohesion: 0.22
Nodes (14): GET(), HizmetVerenSayimGostergesi(), useAnimatedNumber(), cekiciMusaitMi(), istanbulGunVeDakika(), saatMetniDakika(), HIZMET_ETIKET, hizmetVerenEtiket() (+6 more)

## Knowledge Gaps
- **263 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+258 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `getSupabaseAdmin` to `demo-oturum.ts`, `telefonNormalize`, `ArizaFotografAlani.tsx`, `ensureSeedData`, `google-maps.ts`, `sms-provider.ts`, `CekiciAyarlarPanel.tsx`, `memnuniyet.ts`, `hizmet-veren-sayim.ts`, `talep-fotograf.ts`, `seed.ts`, `smsBaseUrl`, `page.tsx`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `Card()` connect `ui.tsx` to `getSupabaseAdmin`, `page.tsx`, `NasilCalisirSerit.tsx`, `CekiciPanelTabs.tsx`, `sms-provider.ts`, `db.ts`, `CekiciRotaPanel.tsx`, `MusteriAnaSayfa.tsx`, `page.tsx`, `route.ts`, `ArizaFotografAlani.tsx`, `sorun-akis-aciklama.ts`, `MobileShell.tsx`, `page.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `ensureSeedData()` connect `google-maps.ts` to `demo-oturum.ts`, `telefonNormalize`, `ArizaFotografAlani.tsx`, `ensureSeedData`, `sms-provider.ts`, `CekiciAyarlarPanel.tsx`, `memnuniyet.ts`, `hizmet-veren-sayim.ts`, `CekiciRotaPanel.tsx`, `seed.ts`, `route.ts`, `smsBaseUrl`, `page.tsx`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _263 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `telefonNormalize` be split into smaller, more focused modules?**
  _Cohesion score 0.06486972147349505 - nodes in this community are weakly interconnected._
- **Should `cekici-email-otp.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08859357696567 - nodes in this community are weakly interconnected._
- **Should `getSupabaseAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.056948798328108674 - nodes in this community are weakly interconnected._