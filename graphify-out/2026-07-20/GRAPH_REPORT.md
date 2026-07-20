# Graph Report - acilcozumbul  (2026-07-20)

## Corpus Check
- 346 files · ~373,411 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1465 nodes · 4543 edges · 75 communities (64 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `44acbc94`
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
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_cekici-email-otp.ts|cekici-email-otp.ts]]
- [[_COMMUNITY_cekici-puan.ts|cekici-puan.ts]]
- [[_COMMUNITY_demo-responses.ts|demo-responses.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_getCekiciById|getCekiciById]]
- [[_COMMUNITY_migrate-json-to-supabase.mjs|migrate-json-to-supabase.mjs]]
- [[_COMMUNITY_PanelChrome.tsx|PanelChrome.tsx]]
- [[_COMMUNITY_NasilCalisirSerit.tsx|NasilCalisirSerit.tsx]]
- [[_COMMUNITY_Supabase veritabanı|Supabase veritabanı]]
- [[_COMMUNITY_Video demo modu|Video demo modu]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_README|README.md]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_Yapılacaklar|Yapılacaklar]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_AGENTS|AGENTS.md]]
- [[_COMMUNITY_next.config.ts|next.config.ts]]
- [[_COMMUNITY_postcss.config.mjs|postcss.config.mjs]]
- [[_COMMUNITY_CerezOnayBanner.tsx|CerezOnayBanner.tsx]]
- [[_COMMUNITY_davet-kayit.ts|davet-kayit.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_cerez-onay.ts|cerez-onay.ts]]
- [[_COMMUNITY_payment.ts|payment.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_kredi-odeme.ts|kredi-odeme.ts]]
- [[_COMMUNITY_davet-panel.ts|davet-panel.ts]]
- [[_COMMUNITY_davet-panel.ts|davet-panel.ts]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_ArizaFotografAlani.tsx|ArizaFotografAlani.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_teklif-db.ts|teklif-db.ts]]
- [[_COMMUNITY_talep-fotograf.ts|talep-fotograf.ts]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_Ölçeklenebilirlik regression smoke checklist|Ölçeklenebilirlik regression smoke checklist]]
- [[_COMMUNITY_verify-teklif-backfill.mjs|verify-teklif-backfill.mjs]]
- [[_COMMUNITY_SorunTipiSecimi.tsx|SorunTipiSecimi.tsx]]

## God Nodes (most connected - your core abstractions)
1. `getSupabaseAdmin()` - 126 edges
2. `ensureSeedData()` - 92 edges
3. `getCurrentCekici()` - 65 edges
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

## Communities (75 total, 11 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.27
Nodes (22): GET(), rotaKoordinatlari(), POST(), listeDurumuBelirle(), toOzet(), sehirBeklemeMesaji(), demoListeDurumuBelirle(), demoTeklifEkle() (+14 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.21
Nodes (6): gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi, satirFromCekici()

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.08
Nodes (38): eslintConfig, main(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku() (+30 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.13
Nodes (24): cekiciTalepBolgesineUygunMu(), cekiciTalepIlIlceyeUygunMu(), cekiciTalepMenzileUygunMu(), filtreleCekicilerBolge(), ilceEslesir(), normalize(), talepKonumBolge(), konumCekici() (+16 more)

### Community 4 - "seo.ts"
Cohesion: 0.18
Nodes (19): POST(), ADIM_OLAYLARI, MusteriAnaSayfaIcerik(), Step, STEP_SIRA, Spinner(), Props, YasalOnayKutusu() (+11 more)

### Community 5 - "mappers.ts"
Cohesion: 0.12
Nodes (12): Saglik, olusturBekleyenRozetOdeme(), odemeFromRow(), OdemeRow, odemeToRow(), AnlasmaDurumu, BekleyenOdeme, Konum (+4 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.07
Nodes (46): noktaOku(), POST(), GET(), GET(), CekiciRotaPanel(), CekiciRotaPanelProps, embedDirectionsUrl(), RotaSureleri (+38 more)

### Community 7 - "ui.tsx"
Cohesion: 0.08
Nodes (20): Adim, SmsKaydi, DegerlendirmeSatir, Ozet, BOS_FORM, KampanyaSatir, KullanimSatir, Ozet (+12 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (34): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+26 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.15
Nodes (22): GET(), addSmsKaydi(), escapeXml(), GondericiAdiSorguSonuc, logSmsKaydi(), netgsmGondericiAdlariSorgula(), netgsmKimlik(), netgsmOtpSmsGonder() (+14 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.18
Nodes (21): POST(), POST(), updateTalep(), demoKatil(), demoKatilMesaji(), anlasamadiSonrasiIhaleyiSurdur(), cekiciAcikTalepUygunMu(), cekiciBildirimKrediTutari() (+13 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.18
Nodes (24): bolgeOzet(), GET(), POST(), PUT(), cekiciHizmetBolgeleri(), cekiciHizmetModu(), cekiciKonumGuncelMi(), hizmetBolgeleriIlceSayisi() (+16 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.21
Nodes (14): POST(), authAnonClient(), authSignIn(), cekiciAuthEmail(), cekiciAuthKullaniciOlustur(), cekiciAuthKullaniciSil(), cekiciAuthSifreDogrula(), cekiciAuthSifreGuncelle() (+6 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.10
Nodes (43): GET(), GET(), PUT(), GET(), POST(), GET(), PATCH(), POST() (+35 more)

### Community 15 - "db.ts"
Cohesion: 0.29
Nodes (5): FormAdimi, NASIL_ADIMLAR, NasilAdim, NasilCalisirSerit(), Props

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.16
Nodes (9): GET(), OnayIcerik(), AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), YasalSiteFooter(), KULLANIMA_ACIK_ILLER (+1 more)

### Community 17 - "route.ts"
Cohesion: 0.21
Nodes (11): metadata, metadata, metadata, metadata, metadata, YasalBolum(), YasalListe(), YasalSayfaShell() (+3 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.16
Nodes (17): GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, cihazPlatformu(), geocodeAdres(), konumAlEsnek(), konumAyarlariAdimlari() (+9 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.15
Nodes (26): POST(), GET(), baseUrlFrom(), GET(), POST(), cekiciHizmetPuani, DegerlendirmeRow, getDegerlendirmeByTalepId() (+18 more)

### Community 20 - "page.tsx"
Cohesion: 0.10
Nodes (18): BekleIcerik(), Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps (+10 more)

### Community 21 - "davet-panel.ts"
Cohesion: 0.20
Nodes (14): config, middleware(), POST(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli(), supabaseEksikEnvAlanlari() (+6 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.09
Nodes (46): GET(), GET(), POST(), POST(), POST(), GET(), GECERLI, POST() (+38 more)

### Community 24 - "page.tsx"
Cohesion: 0.17
Nodes (15): CekiciKayitLayout(), metadata, HomePage(), metadata, MusteriAnaSayfa(), JsonLd(), JsonLdProps, SssBolumu() (+7 more)

### Community 25 - "kredi-odeme.ts"
Cohesion: 0.31
Nodes (7): GET(), GET(), getKrediOdemeById(), listeleKrediOdemeler(), krediOdemeFromRow(), KrediOdemeRow, krediOdemeToRow()

### Community 26 - "route.ts"
Cohesion: 0.20
Nodes (15): GET(), GET(), GET(), countSmsLog(), countTalepler(), getSmsLog(), getTaleplerSince(), FunnelOlay (+7 more)

### Community 27 - "page.tsx"
Cohesion: 0.11
Nodes (27): CekiciTalepClient(), TalepDurum, CekiciAyarlarPanel(), DavetKoduAyarlari(), KisiselVeriGizlemeAyarlari(), BADGE, CekiciPanelTabs(), Istatistik (+19 more)

### Community 28 - "cekici-email-otp.ts"
Cohesion: 0.15
Nodes (15): adimAciklamaMetni(), Props, SorunAkisOzeti(), SorunAkisOzetiIcerik(), SorunSecimi(), SorunSecimiProps, TextArea(), CEKICI_ADIMLAR (+7 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "demo-responses.ts"
Cohesion: 0.35
Nodes (13): GET(), POST(), GET(), cekiciPuanOzetleri(), teklifFiyatDegistiMi(), getTalepById(), isDemoTalepId(), demoTalepGetir() (+5 more)

### Community 32 - "getCekiciById"
Cohesion: 0.21
Nodes (7): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesiProps, HizmetVerenSayimPanel(), PanelGirisForm(), HizmetVerenSayimOzet

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.31
Nodes (10): bildirimRowsFromTalepler(), cekiciToRow(), dataDir, haricRowsFromTalepler(), main(), readJson(), supabase, talepToRow() (+2 more)

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.32
Nodes (4): metadata, PanelChrome(), LINKS, PanelNav()

### Community 35 - "NasilCalisirSerit.tsx"
Cohesion: 0.19
Nodes (17): GET(), HizmetVerenSayimGostergesi(), useAnimatedNumber(), cekiciMusaitMi(), istanbulGunVeDakika(), saatMetniDakika(), cevrimiciJitterFaktor(), cevrimiciJitterUygula() (+9 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "route.ts"
Cohesion: 0.19
Nodes (10): SorunTipiSecimi(), SorunTipiSecimiProps, HIZMET_QUERY_HARITASI, hizmetQuerydenSorunTipi(), SORUN_ARAC_MODELI_TIPLERI, SORUN_CAGRI_BUTON, SORUN_FOTOGRAF_TIPLERI, SORUN_HEDEF_KONUM_ATLANIR (+2 more)

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.38
Nodes (5): hedefAltYazi(), KonumGuncellemeGostergesi(), renkKaristir(), TURUNCU, YESIL

### Community 41 - "route.ts"
Cohesion: 0.83
Nodes (3): GET(), istemciIp(), ozelIp()

### Community 52 - "CerezOnayBanner.tsx"
Cohesion: 0.27
Nodes (8): CerezOnayBanner(), Gorunum, tercihKaydet(), cerezBannerGosterilmeli(), cerezBannerKapaliMi(), cerezBannerKapat(), cerezOnayKaydet(), CerezOnayTercihi

### Community 53 - "davet-kayit.ts"
Cohesion: 0.05
Nodes (80): POST(), GET(), POST(), POST(), POST(), GET(), PUT(), saatGecerliMi() (+72 more)

### Community 54 - "page.tsx"
Cohesion: 0.06
Nodes (95): POST(), POST(), POST(), POST(), IZINLI, POST(), GET(), POST() (+87 more)

### Community 55 - "route.ts"
Cohesion: 0.33
Nodes (6): GET(), KayitKontenjanBilgi(), Props, KayitKontenjanDurum, kayitKontenjanHesapla(), countCekiciler()

### Community 56 - "route.ts"
Cohesion: 0.31
Nodes (5): KrediPage(), belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), formatKredi()

### Community 57 - "route.ts"
Cohesion: 0.15
Nodes (23): hizmetBolgeleriFlatten(), addCekici(), bugunBaslangicIso(), getCekiciByDogrulanmisFaturaEposta(), getCekiciByToken(), getTalepler(), getTaleplerBugun(), getTaleplerMemnuniyetBekleyen() (+15 more)

### Community 58 - "cerez-onay.ts"
Cohesion: 0.23
Nodes (13): GoogleAnalytics(), GTAG_CONSENT_DENIED, GTAG_CONSENT_GRANTED, gtagAdsFiyatTeklifiDonusumu(), gtagAdsKaydolmaDonusumu(), gtagCagir(), gtagCekiciKayitOnayGoruntule(), gtagCerezSenkronize() (+5 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.15
Nodes (13): BelgeYuklemeAlani(), Props, AVANTAJLAR, CekiciKayitLanding(), CekiciKayitLandingProps, GUVEN_MADDELERI, IS_AKISI, YORUMLAR (+5 more)

### Community 61 - "kredi-odeme.ts"
Cohesion: 0.18
Nodes (15): OdemeOnayPage(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, funnelKaydet(), cerezAnalitikAktif(), cerezOnayOku(), OdemeOnayKayit, odemeOnaySessionKey() (+7 more)

### Community 62 - "davet-panel.ts"
Cohesion: 0.24
Nodes (6): GET(), DavetKullanimRow, DavetKullanimSatir, DavetLiderSatir, DavetPanelOzet, getDavetPanelVerisi()

### Community 63 - "davet-panel.ts"
Cohesion: 0.26
Nodes (11): GET(), haftaBaslangici(), istanbulAyAnahtari(), kazananTeklifFiyati(), getTaleplerByKazananCekici(), syncTalepIliskileri(), addBildirilenCekici(), countHaricByCekici() (+3 more)

### Community 64 - "layout.tsx"
Cohesion: 0.28
Nodes (7): geist, metadata, RootLayout(), viewport, PostHogProvider(), gtagConsentBootstrapInline(), SEO_ANAHTARLAR

### Community 65 - "page.tsx"
Cohesion: 0.40
Nodes (5): DemoDurum, DemoSms, kalanSureFormat(), PanelDemoPage(), SIMULE_ADIMLAR

### Community 67 - "ArizaFotografAlani.tsx"
Cohesion: 0.50
Nodes (3): ArizaFotografAlani(), ArizaFotografAlaniProps, fotografSikistir()

### Community 69 - "teklif-db.ts"
Cohesion: 0.14
Nodes (27): anlasilanIsSay(), cekiciPuanOzeti, computePuanFromTables(), fiyatGarantiPuaniHesapla(), normalizeTeklif(), ozetFromCounts(), tercihPuaniHesapla(), getCekicilerBildirimAdaylari() (+19 more)

### Community 70 - "talep-fotograf.ts"
Cohesion: 0.83
Nodes (3): fotografBase64Ayikla(), talepFotografYukle(), uzanti()

### Community 79 - "SorunTipiSecimi.tsx"
Cohesion: 0.17
Nodes (16): BolgeApiData, BolgeAyarlari(), BolgeAyarlariProps, BolgeApiData, DavetKoduDurum, GUNLER, MusaitlikAyarlari(), Durum (+8 more)

## Knowledge Gaps
- **284 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+279 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `teklif-db.ts` to `seo.ts`, `mappers.ts`, `google-maps.ts`, `CekiciPanelTabs.tsx`, `sms-provider.ts`, `CekiciAyarlarPanel.tsx`, `memnuniyet.ts`, `ensureSeedData`, `route.ts`, `kredi-odeme.ts`, `route.ts`, `demo-responses.ts`, `davet-kayit.ts`, `page.tsx`, `route.ts`, `route.ts`, `davet-panel.ts`, `davet-panel.ts`, `talep-fotograf.ts`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `Card()` connect `ui.tsx` to `getCekiciById`, `page.tsx`, `telefonNormalize`, `ArizaFotografAlani.tsx`, `seo.ts`, `mappers.ts`, `ensureSeedData`, `SorunTipiSecimi.tsx`, `hizmet-veren-sayim.ts`, `db.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `route.ts`, `route.ts`, `page.tsx`, `route.ts`, `kredi-odeme.ts`, `davet-panel.ts`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `telefonNormalize()` connect `page.tsx` to `page.tsx`, `seo.ts`, `CekiciAyarlarPanel.tsx`, `memnuniyet.ts`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _284 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cekici-email-otp.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08489795918367347 - nodes in this community are weakly interconnected._
- **Should `getSupabaseAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.13257575757575757 - nodes in this community are weakly interconnected._
- **Should `mappers.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12105263157894737 - nodes in this community are weakly interconnected._