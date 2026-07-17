# Graph Report - acilcozumbul  (2026-07-17)

## Corpus Check
- 328 files · ~365,757 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1374 nodes · 4274 edges · 61 communities (55 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ec6026e7`
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
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_MobileShell.tsx|MobileShell.tsx]]
- [[_COMMUNITY_funnel.ts|funnel.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_cekici-puan.ts|cekici-puan.ts]]
- [[_COMMUNITY_seo.ts|seo.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_OnayliCekiciHesap.tsx|OnayliCekiciHesap.tsx]]
- [[_COMMUNITY_migrate-json-to-supabase.mjs|migrate-json-to-supabase.mjs]]
- [[_COMMUNITY_PanelChrome.tsx|PanelChrome.tsx]]
- [[_COMMUNITY_NasilCalisirSerit.tsx|NasilCalisirSerit.tsx]]
- [[_COMMUNITY_Supabase veritabanı|Supabase veritabanı]]
- [[_COMMUNITY_Video demo modu|Video demo modu]]
- [[_COMMUNITY_NasilCalisirSerit.tsx|NasilCalisirSerit.tsx]]
- [[_COMMUNITY_README|README.md]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_sitemap.ts|sitemap.ts]]
- [[_COMMUNITY_Yapılacaklar|Yapılacaklar]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_AGENTS|AGENTS.md]]
- [[_COMMUNITY_next.config.ts|next.config.ts]]
- [[_COMMUNITY_postcss.config.mjs|postcss.config.mjs]]
- [[_COMMUNITY_davet-kayit.ts|davet-kayit.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_ArizaFotografAlani.tsx|ArizaFotografAlani.tsx]]
- [[_COMMUNITY_sorun-akis-aciklama.ts|sorun-akis-aciklama.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_cerez-onay.ts|cerez-onay.ts]]
- [[_COMMUNITY_payment.ts|payment.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]

## God Nodes (most connected - your core abstractions)
1. `ensureSeedData()` - 93 edges
2. `getSupabaseAdmin()` - 93 edges
3. `getCurrentCekici()` - 66 edges
4. `telefonNormalize()` - 53 edges
5. `Card()` - 44 edges
6. `getCekiciById()` - 37 edges
7. `updateCekici()` - 34 edges
8. `telefonGecerliMi()` - 32 edges
9. `Btn()` - 29 edges
10. `Cekici` - 25 edges

## Surprising Connections (you probably didn't know these)
- `middleware()` --calls--> `updatePanelSession()`  [EXTRACTED]
  middleware.ts → src/lib/supabase/middleware.ts
- `main()` --calls--> `garantiSmokeKartOku()`  [INFERRED]
  scripts/garanti-smoke.ts → src/lib/garanti/smoke-kart.ts
- `main()` --calls--> `krediTutarKurus()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/kredi-fiyat.ts
- `main()` --calls--> `garantiYapilandirildi()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/config.ts
- `main()` --calls--> `garantiYapilandirmaOzeti()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/config.ts

## Import Cycles
- None detected.

## Communities (61 total, 6 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.11
Nodes (38): POST(), POST(), GET(), GECERLI, POST(), demoBaslangicDurumu(), DemoOturumDurum, demoRakipAd() (+30 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.06
Nodes (95): POST(), POST(), GET(), POST(), PUT(), POST(), POST(), IZINLI (+87 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.11
Nodes (28): eslintConfig, main(), GET(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig (+20 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.05
Nodes (75): GET(), GET(), PUT(), POST(), GET(), POST(), GET(), GET() (+67 more)

### Community 4 - "seo.ts"
Cohesion: 0.16
Nodes (18): POST(), GET(), POST(), GET(), POST(), GET(), GET(), PUT() (+10 more)

### Community 5 - "mappers.ts"
Cohesion: 0.19
Nodes (21): GET(), POST(), POST(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder(), EmailOtpKayit (+13 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.13
Nodes (25): noktaOku(), POST(), GET(), mesafeKmHaversine(), durationSaniyedenDk(), googleMapsApiKey(), googleMapsYapilandirildi(), RotaSureKaynagi (+17 more)

### Community 7 - "ui.tsx"
Cohesion: 0.13
Nodes (13): DELETE(), GET(), KrediPage(), belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), DemoDurum, DemoSms (+5 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (34): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+26 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.33
Nodes (6): GET(), KayitKontenjanBilgi(), Props, KayitKontenjanDurum, kayitKontenjanHesapla(), countCekiciler()

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.10
Nodes (20): DavetKoduAyarlari(), DavetKoduDurum, BelgeDurumResponse, durumEtiket(), OnayliCekiciHesap(), BADGE, Istatistik, PanelData (+12 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.11
Nodes (26): GET(), GET(), GET(), addSmsKaydi(), escapeXml(), GondericiAdiSorguSonuc, logSmsKaydi(), netgsmGondericiAdlariSorgula() (+18 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.18
Nodes (22): GET(), haftaBaslangici(), GET(), PATCH(), GET(), GET(), GET(), GET() (+14 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.18
Nodes (22): POST(), baseUrlFrom(), GET(), POST(), cekiciHizmetPuani, DegerlendirmeRow, getDegerlendirmeByTalepId(), getDegerlendirmelerByCekiciId() (+14 more)

### Community 15 - "db.ts"
Cohesion: 0.11
Nodes (14): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), AVANTAJLAR, CekiciKayitLanding(), CekiciKayitLandingProps, GUVEN_MADDELERI (+6 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.29
Nodes (11): PATCH(), POST(), sonKullanmaAyir(), tcKimlikGecerliMi(), vergiNoGecerliMi(), istemciIpAl(), faturaAlanlariniDogrula(), getBekleyenOdeme() (+3 more)

### Community 17 - "route.ts"
Cohesion: 0.08
Nodes (29): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, metadata (+21 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.13
Nodes (24): GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI, funnelKaydet(), Step, STEP_SIRA (+16 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.18
Nodes (18): GET(), HizmetVerenSayimGostergesi(), HizmetVerenSayimGostergesiProps, useAnimatedNumber(), cekiciMusaitMi(), istanbulGunVeDakika(), saatMetniDakika(), cevrimiciJitterFaktor() (+10 more)

### Community 20 - "page.tsx"
Cohesion: 0.12
Nodes (16): Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps, MemnuniyetFormu() (+8 more)

### Community 21 - "route.ts"
Cohesion: 0.14
Nodes (15): config, middleware(), POST(), POST(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli() (+7 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.17
Nodes (13): gonderimZamani(), onaylanmisSira(), RozetPanelOzet, rozetPanelVerisi, satirFromCekici(), AnlasmaDurumu, Cekici, MusteriDegerlendirme (+5 more)

### Community 24 - "page.tsx"
Cohesion: 0.17
Nodes (20): CekiciRotaPanel(), CekiciRotaPanelProps, embedDirectionsUrl(), RotaSureleri, embedDirectionsUrl(), googleMapsDirUrl(), MusteriCekiciTakipHarita(), MusteriCekiciTakipHaritaProps (+12 more)

### Community 25 - "MobileShell.tsx"
Cohesion: 0.13
Nodes (8): OnayIcerik(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, SmsKaydi, BrandLogoYazili(), MobileShell(), MobileShellProps, posthogOlayYakala()

### Community 26 - "funnel.ts"
Cohesion: 0.42
Nodes (7): POST(), KULLANIMA_ACIK_ILLER, sehirBeklemeMesaji(), sehirKullanimAcikMi(), demoKatil(), demoKatilMesaji(), cekiciTalepSmsMetni()

### Community 27 - "page.tsx"
Cohesion: 0.18
Nodes (19): CekiciTalepClient(), TalepDurum, KisiselVeriGizlemeAyarlari(), CekiciPanelTabs(), TalepKarti(), DemoHeaderBadge(), useKazananKonumPaylas(), useKisiselVeriGizle() (+11 more)

### Community 28 - "layout.tsx"
Cohesion: 0.15
Nodes (22): POST(), GET(), POST(), getCekiciById(), getTalepById(), updateTalep(), anlasamadiSonrasiIhaleyiSurdur(), kaybedenTeklifleriIsaretle() (+14 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "seo.ts"
Cohesion: 0.19
Nodes (29): GET(), rotaKoordinatlari(), POST(), GET(), listeDurumuBelirle(), toOzet(), cekiciTalepSorununaUygunMu(), demoListeDurumuBelirle() (+21 more)

### Community 32 - "OnayliCekiciHesap.tsx"
Cohesion: 0.31
Nodes (13): GET(), GET(), BeklePage(), isDemoTalepId(), DEMO_PUAN, demoMusteriTalepDurumJson(), demoMusteriTekliflerJson(), rotaKoordinatlari() (+5 more)

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.39
Nodes (7): cekiciToRow(), dataDir, main(), readJson(), supabase, talepToRow(), upsertBatch()

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.32
Nodes (4): metadata, PanelChrome(), LINKS, PanelNav()

### Community 35 - "NasilCalisirSerit.tsx"
Cohesion: 0.29
Nodes (5): FormAdimi, NASIL_ADIMLAR, NasilAdim, NasilCalisirSerit(), Props

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "NasilCalisirSerit.tsx"
Cohesion: 0.29
Nodes (7): BolgeAyarlari(), CekiciAyarlarPanel(), Durum, PremiumSmsAyarlari(), SorunTipiSecimi(), SorunTipiSecimiProps, SorunTipi

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.83
Nodes (3): GET(), istemciIp(), ozelIp()

### Community 41 - "sitemap.ts"
Cohesion: 0.36
Nodes (8): kayitliAdSoyadUygula(), depolama(), MusteriProfil, musteriProfilKaydet(), musteriProfilOku(), okuHarita(), ProfilHaritasi, yazHarita()

### Community 53 - "davet-kayit.ts"
Cohesion: 0.08
Nodes (47): bolgeOzet(), GET(), POST(), PUT(), BolgeApiData, BolgeAyarlariProps, BolgeApiData, IlceSecimi() (+39 more)

### Community 54 - "page.tsx"
Cohesion: 0.10
Nodes (21): GET(), GET(), hizmetBolgeleriFlatten(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), cekiciFromRow(), CekiciRow (+13 more)

### Community 55 - "ArizaFotografAlani.tsx"
Cohesion: 0.50
Nodes (3): ArizaFotografAlani(), ArizaFotografAlaniProps, fotografSikistir()

### Community 56 - "sorun-akis-aciklama.ts"
Cohesion: 0.13
Nodes (29): POST(), MusteriAnaSayfa(), adimAciklamaMetni(), Props, SorunAkisOzeti(), SorunAkisOzetiIcerik(), SorunSecimiProps, addTalep() (+21 more)

### Community 57 - "route.ts"
Cohesion: 0.06
Nodes (23): Adim, DegerlendirmeSatir, Ozet, BOS_FORM, KampanyaSatir, KullanimSatir, Ozet, Ozet (+15 more)

### Community 58 - "cerez-onay.ts"
Cohesion: 0.11
Nodes (30): geist, metadata, RootLayout(), viewport, CerezOnayBanner(), GoogleAnalytics(), PostHogProvider(), cerezAnalitikAktif() (+22 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.24
Nodes (13): POST(), POST(), KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI, KrediPaket, krediPaketBul(), krediPaketOdenecekTL(), KrediPaketTl (+5 more)

### Community 62 - "page.tsx"
Cohesion: 0.21
Nodes (7): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimPanel(), PanelGirisForm(), useHizmetVerenSayim(), HizmetVerenSayimOzet

## Knowledge Gaps
- **277 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+272 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Card()` connect `route.ts` to `getSupabaseAdmin`, `NasilCalisirSerit.tsx`, `NasilCalisirSerit.tsx`, `ui.tsx`, `google-maps.ts`, `CekiciPanelTabs.tsx`, `db.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `davet-kayit.ts`, `page.tsx`, `ArizaFotografAlani.tsx`, `page.tsx`, `MobileShell.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `ensureSeedData()` connect `CekiciAyarlarPanel.tsx` to `OnayliCekiciHesap.tsx`, `telefonNormalize`, `getSupabaseAdmin`, `seo.ts`, `mappers.ts`, `ui.tsx`, `google-maps.ts`, `layout.tsx`, `memnuniyet.ts`, `hizmet-veren-sayim.ts`, `ensureSeedData`, `davet-kayit.ts`, `sorun-akis-aciklama.ts`, `funnel.ts`, `route.ts`, `seo.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `getSupabaseAdmin()` connect `getSupabaseAdmin` to `demo-oturum.ts`, `telefonNormalize`, `seo.ts`, `mappers.ts`, `google-maps.ts`, `sms-provider.ts`, `CekiciAyarlarPanel.tsx`, `memnuniyet.ts`, `route.ts`, `hizmet-veren-sayim.ts`, `page.tsx`, `sorun-akis-aciklama.ts`, `layout.tsx`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _277 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `demo-oturum.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11008325624421832 - nodes in this community are weakly interconnected._
- **Should `telefonNormalize` be split into smaller, more focused modules?**
  _Cohesion score 0.05952023988005997 - nodes in this community are weakly interconnected._
- **Should `cekici-email-otp.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11261261261261261 - nodes in this community are weakly interconnected._