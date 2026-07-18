# Graph Report - acilcozumbul  (2026-07-18)

## Corpus Check
- 334 files · ~368,276 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1401 nodes · 4354 edges · 67 communities (61 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `30f6bb8a`
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
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_server.ts|server.ts]]
- [[_COMMUNITY_HizmetVerenSayimGostergesi.tsx|HizmetVerenSayimGostergesi.tsx]]
- [[_COMMUNITY_BolgeAyarlari.tsx|BolgeAyarlari.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]

## God Nodes (most connected - your core abstractions)
1. `getSupabaseAdmin()` - 95 edges
2. `ensureSeedData()` - 93 edges
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

## Communities (67 total, 6 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.10
Nodes (39): GET(), GET(), POST(), POST(), POST(), GET(), GECERLI, POST() (+31 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.23
Nodes (18): POST(), GET(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder(), EmailOtpKayit, EmailOtpRow (+10 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.08
Nodes (37): eslintConfig, main(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku() (+29 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.10
Nodes (42): GET(), GET(), PUT(), GET(), GET(), PATCH(), POST(), davetKayitBaslangicKredisiFromSonuc() (+34 more)

### Community 4 - "seo.ts"
Cohesion: 0.25
Nodes (11): GET(), GET(), PUT(), POST(), GET(), GET(), normalizeHizmetSorunTipleri(), getCekiciler() (+3 more)

### Community 5 - "mappers.ts"
Cohesion: 0.33
Nodes (7): KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI, KrediPaket, KrediPaketTl, krediTutarKurus(), krediTutarTL(), tlTutarKurus()

### Community 6 - "ensureSeedData"
Cohesion: 0.08
Nodes (43): noktaOku(), POST(), GET(), CekiciRotaPanelProps, embedDirectionsUrl(), googleMapsDirUrl(), MusteriCekiciTakipHarita(), MusteriCekiciTakipHaritaProps (+35 more)

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
Cohesion: 0.15
Nodes (15): adimAciklamaMetni(), Props, SorunAkisOzeti(), SorunAkisOzetiIcerik(), SorunSecimi(), SorunSecimiProps, TextArea(), CEKICI_ADIMLAR (+7 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.26
Nodes (13): POST(), POST(), POST(), GET(), POST(), getCurrentCekici(), garantiYapilandirildi(), krediPaketBul() (+5 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.13
Nodes (23): GET(), GET(), addSmsKaydi(), escapeXml(), GondericiAdiSorguSonuc, logSmsKaydi(), netgsmGondericiAdlariSorgula(), netgsmKimlik() (+15 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.10
Nodes (22): GET(), GET(), Saglik, hizmetBolgeleriFlatten(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), cekiciFromRow() (+14 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.14
Nodes (26): POST(), GET(), baseUrlFrom(), GET(), POST(), cekiciPuanOzeti, fiyatGarantiPuaniHesapla(), normalizeTeklif() (+18 more)

### Community 15 - "db.ts"
Cohesion: 0.30
Nodes (10): PATCH(), POST(), sonKullanmaAyir(), tcKimlikGecerliMi(), vergiNoGecerliMi(), istemciIpAl(), faturaAlanlariniDogrula(), getBekleyenOdeme() (+2 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.08
Nodes (16): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, DegerlendirmeSatir, Ozet, Ozet, AVANTAJLAR, CekiciKayitLanding() (+8 more)

### Community 17 - "route.ts"
Cohesion: 0.07
Nodes (31): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, metadata (+23 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.13
Nodes (23): GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI, Step, STEP_SIRA, SssBolumu() (+15 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.18
Nodes (18): GET(), HizmetVerenSayimGostergesi(), useAnimatedNumber(), cekiciMusaitMi(), istanbulGunVeDakika(), saatMetniDakika(), cevrimiciJitterFaktor(), cevrimiciJitterUygula() (+10 more)

### Community 20 - "page.tsx"
Cohesion: 0.11
Nodes (17): BekleIcerik(), Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps (+9 more)

### Community 21 - "davet-panel.ts"
Cohesion: 0.22
Nodes (12): GET(), GET(), GET(), getSmsLog(), getAktifDemoOturumRequest(), FunnelOlay, funnelOlaySay(), FunnelOzet (+4 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.18
Nodes (22): POST(), GET(), GET(), POST(), GET(), teklifFiyatDegistiMi(), getCekiciById(), getTalepById() (+14 more)

### Community 24 - "page.tsx"
Cohesion: 0.38
Nodes (5): hedefAltYazi(), KonumGuncellemeGostergesi(), renkKaristir(), TURUNCU, YESIL

### Community 25 - "MobileShell.tsx"
Cohesion: 0.10
Nodes (12): OdemeOnayPage(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, Adim, SmsKaydi, BrandLogoYazili(), MobileShell(), MobileShellProps (+4 more)

### Community 26 - "funnel.ts"
Cohesion: 0.23
Nodes (24): GET(), rotaKoordinatlari(), POST(), listeDurumuBelirle(), toOzet(), KULLANIMA_ACIK_ILLER, sehirBeklemeMesaji(), sehirKullanimAcikMi() (+16 more)

### Community 27 - "page.tsx"
Cohesion: 0.13
Nodes (25): CekiciTalepClient(), TalepDurum, KisiselVeriGizlemeAyarlari(), BADGE, CekiciPanelTabs(), Istatistik, PanelData, Tab (+17 more)

### Community 28 - "route.ts"
Cohesion: 0.28
Nodes (10): cekiciTalepBolgesineUygunMu(), cekiciTalepSorununaUygunMu(), filtreleCekicilerSorun(), cekiciAcikTalepUygunMu(), cekiciTalepSmsAdayiMi(), SMS_BILDIRIM_KREDI, teklifVerilebilirMi(), Cekici (+2 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "route.ts"
Cohesion: 0.39
Nodes (5): gonderimZamani(), onaylanmisSira(), RozetPanelOzet, rozetPanelVerisi, satirFromCekici()

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
Cohesion: 0.24
Nodes (17): POST(), MusteriAnaSayfa(), SORUN_ARAC_MODELI_TIPLERI, SORUN_CAGRI_BUTON, SORUN_FOTOGRAF_TIPLERI, SORUN_HEDEF_KONUM_ATLANIR, sorunAracModeliGerekliMi(), sorunCagriButonEtiketi() (+9 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "env.ts"
Cohesion: 0.09
Nodes (23): config, middleware(), GET(), istemciIp(), ozelIp(), POST(), GET(), POST() (+15 more)

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.19
Nodes (8): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesiProps, HizmetVerenSayimPanel(), PanelGirisForm(), useHizmetVerenSayim(), HizmetVerenSayimOzet

### Community 41 - "sitemap.ts"
Cohesion: 0.12
Nodes (19): BolgeAyarlari(), CekiciAyarlarPanel(), DavetKoduAyarlari(), DavetKoduDurum, GUNLER, MusaitlikAyarlari(), Durum, PremiumSmsAyarlari() (+11 more)

### Community 52 - "sms.ts"
Cohesion: 0.14
Nodes (24): POST(), POST(), updateTalep(), demoKatil(), demoKatilMesaji(), anlasamadiSonrasiIhaleyiSurdur(), cekiciBildirimKrediTutari(), normalizeBase() (+16 more)

### Community 53 - "davet-kayit.ts"
Cohesion: 0.10
Nodes (40): bolgeOzet(), GET(), POST(), PUT(), POST(), cekiciTalepIlIlceyeUygunMu(), filtreleCekicilerBolge(), ilceEslesir() (+32 more)

### Community 54 - "page.tsx"
Cohesion: 0.06
Nodes (109): POST(), POST(), POST(), POST(), GET(), POST(), PUT(), POST() (+101 more)

### Community 55 - "ArizaFotografAlani.tsx"
Cohesion: 0.12
Nodes (15): KrediPage(), belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), BelgeYuklemeAlani(), Props, BelgeDurumResponse, durumEtiket() (+7 more)

### Community 56 - "sorun-akis-aciklama.ts"
Cohesion: 0.36
Nodes (8): kayitliAdSoyadUygula(), depolama(), MusteriProfil, musteriProfilKaydet(), musteriProfilOku(), okuHarita(), ProfilHaritasi, yazHarita()

### Community 57 - "route.ts"
Cohesion: 0.19
Nodes (12): POST(), PATCH(), addTalep(), getCekiciByToken(), updateCekiciBelgeDurum(), CekiciRow, smsFromRow(), SmsLogRow (+4 more)

### Community 58 - "cerez-onay.ts"
Cohesion: 0.10
Nodes (34): OnayIcerik(), geist, metadata, RootLayout(), viewport, CerezOnayBanner(), GoogleAnalytics(), funnelKaydet() (+26 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.33
Nodes (6): GET(), KayitKontenjanBilgi(), Props, KayitKontenjanDurum, kayitKontenjanHesapla(), countCekiciler()

### Community 61 - "server.ts"
Cohesion: 0.70
Nodes (4): GET(), PUT(), saatGecerliMi(), musaitlikOzeti()

### Community 62 - "HizmetVerenSayimGostergesi.tsx"
Cohesion: 0.29
Nodes (5): FormAdimi, NASIL_ADIMLAR, NasilAdim, NasilCalisirSerit(), Props

### Community 63 - "BolgeAyarlari.tsx"
Cohesion: 0.33
Nodes (7): BolgeApiData, BolgeAyarlariProps, BolgeApiData, IlceSecimi(), IlceSecimiProps, HizmetBolgeleri, HizmetBolgeModu

### Community 64 - "route.ts"
Cohesion: 0.39
Nodes (6): GET(), POST(), belgeBase64Ayikla(), cekiciBelgeYukle(), IZINLI_MIME, uzanti()

### Community 65 - "route.ts"
Cohesion: 0.53
Nodes (4): GET(), haftaBaslangici(), GET(), getTalepler()

### Community 66 - "page.tsx"
Cohesion: 0.33
Nodes (4): BOS_FORM, KampanyaSatir, KullanimSatir, Ozet

## Knowledge Gaps
- **280 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+275 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Card()` connect `ArizaFotografAlani.tsx` to `posthog-client.ts`, `page.tsx`, `env.ts`, `ui.tsx`, `route.ts`, `sitemap.ts`, `ensureSeedData`, `CekiciAyarlarPanel.tsx`, `hizmet-veren-sayim.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `MobileShell.tsx`, `cerez-onay.ts`, `page.tsx`, `route.ts`, `HizmetVerenSayimGostergesi.tsx`, `BolgeAyarlari.tsx`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `ensureSeedData()` connect `seo.ts` to `demo-oturum.ts`, `getSupabaseAdmin`, `ui.tsx`, `CekiciPanelTabs.tsx`, `memnuniyet.ts`, `db.ts`, `ensureSeedData`, `davet-panel.ts`, `route.ts`, `funnel.ts`, `NasilCalisirSerit.tsx`, `sms.ts`, `davet-kayit.ts`, `page.tsx`, `route.ts`, `route.ts`, `server.ts`, `route.ts`, `route.ts`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `getSupabaseAdmin()` connect `page.tsx` to `demo-oturum.ts`, `telefonNormalize`, `getSupabaseAdmin`, `seo.ts`, `CekiciPanelTabs.tsx`, `sms-provider.ts`, `CekiciAyarlarPanel.tsx`, `memnuniyet.ts`, `db.ts`, `davet-panel.ts`, `route.ts`, `NasilCalisirSerit.tsx`, `env.ts`, `sms.ts`, `davet-kayit.ts`, `route.ts`, `route.ts`, `route.ts`, `route.ts`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _280 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `demo-oturum.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10285714285714286 - nodes in this community are weakly interconnected._
- **Should `cekici-email-otp.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `getSupabaseAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.09962406015037593 - nodes in this community are weakly interconnected._