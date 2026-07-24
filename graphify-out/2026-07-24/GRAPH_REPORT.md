# Graph Report - acilcozumbul  (2026-07-24)

## Corpus Check
- 427 files · ~407,434 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1794 nodes · 5740 edges · 80 communities (71 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `49bf10f6`
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
- [[_COMMUNITY_kayit-kodu.ts|kayit-kodu.ts]]
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
- [[_COMMUNITY_seo.ts|seo.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_cekici-puan.ts|cekici-puan.ts]]
- [[_COMMUNITY_NasilCalisirSerit.tsx|NasilCalisirSerit.tsx]]
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
- [[_COMMUNITY_SorunAkisOzeti.tsx|SorunAkisOzeti.tsx]]
- [[_COMMUNITY_toplu-sms-gecmis-db.ts|toplu-sms-gecmis-db.ts]]
- [[_COMMUNITY_Ölçeklenebilirlik regression smoke checklist|Ölçeklenebilirlik regression smoke checklist]]
- [[_COMMUNITY_verify-teklif-backfill.mjs|verify-teklif-backfill.mjs]]
- [[_COMMUNITY_cekici-sifre-otp.ts|cekici-sifre-otp.ts]]
- [[_COMMUNITY_KayitKontenjanBilgi.tsx|KayitKontenjanBilgi.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_kredi-fiyat.ts|kredi-fiyat.ts]]

## God Nodes (most connected - your core abstractions)
1. `getSupabaseAdmin()` - 172 edges
2. `ensureSeedData()` - 102 edges
3. `telefonNormalize()` - 78 edges
4. `getCurrentCekici()` - 70 edges
5. `telefonGecerliMi()` - 56 edges
6. `Card()` - 52 edges
7. `getCekiciById()` - 37 edges
8. `updateCekici()` - 36 edges
9. `Btn()` - 35 edges
10. `smsBaseUrl()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `middleware()` --calls--> `updatePanelSession()`  [EXTRACTED]
  middleware.ts → src/lib/supabase/middleware.ts
- `main()` --calls--> `garantiSmokeKartOku()`  [INFERRED]
  scripts/garanti-smoke.ts → src/lib/garanti/smoke-kart.ts
- `main()` --calls--> `garantiYapilandirildi()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/config.ts
- `main()` --calls--> `garantiYapilandirmaOzeti()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/config.ts
- `main()` --calls--> `garantiKrediOdemesiYap()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/payment.ts

## Import Cycles
- None detected.

## Communities (80 total, 9 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.44
Nodes (14): POST(), POST(), POST(), POST(), SifremiUnuttumPage(), otpBasariMesaji(), otpBekleyenMesaji(), otpGelmediMesaji() (+6 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.12
Nodes (24): POST(), GET(), generateMetadata(), KayitFunnelPage(), Props, CekiciKayitKontrolSayfa(), KayitPhoneFirstSayfa(), KAYIT_FUNNEL_HARFLER (+16 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.16
Nodes (23): GET(), GET(), POST(), getDogrulanmisTelefon(), musteriTelCookieAyarla(), musteriTelCookieDegeri(), musteriTelCookieTemizle(), ayniIstanbulGunuMu() (+15 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.07
Nodes (45): eslintConfig, main(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku() (+37 more)

### Community 4 - "seo.ts"
Cohesion: 0.38
Nodes (11): envInt(), guvenlikSay(), IP_LIMIT(), IP_SAAT(), OTP_IP_DK(), OTP_IP_LIMIT(), pencereBaslangic(), talepFraudKontrol() (+3 more)

### Community 5 - "mappers.ts"
Cohesion: 0.19
Nodes (8): PATCH(), updateCekiciBelgeDurum(), AnlasmaDurumu, BelgeDurum, Konum, KrediOdeme, OdemeTipi, TalepDurumu

### Community 6 - "ensureSeedData"
Cohesion: 0.10
Nodes (13): Adim, SmsKaydi, BrandLogoYazili(), ADIMLAR, GUVEN, SSS, MobileShell(), MobileShellProps (+5 more)

### Community 7 - "ui.tsx"
Cohesion: 0.14
Nodes (29): POST(), GET(), POST(), GET(), PUT(), POST(), POST(), POST() (+21 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (35): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+27 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.10
Nodes (26): GenelTelefon, KampanyaSablon, KuyrukIs, ListeAlici, ListeOzet, OncekiMod, PanelTopluSmsPage(), SaatIzgarasi (+18 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.40
Nodes (5): DemoDurum, DemoSms, kalanSureFormat(), PanelDemoPage(), SIMULE_ADIMLAR

### Community 12 - "sms-provider.ts"
Cohesion: 0.07
Nodes (31): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, metadata (+23 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.11
Nodes (32): POST(), MusteriAnaSayfaIcerik(), adimAciklamaMetni(), Props, SorunAkisOzeti(), SorunAkisOzetiIcerik(), addTalep(), CEKICI_ADIMLAR (+24 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.10
Nodes (42): GET(), GET(), GET(), PATCH(), POST(), belgeBase64Ayikla(), cekiciBelgeYukle(), IZINLI_MIME (+34 more)

### Community 15 - "db.ts"
Cohesion: 0.16
Nodes (37): GET(), rotaKoordinatlari(), POST(), listeDurumuBelirle(), toOzet(), OnayIcerik(), TalepOzet, cekiciTalepBolgesineUygunMu() (+29 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.12
Nodes (19): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), KayitKontenjanBilgi(), Props, Props, YasalOnayKutusu() (+11 more)

### Community 17 - "route.ts"
Cohesion: 0.11
Nodes (19): filtreleCekicilerBolge(), konumCekici(), filtreleCekicilerSorun(), SMS_BILDIRIM_KREDI, IL_ILCELER, asyaSet, ISTANBUL_ASYA_ILCELER, ISTANBUL_AVRUPA_ILCELER (+11 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.11
Nodes (27): ArizaFotografAlani(), ArizaFotografAlaniProps, GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI, Step (+19 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.07
Nodes (16): DegerlendirmeSatir, Ozet, Ozet, Ozet, Saglik, formatKalan(), MemnuniyetBekle(), FormAdimi (+8 more)

### Community 20 - "page.tsx"
Cohesion: 0.11
Nodes (16): Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps, MemnuniyetFormu() (+8 more)

### Community 21 - "davet-panel.ts"
Cohesion: 0.08
Nodes (28): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesi(), HizmetVerenSayimGostergesiProps, useAnimatedNumber(), HizmetVerenSayimPanel(), KullaniciSayisiGrafik() (+20 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.16
Nodes (15): KrediPage(), OdemeOnayPage(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, funnelKaydet(), krediPaketOdenecekTL(), OdemeOnayKayit, odemeOnaySessionKey() (+7 more)

### Community 24 - "page.tsx"
Cohesion: 0.13
Nodes (31): POST(), GET(), baseUrlFrom(), GET(), POST(), GET(), PanelLinkHaritasiPage(), getTalepById() (+23 more)

### Community 25 - "kredi-odeme.ts"
Cohesion: 0.14
Nodes (35): bolgeOzet(), GET(), POST(), PUT(), GET(), POST(), GET(), BolgeApiData (+27 more)

### Community 26 - "route.ts"
Cohesion: 0.23
Nodes (16): Ctx, DELETE(), panelKullanici(), PATCH(), GET(), panelKullanici(), POST(), guncelleSmsSablon() (+8 more)

### Community 27 - "page.tsx"
Cohesion: 0.09
Nodes (31): CekiciTalepClient(), TalepDurum, CekiciKart(), Gorunum, SehirSiralama, KisiselVeriGizlemeAyarlari(), BADGE, CekiciPanelTabs() (+23 more)

### Community 28 - "cekici-email-otp.ts"
Cohesion: 0.10
Nodes (33): GET(), GET(), GET(), hizmetBolgeleriFlatten(), bugunBaslangicIso(), countCekiciler(), countCekicilerBelgeDurum(), countTalepler() (+25 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "demo-responses.ts"
Cohesion: 0.15
Nodes (26): POST(), POST(), GET(), POST(), POST(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula() (+18 more)

### Community 32 - "kayit-kodu.ts"
Cohesion: 0.21
Nodes (23): POST(), POST(), cekiciOturumCookieAyarlari(), cekiciAuthKullaniciOlustur(), cekiciAuthKullaniciSil(), cekiciAuthRastgeleSifre(), bekleyenCekiciKayitOtp(), cekiciKayitOtpDogrula() (+15 more)

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.31
Nodes (10): bildirimRowsFromTalepler(), cekiciToRow(), dataDir, haricRowsFromTalepler(), main(), readJson(), supabase, talepToRow() (+2 more)

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.23
Nodes (7): metadata, PanelChrome(), LINKS, PanelNav(), NavSayacRozet(), PanelNavSayac, usePanelNavSayac()

### Community 35 - "NasilCalisirSerit.tsx"
Cohesion: 0.14
Nodes (28): POST(), panelKullanici(), POST(), GET(), panelKullanici(), POST(), register(), topluSmsIsTablolariVar() (+20 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "route.ts"
Cohesion: 0.07
Nodes (43): noktaOku(), POST(), GET(), GET(), CekiciRotaPanelProps, embedDirectionsUrl(), googleMapsDirUrl(), MusteriCekiciTakipHarita() (+35 more)

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.38
Nodes (5): hedefAltYazi(), KonumGuncellemeGostergesi(), renkKaristir(), TURUNCU, YESIL

### Community 41 - "route.ts"
Cohesion: 0.24
Nodes (6): GET(), DavetKullanimRow, DavetKullanimSatir, DavetLiderSatir, DavetPanelOzet, getDavetPanelVerisi()

### Community 52 - "CerezOnayBanner.tsx"
Cohesion: 0.18
Nodes (19): GET(), addSmsKaydi(), escapeXml(), GondericiAdiSorguSonuc, logSmsKaydi(), netgsmGondericiAdlariSorgula(), netgsmKimlik(), netgsmOtpSmsGonder() (+11 more)

### Community 53 - "KayitKontenjanBilgi.tsx"
Cohesion: 0.18
Nodes (16): config, middleware(), POST(), GET(), GET(), sms50FooterSatirlari(), listeAktifSmsSablonOzetleri(), panelAdminEpostalari() (+8 more)

### Community 54 - "seo.ts"
Cohesion: 0.10
Nodes (43): GET(), GET(), POST(), POST(), POST(), GET(), GECERLI, POST() (+35 more)

### Community 55 - "page.tsx"
Cohesion: 0.14
Nodes (32): POST(), POST(), beniAnimsaOku(), bekleyenCekiciGirisOtp(), cekiciGirisOtpDogrula(), cekiciGirisOtpGonder(), CekiciGirisOtpKayit, CekiciGirisOtpRow (+24 more)

### Community 56 - "cekici-puan.ts"
Cohesion: 0.14
Nodes (26): POST(), GET(), BekleIcerik(), anlasilanIsSay(), cekiciPuanOzeti, cekiciPuanOzetleri(), computePuanFromTables(), fiyatGarantiPuaniHesapla() (+18 more)

### Community 57 - "NasilCalisirSerit.tsx"
Cohesion: 0.23
Nodes (11): HaritaNokta, PanelCekiciHarita(), RENK, SehirAdet, haritaSehirNoktalari(), haritaYaricapLog(), IlKoordinat, ilKoordinatBul() (+3 more)

### Community 58 - "cerez-onay.ts"
Cohesion: 0.10
Nodes (40): geist, metadata, RootLayout(), viewport, CerezOnayBanner(), Gorunum, tercihKaydet(), GoogleAnalytics() (+32 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.11
Nodes (17): belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), BelgeYuklemeAlani(), Props, ANCHOR_IDS, AVANTAJLAR, CekiciKayitLanding() (+9 more)

### Community 61 - "kredi-odeme.ts"
Cohesion: 0.10
Nodes (21): BOS_FORM, KampanyaSatir, KullanimSatir, Ozet, BolgeAyarlari(), BolgeAyarlariProps, CekiciAyarlarPanel(), DavetKoduAyarlari() (+13 more)

### Community 62 - "getSupabaseAdmin"
Cohesion: 0.29
Nodes (12): POST(), hesapSilOnayMetniGecerliMi(), cekiciHesapSilOtpDogrula(), CekiciHesapSilOtpKayit, cekiciHesapSilOtpOlustur(), cekiciHesapSilOtpSil(), fromRow(), otpGet() (+4 more)

### Community 63 - "davet-panel.ts"
Cohesion: 0.14
Nodes (26): GET(), BOS_FORM, Sablon, GET(), GET(), SMS50_KAYIT_FUNNEL_HARITASI, SMS50_VARYANTLAR, sms50KayitFunnelId() (+18 more)

### Community 64 - "layout.tsx"
Cohesion: 0.21
Nodes (6): gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi, satirFromCekici()

### Community 65 - "route.ts"
Cohesion: 0.24
Nodes (11): kaybedenTeklifleriIsaretle(), listTekliflerByCekici(), listTekliflerByTalep(), listTekliflerByTalepIds(), setKaybedenTeklifler(), teklifFromRow(), TeklifRow, teklifToRow() (+3 more)

### Community 66 - "page.tsx"
Cohesion: 0.14
Nodes (21): GET(), haftaBaslangici(), istanbulAyAnahtari(), kazananTeklifFiyati(), GET(), GET(), GET(), GET() (+13 more)

### Community 67 - "route.ts"
Cohesion: 0.83
Nodes (3): GET(), istemciIp(), ozelIp()

### Community 68 - "PanelCekiciHarita.tsx"
Cohesion: 0.67
Nodes (4): NETGSM_TR_CIFTE, netgsmSmsBirimHesapla(), netgsmSmsMesajGecerliMi(), netgsmSmsParcaSayisi()

### Community 70 - "SorunAkisOzeti.tsx"
Cohesion: 0.19
Nodes (18): POST(), POST(), getCekicilerBildirimAdaylari(), updateTalep(), demoKatil(), demoKatilMesaji(), anlasamadiSonrasiIhaleyiSurdur(), cekiciBildirimKrediTutari() (+10 more)

### Community 71 - "toplu-sms-gecmis-db.ts"
Cohesion: 0.19
Nodes (19): POST(), GET(), POST(), panelKullanici(), POST(), sendPanelTopluSms(), createClient(), topluSmsGecmisTablolariVar() (+11 more)

### Community 76 - "cekici-sifre-otp.ts"
Cohesion: 0.19
Nodes (20): POST(), authAnonClient(), authSignIn(), cekiciAuthEmail(), cekiciAuthSifreDogrula(), cekiciAuthSifreGuncelle(), cekiciGirisSifreKontrol(), cekiciSifreyiAuthaTasi() (+12 more)

### Community 77 - "KayitKontenjanBilgi.tsx"
Cohesion: 0.36
Nodes (8): kayitliAdSoyadUygula(), depolama(), MusteriProfil, musteriProfilKaydet(), musteriProfilOku(), okuHarita(), ProfilHaritasi, yazHarita()

### Community 82 - "page.tsx"
Cohesion: 0.29
Nodes (11): IZINLI, POST(), POST(), FunnelOlay, funnelOlayKaydet(), funnelOlaySay(), FunnelOzet, funnelOzetHesapla() (+3 more)

### Community 85 - "page.tsx"
Cohesion: 0.20
Nodes (10): POST(), DELETE(), GET(), cekiciBelgeleriniSil(), silCekiciCascade(), mockFrom, mockStorageFrom, getCekiciById() (+2 more)

### Community 89 - "kredi-fiyat.ts"
Cohesion: 0.11
Nodes (23): PATCH(), GET(), POST(), sonKullanmaAyir(), GET(), GET(), tcKimlikGecerliMi(), vergiNoGecerliMi() (+15 more)

## Knowledge Gaps
- **346 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+341 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `memnuniyet.ts` to `demo-oturum.ts`, `telefonNormalize`, `cekici-email-otp.ts`, `seo.ts`, `mappers.ts`, `ui.tsx`, `CekiciAyarlarPanel.tsx`, `db.ts`, `page.tsx`, `route.ts`, `cekici-email-otp.ts`, `demo-responses.ts`, `kayit-kodu.ts`, `NasilCalisirSerit.tsx`, `route.ts`, `CerezOnayBanner.tsx`, `KayitKontenjanBilgi.tsx`, `seo.ts`, `page.tsx`, `cekici-puan.ts`, `getSupabaseAdmin`, `davet-panel.ts`, `route.ts`, `page.tsx`, `SorunAkisOzeti.tsx`, `toplu-sms-gecmis-db.ts`, `cekici-sifre-otp.ts`, `page.tsx`, `page.tsx`, `kredi-fiyat.ts`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Why does `Card()` connect `ensureSeedData` to `layout.tsx`, `mappers.ts`, `ensureSeedData`, `route.ts`, `route.ts`, `google-maps.ts`, `CekiciPanelTabs.tsx`, `hizmet-veren-sayim.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `davet-panel.ts`, `route.ts`, `page.tsx`, `page.tsx`, `route.ts`, `kredi-odeme.ts`, `davet-panel.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `telefonNormalize()` connect `page.tsx` to `demo-oturum.ts`, `kayit-kodu.ts`, `cekici-email-otp.ts`, `NasilCalisirSerit.tsx`, `seo.ts`, `toplu-sms-gecmis-db.ts`, `cekici-sifre-otp.ts`, `CekiciAyarlarPanel.tsx`, `KayitKontenjanBilgi.tsx`, `MusteriAnaSayfa.tsx`, `page.tsx`, `getSupabaseAdmin`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _346 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `telefonNormalize` be split into smaller, more focused modules?**
  _Cohesion score 0.12473118279569892 - nodes in this community are weakly interconnected._
- **Should `getSupabaseAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.06954997077732321 - nodes in this community are weakly interconnected._
- **Should `ensureSeedData` be split into smaller, more focused modules?**
  _Cohesion score 0.10098522167487685 - nodes in this community are weakly interconnected._