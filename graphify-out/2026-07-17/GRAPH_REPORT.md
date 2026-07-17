# Graph Report - acilcozumbul  (2026-07-17)

## Corpus Check
- 328 files · ~365,331 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1372 nodes · 4266 edges · 63 communities (57 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `846a7c86`
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
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_davet-kayit.ts|davet-kayit.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_ArizaFotografAlani.tsx|ArizaFotografAlani.tsx]]
- [[_COMMUNITY_sorun-akis-aciklama.ts|sorun-akis-aciklama.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_cerez-onay.ts|cerez-onay.ts]]
- [[_COMMUNITY_payment.ts|payment.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_HizmetVerenSayimGostergesi.tsx|HizmetVerenSayimGostergesi.tsx]]
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
- `main()` --calls--> `garantiYapilandirildi()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/config.ts
- `main()` --calls--> `garantiSmokeKartOku()`  [INFERRED]
  scripts/garanti-smoke.ts → src/lib/garanti/smoke-kart.ts
- `main()` --calls--> `krediTutarKurus()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/kredi-fiyat.ts
- `main()` --calls--> `garantiYapilandirmaOzeti()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/config.ts

## Import Cycles
- None detected.

## Communities (63 total, 6 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.11
Nodes (35): POST(), POST(), GET(), GECERLI, POST(), demoBaslangicDurumu(), DemoOturumDurum, demoRakipAd() (+27 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.05
Nodes (102): POST(), POST(), GET(), POST(), POST(), POST(), IZINLI, POST() (+94 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.12
Nodes (25): eslintConfig, main(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku(), GarantiMode (+17 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.06
Nodes (66): GET(), POST(), GET(), POST(), GET(), GET(), PATCH(), POST() (+58 more)

### Community 4 - "seo.ts"
Cohesion: 0.16
Nodes (18): POST(), GET(), POST(), POST(), GET(), POST(), GET(), PUT() (+10 more)

### Community 5 - "mappers.ts"
Cohesion: 0.17
Nodes (23): POST(), GET(), POST(), PATCH(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder() (+15 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.13
Nodes (25): noktaOku(), POST(), GET(), mesafeKmHaversine(), durationSaniyedenDk(), googleMapsApiKey(), googleMapsYapilandirildi(), RotaSureKaynagi (+17 more)

### Community 7 - "ui.tsx"
Cohesion: 0.22
Nodes (8): DELETE(), GET(), DemoDurum, DemoSms, kalanSureFormat(), PanelDemoPage(), SIMULE_ADIMLAR, cekiciPanelOzet

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (34): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+26 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.17
Nodes (19): POST(), PATCH(), hizmetBolgeleriFlatten(), davetKayitBonusTamamla(), getCekiciById(), kaydetDavetKullanim(), updateCekiciBelgeDurum(), cekiciFromRow() (+11 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.12
Nodes (21): BolgeApiData, BolgeAyarlari(), BolgeAyarlariProps, BolgeApiData, DavetKoduAyarlari(), DavetKoduDurum, GUNLER, MusaitlikAyarlari() (+13 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.10
Nodes (28): GET(), GET(), GET(), Saglik, addSmsKaydi(), escapeXml(), GondericiAdiSorguSonuc, logSmsKaydi() (+20 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.14
Nodes (22): GET(), PUT(), GET(), haftaBaslangici(), GET(), GET(), GET(), GET() (+14 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.14
Nodes (27): POST(), GET(), baseUrlFrom(), GET(), POST(), cekiciPuanOzeti, fiyatGarantiPuaniHesapla(), normalizeTeklif() (+19 more)

### Community 15 - "db.ts"
Cohesion: 0.13
Nodes (12): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), KayitKontenjanBilgi(), Props, Props, YasalOnayKutusu() (+4 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.18
Nodes (17): GET(), GET(), POST(), sonKullanmaAyir(), POST(), garantiYapilandirildi(), istemciIpAl(), getBekleyenOdeme() (+9 more)

### Community 17 - "route.ts"
Cohesion: 0.08
Nodes (29): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, metadata (+21 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.15
Nodes (22): GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI, funnelKaydet(), Step, STEP_SIRA (+14 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.18
Nodes (13): useHizmetVerenSayim(), cekiciMusaitMi(), istanbulGunVeDakika(), saatMetniDakika(), cevrimiciJitterFaktor(), cevrimiciJitterUygula(), HIZMET_ETIKET, hizmetVerenEtiket() (+5 more)

### Community 20 - "page.tsx"
Cohesion: 0.12
Nodes (16): Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps, MemnuniyetFormu() (+8 more)

### Community 21 - "route.ts"
Cohesion: 0.20
Nodes (14): config, middleware(), POST(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli(), supabaseEksikEnvAlanlari() (+6 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.10
Nodes (26): cekiciTalepBolgesineUygunMu(), cekiciTalepMenzileUygunMu(), filtreleCekicilerBolge(), konumCekici(), cekiciTalepSorununaUygunMu(), filtreleCekicilerSorun(), SMS_BILDIRIM_KREDI, teklifVerilebilirMi() (+18 more)

### Community 24 - "page.tsx"
Cohesion: 0.17
Nodes (20): CekiciRotaPanel(), CekiciRotaPanelProps, embedDirectionsUrl(), RotaSureleri, embedDirectionsUrl(), googleMapsDirUrl(), MusteriCekiciTakipHarita(), MusteriCekiciTakipHaritaProps (+12 more)

### Community 25 - "MobileShell.tsx"
Cohesion: 0.10
Nodes (11): OnayIcerik(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, Adim, SmsKaydi, BrandLogoYazili(), MobileShell(), MobileShellProps (+3 more)

### Community 26 - "funnel.ts"
Cohesion: 0.15
Nodes (15): adimAciklamaMetni(), Props, SorunAkisOzeti(), SorunAkisOzetiIcerik(), SorunSecimi(), SorunSecimiProps, TextArea(), CEKICI_ADIMLAR (+7 more)

### Community 27 - "page.tsx"
Cohesion: 0.12
Nodes (26): CekiciTalepClient(), TalepDurum, CekiciAyarlarPanel(), KisiselVeriGizlemeAyarlari(), BADGE, CekiciPanelTabs(), Istatistik, PanelData (+18 more)

### Community 28 - "layout.tsx"
Cohesion: 0.18
Nodes (22): POST(), GET(), POST(), getTalepById(), updateTalep(), demoKatil(), demoKatilMesaji(), cekiciAcikTalepUygunMu() (+14 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "seo.ts"
Cohesion: 0.25
Nodes (21): GET(), rotaKoordinatlari(), POST(), listeDurumuBelirle(), toOzet(), KULLANIMA_ACIK_ILLER, sehirBeklemeMesaji(), sehirKullanimAcikMi() (+13 more)

### Community 32 - "OnayliCekiciHesap.tsx"
Cohesion: 0.21
Nodes (20): GET(), POST(), GET(), BeklePage(), teklifFiyatDegistiMi(), isDemoTalepId(), demoTalepBul(), demoTalepGetir() (+12 more)

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
Cohesion: 0.38
Nodes (5): hedefAltYazi(), KonumGuncellemeGostergesi(), renkKaristir(), TURUNCU, YESIL

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.83
Nodes (3): GET(), istemciIp(), ozelIp()

### Community 41 - "sitemap.ts"
Cohesion: 0.09
Nodes (18): KrediPage(), belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), BelgeYuklemeAlani(), Props, AVANTAJLAR, CekiciKayitLanding() (+10 more)

### Community 52 - "route.ts"
Cohesion: 0.43
Nodes (6): gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi, satirFromCekici()

### Community 53 - "davet-kayit.ts"
Cohesion: 0.16
Nodes (27): bolgeOzet(), GET(), PUT(), cekiciTalepIlIlceyeUygunMu(), ilceEslesir(), normalize(), talepKonumBolge(), cekiciHizmetBolgeleri() (+19 more)

### Community 54 - "page.tsx"
Cohesion: 0.19
Nodes (9): GET(), GET(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), krediOdemeFromRow(), KrediOdemeRow, krediOdemeToRow() (+1 more)

### Community 55 - "ArizaFotografAlani.tsx"
Cohesion: 0.50
Nodes (3): ArizaFotografAlani(), ArizaFotografAlaniProps, fotografSikistir()

### Community 56 - "sorun-akis-aciklama.ts"
Cohesion: 0.22
Nodes (18): POST(), MusteriAnaSayfa(), addTalep(), SORUN_ARAC_MODELI_TIPLERI, SORUN_CAGRI_BUTON, SORUN_FOTOGRAF_TIPLERI, SORUN_HEDEF_KONUM_ATLANIR, sorunAracModeliGerekliMi() (+10 more)

### Community 57 - "route.ts"
Cohesion: 0.11
Nodes (12): DegerlendirmeSatir, Ozet, BOS_FORM, KampanyaSatir, KullanimSatir, Ozet, Ozet, formatKalan() (+4 more)

### Community 58 - "cerez-onay.ts"
Cohesion: 0.11
Nodes (30): geist, metadata, RootLayout(), viewport, CerezOnayBanner(), GoogleAnalytics(), PostHogProvider(), cerezAnalitikAktif() (+22 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.25
Nodes (12): POST(), POST(), KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI, KrediPaket, krediPaketBul(), krediPaketOdenecekTL(), KrediPaketTl (+4 more)

### Community 61 - "HizmetVerenSayimGostergesi.tsx"
Cohesion: 0.60
Nodes (4): HizmetVerenSayimGostergesi(), useAnimatedNumber(), hizmetVerenSatirBul(), gecerliSorunTipi()

### Community 62 - "page.tsx"
Cohesion: 0.29
Nodes (7): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesiProps, HizmetVerenSayimPanel(), PanelGirisForm(), HizmetVerenSayimOzet

## Knowledge Gaps
- **277 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+272 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Card()` connect `route.ts` to `getSupabaseAdmin`, `NasilCalisirSerit.tsx`, `ui.tsx`, `sitemap.ts`, `CekiciPanelTabs.tsx`, `sms-provider.ts`, `db.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `page.tsx`, `ArizaFotografAlani.tsx`, `page.tsx`, `MobileShell.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `ensureSeedData()` connect `CekiciAyarlarPanel.tsx` to `OnayliCekiciHesap.tsx`, `telefonNormalize`, `getSupabaseAdmin`, `seo.ts`, `ui.tsx`, `google-maps.ts`, `layout.tsx`, `memnuniyet.ts`, `hizmet-veren-sayim.ts`, `davet-kayit.ts`, `sorun-akis-aciklama.ts`, `route.ts`, `seo.ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `getSupabaseAdmin()` connect `getSupabaseAdmin` to `demo-oturum.ts`, `telefonNormalize`, `seo.ts`, `mappers.ts`, `google-maps.ts`, `sms-provider.ts`, `CekiciAyarlarPanel.tsx`, `memnuniyet.ts`, `route.ts`, `hizmet-veren-sayim.ts`, `davet-kayit.ts`, `page.tsx`, `sorun-akis-aciklama.ts`, `layout.tsx`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _277 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `demo-oturum.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.113107822410148 - nodes in this community are weakly interconnected._
- **Should `telefonNormalize` be split into smaller, more focused modules?**
  _Cohesion score 0.053806451612903226 - nodes in this community are weakly interconnected._
- **Should `cekici-email-otp.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11693548387096774 - nodes in this community are weakly interconnected._