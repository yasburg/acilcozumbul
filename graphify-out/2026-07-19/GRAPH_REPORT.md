# Graph Report - acilcozumbul  (2026-07-19)

## Corpus Check
- 344 files · ~372,492 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1456 nodes · 4526 edges · 74 communities (66 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3b6ed863`
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
- [[_COMMUNITY_cekici-sil.ts|cekici-sil.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_teklif-db.ts|teklif-db.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_talep-fotograf.ts|talep-fotograf.ts]]
- [[_COMMUNITY_Ölçeklenebilirlik regression smoke checklist|Ölçeklenebilirlik regression smoke checklist]]
- [[_COMMUNITY_verify-teklif-backfill.mjs|verify-teklif-backfill.mjs]]

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

## Communities (74 total, 8 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.09
Nodes (44): GET(), GET(), POST(), POST(), POST(), GET(), GECERLI, POST() (+36 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.21
Nodes (19): POST(), GET(), POST(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder(), EmailOtpKayit (+11 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.08
Nodes (38): eslintConfig, main(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku() (+30 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.19
Nodes (19): GET(), davetKayitBaslangicKredisiFromSonuc(), davetKayitBonusTamamla(), davetKayitHazirla(), DavetKayitSonuc, davetKayitBaslangicKredisi(), davetKoduGecerliMi(), davetKoduNormalize() (+11 more)

### Community 4 - "seo.ts"
Cohesion: 0.12
Nodes (32): POST(), GET(), POST(), GET(), PUT(), POST(), GET(), GET() (+24 more)

### Community 5 - "mappers.ts"
Cohesion: 0.25
Nodes (12): POST(), POST(), KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI, KrediPaket, krediPaketBul(), krediPaketOdenecekTL(), KrediPaketTl (+4 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.17
Nodes (21): CekiciRotaPanel(), CekiciRotaPanelProps, embedDirectionsUrl(), RotaSureleri, embedDirectionsUrl(), googleMapsDirUrl(), MusteriCekiciTakipHarita(), MusteriCekiciTakipHaritaProps (+13 more)

### Community 7 - "ui.tsx"
Cohesion: 0.16
Nodes (11): KrediPage(), belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), BelgeYuklemeAlani(), Props, BelgeDurumResponse, durumEtiket() (+3 more)

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
Cohesion: 0.28
Nodes (11): GET(), mesafeKmHaversine(), googleAcikHedefOnerileri(), GooglePlaceRow, placesTextSearch(), HedefOneriSecenekleri, KonumOneri, SORUN_ARAMALARI (+3 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.09
Nodes (35): GET(), GET(), GET(), GET(), GET(), addSmsKaydi(), countSmsLog(), countTalepler() (+27 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.19
Nodes (7): GET(), gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi, satirFromCekici()

### Community 14 - "memnuniyet.ts"
Cohesion: 0.10
Nodes (36): POST(), GET(), baseUrlFrom(), GET(), POST(), anlasilanIsSay(), cekiciPuanOzeti, computePuanFromTables() (+28 more)

### Community 15 - "db.ts"
Cohesion: 0.21
Nodes (15): PATCH(), GET(), POST(), sonKullanmaAyir(), tcKimlikGecerliMi(), vergiNoGecerliMi(), istemciIpAl(), faturaAlanlariniDogrula() (+7 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.06
Nodes (24): OnayIcerik(), Adim, SmsKaydi, DegerlendirmeSatir, Ozet, BOS_FORM, KampanyaSatir, KullanimSatir (+16 more)

### Community 17 - "route.ts"
Cohesion: 0.07
Nodes (32): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, metadata (+24 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.13
Nodes (24): ArizaFotografAlani(), GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI, kayitliAdSoyadUygula(), Step (+16 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.20
Nodes (11): useHizmetVerenSayim(), cekiciMusaitMi(), istanbulGunVeDakika(), saatMetniDakika(), cevrimiciJitterFaktor(), cevrimiciJitterUygula(), HIZMET_ETIKET, hizmetVerenEtiket() (+3 more)

### Community 20 - "page.tsx"
Cohesion: 0.10
Nodes (18): BekleIcerik(), Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps (+10 more)

### Community 21 - "davet-panel.ts"
Cohesion: 0.36
Nodes (8): GET(), HizmetVerenSayimGostergesi(), useAnimatedNumber(), getCekiciler(), hizmetVerenSatirBul(), hizmetVerenSayimHesapla(), hizmetVerenSayimMusteriGoster(), gecerliSorunTipi()

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.33
Nodes (12): GET(), GET(), cekiciPuanOzetleri(), DEMO_PUAN, demoCekiciTalepGetJson(), demoMusteriTalepDurumJson(), demoMusteriTekliflerJson(), rotaKoordinatlari() (+4 more)

### Community 24 - "page.tsx"
Cohesion: 0.38
Nodes (5): hedefAltYazi(), KonumGuncellemeGostergesi(), renkKaristir(), TURUNCU, YESIL

### Community 25 - "MobileShell.tsx"
Cohesion: 0.25
Nodes (5): OdemeOnayPage(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, OdemeOnayKayit, odemeOnaySessionKey()

### Community 26 - "funnel.ts"
Cohesion: 0.17
Nodes (30): POST(), listeDurumuBelirle(), toOzet(), cekiciTalepBolgesineUygunMu(), cekiciTalepSorununaUygunMu(), demoListeDurumuBelirle(), demoTeklifEkle(), demoToOzet() (+22 more)

### Community 27 - "page.tsx"
Cohesion: 0.13
Nodes (24): CekiciTalepClient(), TalepDurum, KisiselVeriGizlemeAyarlari(), BADGE, CekiciPanelTabs(), Istatistik, PanelData, Tab (+16 more)

### Community 28 - "route.ts"
Cohesion: 0.12
Nodes (23): POST(), getCekicilerBildirimAdaylari(), updateTalep(), anlasamadiSonrasiIhaleyiSurdur(), kaybedenTeklifleriIsaretle(), CekiciPuanOzetRow, getCekiciPuanOzetRows(), refreshCekiciPuanOzet() (+15 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "route.ts"
Cohesion: 0.29
Nodes (15): POST(), GET(), rotaKoordinatlari(), POST(), KULLANIMA_ACIK_ILLER, sehirBeklemeMesaji(), sehirKullanimAcikMi(), getTalepById() (+7 more)

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
Cohesion: 0.21
Nodes (18): POST(), MusteriAnaSayfa(), SorunTipiSecimi(), SorunTipiSecimiProps, SORUN_ARAC_MODELI_TIPLERI, SORUN_CAGRI_BUTON, SORUN_FOTOGRAF_TIPLERI, SORUN_HEDEF_KONUM_ATLANIR (+10 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "env.ts"
Cohesion: 0.16
Nodes (14): config, middleware(), POST(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli(), supabaseEksikEnvAlanlari() (+6 more)

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.22
Nodes (15): GET(), PATCH(), POST(), ekleKampanya(), getKampanyaKullanimlari(), getKampanyalar(), guncelleKampanya(), KampanyaKullanimSatir (+7 more)

### Community 41 - "sitemap.ts"
Cohesion: 0.13
Nodes (20): BolgeApiData, BolgeAyarlari(), BolgeAyarlariProps, BolgeApiData, CekiciAyarlarPanel(), DavetKoduAyarlari(), DavetKoduDurum, GUNLER (+12 more)

### Community 52 - "google-maps.ts"
Cohesion: 0.23
Nodes (13): noktaOku(), POST(), GET(), durationSaniyedenDk(), googleMapsApiKey(), googleMapsYapilandirildi(), RotaSureKaynagi, surusSuresiDk() (+5 more)

### Community 53 - "davet-kayit.ts"
Cohesion: 0.11
Nodes (38): bolgeOzet(), GET(), POST(), PUT(), cekiciTalepIlIlceyeUygunMu(), cekiciTalepMenzileUygunMu(), filtreleCekicilerBolge(), ilceEslesir() (+30 more)

### Community 54 - "page.tsx"
Cohesion: 0.06
Nodes (101): POST(), POST(), POST(), GET(), POST(), POST(), POST(), GET() (+93 more)

### Community 55 - "ArizaFotografAlani.tsx"
Cohesion: 0.53
Nodes (4): POST(), olusturBekleyenRozetOdeme(), rozetIndirimYuzde(), odemeToRow()

### Community 56 - "sorun-akis-aciklama.ts"
Cohesion: 0.32
Nodes (9): GET(), belgeBase64Ayikla(), cekiciBelgeYukle(), IZINLI_MIME, uzanti(), getSupabaseAdmin(), supabaseDbAktif(), davetKoduSutunuVar() (+1 more)

### Community 57 - "route.ts"
Cohesion: 0.11
Nodes (32): GET(), hizmetBolgeleriFlatten(), addCekici(), addTalep(), bugunBaslangicIso(), getCekiciByDogrulanmisFaturaEposta(), getTalepler(), getTaleplerBugun() (+24 more)

### Community 58 - "cerez-onay.ts"
Cohesion: 0.11
Nodes (33): geist, metadata, RootLayout(), viewport, CerezOnayBanner(), GoogleAnalytics(), funnelKaydet(), PostHogProvider() (+25 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.13
Nodes (11): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), AVANTAJLAR, CekiciKayitLanding(), CekiciKayitLandingProps, GUVEN_MADDELERI (+3 more)

### Community 61 - "kredi-odeme.ts"
Cohesion: 0.19
Nodes (9): GET(), GET(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), krediOdemeFromRow(), KrediOdemeRow, krediOdemeToRow() (+1 more)

### Community 62 - "HizmetVerenSayimGostergesi.tsx"
Cohesion: 0.29
Nodes (5): FormAdimi, NASIL_ADIMLAR, NasilAdim, NasilCalisirSerit(), Props

### Community 63 - "davet-panel.ts"
Cohesion: 0.24
Nodes (6): GET(), DavetKullanimRow, DavetKullanimSatir, DavetLiderSatir, DavetPanelOzet, getDavetPanelVerisi()

### Community 64 - "cekici-sil.ts"
Cohesion: 0.27
Nodes (7): POST(), DELETE(), cekiciAuthKullaniciSil(), cekiciBelgeleriniSil(), silCekiciCascade(), mockFrom, mockStorageFrom

### Community 65 - "route.ts"
Cohesion: 0.52
Nodes (6): GET(), haftaBaslangici(), istanbulAyAnahtari(), kazananTeklifFiyati(), getTaleplerByKazananCekici(), countHaricByCekici()

### Community 66 - "route.ts"
Cohesion: 0.33
Nodes (6): GET(), KayitKontenjanBilgi(), Props, KayitKontenjanDurum, kayitKontenjanHesapla(), countCekiciler()

### Community 67 - "page.tsx"
Cohesion: 0.29
Nodes (7): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesiProps, HizmetVerenSayimPanel(), PanelGirisForm(), HizmetVerenSayimOzet

### Community 68 - "route.ts"
Cohesion: 0.53
Nodes (6): IZINLI, POST(), POST(), funnelOlayKaydet(), ipHash(), istekIp()

### Community 69 - "teklif-db.ts"
Cohesion: 0.33
Nodes (8): listTekliflerByCekici(), listTekliflerByTalep(), listTekliflerByTalepIds(), teklifFromRow(), TeklifRow, teklifToRow(), upsertTeklif(), TeklifDurumu

### Community 70 - "page.tsx"
Cohesion: 0.40
Nodes (5): DemoDurum, DemoSms, kalanSureFormat(), PanelDemoPage(), SIMULE_ADIMLAR

### Community 71 - "talep-fotograf.ts"
Cohesion: 0.83
Nodes (3): fotografBase64Ayikla(), talepFotografYukle(), uzanti()

## Knowledge Gaps
- **283 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+278 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `sorun-akis-aciklama.ts` to `demo-oturum.ts`, `telefonNormalize`, `getSupabaseAdmin`, `seo.ts`, `mappers.ts`, `sms-provider.ts`, `memnuniyet.ts`, `db.ts`, `davet-panel.ts`, `funnel.ts`, `route.ts`, `route.ts`, `route.ts`, `page.tsx`, `ArizaFotografAlani.tsx`, `route.ts`, `kredi-odeme.ts`, `davet-panel.ts`, `cekici-sil.ts`, `route.ts`, `route.ts`, `route.ts`, `teklif-db.ts`, `talep-fotograf.ts`?**
  _High betweenness centrality (0.074) - this node is a cross-community bridge._
- **Why does `Card()` connect `hizmet-veren-sayim.ts` to `route.ts`, `page.tsx`, `page.tsx`, `ui.tsx`, `ensureSeedData`, `sitemap.ts`, `CekiciAyarlarPanel.tsx`, `MusteriAnaSayfa.tsx`, `page.tsx`, `MobileShell.tsx`, `page.tsx`, `route.ts`, `kredi-odeme.ts`, `HizmetVerenSayimGostergesi.tsx`, `davet-panel.ts`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `getCurrentCekici()` connect `seo.ts` to `demo-oturum.ts`, `route.ts`, `cekici-sil.ts`, `cekici-email-otp.ts`, `telefonNormalize`, `mappers.ts`, `db.ts`, `route.ts`, `google-maps.ts`, `davet-kayit.ts`, `page.tsx`, `ArizaFotografAlani.tsx`, `funnel.ts`, `route.ts`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _283 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `demo-oturum.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0936026936026936 - nodes in this community are weakly interconnected._
- **Should `cekici-email-otp.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08489795918367347 - nodes in this community are weakly interconnected._
- **Should `seo.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12303422756706753 - nodes in this community are weakly interconnected._