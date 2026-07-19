# Graph Report - acilcozumbul  (2026-07-19)

## Corpus Check
- 334 files · ~368,527 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1403 nodes · 4364 edges · 62 communities (56 shown, 6 thin omitted)
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
- [[_COMMUNITY_davet-kayit.ts|davet-kayit.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_ArizaFotografAlani.tsx|ArizaFotografAlani.tsx]]
- [[_COMMUNITY_sorun-akis-aciklama.ts|sorun-akis-aciklama.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_cerez-onay.ts|cerez-onay.ts]]
- [[_COMMUNITY_payment.ts|payment.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_HizmetVerenSayimGostergesi.tsx|HizmetVerenSayimGostergesi.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]

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

## Communities (62 total, 6 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.11
Nodes (39): POST(), POST(), POST(), GET(), GECERLI, POST(), demoBaslangicDurumu(), DemoOturumDurum (+31 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.14
Nodes (27): POST(), GET(), POST(), PATCH(), POST(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula() (+19 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.08
Nodes (38): eslintConfig, main(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku() (+30 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.06
Nodes (65): GET(), GET(), PUT(), GET(), DELETE(), GET(), GET(), PATCH() (+57 more)

### Community 4 - "seo.ts"
Cohesion: 0.15
Nodes (26): POST(), GET(), POST(), GET(), POST(), POST(), GET(), GET() (+18 more)

### Community 5 - "mappers.ts"
Cohesion: 0.25
Nodes (12): POST(), POST(), KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI, KrediPaket, krediPaketBul(), krediPaketOdenecekTL(), KrediPaketTl (+4 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.11
Nodes (33): noktaOku(), POST(), CekiciRotaPanel(), CekiciRotaPanelProps, embedDirectionsUrl(), RotaSureleri, embedDirectionsUrl(), googleMapsDirUrl() (+25 more)

### Community 7 - "ui.tsx"
Cohesion: 0.15
Nodes (12): GET(), KrediPage(), belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), DemoDurum, DemoSms, kalanSureFormat() (+4 more)

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
Nodes (12): GET(), mesafeKmHaversine(), googleAcikHedefOnerileri(), GooglePlaceRow, placesTextSearch(), HedefOneriSecenekleri, KonumOneri, SORUN_ARAMALARI (+4 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.10
Nodes (33): GET(), POST(), addSmsKaydi(), anlasamadiSonrasiIhaleyiSurdur(), MUSTERI_OTP_TIPLERI, MUSTERI_SMS_IPTAL, MusteriSmsTipi, notifyCekiciIptal() (+25 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.11
Nodes (13): gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi, satirFromCekici(), AnlasmaDurumu, KrediOdeme (+5 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.16
Nodes (24): POST(), GET(), baseUrlFrom(), GET(), POST(), DegerlendirmeRow, getDegerlendirmeByTalepId(), getDegerlendirmelerByCekiciId() (+16 more)

### Community 15 - "db.ts"
Cohesion: 0.30
Nodes (10): GET(), POST(), sonKullanmaAyir(), istemciIpAl(), getBekleyenOdeme(), guncelleBekleyenOdemeFatura(), tamamlaOdeme(), odemeFromRow() (+2 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.08
Nodes (15): DegerlendirmeSatir, Ozet, BOS_FORM, KampanyaSatir, KullanimSatir, Ozet, Ozet, Saglik (+7 more)

### Community 17 - "route.ts"
Cohesion: 0.05
Nodes (41): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, metadata (+33 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.14
Nodes (23): ArizaFotografAlani(), GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI, funnelKaydet(), Step (+15 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.12
Nodes (21): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesi(), HizmetVerenSayimGostergesiProps, useAnimatedNumber(), HizmetVerenSayimPanel(), PanelGirisForm() (+13 more)

### Community 20 - "page.tsx"
Cohesion: 0.14
Nodes (13): Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps, MemnuniyetFormu() (+5 more)

### Community 21 - "davet-panel.ts"
Cohesion: 0.15
Nodes (13): GET(), GET(), GET(), GET(), GET(), GET(), GET(), getCekiciler() (+5 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.22
Nodes (19): POST(), POST(), GET(), POST(), GET(), BekleIcerik(), getCekiciById(), getTalepById() (+11 more)

### Community 24 - "page.tsx"
Cohesion: 0.38
Nodes (5): hedefAltYazi(), KonumGuncellemeGostergesi(), renkKaristir(), TURUNCU, YESIL

### Community 25 - "MobileShell.tsx"
Cohesion: 0.10
Nodes (12): OdemeOnayPage(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, Adim, SmsKaydi, BrandLogoYazili(), MobileShell(), MobileShellProps (+4 more)

### Community 26 - "funnel.ts"
Cohesion: 0.16
Nodes (36): GET(), rotaKoordinatlari(), POST(), listeDurumuBelirle(), toOzet(), TalepOzet, cekiciTalepBolgesineUygunMu(), cekiciTalepSorununaUygunMu() (+28 more)

### Community 27 - "page.tsx"
Cohesion: 0.12
Nodes (26): CekiciTalepClient(), TalepDurum, CekiciAyarlarPanel(), DavetKoduAyarlari(), KisiselVeriGizlemeAyarlari(), BADGE, CekiciPanelTabs(), Istatistik (+18 more)

### Community 28 - "route.ts"
Cohesion: 0.46
Nodes (7): cekiciPuanOzeti, fiyatGarantiPuaniHesapla(), normalizeTeklif(), teklifFiyatDegistiMi(), tercihPuaniHesapla(), cekiciHizmetPuani, gorunurTercihPuani()

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "route.ts"
Cohesion: 0.43
Nodes (5): OnayIcerik(), KayitIcerik(), KULLANIMA_ACIK_ILLER, sehirBeklemeMesaji(), sehirKullanimAcikMi()

### Community 32 - "posthog-client.ts"
Cohesion: 0.83
Nodes (3): GET(), istemciIp(), ozelIp()

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.39
Nodes (7): cekiciToRow(), dataDir, main(), readJson(), supabase, talepToRow(), upsertBatch()

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.32
Nodes (4): metadata, PanelChrome(), LINKS, PanelNav()

### Community 35 - "NasilCalisirSerit.tsx"
Cohesion: 0.22
Nodes (18): POST(), MusteriAnaSayfa(), addTalep(), SORUN_ARAC_MODELI_TIPLERI, SORUN_CAGRI_BUTON, SORUN_FOTOGRAF_TIPLERI, SORUN_HEDEF_KONUM_ATLANIR, sorunAracModeliGerekliMi() (+10 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "env.ts"
Cohesion: 0.20
Nodes (14): config, middleware(), POST(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli(), supabaseEksikEnvAlanlari() (+6 more)

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.83
Nodes (3): cekiciMusaitMi(), istanbulGunVeDakika(), saatMetniDakika()

### Community 41 - "sitemap.ts"
Cohesion: 0.13
Nodes (21): BolgeApiData, BolgeAyarlari(), BolgeAyarlariProps, BolgeApiData, DavetKoduDurum, GUNLER, MusaitlikAyarlari(), Durum (+13 more)

### Community 53 - "davet-kayit.ts"
Cohesion: 0.10
Nodes (41): bolgeOzet(), GET(), POST(), PUT(), cekiciTalepIlIlceyeUygunMu(), cekiciTalepMenzileUygunMu(), filtreleCekicilerBolge(), ilceEslesir() (+33 more)

### Community 54 - "page.tsx"
Cohesion: 0.05
Nodes (105): POST(), POST(), POST(), POST(), POST(), POST(), IZINLI, POST() (+97 more)

### Community 55 - "ArizaFotografAlani.tsx"
Cohesion: 0.27
Nodes (7): BelgeYuklemeAlani(), Props, BelgeDurumResponse, durumEtiket(), OnayliCekiciHesap(), OnayliCekiciRozeti(), rozetIndirimYuzde()

### Community 56 - "sorun-akis-aciklama.ts"
Cohesion: 0.36
Nodes (8): kayitliAdSoyadUygula(), depolama(), MusteriProfil, musteriProfilKaydet(), musteriProfilOku(), okuHarita(), ProfilHaritasi, yazHarita()

### Community 57 - "route.ts"
Cohesion: 0.16
Nodes (18): GET(), PATCH(), hizmetBolgeleriFlatten(), countCekiciler(), updateCekiciBelgeDurum(), cekiciFromRow(), CekiciRow, cekiciToRow() (+10 more)

### Community 58 - "cerez-onay.ts"
Cohesion: 0.12
Nodes (27): CerezOnayBanner(), MemnuniyetFormuProps, YildizPuani(), YildizPuaniProps, cerezAnalitikAktif(), cerezBannerGosterilmeli(), cerezBannerKapaliMi(), cerezBannerKapat() (+19 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.12
Nodes (13): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, AVANTAJLAR, CekiciKayitLanding(), CekiciKayitLandingProps, GUVEN_MADDELERI, IS_AKISI (+5 more)

### Community 62 - "HizmetVerenSayimGostergesi.tsx"
Cohesion: 0.29
Nodes (5): FormAdimi, NASIL_ADIMLAR, NasilAdim, NasilCalisirSerit(), Props

### Community 65 - "route.ts"
Cohesion: 0.43
Nodes (6): GET(), haftaBaslangici(), istanbulAyAnahtari(), kazananTeklifFiyati(), GET(), getTalepler()

## Knowledge Gaps
- **280 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+275 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `getSupabaseAdmin` to `demo-oturum.ts`, `telefonNormalize`, `route.ts`, `NasilCalisirSerit.tsx`, `seo.ts`, `mappers.ts`, `sms-provider.ts`, `memnuniyet.ts`, `db.ts`, `davet-panel.ts`, `page.tsx`, `route.ts`, `route.ts`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `Card()` connect `hizmet-veren-sayim.ts` to `getSupabaseAdmin`, `ensureSeedData`, `ui.tsx`, `sitemap.ts`, `CekiciAyarlarPanel.tsx`, `MusteriAnaSayfa.tsx`, `ensureSeedData`, `page.tsx`, `ArizaFotografAlani.tsx`, `MobileShell.tsx`, `cerez-onay.ts`, `page.tsx`, `route.ts`, `HizmetVerenSayimGostergesi.tsx`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `ensureSeedData()` connect `seo.ts` to `route.ts`, `telefonNormalize`, `getSupabaseAdmin`, `NasilCalisirSerit.tsx`, `mappers.ts`, `ui.tsx`, `sms-provider.ts`, `memnuniyet.ts`, `db.ts`, `davet-kayit.ts`, `page.tsx`, `route.ts`, `davet-panel.ts`, `route.ts`, `funnel.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _280 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `demo-oturum.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10726950354609929 - nodes in this community are weakly interconnected._
- **Should `telefonNormalize` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `cekici-email-otp.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08489795918367347 - nodes in this community are weakly interconnected._