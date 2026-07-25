# Graph Report - acilcozumbul  (2026-07-25)

## Corpus Check
- 431 files · ~409,111 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1813 nodes · 5758 edges · 72 communities (63 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.64)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `72d9be25`
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
- [[_COMMUNITY_MusteriAnaSayfa.tsx|MusteriAnaSayfa.tsx]]
- [[_COMMUNITY_ensureSeedData|ensureSeedData]]
- [[_COMMUNITY_page.tsx|page.tsx]]
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
- [[_COMMUNITY_kayit-kodu.ts|kayit-kodu.ts]]
- [[_COMMUNITY_migrate-json-to-supabase.mjs|migrate-json-to-supabase.mjs]]
- [[_COMMUNITY_PanelChrome.tsx|PanelChrome.tsx]]
- [[_COMMUNITY_NasilCalisirSerit.tsx|NasilCalisirSerit.tsx]]
- [[_COMMUNITY_Supabase veritabanı|Supabase veritabanı]]
- [[_COMMUNITY_Video demo modu|Video demo modu]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_README|README.md]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_Yapılacaklar|Yapılacaklar]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_AGENTS|AGENTS.md]]
- [[_COMMUNITY_next.config.ts|next.config.ts]]
- [[_COMMUNITY_postcss.config.mjs|postcss.config.mjs]]
- [[_COMMUNITY_CerezOnayBanner.tsx|CerezOnayBanner.tsx]]
- [[_COMMUNITY_KayitKontenjanBilgi.tsx|KayitKontenjanBilgi.tsx]]
- [[_COMMUNITY_seo.ts|seo.ts]]
- [[_COMMUNITY_cekici-puan.ts|cekici-puan.ts]]
- [[_COMMUNITY_cerez-onay.ts|cerez-onay.ts]]
- [[_COMMUNITY_payment.ts|payment.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_kredi-odeme.ts|kredi-odeme.ts]]
- [[_COMMUNITY_getSupabaseAdmin|getSupabaseAdmin]]
- [[_COMMUNITY_davet-panel.ts|davet-panel.ts]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_PanelCekiciHarita.tsx|PanelCekiciHarita.tsx]]
- [[_COMMUNITY_toplu-sms-gecmis-db.ts|toplu-sms-gecmis-db.ts]]
- [[_COMMUNITY_Ölçeklenebilirlik regression smoke checklist|Ölçeklenebilirlik regression smoke checklist]]
- [[_COMMUNITY_verify-teklif-backfill.mjs|verify-teklif-backfill.mjs]]
- [[_COMMUNITY_cekici-sifre-otp.ts|cekici-sifre-otp.ts]]
- [[_COMMUNITY_KayitKontenjanBilgi.tsx|KayitKontenjanBilgi.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_kredi-fiyat.ts|kredi-fiyat.ts]]

## God Nodes (most connected - your core abstractions)
1. `getSupabaseAdmin()` - 172 edges
2. `ensureSeedData()` - 102 edges
3. `telefonNormalize()` - 78 edges
4. `getCurrentCekici()` - 68 edges
5. `telefonGecerliMi()` - 56 edges
6. `Card()` - 52 edges
7. `getCekiciById()` - 37 edges
8. `updateCekici()` - 36 edges
9. `Btn()` - 35 edges
10. `smsBaseUrl()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `middleware()` --calls--> `updatePanelSession()`  [EXTRACTED]
  middleware.ts → src/lib/supabase/middleware.ts
- `main()` --calls--> `garantiYapilandirildi()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/config.ts
- `main()` --calls--> `garantiSmokeKartOku()`  [INFERRED]
  scripts/garanti-smoke.ts → src/lib/garanti/smoke-kart.ts
- `main()` --calls--> `garantiYapilandirmaOzeti()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/config.ts
- `main()` --calls--> `garantiKrediOdemesiYap()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/payment.ts

## Import Cycles
- None detected.

## Communities (72 total, 9 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.22
Nodes (26): POST(), POST(), POST(), IZINLI, POST(), POST(), POST(), getCekiciByTelefon() (+18 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.06
Nodes (60): GET(), POST(), POST(), GET(), generateMetadata(), KayitFunnelPage(), Props, CekiciKayitKontrolSayfa() (+52 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.18
Nodes (23): GET(), GET(), POST(), getDogrulanmisTelefon(), musteriTelCookieDegeri(), musteriTelCookieTemizle(), ayniIstanbulGunuMu(), bekleyenOtpBilgisi() (+15 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.08
Nodes (39): eslintConfig, main(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku() (+31 more)

### Community 4 - "seo.ts"
Cohesion: 0.38
Nodes (11): envInt(), guvenlikSay(), IP_LIMIT(), IP_SAAT(), OTP_IP_DK(), OTP_IP_LIMIT(), pencereBaslangic(), talepFraudKontrol() (+3 more)

### Community 5 - "mappers.ts"
Cohesion: 0.29
Nodes (8): GET(), GET(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), krediOdemeFromRow(), KrediOdemeRow, krediOdemeToRow()

### Community 6 - "ensureSeedData"
Cohesion: 0.19
Nodes (18): POST(), GET(), cekiciPuanOzetleri(), teklifFiyatDegistiMi(), isDemoTalepId(), demoTalepBul(), demoTalepGetir(), demoTeklifSec() (+10 more)

### Community 7 - "ui.tsx"
Cohesion: 0.13
Nodes (21): POST(), GET(), POST(), GET(), POST(), POST(), GET(), PUT() (+13 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (35): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+27 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.09
Nodes (27): GenelTelefon, KampanyaSablon, KuyrukIs, kuyrukIsBaslik(), ListeAlici, ListeOzet, OncekiMod, PanelTopluSmsPage() (+19 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.05
Nodes (60): POST(), hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimAlani(), HizmetVerenSayimGostergesi(), HizmetVerenSayimGostergesiProps, useAnimatedNumber() (+52 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.07
Nodes (29): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, metadata (+21 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.15
Nodes (20): GET(), PATCH(), GET(), hizmetBolgeleriFlatten(), countCekiciler(), countCekicilerBelgeDurum(), countTalepler(), updateCekiciBelgeDurum() (+12 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.38
Nodes (5): hedefAltYazi(), KonumGuncellemeGostergesi(), renkKaristir(), TURUNCU, YESIL

### Community 15 - "db.ts"
Cohesion: 0.22
Nodes (25): GET(), rotaKoordinatlari(), POST(), listeDurumuBelirle(), toOzet(), KULLANIMA_ACIK_ILLER, sehirBeklemeMesaji(), sehirKullanimAcikMi() (+17 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.11
Nodes (20): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), KayitKontenjanBilgi(), Props, Props, YasalOnayKutusu() (+12 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.10
Nodes (29): GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI, ArizaFotografAlani, HizmetVerenSayimAlani, KonumIzniYardim (+21 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.04
Nodes (28): SmsKaydi, DegerlendirmeSatir, Ozet, DemoDurum, DemoSms, kalanSureFormat(), PanelDemoPage(), SIMULE_ADIMLAR (+20 more)

### Community 20 - "page.tsx"
Cohesion: 0.11
Nodes (17): BekleIcerik(), Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps (+9 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.08
Nodes (25): OnayIcerik(), KrediPage(), OdemeOnayPage(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, Adim, SifremiUnuttumPage(), BrandLogoYazili() (+17 more)

### Community 24 - "page.tsx"
Cohesion: 0.13
Nodes (31): POST(), GET(), baseUrlFrom(), GET(), POST(), GET(), PanelLinkHaritasiPage(), getTalepById() (+23 more)

### Community 25 - "kredi-odeme.ts"
Cohesion: 0.11
Nodes (31): cekiciTalepBolgesineUygunMu(), cekiciTalepMenzileUygunMu(), filtreleCekicilerBolge(), konumCekici(), cekiciKonumGuncelMi(), cekiciMusaitMi(), istanbulGunVeDakika(), saatMetniDakika() (+23 more)

### Community 26 - "route.ts"
Cohesion: 0.23
Nodes (16): Ctx, DELETE(), panelKullanici(), PATCH(), GET(), panelKullanici(), POST(), guncelleSmsSablon() (+8 more)

### Community 27 - "page.tsx"
Cohesion: 0.10
Nodes (30): CekiciTalepClient(), TalepDurum, CekiciKart(), Gorunum, SehirSiralama, CekiciAyarlarPanel(), DavetKoduAyarlari(), KisiselVeriGizlemeAyarlari() (+22 more)

### Community 28 - "cekici-email-otp.ts"
Cohesion: 0.07
Nodes (55): GET(), haftaBaslangici(), istanbulAyAnahtari(), kazananTeklifFiyati(), GET(), DELETE(), cekiciAuthKullaniciSil(), belgeBase64Ayikla() (+47 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "demo-responses.ts"
Cohesion: 0.19
Nodes (21): POST(), POST(), GET(), POST(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder() (+13 more)

### Community 32 - "kayit-kodu.ts"
Cohesion: 0.18
Nodes (20): POST(), authAnonClient(), authSignIn(), cekiciAuthEmail(), cekiciAuthKullaniciOlustur(), cekiciAuthSifreDogrula(), cekiciAuthSifreGuncelle(), cekiciSifreyiAuthaTasi() (+12 more)

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.31
Nodes (10): bildirimRowsFromTalepler(), cekiciToRow(), dataDir, haricRowsFromTalepler(), main(), readJson(), supabase, talepToRow() (+2 more)

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.23
Nodes (7): metadata, PanelChrome(), LINKS, PanelNav(), NavSayacRozet(), PanelNavSayac, usePanelNavSayac()

### Community 35 - "NasilCalisirSerit.tsx"
Cohesion: 0.14
Nodes (28): POST(), panelKullanici(), POST(), GET(), panelKullanici(), POST(), register(), sms50VaryantMi() (+20 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "route.ts"
Cohesion: 0.07
Nodes (47): noktaOku(), POST(), GET(), GET(), CekiciRotaPanel(), CekiciRotaPanelProps, embedDirectionsUrl(), RotaSureleri (+39 more)

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.14
Nodes (21): bolgeOzet(), GET(), POST(), PUT(), POST(), GET(), GET(), GET() (+13 more)

### Community 52 - "CerezOnayBanner.tsx"
Cohesion: 0.09
Nodes (43): POST(), GET(), POST(), POST(), addSmsKaydi(), getCekiciById(), getCekicilerBildirimAdaylari(), updateTalep() (+35 more)

### Community 53 - "KayitKontenjanBilgi.tsx"
Cohesion: 0.22
Nodes (13): config, middleware(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli(), supabaseEksikEnvAlanlari(), supabaseYapilandirildi() (+5 more)

### Community 54 - "seo.ts"
Cohesion: 0.10
Nodes (40): GET(), GET(), POST(), POST(), POST(), GET(), GECERLI, POST() (+32 more)

### Community 56 - "cekici-puan.ts"
Cohesion: 0.08
Nodes (42): GET(), PUT(), GET(), GET(), PATCH(), POST(), davetKayitBaslangicKredisiFromSonuc(), davetKayitBonusTamamla() (+34 more)

### Community 58 - "cerez-onay.ts"
Cohesion: 0.08
Nodes (49): geist, metadata, RootLayout(), viewport, bannerServerSnapshot(), bannerSnapshot(), bannerSubscribe(), CerezOnayBanner() (+41 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.09
Nodes (17): belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), BelgeYuklemeAlani(), Props, ANCHOR_IDS, AVANTAJLAR, CekiciKayitLanding() (+9 more)

### Community 61 - "kredi-odeme.ts"
Cohesion: 0.14
Nodes (19): BolgeApiData, BolgeAyarlari(), BolgeAyarlariProps, BolgeApiData, DavetKoduDurum, GUNLER, MusaitlikAyarlari(), Durum (+11 more)

### Community 62 - "getSupabaseAdmin"
Cohesion: 0.30
Nodes (10): cekiciHesapSilOtpDogrula(), CekiciHesapSilOtpKayit, cekiciHesapSilOtpOlustur(), cekiciHesapSilOtpSil(), fromRow(), otpGet(), otpSuresiDolduMu(), otpUpsert() (+2 more)

### Community 63 - "davet-panel.ts"
Cohesion: 0.13
Nodes (28): GET(), GET(), BOS_FORM, Sablon, GET(), GET(), SMS50_KAYIT_FUNNEL_HARITASI, SMS50_VARYANTLAR (+20 more)

### Community 64 - "layout.tsx"
Cohesion: 0.31
Nodes (8): POST(), KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI, KrediPaket, krediPaketBul(), krediPaketOdenecekTL(), KrediPaketTl, tlTutarKurus()

### Community 65 - "route.ts"
Cohesion: 0.67
Nodes (4): NETGSM_TR_CIFTE, netgsmSmsBirimHesapla(), netgsmSmsMesajGecerliMi(), netgsmSmsParcaSayisi()

### Community 66 - "page.tsx"
Cohesion: 0.28
Nodes (10): GET(), GET(), GET(), GET(), countSmsLog(), getSmsLog(), getTaleplerSince(), smsDurumu() (+2 more)

### Community 67 - "route.ts"
Cohesion: 0.83
Nodes (3): GET(), istemciIp(), ozelIp()

### Community 68 - "PanelCekiciHarita.tsx"
Cohesion: 0.22
Nodes (19): POST(), POST(), cekiciAuthRastgeleSifre(), bekleyenCekiciKayitOtp(), cekiciKayitOtpDogrula(), cekiciKayitOtpGonder(), CekiciKayitOtpKayit, CekiciKayitOtpRow (+11 more)

### Community 71 - "toplu-sms-gecmis-db.ts"
Cohesion: 0.18
Nodes (20): POST(), GET(), POST(), panelKullanici(), POST(), sendPanelTopluSms(), createClient(), topluSmsGecmisTablolariVar() (+12 more)

### Community 76 - "cekici-sifre-otp.ts"
Cohesion: 0.12
Nodes (32): POST(), POST(), beniAnimsaOku(), cekiciOturumCookieAyarlari(), bekleyenCekiciGirisOtp(), cekiciGirisOtpDogrula(), cekiciGirisOtpGonder(), CekiciGirisOtpKayit (+24 more)

### Community 77 - "KayitKontenjanBilgi.tsx"
Cohesion: 0.36
Nodes (8): kayitliAdSoyadUygula(), depolama(), MusteriProfil, musteriProfilKaydet(), musteriProfilOku(), okuHarita(), ProfilHaritasi, yazHarita()

### Community 85 - "page.tsx"
Cohesion: 0.33
Nodes (6): gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi, satirFromCekici()

### Community 89 - "kredi-fiyat.ts"
Cohesion: 0.16
Nodes (20): PATCH(), GET(), POST(), sonKullanmaAyir(), POST(), tcKimlikGecerliMi(), vergiNoGecerliMi(), garantiYapilandirildi() (+12 more)

## Knowledge Gaps
- **351 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+346 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `cekici-email-otp.ts` to `demo-oturum.ts`, `telefonNormalize`, `cekici-email-otp.ts`, `seo.ts`, `mappers.ts`, `ensureSeedData`, `ui.tsx`, `CekiciPanelTabs.tsx`, `CekiciAyarlarPanel.tsx`, `db.ts`, `page.tsx`, `route.ts`, `demo-responses.ts`, `kayit-kodu.ts`, `NasilCalisirSerit.tsx`, `route.ts`, `CerezOnayBanner.tsx`, `seo.ts`, `cekici-puan.ts`, `getSupabaseAdmin`, `davet-panel.ts`, `page.tsx`, `PanelCekiciHarita.tsx`, `toplu-sms-gecmis-db.ts`, `cekici-sifre-otp.ts`, `kredi-fiyat.ts`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **Why does `Card()` connect `ensureSeedData` to `route.ts`, `google-maps.ts`, `CekiciPanelTabs.tsx`, `hizmet-veren-sayim.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `route.ts`, `cekici-puan.ts`, `page.tsx`, `page.tsx`, `route.ts`, `kredi-odeme.ts`, `davet-panel.ts`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `telefonNormalize()` connect `cekici-email-otp.ts` to `demo-oturum.ts`, `kayit-kodu.ts`, `NasilCalisirSerit.tsx`, `PanelCekiciHarita.tsx`, `seo.ts`, `toplu-sms-gecmis-db.ts`, `CekiciPanelTabs.tsx`, `cekici-sifre-otp.ts`, `KayitKontenjanBilgi.tsx`, `MusteriAnaSayfa.tsx`, `page.tsx`, `getSupabaseAdmin`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _351 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `telefonNormalize` be split into smaller, more focused modules?**
  _Cohesion score 0.056150600454397924 - nodes in this community are weakly interconnected._
- **Should `getSupabaseAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.0792156862745098 - nodes in this community are weakly interconnected._
- **Should `ui.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13213213213213212 - nodes in this community are weakly interconnected._