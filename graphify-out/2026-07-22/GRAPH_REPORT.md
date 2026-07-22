# Graph Report - acilcozumbul  (2026-07-22)

## Corpus Check
- 388 files · ~390,682 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1631 nodes · 5067 edges · 82 communities (72 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b8e05c74`
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
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_admin.ts|admin.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_sorun-tipleri.ts|sorun-tipleri.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_Ölçeklenebilirlik regression smoke checklist|Ölçeklenebilirlik regression smoke checklist]]
- [[_COMMUNITY_verify-teklif-backfill.mjs|verify-teklif-backfill.mjs]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_davet-kayit.ts|davet-kayit.ts]]
- [[_COMMUNITY_cekici-sil.ts|cekici-sil.ts]]
- [[_COMMUNITY_NasilCalisirSerit.tsx|NasilCalisirSerit.tsx]]
- [[_COMMUNITY_ArizaFotografAlani.tsx|ArizaFotografAlani.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_MemnuniyetBekle.tsx|MemnuniyetBekle.tsx]]
- [[_COMMUNITY_addSmsKaydi|addSmsKaydi]]

## God Nodes (most connected - your core abstractions)
1. `getSupabaseAdmin()` - 150 edges
2. `ensureSeedData()` - 96 edges
3. `getCurrentCekici()` - 67 edges
4. `telefonNormalize()` - 64 edges
5. `Card()` - 47 edges
6. `telefonGecerliMi()` - 41 edges
7. `getCekiciById()` - 37 edges
8. `updateCekici()` - 34 edges
9. `Btn()` - 33 edges
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

## Communities (82 total, 10 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.25
Nodes (13): cekiciHesapSilOtpDogrula(), CekiciHesapSilOtpKayit, cekiciHesapSilOtpOlustur(), cekiciHesapSilOtpSil(), fromRow(), otpGet(), otpSuresiDolduMu(), otpUpsert() (+5 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.22
Nodes (24): POST(), listeDurumuBelirle(), toOzet(), cekiciTalepBolgesineUygunMu(), cekiciTalepSorununaUygunMu(), demoListeDurumuBelirle(), demoTeklifEkle(), demoToOzet() (+16 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.18
Nodes (21): GET(), GET(), POST(), getDogrulanmisTelefon(), musteriTelCookieTemizle(), ayniIstanbulGunuMu(), bekleyenOtpBilgisi(), istanbulGunAnahtari() (+13 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.08
Nodes (36): eslintConfig, main(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku(), GarantiMode (+28 more)

### Community 4 - "seo.ts"
Cohesion: 0.36
Nodes (10): GET(), BekleIcerik(), cekiciPuanOzetleri(), DEMO_PUAN, demoMusteriTekliflerJson(), rotaKoordinatlari(), aktifTeklifler(), ihaleAcikMi() (+2 more)

### Community 5 - "mappers.ts"
Cohesion: 0.29
Nodes (11): PATCH(), POST(), sonKullanmaAyir(), tcKimlikGecerliMi(), vergiNoGecerliMi(), istemciIpAl(), faturaAlanlariniDogrula(), getBekleyenOdeme() (+3 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.08
Nodes (42): noktaOku(), POST(), GET(), CekiciRotaPanelProps, embedDirectionsUrl(), googleMapsDirUrl(), MusteriCekiciTakipHarita(), MusteriCekiciTakipHaritaProps (+34 more)

### Community 7 - "ui.tsx"
Cohesion: 0.11
Nodes (33): POST(), GET(), POST(), GET(), POST(), POST(), POST(), GET() (+25 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (35): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+27 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.21
Nodes (21): POST(), bekleyenCekiciKayitOtp(), cekiciKayitOtpDogrula(), cekiciKayitOtpGonder(), CekiciKayitOtpKayit, CekiciKayitOtpRow, cekiciKayitOtpTemizle(), fromRow() (+13 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.25
Nodes (21): POST(), POST(), IZINLI, POST(), POST(), POST(), SifremiUnuttumPage(), getCekiciByTelefon() (+13 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.07
Nodes (32): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, metadata (+24 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.13
Nodes (22): POST(), GET(), POST(), GET(), POST(), garantiYapilandirildi(), KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI (+14 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.19
Nodes (18): GET(), PATCH(), POST(), ekleKampanya(), getKampanyaByKod(), getKampanyaKullanimlari(), getKampanyalar(), guncelleKampanya() (+10 more)

### Community 15 - "db.ts"
Cohesion: 0.19
Nodes (12): KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, funnelKaydet(), OdemeOnayKayit, odemeOnaySessionKey(), posthogCerezSenkronize(), posthogKampanyaKaydet(), posthogOlayBirKez() (+4 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.13
Nodes (17): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), KayitKontenjanBilgi(), Props, Props, YasalOnayKutusu() (+9 more)

### Community 17 - "route.ts"
Cohesion: 0.08
Nodes (52): bolgeOzet(), GET(), POST(), PUT(), BolgeApiData, BolgeApiData, HaritaNokta, RENK (+44 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.10
Nodes (28): ArizaFotografAlani(), ArizaFotografAlaniProps, GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI, Step (+20 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.19
Nodes (9): GET(), GET(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), krediOdemeFromRow(), KrediOdemeRow, krediOdemeToRow() (+1 more)

### Community 20 - "page.tsx"
Cohesion: 0.11
Nodes (16): Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps, MemnuniyetFormu() (+8 more)

### Community 21 - "davet-panel.ts"
Cohesion: 0.36
Nodes (6): GET(), GET(), kayitKontenjanHesapla(), countCekiciler(), countCekicilerBelgeDurum(), countTalepler()

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.11
Nodes (37): GET(), POST(), POST(), POST(), GECERLI, POST(), demoBaslangicDurumu(), DemoOturumDurum (+29 more)

### Community 24 - "page.tsx"
Cohesion: 0.14
Nodes (28): POST(), GET(), baseUrlFrom(), GET(), POST(), GET(), getTaleplerMemnuniyetBekleyen(), demoMusteriTalepDurumJson() (+20 more)

### Community 25 - "kredi-odeme.ts"
Cohesion: 0.20
Nodes (16): POST(), GET(), POST(), panelKullanici(), POST(), sendPanelTopluSms(), createClient(), chunk() (+8 more)

### Community 26 - "route.ts"
Cohesion: 0.18
Nodes (20): POST(), authAnonClient(), authSignIn(), cekiciAuthEmail(), cekiciAuthKullaniciOlustur(), cekiciAuthSifreDogrula(), cekiciAuthSifreGuncelle(), cekiciSifreyiAuthaTasi() (+12 more)

### Community 27 - "page.tsx"
Cohesion: 0.11
Nodes (28): CekiciTalepClient(), TalepDurum, CekiciKart(), CekiciAyarlarPanel(), DavetKoduAyarlari(), KisiselVeriGizlemeAyarlari(), BADGE, CekiciPanelTabs() (+20 more)

### Community 28 - "cekici-email-otp.ts"
Cohesion: 0.16
Nodes (18): GET(), haftaBaslangici(), istanbulAyAnahtari(), kazananTeklifFiyati(), getTalepler(), getTaleplerByKazananCekici(), hydrateTalep(), hydrateTalepler() (+10 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "demo-responses.ts"
Cohesion: 0.19
Nodes (20): POST(), POST(), GET(), POST(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder() (+12 more)

### Community 32 - "getCekiciById"
Cohesion: 0.14
Nodes (22): POST(), getCekicilerBildirimAdaylari(), updateTalep(), anlasamadiSonrasiIhaleyiSurdur(), enDusukTeklif(), kaybedenTeklifleriIsaretle(), CekiciPuanOzetRow, getCekiciPuanOzetRows() (+14 more)

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.31
Nodes (10): bildirimRowsFromTalepler(), cekiciToRow(), dataDir, haricRowsFromTalepler(), main(), readJson(), supabase, talepToRow() (+2 more)

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.23
Nodes (7): metadata, PanelChrome(), LINKS, PanelNav(), NavSayacRozet(), PanelNavSayac, usePanelNavSayac()

### Community 35 - "NasilCalisirSerit.tsx"
Cohesion: 0.32
Nodes (11): anlasilanIsSay(), cekiciPuanOzeti, computePuanFromTables(), fiyatGarantiPuaniHesapla(), normalizeTeklif(), ozetFromCounts(), tercihPuaniHesapla(), cekiciHizmetPuani (+3 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "route.ts"
Cohesion: 0.21
Nodes (16): GET(), GET(), GET(), SMS50_VARYANTLAR, sms50FooterSatirlari(), Sms50GovdeId, sms50KayitUrl(), sms50KisaPath() (+8 more)

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.38
Nodes (5): hedefAltYazi(), KonumGuncellemeGostergesi(), renkKaristir(), TURUNCU, YESIL

### Community 41 - "route.ts"
Cohesion: 0.20
Nodes (18): Ctx, DELETE(), panelKullanici(), PATCH(), GET(), panelKullanici(), POST(), SMS50_GOVDE_SABLONLARI (+10 more)

### Community 52 - "CerezOnayBanner.tsx"
Cohesion: 0.08
Nodes (34): GET(), GET(), GET(), GET(), Saglik, countSmsLog(), getSmsLog(), getTaleplerSince() (+26 more)

### Community 53 - "KayitKontenjanBilgi.tsx"
Cohesion: 0.12
Nodes (25): POST(), PATCH(), DELETE(), GET(), GET(), cekiciAuthKullaniciSil(), hizmetBolgeleriFlatten(), cekiciBelgeleriniSil() (+17 more)

### Community 54 - "ArizaFotografAlani.tsx"
Cohesion: 0.14
Nodes (12): GET(), bugunBaslangicIso(), getTaleplerBugun(), demoPanelVerisi(), mergeCekiciPanelData, talepTekliflerle(), SMS_BILDIRIM_KREDI, AnlasmaDurumu (+4 more)

### Community 55 - "route.ts"
Cohesion: 0.37
Nodes (12): envInt(), guvenlikSay(), IP_LIMIT(), IP_SAAT(), OTP_IP_DK(), OTP_IP_LIMIT(), otpFraudKontrol(), pencereBaslangic() (+4 more)

### Community 56 - "route.ts"
Cohesion: 0.36
Nodes (8): kayitliAdSoyadUygula(), depolama(), MusteriProfil, musteriProfilKaydet(), musteriProfilOku(), okuHarita(), ProfilHaritasi, yazHarita()

### Community 57 - "NasilCalisirSerit.tsx"
Cohesion: 0.27
Nodes (16): POST(), GET(), rotaKoordinatlari(), KULLANIMA_ACIK_ILLER, sehirBeklemeMesaji(), sehirKullanimAcikMi(), getTalepById(), isDemoTalepId() (+8 more)

### Community 58 - "cerez-onay.ts"
Cohesion: 0.10
Nodes (39): geist, metadata, RootLayout(), viewport, CerezOnayBanner(), Gorunum, tercihKaydet(), GoogleAnalytics() (+31 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.12
Nodes (15): KrediPage(), OdemeOnayPage(), belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), ANCHOR_IDS, AVANTAJLAR, CekiciKayitLanding() (+7 more)

### Community 61 - "kredi-odeme.ts"
Cohesion: 0.07
Nodes (20): OnayIcerik(), Adim, SmsKaydi, BOS_FORM, KampanyaSatir, KullanimSatir, Ozet, Ozet (+12 more)

### Community 62 - "page.tsx"
Cohesion: 0.14
Nodes (17): GenelTelefon, KampanyaSablon, ListeAlici, ListeOzet, OncekiMod, PanelTopluSmsPage(), Sekme, TestLinkOzet (+9 more)

### Community 63 - "davet-panel.ts"
Cohesion: 0.22
Nodes (13): config, middleware(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli(), supabaseEksikEnvAlanlari(), supabaseYapilandirildi() (+5 more)

### Community 64 - "layout.tsx"
Cohesion: 0.15
Nodes (10): Gorunum, SehirSiralama, DemoDurum, DemoSms, kalanSureFormat(), PanelDemoPage(), SIMULE_ADIMLAR, PanelCekiciHarita() (+2 more)

### Community 65 - "page.tsx"
Cohesion: 0.38
Nodes (4): hataMesajiFromParam(), PanelIcerik(), HizmetVerenSayimPanel(), PanelGirisForm()

### Community 66 - "admin.ts"
Cohesion: 0.35
Nodes (8): GET(), GET(), kayitKoduDogrula(), getSupabaseAdmin(), supabaseDbAktif(), davetKoduSutunuVar(), kampanyaKoduSutunuVar(), topluSmsGecmisTablolariVar()

### Community 67 - "route.ts"
Cohesion: 0.83
Nodes (3): GET(), istemciIp(), ozelIp()

### Community 68 - "sorun-tipleri.ts"
Cohesion: 0.33
Nodes (8): listTekliflerByCekici(), listTekliflerByTalep(), listTekliflerByTalepIds(), teklifFromRow(), TeklifRow, teklifToRow(), upsertTeklif(), TeklifDurumu

### Community 69 - "route.ts"
Cohesion: 0.24
Nodes (6): GET(), DavetKullanimRow, DavetKullanimSatir, DavetLiderSatir, DavetPanelOzet, getDavetPanelVerisi()

### Community 70 - "page.tsx"
Cohesion: 0.21
Nodes (6): gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi, satirFromCekici()

### Community 71 - "route.ts"
Cohesion: 0.06
Nodes (59): GET(), POST(), Ozet, HizmetVerenSayimGostergesi(), HizmetVerenSayimGostergesiProps, useAnimatedNumber(), MusteriAnaSayfaIcerik(), adimAciklamaMetni() (+51 more)

### Community 74 - "page.tsx"
Cohesion: 0.12
Nodes (21): BolgeAyarlari(), BolgeAyarlariProps, BelgeYuklemeAlani(), Props, DavetKoduDurum, GUNLER, MusaitlikAyarlari(), BelgeDurumResponse (+13 more)

### Community 75 - "davet-kayit.ts"
Cohesion: 0.22
Nodes (16): PUT(), davetKayitBaslangicKredisiFromSonuc(), davetKayitBonusTamamla(), davetKayitHazirla(), DavetKayitSonuc, davetKayitBaslangicKredisi(), davetKoduGecerliMi(), davetKoduNormalize() (+8 more)

### Community 76 - "cekici-sil.ts"
Cohesion: 0.67
Nodes (4): NETGSM_TR_CIFTE, netgsmSmsBirimHesapla(), netgsmSmsMesajGecerliMi(), netgsmSmsParcaSayisi()

### Community 77 - "NasilCalisirSerit.tsx"
Cohesion: 0.70
Nodes (4): POST(), teklifFiyatDegistiMi(), demoTeklifSec(), demoTeklifSecDurumu()

### Community 78 - "ArizaFotografAlani.tsx"
Cohesion: 0.60
Nodes (4): belgeBase64Ayikla(), cekiciBelgeYukle(), IZINLI_MIME, uzanti()

### Community 81 - "addSmsKaydi"
Cohesion: 0.67
Nodes (3): addSmsKaydi(), logSmsKaydi(), smsToRow()

## Knowledge Gaps
- **317 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+312 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `admin.ts` to `demo-oturum.ts`, `telefonNormalize`, `cekici-email-otp.ts`, `mappers.ts`, `ui.tsx`, `google-maps.ts`, `CekiciPanelTabs.tsx`, `CekiciAyarlarPanel.tsx`, `memnuniyet.ts`, `route.ts`, `ensureSeedData`, `davet-panel.ts`, `route.ts`, `page.tsx`, `kredi-odeme.ts`, `route.ts`, `cekici-email-otp.ts`, `demo-responses.ts`, `getCekiciById`, `NasilCalisirSerit.tsx`, `route.ts`, `route.ts`, `CerezOnayBanner.tsx`, `KayitKontenjanBilgi.tsx`, `route.ts`, `NasilCalisirSerit.tsx`, `sorun-tipleri.ts`, `route.ts`, `route.ts`, `davet-kayit.ts`, `ArizaFotografAlani.tsx`, `addSmsKaydi`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Why does `telefonNormalize()` connect `demo-oturum.ts` to `cekici-email-otp.ts`, `route.ts`, `google-maps.ts`, `CekiciPanelTabs.tsx`, `MusteriAnaSayfa.tsx`, `page.tsx`, `route.ts`, `route.ts`, `kredi-odeme.ts`, `route.ts`, `page.tsx`, `demo-responses.ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `Card()` connect `page.tsx` to `layout.tsx`, `page.tsx`, `route.ts`, `page.tsx`, `ensureSeedData`, `db.ts`, `hizmet-veren-sayim.ts`, `page.tsx`, `MusteriAnaSayfa.tsx`, `ensureSeedData`, `page.tsx`, `CerezOnayBanner.tsx`, `MemnuniyetBekle.tsx`, `page.tsx`, `route.ts`, `kredi-odeme.ts`, `page.tsx`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _317 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getSupabaseAdmin` be split into smaller, more focused modules?**
  _Cohesion score 0.0841813135985199 - nodes in this community are weakly interconnected._
- **Should `ensureSeedData` be split into smaller, more focused modules?**
  _Cohesion score 0.07756813417190776 - nodes in this community are weakly interconnected._
- **Should `ui.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11178451178451178 - nodes in this community are weakly interconnected._