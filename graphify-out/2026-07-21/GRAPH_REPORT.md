# Graph Report - acilcozumbul  (2026-07-21)

## Corpus Check
- 359 files · ~378,785 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1516 nodes · 4679 edges · 72 communities (64 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `457bfe71`
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
- [[_COMMUNITY_KayitKontenjanBilgi.tsx|KayitKontenjanBilgi.tsx]]
- [[_COMMUNITY_ArizaFotografAlani.tsx|ArizaFotografAlani.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_NasilCalisirSerit.tsx|NasilCalisirSerit.tsx]]
- [[_COMMUNITY_cerez-onay.ts|cerez-onay.ts]]
- [[_COMMUNITY_payment.ts|payment.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_kredi-odeme.ts|kredi-odeme.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_davet-panel.ts|davet-panel.ts]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_ArizaFotografAlani.tsx|ArizaFotografAlani.tsx]]
- [[_COMMUNITY_cekici-belge.ts|cekici-belge.ts]]
- [[_COMMUNITY_Cekici|Cekici]]
- [[_COMMUNITY_Ölçeklenebilirlik regression smoke checklist|Ölçeklenebilirlik regression smoke checklist]]
- [[_COMMUNITY_verify-teklif-backfill.mjs|verify-teklif-backfill.mjs]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_SorunTipiSecimi.tsx|SorunTipiSecimi.tsx]]

## God Nodes (most connected - your core abstractions)
1. `getSupabaseAdmin()` - 127 edges
2. `ensureSeedData()` - 94 edges
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

## Communities (72 total, 8 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.18
Nodes (21): POST(), POST(), GET(), POST(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder() (+13 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.12
Nodes (25): GET(), GET(), GET(), addSmsKaydi(), escapeXml(), GondericiAdiSorguSonuc, logSmsKaydi(), netgsmGondericiAdlariSorgula() (+17 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.07
Nodes (32): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, metadata (+24 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.20
Nodes (14): config, middleware(), POST(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli(), supabaseEksikEnvAlanlari() (+6 more)

### Community 4 - "seo.ts"
Cohesion: 0.15
Nodes (19): garantiHashHesapla(), garantiXmlDeger(), GARANTI_HATA_KODLARI, garantiKodNormalize(), garantiMesajGenelMi(), garantiMusteriHataMesaji(), garantiYetersizBakiyeMetniMi(), GENEL_MESAJ_ORNEKLERI (+11 more)

### Community 5 - "mappers.ts"
Cohesion: 0.12
Nodes (26): belgeBase64Ayikla(), cekiciBelgeYukle(), IZINLI_MIME, uzanti(), hydrateTalep(), syncTalepIliskileri(), getSupabaseAdmin(), supabaseDbAktif() (+18 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.08
Nodes (42): noktaOku(), POST(), GET(), CekiciRotaPanelProps, embedDirectionsUrl(), googleMapsDirUrl(), MusteriCekiciTakipHarita(), MusteriCekiciTakipHaritaProps (+34 more)

### Community 7 - "ui.tsx"
Cohesion: 0.11
Nodes (31): GET(), haftaBaslangici(), istanbulAyAnahtari(), kazananTeklifFiyati(), GET(), GET(), GET(), GET() (+23 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (34): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+26 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.15
Nodes (20): eslintConfig, main(), GET(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig (+12 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.06
Nodes (95): POST(), POST(), POST(), IZINLI, POST(), GET(), POST(), GET() (+87 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.20
Nodes (17): GET(), PATCH(), POST(), ekleKampanya(), getKampanyaByKod(), getKampanyaKullanimlari(), getKampanyalar(), guncelleKampanya() (+9 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.17
Nodes (36): GET(), rotaKoordinatlari(), POST(), listeDurumuBelirle(), toOzet(), cekiciTalepBolgesineUygunMu(), sehirBeklemeMesaji(), cekiciTalepSorununaUygunMu() (+28 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.18
Nodes (20): GET(), PUT(), davetKayitBaslangicKredisiFromSonuc(), davetKayitBonusTamamla(), davetKayitHazirla(), DavetKayitSonuc, davetKayitBaslangicKredisi(), davetKoduGecerliMi() (+12 more)

### Community 15 - "db.ts"
Cohesion: 0.15
Nodes (26): POST(), GET(), POST(), bolgeOzet(), GET(), POST(), PUT(), POST() (+18 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.12
Nodes (18): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), KayitKontenjanBilgi(), Props, YasalOnayKutusu(), YasalSiteFooter() (+10 more)

### Community 17 - "route.ts"
Cohesion: 0.07
Nodes (54): POST(), POST(), DELETE(), authAnonClient(), authSignIn(), cekiciAuthEmail(), cekiciAuthKullaniciOlustur(), cekiciAuthKullaniciSil() (+46 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.15
Nodes (21): GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI, Step, STEP_SIRA, Spinner() (+13 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.17
Nodes (14): OdemeOnayPage(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, funnelKaydet(), OdemeOnayKayit, odemeOnaySessionKey(), posthogCerezSenkronize(), posthogKampanyaKaydet() (+6 more)

### Community 20 - "page.tsx"
Cohesion: 0.11
Nodes (16): Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps, MemnuniyetFormu() (+8 more)

### Community 21 - "davet-panel.ts"
Cohesion: 0.21
Nodes (15): anlasilanIsSay(), cekiciPuanOzeti, computePuanFromTables(), fiyatGarantiPuaniHesapla(), normalizeTeklif(), ozetFromCounts(), teklifFiyatDegistiMi(), tercihPuaniHesapla() (+7 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.08
Nodes (50): GET(), POST(), POST(), POST(), GET(), GECERLI, POST(), DemoDurum (+42 more)

### Community 24 - "page.tsx"
Cohesion: 0.16
Nodes (23): POST(), GET(), baseUrlFrom(), GET(), POST(), DegerlendirmeRow, getDegerlendirmeByTalepId(), getDegerlendirmelerByCekiciId() (+15 more)

### Community 25 - "kredi-odeme.ts"
Cohesion: 0.23
Nodes (16): POST(), GET(), GET(), POST(), GET(), BekleIcerik(), cekiciPuanOzetleri(), getCekiciById() (+8 more)

### Community 26 - "route.ts"
Cohesion: 0.27
Nodes (12): PATCH(), POST(), sonKullanmaAyir(), tcKimlikGecerliMi(), vergiNoGecerliMi(), istemciIpAl(), faturaAlanlariniDogrula(), getBekleyenOdeme() (+4 more)

### Community 27 - "page.tsx"
Cohesion: 0.11
Nodes (29): CekiciTalepClient(), TalepDurum, CekiciAyarlarPanel(), DavetKoduAyarlari(), KisiselVeriGizlemeAyarlari(), BADGE, CekiciPanelTabs(), Istatistik (+21 more)

### Community 28 - "cekici-email-otp.ts"
Cohesion: 0.22
Nodes (13): POST(), KrediPage(), KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI, KrediPaket, krediPaketBul(), krediPaketOdenecekTL(), KrediPaketTl (+5 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "demo-responses.ts"
Cohesion: 0.60
Nodes (3): GET(), KULLANIMA_ACIK_ILLER, sehirKullanimAcikMi()

### Community 32 - "getCekiciById"
Cohesion: 0.20
Nodes (8): PATCH(), GET(), belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), updateCekiciBelgeDurum(), cekiciPanelOzet, BelgeDurum

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.31
Nodes (10): bildirimRowsFromTalepler(), cekiciToRow(), dataDir, haricRowsFromTalepler(), main(), readJson(), supabase, talepToRow() (+2 more)

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.23
Nodes (7): metadata, PanelChrome(), LINKS, PanelNav(), NavSayacRozet(), PanelNavSayac, usePanelNavSayac()

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
Cohesion: 0.16
Nodes (17): MusteriAnaSayfaIcerik(), SorunTipiSecimi(), SorunTipiSecimiProps, HIZMET_QUERY_HARITASI, hizmetQuerydenSorunTipi(), SORUN_ARAC_MODELI_TIPLERI, SORUN_CAGRI_BUTON, SORUN_FOTOGRAF_TIPLERI (+9 more)

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
Cohesion: 0.17
Nodes (22): POST(), POST(), getCekicilerBildirimAdaylari(), updateTalep(), demoKatilMesaji(), anlasamadiSonrasiIhaleyiSurdur(), cekiciBildirimKrediTutari(), cekiciPremiumSmsAktifMi() (+14 more)

### Community 53 - "KayitKontenjanBilgi.tsx"
Cohesion: 0.08
Nodes (23): GET(), GET(), Saglik, hizmetBolgeleriFlatten(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), cekiciFromRow() (+15 more)

### Community 54 - "ArizaFotografAlani.tsx"
Cohesion: 0.23
Nodes (11): HaritaNokta, PanelCekiciHarita(), RENK, SehirAdet, haritaSehirNoktalari(), haritaYaricapLog(), IlKoordinat, ilKoordinatBul() (+3 more)

### Community 55 - "route.ts"
Cohesion: 0.13
Nodes (9): OnayIcerik(), Adim, SmsKaydi, BrandLogoYazili(), MobileShell(), MobileShellProps, PanelGirisFormProps, Field (+1 more)

### Community 56 - "route.ts"
Cohesion: 0.15
Nodes (15): adimAciklamaMetni(), Props, SorunAkisOzeti(), SorunAkisOzetiIcerik(), SorunSecimi(), SorunSecimiProps, TextArea(), CEKICI_ADIMLAR (+7 more)

### Community 57 - "NasilCalisirSerit.tsx"
Cohesion: 0.19
Nodes (8): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesiProps, HizmetVerenSayimPanel(), PanelGirisForm(), useHizmetVerenSayim(), HizmetVerenSayimOzet

### Community 58 - "cerez-onay.ts"
Cohesion: 0.10
Nodes (39): geist, metadata, RootLayout(), viewport, CerezOnayBanner(), Gorunum, tercihKaydet(), GoogleAnalytics() (+31 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.22
Nodes (8): ANCHOR_IDS, AVANTAJLAR, CekiciKayitLanding(), CekiciKayitLandingProps, GUVEN_MADDELERI, HIZMET_BOLGESI, IS_AKISI, YORUMLAR

### Community 61 - "kredi-odeme.ts"
Cohesion: 0.24
Nodes (6): GET(), DavetKullanimRow, DavetKullanimSatir, DavetLiderSatir, DavetPanelOzet, getDavetPanelVerisi()

### Community 62 - "page.tsx"
Cohesion: 0.36
Nodes (8): kayitliAdSoyadUygula(), depolama(), MusteriProfil, musteriProfilKaydet(), musteriProfilOku(), okuHarita(), ProfilHaritasi, yazHarita()

### Community 63 - "davet-panel.ts"
Cohesion: 0.33
Nodes (7): POST(), BelgeYuklemeAlani(), BelgeDurumResponse, durumEtiket(), OnayliCekiciHesap(), olusturBekleyenRozetOdeme(), rozetIndirimYuzde()

### Community 64 - "layout.tsx"
Cohesion: 0.29
Nodes (5): FormAdimi, NASIL_ADIMLAR, NasilAdim, NasilCalisirSerit(), Props

### Community 65 - "ArizaFotografAlani.tsx"
Cohesion: 0.50
Nodes (3): ArizaFotografAlani(), ArizaFotografAlaniProps, fotografSikistir()

### Community 66 - "cekici-belge.ts"
Cohesion: 0.60
Nodes (4): GET(), GET(), kayitKoduDogrula(), kampanyaKoduSutunuVar()

### Community 70 - "Cekici"
Cohesion: 0.21
Nodes (6): gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi, satirFromCekici()

### Community 74 - "page.tsx"
Cohesion: 0.08
Nodes (15): Gorunum, SehirSiralama, DegerlendirmeSatir, Ozet, BOS_FORM, KampanyaSatir, KullanimSatir, Ozet (+7 more)

### Community 79 - "SorunTipiSecimi.tsx"
Cohesion: 0.14
Nodes (19): BolgeApiData, BolgeAyarlari(), BolgeAyarlariProps, BolgeApiData, DavetKoduDurum, GUNLER, MusaitlikAyarlari(), Durum (+11 more)

## Knowledge Gaps
- **294 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+289 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `mappers.ts` to `demo-oturum.ts`, `telefonNormalize`, `ui.tsx`, `CekiciPanelTabs.tsx`, `sms-provider.ts`, `memnuniyet.ts`, `db.ts`, `route.ts`, `davet-panel.ts`, `route.ts`, `page.tsx`, `kredi-odeme.ts`, `route.ts`, `cekici-email-otp.ts`, `getCekiciById`, `CerezOnayBanner.tsx`, `KayitKontenjanBilgi.tsx`, `kredi-odeme.ts`, `davet-panel.ts`, `cekici-belge.ts`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `telefonNormalize()` connect `CekiciPanelTabs.tsx` to `demo-oturum.ts`, `route.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `page.tsx`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `Card()` connect `page.tsx` to `getCekiciById`, `ArizaFotografAlani.tsx`, `layout.tsx`, `Cekici`, `ensureSeedData`, `SorunTipiSecimi.tsx`, `hizmet-veren-sayim.ts`, `MusteriAnaSayfa.tsx`, `ensureSeedData`, `page.tsx`, `route.ts`, `KayitKontenjanBilgi.tsx`, `route.ts`, `NasilCalisirSerit.tsx`, `page.tsx`, `route.ts`, `kredi-odeme.ts`, `davet-panel.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _294 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `telefonNormalize` be split into smaller, more focused modules?**
  _Cohesion score 0.11724137931034483 - nodes in this community are weakly interconnected._
- **Should `cekici-email-otp.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07005649717514124 - nodes in this community are weakly interconnected._
- **Should `mappers.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12477718360071301 - nodes in this community are weakly interconnected._