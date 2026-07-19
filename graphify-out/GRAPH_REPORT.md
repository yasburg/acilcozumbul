# Graph Report - acilcozumbul  (2026-07-19)

## Corpus Check
- 345 files · ~373,620 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1465 nodes · 4553 edges · 63 communities (54 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `690b6be6`
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
- [[_COMMUNITY_kredi-odeme.ts|kredi-odeme.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_cekici-email-otp.ts|cekici-email-otp.ts]]
- [[_COMMUNITY_cekici-puan.ts|cekici-puan.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_migrate-json-to-supabase.mjs|migrate-json-to-supabase.mjs]]
- [[_COMMUNITY_PanelChrome.tsx|PanelChrome.tsx]]
- [[_COMMUNITY_NasilCalisirSerit.tsx|NasilCalisirSerit.tsx]]
- [[_COMMUNITY_Supabase veritabanı|Supabase veritabanı]]
- [[_COMMUNITY_Video demo modu|Video demo modu]]
- [[_COMMUNITY_README|README.md]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_Yapılacaklar|Yapılacaklar]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_AGENTS|AGENTS.md]]
- [[_COMMUNITY_next.config.ts|next.config.ts]]
- [[_COMMUNITY_postcss.config.mjs|postcss.config.mjs]]
- [[_COMMUNITY_davet-kayit.ts|davet-kayit.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_cerez-onay.ts|cerez-onay.ts]]
- [[_COMMUNITY_payment.ts|payment.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_kredi-odeme.ts|kredi-odeme.ts]]
- [[_COMMUNITY_davet-panel.ts|davet-panel.ts]]
- [[_COMMUNITY_davet-panel.ts|davet-panel.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_teklif-db.ts|teklif-db.ts]]
- [[_COMMUNITY_Ölçeklenebilirlik regression smoke checklist|Ölçeklenebilirlik regression smoke checklist]]
- [[_COMMUNITY_verify-teklif-backfill.mjs|verify-teklif-backfill.mjs]]
- [[_COMMUNITY_SorunTipiSecimi.tsx|SorunTipiSecimi.tsx]]

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

## Communities (63 total, 9 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.06
Nodes (90): GET(), POST(), GET(), rotaKoordinatlari(), POST(), GET(), listeDurumuBelirle(), toOzet() (+82 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.15
Nodes (15): adimAciklamaMetni(), Props, SorunAkisOzeti(), SorunAkisOzetiIcerik(), SorunSecimi(), SorunSecimiProps, TextArea(), CEKICI_ADIMLAR (+7 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.16
Nodes (19): garantiHashHesapla(), garantiXmlDeger(), GARANTI_HATA_KODLARI, garantiKodNormalize(), garantiMesajGenelMi(), garantiMusteriHataMesaji(), garantiYetersizBakiyeMetniMi(), GENEL_MESAJ_ORNEKLERI (+11 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.20
Nodes (17): GET(), POST(), addCekici(), getKampanyaByKod(), kaydetKampanyaKullanim(), kampanyaGecerliMi(), KampanyaKodu, kampanyaKoduGecerliMi() (+9 more)

### Community 4 - "seo.ts"
Cohesion: 0.25
Nodes (9): POST(), POST(), POST(), POST(), getCurrentCekici(), getCekiciByToken(), olusturBekleyenRozetOdeme(), rozetIndirimYuzde() (+1 more)

### Community 5 - "mappers.ts"
Cohesion: 0.26
Nodes (12): PATCH(), GET(), POST(), sonKullanmaAyir(), tcKimlikGecerliMi(), vergiNoGecerliMi(), istemciIpAl(), faturaAlanlariniDogrula() (+4 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.07
Nodes (43): noktaOku(), POST(), GET(), GET(), CekiciRotaPanelProps, embedDirectionsUrl(), googleMapsDirUrl(), MusteriCekiciTakipHarita() (+35 more)

### Community 7 - "ui.tsx"
Cohesion: 0.08
Nodes (28): Adim, DegerlendirmeSatir, Ozet, BOS_FORM, KampanyaSatir, KullanimSatir, Ozet, Ozet (+20 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (34): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+26 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.10
Nodes (34): GET(), GET(), GET(), GET(), addSmsKaydi(), countSmsLog(), countTalepler(), getSmsLog() (+26 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.19
Nodes (8): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesiProps, HizmetVerenSayimPanel(), PanelGirisForm(), useHizmetVerenSayim(), HizmetVerenSayimOzet

### Community 12 - "sms-provider.ts"
Cohesion: 0.19
Nodes (23): bolgeOzet(), GET(), POST(), PUT(), cekiciHizmetBolgeleri(), cekiciHizmetModu(), cekiciKonumGuncelMi(), hizmetBolgeleriIlceSayisi() (+15 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.83
Nodes (3): cekiciMusaitMi(), istanbulGunVeDakika(), saatMetniDakika()

### Community 14 - "memnuniyet.ts"
Cohesion: 0.21
Nodes (15): GET(), GET(), PATCH(), POST(), ekleKampanya(), getKampanyaKullanimlari(), getKampanyalar(), guncelleKampanya() (+7 more)

### Community 15 - "db.ts"
Cohesion: 0.29
Nodes (5): FormAdimi, NASIL_ADIMLAR, NasilAdim, NasilCalisirSerit(), Props

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.12
Nodes (12): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, AVANTAJLAR, CekiciKayitLanding(), CekiciKayitLandingProps, GUVEN_MADDELERI, IS_AKISI (+4 more)

### Community 17 - "route.ts"
Cohesion: 0.07
Nodes (31): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, metadata (+23 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.10
Nodes (28): ArizaFotografAlani(), ArizaFotografAlaniProps, CekiciRotaPanel(), embedDirectionsUrl(), RotaSureleri, GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim() (+20 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.15
Nodes (27): POST(), GET(), baseUrlFrom(), GET(), POST(), GET(), demoMusteriTalepDurumJson(), DegerlendirmeRow (+19 more)

### Community 20 - "page.tsx"
Cohesion: 0.10
Nodes (23): Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps, MemnuniyetFormu() (+15 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.06
Nodes (65): config, middleware(), GET(), POST(), GET(), GET(), istemciIp(), ozelIp() (+57 more)

### Community 24 - "page.tsx"
Cohesion: 0.17
Nodes (19): eslintConfig, main(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku() (+11 more)

### Community 25 - "kredi-odeme.ts"
Cohesion: 0.29
Nodes (8): GET(), GET(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), krediOdemeFromRow(), KrediOdemeRow, krediOdemeToRow()

### Community 27 - "page.tsx"
Cohesion: 0.12
Nodes (26): BekleIcerik(), CekiciTalepClient(), TalepDurum, CekiciAyarlarPanel(), DavetKoduAyarlari(), BADGE, CekiciPanelTabs(), Istatistik (+18 more)

### Community 28 - "cekici-email-otp.ts"
Cohesion: 0.24
Nodes (18): POST(), GET(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder(), EmailOtpKayit, EmailOtpRow (+10 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.31
Nodes (10): bildirimRowsFromTalepler(), cekiciToRow(), dataDir, haricRowsFromTalepler(), main(), readJson(), supabase, talepToRow() (+2 more)

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.32
Nodes (4): metadata, PanelChrome(), LINKS, PanelNav()

### Community 35 - "NasilCalisirSerit.tsx"
Cohesion: 0.24
Nodes (14): GET(), HizmetVerenSayimGostergesi(), useAnimatedNumber(), cevrimiciJitterFaktor(), cevrimiciJitterUygula(), HIZMET_ETIKET, hizmetVerenEtiket(), hizmetVerenKisaMetin() (+6 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.26
Nodes (15): POST(), MusteriAnaSayfaIcerik(), addTalep(), sorunAracModeliGerekliMi(), sorunCagriButonEtiketi(), sorunFotografAlaniGoster(), sorunFotografGerekliMi(), sorunHedefKonumGerekliMi() (+7 more)

### Community 53 - "davet-kayit.ts"
Cohesion: 0.06
Nodes (44): GET(), POST(), GET(), POST(), GET(), PUT(), saatGecerliMi(), GET() (+36 more)

### Community 54 - "page.tsx"
Cohesion: 0.05
Nodes (108): POST(), POST(), POST(), GET(), POST(), PUT(), POST(), POST() (+100 more)

### Community 56 - "route.ts"
Cohesion: 0.26
Nodes (11): POST(), KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI, KrediPaket, krediPaketBul(), krediPaketOdenecekTL(), KrediPaketTl, krediTutarKurus() (+3 more)

### Community 57 - "route.ts"
Cohesion: 0.09
Nodes (24): Saglik, BolgeApiData, BolgeApiData, hizmetBolgeleriFlatten(), cekiciFromRow(), CekiciRow, cekiciToRow(), OdemeRow (+16 more)

### Community 58 - "cerez-onay.ts"
Cohesion: 0.11
Nodes (30): geist, metadata, RootLayout(), viewport, CerezOnayBanner(), Gorunum, tercihKaydet(), GoogleAnalytics() (+22 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.11
Nodes (12): BelgeYuklemeAlani(), Props, BelgeDurumResponse, durumEtiket(), OnayliCekiciHesap(), hedefAltYazi(), KonumGuncellemeGostergesi(), renkKaristir() (+4 more)

### Community 61 - "kredi-odeme.ts"
Cohesion: 0.14
Nodes (8): KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, SmsKaydi, BrandLogoYazili(), MobileShell(), MobileShellProps, OdemeOnayKayit, odemeOnaySessionKey()

### Community 62 - "davet-panel.ts"
Cohesion: 0.24
Nodes (6): GET(), DavetKullanimRow, DavetKullanimSatir, DavetLiderSatir, DavetPanelOzet, getDavetPanelVerisi()

### Community 63 - "davet-panel.ts"
Cohesion: 0.20
Nodes (17): GET(), haftaBaslangici(), istanbulAyAnahtari(), kazananTeklifFiyati(), anlasilanIsSay(), cekiciPuanOzeti, computePuanFromTables(), fiyatGarantiPuaniHesapla() (+9 more)

### Community 66 - "route.ts"
Cohesion: 0.24
Nodes (14): GET(), PUT(), davetKayitBaslangicKredisiFromSonuc(), davetKayitBonusTamamla(), davetKayitHazirla(), DavetKayitSonuc, davetKayitBaslangicKredisi(), davetKoduGecerliMi() (+6 more)

### Community 68 - "page.tsx"
Cohesion: 0.28
Nodes (6): KrediPage(), OdemeOnayPage(), belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), formatKredi()

### Community 69 - "teklif-db.ts"
Cohesion: 0.13
Nodes (33): POST(), cekiciAuthKullaniciSil(), cekiciBelgeleriniSil(), silCekiciCascade(), mockFrom, mockStorageFrom, getCekicilerBildirimAdaylari(), getTalepById() (+25 more)

### Community 79 - "SorunTipiSecimi.tsx"
Cohesion: 0.19
Nodes (10): SorunTipiSecimi(), SorunTipiSecimiProps, HIZMET_QUERY_HARITASI, hizmetQuerydenSorunTipi(), SORUN_ARAC_MODELI_TIPLERI, SORUN_CAGRI_BUTON, SORUN_FOTOGRAF_TIPLERI, SORUN_HEDEF_KONUM_ATLANIR (+2 more)

## Knowledge Gaps
- **284 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+279 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `teklif-db.ts` to `demo-oturum.ts`, `route.ts`, `getSupabaseAdmin`, `seo.ts`, `mappers.ts`, `route.ts`, `google-maps.ts`, `memnuniyet.ts`, `ensureSeedData`, `davet-kayit.ts`, `page.tsx`, `route.ts`, `route.ts`, `kredi-odeme.ts`, `cekici-email-otp.ts`, `davet-panel.ts`, `davet-panel.ts`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `Card()` connect `ui.tsx` to `page.tsx`, `ensureSeedData`, `CekiciPanelTabs.tsx`, `db.ts`, `hizmet-veren-sayim.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `davet-kayit.ts`, `davet-panel.ts`, `route.ts`, `page.tsx`, `route.ts`, `kredi-odeme.ts`, `davet-panel.ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `getCurrentCekici()` connect `seo.ts` to `demo-oturum.ts`, `route.ts`, `mappers.ts`, `ensureSeedData`, `teklif-db.ts`, `sms-provider.ts`, `route.ts`, `davet-kayit.ts`, `page.tsx`, `route.ts`, `route.ts`, `page.tsx`, `cekici-email-otp.ts`, `davet-panel.ts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _284 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `demo-oturum.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.056207446037954516 - nodes in this community are weakly interconnected._
- **Should `ensureSeedData` be split into smaller, more focused modules?**
  _Cohesion score 0.0734006734006734 - nodes in this community are weakly interconnected._
- **Should `ui.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07727272727272727 - nodes in this community are weakly interconnected._