# Graph Report - acilcozumbul  (2026-07-19)

## Corpus Check
- 344 files · ~372,754 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1456 nodes · 4533 edges · 71 communities (60 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a78c87dc`
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
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_musteri-profil.ts|musteri-profil.ts]]
- [[_COMMUNITY_NasilCalisirSerit.tsx|NasilCalisirSerit.tsx]]
- [[_COMMUNITY_teklif-db.ts|teklif-db.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
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

## Communities (71 total, 11 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.05
Nodes (109): GET(), GET(), POST(), GET(), rotaKoordinatlari(), POST(), GET(), listeDurumuBelirle() (+101 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.21
Nodes (19): POST(), GET(), POST(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder(), EmailOtpKayit (+11 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.16
Nodes (19): garantiHashHesapla(), garantiXmlDeger(), GARANTI_HATA_KODLARI, garantiKodNormalize(), garantiMesajGenelMi(), garantiMusteriHataMesaji(), garantiYetersizBakiyeMetniMi(), GENEL_MESAJ_ORNEKLERI (+11 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.09
Nodes (46): GET(), GET(), PUT(), GET(), POST(), GET(), PATCH(), POST() (+38 more)

### Community 4 - "seo.ts"
Cohesion: 0.16
Nodes (21): GET(), POST(), POST(), GET(), PUT(), saatGecerliMi(), GET(), PUT() (+13 more)

### Community 5 - "mappers.ts"
Cohesion: 0.15
Nodes (17): POST(), POST(), POST(), POST(), POST(), getCurrentCekici(), getCekiciByToken(), KREDI_PAKET_TL_LISTESI (+9 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.10
Nodes (33): noktaOku(), POST(), GET(), CekiciRotaPanel(), CekiciRotaPanelProps, embedDirectionsUrl(), RotaSureleri, embedDirectionsUrl() (+25 more)

### Community 7 - "ui.tsx"
Cohesion: 0.08
Nodes (15): DegerlendirmeSatir, Ozet, BOS_FORM, KampanyaSatir, KullanimSatir, Ozet, Ozet, Saglik (+7 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (34): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+26 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.06
Nodes (61): POST(), GET(), GET(), POST(), baseUrlFrom(), GET(), POST(), GET() (+53 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.21
Nodes (15): POST(), DELETE(), GET(), authAnonClient(), authSignIn(), cekiciAuthEmail(), cekiciAuthKullaniciOlustur(), cekiciAuthKullaniciSil() (+7 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.18
Nodes (16): GET(), GET(), GET(), GET(), countSmsLog(), countTalepler(), getSmsLog(), getTaleplerSince() (+8 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.21
Nodes (6): gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi, satirFromCekici()

### Community 14 - "memnuniyet.ts"
Cohesion: 0.16
Nodes (23): anlasilanIsSay(), cekiciPuanOzeti, computePuanFromTables(), fiyatGarantiPuaniHesapla(), normalizeTeklif(), ozetFromCounts(), tercihPuaniHesapla(), cekiciHizmetPuani (+15 more)

### Community 15 - "db.ts"
Cohesion: 0.17
Nodes (18): PATCH(), GET(), POST(), sonKullanmaAyir(), POST(), tcKimlikGecerliMi(), vergiNoGecerliMi(), istemciIpAl() (+10 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.20
Nodes (14): KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, funnelKaydet(), cerezAnalitikAktif(), cerezOnayOku(), OdemeOnayKayit, odemeOnaySessionKey(), posthogCerezSenkronize() (+6 more)

### Community 17 - "route.ts"
Cohesion: 0.21
Nodes (11): metadata, metadata, metadata, metadata, metadata, YasalBolum(), YasalListe(), YasalSayfaShell() (+3 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.12
Nodes (25): ArizaFotografAlani(), GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI, Step, STEP_SIRA (+17 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.18
Nodes (14): CekiciKayitLayout(), metadata, HomePage(), metadata, JsonLd(), JsonLdProps, SssBolumu(), CEKICI_KAYIT_SEO (+6 more)

### Community 20 - "page.tsx"
Cohesion: 0.11
Nodes (17): BekleIcerik(), Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps (+9 more)

### Community 21 - "davet-panel.ts"
Cohesion: 0.17
Nodes (19): eslintConfig, main(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku() (+11 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.24
Nodes (6): GET(), DavetKullanimRow, DavetKullanimSatir, DavetLiderSatir, DavetPanelOzet, getDavetPanelVerisi()

### Community 24 - "page.tsx"
Cohesion: 0.38
Nodes (5): hedefAltYazi(), KonumGuncellemeGostergesi(), renkKaristir(), TURUNCU, YESIL

### Community 25 - "MobileShell.tsx"
Cohesion: 0.24
Nodes (8): geist, metadata, RootLayout(), viewport, CerezOnayBanner(), PostHogProvider(), gtagConsentBootstrapInline(), SEO_ANAHTARLAR

### Community 26 - "funnel.ts"
Cohesion: 0.40
Nodes (5): DemoDurum, DemoSms, kalanSureFormat(), PanelDemoPage(), SIMULE_ADIMLAR

### Community 27 - "page.tsx"
Cohesion: 0.11
Nodes (27): CekiciTalepClient(), TalepDurum, CekiciAyarlarPanel(), DavetKoduAyarlari(), KisiselVeriGizlemeAyarlari(), BADGE, CekiciPanelTabs(), Istatistik (+19 more)

### Community 28 - "route.ts"
Cohesion: 0.60
Nodes (4): belgeBase64Ayikla(), cekiciBelgeYukle(), IZINLI_MIME, uzanti()

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
Cohesion: 0.12
Nodes (24): GET(), hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesi(), HizmetVerenSayimGostergesiProps, useAnimatedNumber(), HizmetVerenSayimPanel() (+16 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "env.ts"
Cohesion: 0.18
Nodes (14): config, middleware(), POST(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli(), supabaseEksikEnvAlanlari() (+6 more)

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.17
Nodes (22): POST(), MusteriAnaSayfa(), SorunTipiSecimi(), SorunTipiSecimiProps, addTalep(), SORUN_ARAC_MODELI_TIPLERI, SORUN_CAGRI_BUTON, SORUN_FOTOGRAF_TIPLERI (+14 more)

### Community 41 - "sitemap.ts"
Cohesion: 0.17
Nodes (17): BolgeApiData, BolgeAyarlari(), BolgeAyarlariProps, BolgeApiData, DavetKoduDurum, GUNLER, MusaitlikAyarlari(), Durum (+9 more)

### Community 53 - "davet-kayit.ts"
Cohesion: 0.08
Nodes (51): bolgeOzet(), GET(), POST(), PUT(), GET(), cekiciTalepIlIlceyeUygunMu(), cekiciTalepMenzileUygunMu(), filtreleCekicilerBolge() (+43 more)

### Community 54 - "page.tsx"
Cohesion: 0.07
Nodes (87): POST(), POST(), GET(), POST(), PUT(), POST(), POST(), IZINLI (+79 more)

### Community 55 - "ArizaFotografAlani.tsx"
Cohesion: 0.33
Nodes (6): BelgeYuklemeAlani(), Props, BelgeDurumResponse, durumEtiket(), OnayliCekiciHesap(), rozetIndirimYuzde()

### Community 57 - "route.ts"
Cohesion: 0.19
Nodes (9): GET(), GET(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), krediOdemeFromRow(), KrediOdemeRow, krediOdemeToRow() (+1 more)

### Community 58 - "cerez-onay.ts"
Cohesion: 0.18
Nodes (16): GoogleAnalytics(), cerezBannerGosterilmeli(), cerezBannerKapaliMi(), cerezBannerKapat(), cerezOnayKaydet(), CerezOnayTercihi, GTAG_CONSENT_DENIED, GTAG_CONSENT_GRANTED (+8 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.22
Nodes (5): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), YasalSiteFooter()

### Community 61 - "kredi-odeme.ts"
Cohesion: 0.12
Nodes (10): OnayIcerik(), Adim, SifremiUnuttumPage(), SmsKaydi, BrandLogoYazili(), MobileShell(), MobileShellProps, PanelGirisFormProps (+2 more)

### Community 63 - "davet-panel.ts"
Cohesion: 0.15
Nodes (15): adimAciklamaMetni(), Props, SorunAkisOzeti(), SorunAkisOzetiIcerik(), SorunSecimi(), SorunSecimiProps, TextArea(), CEKICI_ADIMLAR (+7 more)

### Community 65 - "route.ts"
Cohesion: 0.26
Nodes (11): GET(), haftaBaslangici(), istanbulAyAnahtari(), kazananTeklifFiyati(), getTaleplerByKazananCekici(), syncTalepIliskileri(), addBildirilenCekici(), countHaricByCekici() (+3 more)

### Community 66 - "route.ts"
Cohesion: 0.33
Nodes (6): GET(), KayitKontenjanBilgi(), Props, KayitKontenjanDurum, kayitKontenjanHesapla(), countCekiciler()

### Community 67 - "musteri-profil.ts"
Cohesion: 0.36
Nodes (8): kayitliAdSoyadUygula(), depolama(), MusteriProfil, musteriProfilKaydet(), musteriProfilOku(), okuHarita(), ProfilHaritasi, yazHarita()

### Community 68 - "NasilCalisirSerit.tsx"
Cohesion: 0.29
Nodes (5): FormAdimi, NASIL_ADIMLAR, NasilAdim, NasilCalisirSerit(), Props

### Community 69 - "teklif-db.ts"
Cohesion: 0.13
Nodes (25): GET(), hizmetBolgeleriFlatten(), bugunBaslangicIso(), getCekiciByDogrulanmisFaturaEposta(), getTalepler(), getTaleplerBugun(), getTaleplerSayfali(), hydrateTalep() (+17 more)

### Community 70 - "page.tsx"
Cohesion: 0.14
Nodes (13): KrediPage(), OdemeOnayPage(), belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), AVANTAJLAR, CekiciKayitLanding(), CekiciKayitLandingProps (+5 more)

## Knowledge Gaps
- **282 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+277 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `memnuniyet.ts` to `demo-oturum.ts`, `telefonNormalize`, `route.ts`, `getSupabaseAdmin`, `seo.ts`, `teklif-db.ts`, `mappers.ts`, `route.ts`, `route.ts`, `google-maps.ts`, `CekiciPanelTabs.tsx`, `sms-provider.ts`, `db.ts`, `page.tsx`, `route.ts`, `route.ts`, `route.ts`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `Card()` connect `ui.tsx` to `route.ts`, `NasilCalisirSerit.tsx`, `NasilCalisirSerit.tsx`, `page.tsx`, `ensureSeedData`, `sitemap.ts`, `CekiciAyarlarPanel.tsx`, `hizmet-veren-sayim.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `ArizaFotografAlani.tsx`, `route.ts`, `route.ts`, `funnel.ts`, `page.tsx`, `route.ts`, `kredi-odeme.ts`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `getCurrentCekici()` connect `mappers.ts` to `demo-oturum.ts`, `route.ts`, `telefonNormalize`, `getSupabaseAdmin`, `seo.ts`, `ensureSeedData`, `CekiciPanelTabs.tsx`, `db.ts`, `ensureSeedData`, `davet-kayit.ts`, `davet-panel.ts`, `page.tsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _282 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `demo-oturum.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05442602439787301 - nodes in this community are weakly interconnected._
- **Should `getSupabaseAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.09077380952380952 - nodes in this community are weakly interconnected._
- **Should `mappers.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1452991452991453 - nodes in this community are weakly interconnected._