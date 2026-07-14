# Graph Report - acilcozumbul  (2026-07-14)

## Corpus Check
- 302 files · ~355,442 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1241 nodes · 3816 edges · 55 communities (49 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0b94df1e`
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
- [[_COMMUNITY_CekiciTalepClient.tsx|CekiciTalepClient.tsx]]
- [[_COMMUNITY_migrate-json-to-supabase.mjs|migrate-json-to-supabase.mjs]]
- [[_COMMUNITY_PanelChrome.tsx|PanelChrome.tsx]]
- [[_COMMUNITY_NasilCalisirSerit.tsx|NasilCalisirSerit.tsx]]
- [[_COMMUNITY_Supabase veritabanı|Supabase veritabanı]]
- [[_COMMUNITY_Video demo modu|Video demo modu]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_README|README.md]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_talep-fotograf.ts|talep-fotograf.ts]]
- [[_COMMUNITY_Yapılacaklar|Yapılacaklar]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_AGENTS|AGENTS.md]]
- [[_COMMUNITY_next.config.ts|next.config.ts]]
- [[_COMMUNITY_postcss.config.mjs|postcss.config.mjs]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_ArizaFotografAlani.tsx|ArizaFotografAlani.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]

## God Nodes (most connected - your core abstractions)
1. `ensureSeedData()` - 89 edges
2. `getSupabaseAdmin()` - 89 edges
3. `getCurrentCekici()` - 58 edges
4. `telefonNormalize()` - 44 edges
5. `Card()` - 41 edges
6. `getCekiciById()` - 37 edges
7. `updateCekici()` - 29 edges
8. `telefonGecerliMi()` - 29 edges
9. `Btn()` - 27 edges
10. `getTalepById()` - 24 edges

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

## Communities (55 total, 6 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.07
Nodes (94): POST(), GET(), rotaKoordinatlari(), POST(), listeDurumuBelirle(), toOzet(), POST(), POST() (+86 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.07
Nodes (85): POST(), POST(), POST(), POST(), POST(), IZINLI, POST(), GET() (+77 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.17
Nodes (19): eslintConfig, main(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku() (+11 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.08
Nodes (44): GET(), GET(), GET(), GET(), PATCH(), POST(), davetKayitBaslangicKredisiFromSonuc(), davetKayitBonusTamamla() (+36 more)

### Community 4 - "seo.ts"
Cohesion: 0.06
Nodes (45): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, geist (+37 more)

### Community 5 - "mappers.ts"
Cohesion: 0.10
Nodes (40): bolgeOzet(), GET(), PUT(), BolgeApiData, BolgeApiData, cekiciTalepIlIlceyeUygunMu(), filtreleCekicilerBolge(), ilceEslesir() (+32 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.14
Nodes (15): POST(), POST(), GET(), PUT(), GET(), GET(), POST(), POST() (+7 more)

### Community 7 - "ui.tsx"
Cohesion: 0.07
Nodes (19): DegerlendirmeSatir, Ozet, BOS_FORM, KampanyaSatir, KullanimSatir, Ozet, Ozet, Saglik (+11 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (33): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+25 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.12
Nodes (26): noktaOku(), POST(), GET(), cekiciTalepMenzileUygunMu(), mesafeKmHaversine(), durationSaniyedenDk(), googleMapsApiKey(), googleMapsYapilandirildi() (+18 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.08
Nodes (28): GirisIcerik(), BolgeAyarlari(), BolgeAyarlariProps, BelgeYuklemeAlani(), Props, CekiciAyarlarPanel(), DavetKoduAyarlari(), DavetKoduDurum (+20 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.18
Nodes (15): GET(), addSmsKaydi(), escapeXml(), GondericiAdiSorguSonuc, logSmsKaydi(), netgsmGondericiAdlariSorgula(), netgsmKimlik(), netgsmXmlGonder() (+7 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.10
Nodes (21): GET(), GET(), hizmetBolgeleriFlatten(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), cekiciFromRow(), CekiciRow (+13 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.12
Nodes (31): POST(), GET(), baseUrlFrom(), GET(), POST(), cekiciPuanOzeti, fiyatGarantiPuaniHesapla(), normalizeTeklif() (+23 more)

### Community 15 - "db.ts"
Cohesion: 0.21
Nodes (12): POST(), PATCH(), DELETE(), GET(), GET(), cekiciBelgeleriniSil(), silCekiciCascade(), mockFrom (+4 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.06
Nodes (56): POST(), POST(), hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesi(), HizmetVerenSayimGostergesiProps, useAnimatedNumber() (+48 more)

### Community 17 - "CekiciRotaPanel.tsx"
Cohesion: 0.17
Nodes (20): CekiciRotaPanel(), CekiciRotaPanelProps, embedDirectionsUrl(), RotaSureleri, embedDirectionsUrl(), googleMapsDirUrl(), MusteriCekiciTakipHarita(), MusteriCekiciTakipHaritaProps (+12 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.15
Nodes (22): GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, Step, STEP_SIRA, SorunSecimi(), SorunSecimiProps (+14 more)

### Community 19 - "route.ts"
Cohesion: 0.26
Nodes (17): GET(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder(), EmailOtpKayit, EmailOtpRow, fromRow() (+9 more)

### Community 20 - "page.tsx"
Cohesion: 0.12
Nodes (16): Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps, MemnuniyetFormu() (+8 more)

### Community 21 - "route.ts"
Cohesion: 0.20
Nodes (14): config, middleware(), POST(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli(), supabaseEksikEnvAlanlari() (+6 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "sorun-akis-aciklama.ts"
Cohesion: 0.20
Nodes (15): POST(), KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI, KrediPaket, krediPaketBul(), krediPaketOdenecekTL(), KrediPaketTl, krediTutarKurus() (+7 more)

### Community 24 - "seed.ts"
Cohesion: 0.29
Nodes (11): POST(), GET(), GET(), GET(), getCekiciler(), saveCekiciler(), hizmetVerenSayimHesapla(), hizmetVerenSayimMusteriGoster() (+3 more)

### Community 25 - "MobileShell.tsx"
Cohesion: 0.12
Nodes (12): KrediPage(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, Adim, SifremiUnuttumPage(), SmsKaydi, BrandLogoYazili(), MobileShell() (+4 more)

### Community 26 - "smsBaseUrl"
Cohesion: 0.21
Nodes (11): GET(), POST(), POST(), GET(), PUT(), belgeBase64Ayikla(), cekiciBelgeYukle(), IZINLI_MIME (+3 more)

### Community 27 - "page.tsx"
Cohesion: 0.11
Nodes (14): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), AVANTAJLAR, CekiciKayitLanding(), CekiciKayitLandingProps, GUVEN_MADDELERI (+6 more)

### Community 28 - "page.tsx"
Cohesion: 0.21
Nodes (6): gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi, satirFromCekici()

### Community 29 - "cekici-puan.ts"
Cohesion: 0.19
Nodes (14): GET(), haftaBaslangici(), GET(), GET(), GET(), GET(), GET(), getSmsLog() (+6 more)

### Community 30 - "page.tsx"
Cohesion: 0.17
Nodes (10): belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), DemoDurum, DemoSms, kalanSureFormat(), PanelDemoPage(), SIMULE_ADIMLAR (+2 more)

### Community 31 - "route.ts"
Cohesion: 0.33
Nodes (6): GET(), KayitKontenjanBilgi(), Props, KayitKontenjanDurum, kayitKontenjanHesapla(), countCekiciler()

### Community 32 - "CekiciTalepClient.tsx"
Cohesion: 0.32
Nodes (4): CekiciTalepClient(), TalepDurum, DemoHeaderBadge(), useKazananKonumPaylas()

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.39
Nodes (7): cekiciToRow(), dataDir, main(), readJson(), supabase, talepToRow(), upsertBatch()

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.32
Nodes (4): metadata, PanelChrome(), LINKS, PanelNav()

### Community 35 - "NasilCalisirSerit.tsx"
Cohesion: 0.29
Nodes (11): PATCH(), POST(), sonKullanmaAyir(), tcKimlikGecerliMi(), vergiNoGecerliMi(), istemciIpAl(), faturaAlanlariniDogrula(), getBekleyenOdeme() (+3 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "page.tsx"
Cohesion: 0.33
Nodes (8): garantiHashHesapla(), garantiXmlDeger(), BASARI_KODLARI, GarantiKrediOdemeIstegi, garantiKrediOdemesiYap(), GarantiOdemeSonuc, orderIdTemizle(), xmlIstekOlustur()

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.83
Nodes (3): GET(), istemciIp(), ozelIp()

### Community 41 - "talep-fotograf.ts"
Cohesion: 0.38
Nodes (5): hedefAltYazi(), KonumGuncellemeGostergesi(), renkKaristir(), TURUNCU, YESIL

### Community 52 - "route.ts"
Cohesion: 0.70
Nodes (4): GET(), PUT(), saatGecerliMi(), musaitlikOzeti()

### Community 53 - "ArizaFotografAlani.tsx"
Cohesion: 0.50
Nodes (3): ArizaFotografAlani(), ArizaFotografAlaniProps, fotografSikistir()

## Knowledge Gaps
- **244 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+239 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `telefonNormalize` to `demo-oturum.ts`, `getSupabaseAdmin`, `NasilCalisirSerit.tsx`, `ensureSeedData`, `sms-provider.ts`, `CekiciAyarlarPanel.tsx`, `memnuniyet.ts`, `db.ts`, `hizmet-veren-sayim.ts`, `route.ts`, `sorun-akis-aciklama.ts`, `seed.ts`, `smsBaseUrl`, `cekici-puan.ts`, `route.ts`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `Card()` connect `ui.tsx` to `CekiciTalepClient.tsx`, `getSupabaseAdmin`, `CekiciPanelTabs.tsx`, `CekiciAyarlarPanel.tsx`, `hizmet-veren-sayim.ts`, `CekiciRotaPanel.tsx`, `MusteriAnaSayfa.tsx`, `page.tsx`, `ArizaFotografAlani.tsx`, `MobileShell.tsx`, `page.tsx`, `page.tsx`, `page.tsx`, `route.ts`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `ensureSeedData()` connect `seed.ts` to `demo-oturum.ts`, `telefonNormalize`, `NasilCalisirSerit.tsx`, `mappers.ts`, `ensureSeedData`, `memnuniyet.ts`, `db.ts`, `hizmet-veren-sayim.ts`, `route.ts`, `route.ts`, `sorun-akis-aciklama.ts`, `smsBaseUrl`, `cekici-puan.ts`, `route.ts`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _244 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `demo-oturum.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06637231163651901 - nodes in this community are weakly interconnected._
- **Should `telefonNormalize` be split into smaller, more focused modules?**
  _Cohesion score 0.06758775205377147 - nodes in this community are weakly interconnected._
- **Should `getSupabaseAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._