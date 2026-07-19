# Graph Report - acilcozumbul  (2026-07-19)

## Corpus Check
- 344 files · ~373,179 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1460 nodes · 4542 edges · 63 communities (55 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a658dfd2`
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
- [[_COMMUNITY_funnel.ts|funnel.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_cekici-puan.ts|cekici-puan.ts]]
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
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_cerez-onay.ts|cerez-onay.ts]]
- [[_COMMUNITY_payment.ts|payment.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_kredi-odeme.ts|kredi-odeme.ts]]
- [[_COMMUNITY_davet-panel.ts|davet-panel.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_teklif-db.ts|teklif-db.ts]]
- [[_COMMUNITY_Ölçeklenebilirlik regression smoke checklist|Ölçeklenebilirlik regression smoke checklist]]
- [[_COMMUNITY_verify-teklif-backfill.mjs|verify-teklif-backfill.mjs]]
- [[_COMMUNITY_route.ts|route.ts]]

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

## Communities (63 total, 8 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.20
Nodes (33): GET(), rotaKoordinatlari(), POST(), GET(), listeDurumuBelirle(), toOzet(), cekiciTalepBolgesineUygunMu(), cekiciTalepSorununaUygunMu() (+25 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.15
Nodes (15): adimAciklamaMetni(), Props, SorunAkisOzeti(), SorunAkisOzetiIcerik(), SorunSecimi(), SorunSecimiProps, TextArea(), CEKICI_ADIMLAR (+7 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.08
Nodes (36): eslintConfig, main(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku(), GarantiMode (+28 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.07
Nodes (48): GET(), GET(), PUT(), GET(), GET(), GET(), PATCH(), POST() (+40 more)

### Community 4 - "seo.ts"
Cohesion: 0.11
Nodes (35): POST(), GET(), POST(), bolgeOzet(), GET(), POST(), PUT(), GET() (+27 more)

### Community 5 - "mappers.ts"
Cohesion: 0.11
Nodes (29): POST(), GET(), POST(), PATCH(), GET(), POST(), sonKullanmaAyir(), POST() (+21 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.17
Nodes (20): CekiciRotaPanel(), CekiciRotaPanelProps, embedDirectionsUrl(), RotaSureleri, embedDirectionsUrl(), googleMapsDirUrl(), MusteriCekiciTakipHarita(), MusteriCekiciTakipHaritaProps (+12 more)

### Community 7 - "ui.tsx"
Cohesion: 0.07
Nodes (28): DegerlendirmeSatir, Ozet, BOS_FORM, KampanyaSatir, KullanimSatir, Ozet, Ozet, ArizaFotografAlaniProps (+20 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (34): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+26 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.07
Nodes (58): POST(), GET(), GET(), GET(), POST(), baseUrlFrom(), GET(), POST() (+50 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.19
Nodes (8): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesiProps, HizmetVerenSayimPanel(), PanelGirisForm(), useHizmetVerenSayim(), HizmetVerenSayimOzet

### Community 12 - "sms-provider.ts"
Cohesion: 0.20
Nodes (14): GET(), GET(), GET(), countSmsLog(), countTalepler(), getSmsLog(), getAktifDemoOturumRequest(), FunnelOlay (+6 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.21
Nodes (6): gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi, satirFromCekici()

### Community 14 - "memnuniyet.ts"
Cohesion: 0.32
Nodes (12): getSupabaseAdmin(), insertTeklif(), listTekliflerByCekici(), listTekliflerByTalep(), listTekliflerByTalepIds(), setKaybedenTeklifler(), syncTekliflerForTalep(), teklifFromRow() (+4 more)

### Community 15 - "db.ts"
Cohesion: 0.29
Nodes (5): FormAdimi, NASIL_ADIMLAR, NasilAdim, NasilCalisirSerit(), Props

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.13
Nodes (17): OdemeOnayPage(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), OdemeOnayKayit, odemeOnaySessionKey() (+9 more)

### Community 17 - "route.ts"
Cohesion: 0.07
Nodes (32): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, metadata (+24 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.15
Nodes (21): ArizaFotografAlani(), GpsHttpsBanner(), KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI, funnelKaydet(), Step, STEP_SIRA (+13 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.60
Nodes (4): belgeBase64Ayikla(), cekiciBelgeYukle(), IZINLI_MIME, uzanti()

### Community 20 - "page.tsx"
Cohesion: 0.11
Nodes (17): BekleIcerik(), Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps (+9 more)

### Community 21 - "davet-panel.ts"
Cohesion: 0.83
Nodes (3): fotografBase64Ayikla(), talepFotografYukle(), uzanti()

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.06
Nodes (57): GET(), POST(), POST(), DELETE(), GET(), POST(), POST(), GET() (+49 more)

### Community 24 - "page.tsx"
Cohesion: 0.38
Nodes (5): hedefAltYazi(), KonumGuncellemeGostergesi(), renkKaristir(), TURUNCU, YESIL

### Community 26 - "funnel.ts"
Cohesion: 0.09
Nodes (15): PATCH(), Saglik, updateCekiciBelgeDurum(), SMS_BILDIRIM_KREDI, AnlasmaDurumu, BekleyenOdeme, BelgeDurum, Konum (+7 more)

### Community 27 - "page.tsx"
Cohesion: 0.11
Nodes (28): CekiciTalepClient(), TalepDurum, KisiselVeriGizlemeAyarlari(), BADGE, CekiciPanelTabs(), Istatistik, PanelData, Tab (+20 more)

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
Cohesion: 0.10
Nodes (34): config, middleware(), GET(), POST(), POST(), GET(), bekleyenCekiciEpostaOtp(), cekiciEpostaOtpDogrula() (+26 more)

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.23
Nodes (17): POST(), MusteriAnaSayfa(), SorunTipiSecimi(), SorunTipiSecimiProps, SORUN_ARAC_MODELI_TIPLERI, SORUN_CAGRI_BUTON, SORUN_FOTOGRAF_TIPLERI, SORUN_HEDEF_KONUM_ATLANIR (+9 more)

### Community 41 - "sitemap.ts"
Cohesion: 0.23
Nodes (10): BolgeApiData, BolgeAyarlari(), BolgeAyarlariProps, BolgeApiData, CekiciAyarlarPanel(), IlceSecimi(), IlceSecimiProps, parseJsonYanit() (+2 more)

### Community 52 - "getCekiciById"
Cohesion: 0.23
Nodes (16): POST(), GET(), POST(), GET(), cekiciPuanOzetleri(), getTalepById(), updateTalep(), isDemoTalepId() (+8 more)

### Community 53 - "davet-kayit.ts"
Cohesion: 0.06
Nodes (61): noktaOku(), POST(), GET(), cekiciTalepIlIlceyeUygunMu(), cekiciTalepMenzileUygunMu(), filtreleCekicilerBolge(), ilceEslesir(), normalize() (+53 more)

### Community 54 - "page.tsx"
Cohesion: 0.05
Nodes (107): POST(), POST(), POST(), POST(), POST(), POST(), POST(), IZINLI (+99 more)

### Community 57 - "route.ts"
Cohesion: 0.29
Nodes (8): GET(), GET(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), krediOdemeFromRow(), KrediOdemeRow, krediOdemeToRow()

### Community 58 - "cerez-onay.ts"
Cohesion: 0.11
Nodes (29): geist, metadata, RootLayout(), viewport, CerezOnayBanner(), Gorunum, tercihKaydet(), GoogleAnalytics() (+21 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.10
Nodes (16): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), AVANTAJLAR, CekiciKayitLanding(), CekiciKayitLandingProps, GUVEN_MADDELERI (+8 more)

### Community 61 - "kredi-odeme.ts"
Cohesion: 0.13
Nodes (8): OnayIcerik(), Adim, SmsKaydi, BrandLogoYazili(), MobileShell(), MobileShellProps, PanelGirisFormProps, SifreAlani

### Community 63 - "davet-panel.ts"
Cohesion: 0.22
Nodes (16): anlasilanIsSay(), cekiciPuanOzeti, computePuanFromTables(), fiyatGarantiPuaniHesapla(), normalizeTeklif(), ozetFromCounts(), teklifFiyatDegistiMi(), tercihPuaniHesapla() (+8 more)

### Community 65 - "route.ts"
Cohesion: 0.52
Nodes (6): GET(), haftaBaslangici(), istanbulAyAnahtari(), kazananTeklifFiyati(), getTaleplerByKazananCekici(), countHaricByCekici()

### Community 69 - "teklif-db.ts"
Cohesion: 0.13
Nodes (29): hizmetBolgeleriFlatten(), addCekici(), addTalep(), bugunBaslangicIso(), getCekiciByDogrulanmisFaturaEposta(), getTalepler(), getTaleplerBugun(), getTaleplerSince() (+21 more)

### Community 74 - "route.ts"
Cohesion: 0.52
Nodes (4): GET(), KULLANIMA_ACIK_ILLER, sehirBeklemeMesaji(), sehirKullanimAcikMi()

## Knowledge Gaps
- **283 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+278 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `memnuniyet.ts` to `route.ts`, `getSupabaseAdmin`, `seo.ts`, `teklif-db.ts`, `env.ts`, `mappers.ts`, `google-maps.ts`, `sms-provider.ts`, `ensureSeedData`, `getCekiciById`, `davet-panel.ts`, `page.tsx`, `route.ts`, `route.ts`, `funnel.ts`, `davet-panel.ts`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `Card()` connect `ui.tsx` to `getSupabaseAdmin`, `ensureSeedData`, `sitemap.ts`, `CekiciPanelTabs.tsx`, `CekiciAyarlarPanel.tsx`, `db.ts`, `hizmet-veren-sayim.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `route.ts`, `funnel.ts`, `page.tsx`, `route.ts`, `kredi-odeme.ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `getCurrentCekici()` connect `seo.ts` to `demo-oturum.ts`, `route.ts`, `getSupabaseAdmin`, `mappers.ts`, `env.ts`, `route.ts`, `route.ts`, `getCekiciById`, `davet-kayit.ts`, `page.tsx`, `route.ts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _283 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cekici-email-otp.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0841813135985199 - nodes in this community are weakly interconnected._
- **Should `getSupabaseAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.07404426559356136 - nodes in this community are weakly interconnected._
- **Should `seo.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11372549019607843 - nodes in this community are weakly interconnected._