# Graph Report - acilcozumbul  (2026-07-23)

## Corpus Check
- 403 files · ~397,843 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1693 nodes · 5307 edges · 81 communities (73 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c0f49584`
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
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_SorunAkisOzeti.tsx|SorunAkisOzeti.tsx]]
- [[_COMMUNITY_musteri-profil.ts|musteri-profil.ts]]
- [[_COMMUNITY_Ölçeklenebilirlik regression smoke checklist|Ölçeklenebilirlik regression smoke checklist]]
- [[_COMMUNITY_verify-teklif-backfill.mjs|verify-teklif-backfill.mjs]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_getCekiciById|getCekiciById]]
- [[_COMMUNITY_teklif-db.ts|teklif-db.ts]]
- [[_COMMUNITY_KayitKontenjanBilgi.tsx|KayitKontenjanBilgi.tsx]]
- [[_COMMUNITY_NasilCalisirSerit.tsx|NasilCalisirSerit.tsx]]
- [[_COMMUNITY_cekici-belge.ts|cekici-belge.ts]]
- [[_COMMUNITY_talep-fotograf.ts|talep-fotograf.ts]]

## God Nodes (most connected - your core abstractions)
1. `getSupabaseAdmin()` - 164 edges
2. `ensureSeedData()` - 96 edges
3. `getCurrentCekici()` - 67 edges
4. `telefonNormalize()` - 67 edges
5. `Card()` - 47 edges
6. `telefonGecerliMi()` - 45 edges
7. `getCekiciById()` - 37 edges
8. `updateCekici()` - 34 edges
9. `Btn()` - 33 edges
10. `panelEpostaIzinli()` - 26 edges

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

## Communities (81 total, 8 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.24
Nodes (14): POST(), DELETE(), hesapSilOnayMetniGecerliMi(), cekiciHesapSilOtpDogrula(), CekiciHesapSilOtpKayit, cekiciHesapSilOtpOlustur(), cekiciHesapSilOtpSil(), fromRow() (+6 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.16
Nodes (21): GET(), GET(), GET(), GET(), GET(), hizmetBolgeleriFlatten(), bugunBaslangicIso(), countCekiciler() (+13 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.05
Nodes (107): POST(), POST(), POST(), POST(), POST(), IZINLI, POST(), GET() (+99 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.16
Nodes (19): garantiHashHesapla(), garantiXmlDeger(), GARANTI_HATA_KODLARI, garantiKodNormalize(), garantiMesajGenelMi(), garantiMusteriHataMesaji(), garantiYetersizBakiyeMetniMi(), GENEL_MESAJ_ORNEKLERI (+11 more)

### Community 4 - "seo.ts"
Cohesion: 0.25
Nodes (11): GET(), GET(), GET(), POST(), GET(), cekiciPuanOzetleri(), isDemoTalepId(), demoCookieYanitaYaz() (+3 more)

### Community 5 - "mappers.ts"
Cohesion: 0.11
Nodes (18): GET(), GET(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), CekiciRow, krediOdemeFromRow(), KrediOdemeRow (+10 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.08
Nodes (15): DegerlendirmeSatir, Ozet, BOS_FORM, KampanyaSatir, KullanimSatir, Ozet, Ozet, Saglik (+7 more)

### Community 7 - "ui.tsx"
Cohesion: 0.12
Nodes (23): POST(), GET(), POST(), POST(), POST(), POST(), GET(), PUT() (+15 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (35): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+27 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.09
Nodes (26): GenelTelefon, KampanyaSablon, KuyrukIs, ListeAlici, ListeOzet, OncekiMod, PanelTopluSmsPage(), SaatIzgarasi (+18 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.17
Nodes (19): eslintConfig, main(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku() (+11 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.22
Nodes (10): metadata, metadata, metadata, metadata, metadata, YasalBolum(), YasalListe(), YasalSayfaShell() (+2 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.26
Nodes (11): POST(), KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI, KrediPaket, krediPaketBul(), krediPaketOdenecekTL(), KrediPaketTl, krediTutarKurus() (+3 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.20
Nodes (17): GET(), PATCH(), POST(), ekleKampanya(), getKampanyaByKod(), getKampanyaKullanimlari(), getKampanyalar(), guncelleKampanya() (+9 more)

### Community 15 - "db.ts"
Cohesion: 0.28
Nodes (12): PATCH(), POST(), sonKullanmaAyir(), tcKimlikGecerliMi(), vergiNoGecerliMi(), istemciIpAl(), faturaAlanlariniDogrula(), getBekleyenOdeme() (+4 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.14
Nodes (16): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), Props, YasalOnayKutusu(), YasalSiteFooter(), DOGUM_AYLARI (+8 more)

### Community 17 - "route.ts"
Cohesion: 0.06
Nodes (58): bolgeOzet(), GET(), POST(), PUT(), GET(), cekiciTalepIlIlceyeUygunMu(), cekiciTalepMenzileUygunMu(), filtreleCekicilerBolge() (+50 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.13
Nodes (24): ArizaFotografAlani(), GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI, Step, STEP_SIRA (+16 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.21
Nodes (13): GET(), PUT(), GET(), GET(), GET(), GET(), GET(), getCekiciler() (+5 more)

### Community 20 - "page.tsx"
Cohesion: 0.10
Nodes (19): BekleIcerik(), Durum, MemnuniyetState, TeklifOzet, DemoHeaderBadge(), Asama, ASAMA_METIN, IhaleBekleAnimasyon() (+11 more)

### Community 21 - "davet-panel.ts"
Cohesion: 0.24
Nodes (14): GET(), HizmetVerenSayimGostergesi(), useAnimatedNumber(), cevrimiciJitterFaktor(), cevrimiciJitterUygula(), HIZMET_ETIKET, hizmetVerenEtiket(), hizmetVerenKisaMetin() (+6 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.05
Nodes (96): GET(), rotaKoordinatlari(), POST(), listeDurumuBelirle(), toOzet(), POST(), POST(), POST() (+88 more)

### Community 24 - "page.tsx"
Cohesion: 0.15
Nodes (28): POST(), GET(), baseUrlFrom(), GET(), POST(), GET(), getTalepById(), cekiciHizmetPuani (+20 more)

### Community 25 - "kredi-odeme.ts"
Cohesion: 0.18
Nodes (20): POST(), GET(), POST(), POST(), panelKullanici(), POST(), createClient(), topluSmsGecmisTablolariVar() (+12 more)

### Community 26 - "route.ts"
Cohesion: 0.23
Nodes (16): Ctx, DELETE(), panelKullanici(), PATCH(), GET(), panelKullanici(), POST(), guncelleSmsSablon() (+8 more)

### Community 27 - "page.tsx"
Cohesion: 0.14
Nodes (24): CekiciTalepClient(), CekiciKart(), DavetKoduAyarlari(), KisiselVeriGizlemeAyarlari(), BADGE, CekiciPanelTabs(), Istatistik, PanelData (+16 more)

### Community 28 - "cekici-email-otp.ts"
Cohesion: 0.15
Nodes (19): GET(), haftaBaslangici(), istanbulAyAnahtari(), kazananTeklifFiyati(), getTalepler(), getTaleplerByKazananCekici(), getTaleplerMemnuniyetBekleyen(), hydrateTalep() (+11 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "demo-responses.ts"
Cohesion: 0.23
Nodes (19): GET(), POST(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder(), EmailOtpKayit, EmailOtpRow (+11 more)

### Community 32 - "kayit-kodu.ts"
Cohesion: 0.24
Nodes (14): davetKayitBaslangicKredisiFromSonuc(), davetKayitHazirla(), DavetKayitSonuc, davetKayitBaslangicKredisi(), davetKoduGecerliMi(), davetKoduNormalize(), davetKoduOner(), YASAKLI_KODLAR (+6 more)

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.31
Nodes (10): bildirimRowsFromTalepler(), cekiciToRow(), dataDir, haricRowsFromTalepler(), main(), readJson(), supabase, talepToRow() (+2 more)

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.23
Nodes (7): metadata, PanelChrome(), LINKS, PanelNav(), NavSayacRozet(), PanelNavSayac, usePanelNavSayac()

### Community 35 - "NasilCalisirSerit.tsx"
Cohesion: 0.12
Nodes (30): POST(), panelKullanici(), POST(), GET(), panelKullanici(), register(), topluSmsIsTablolariVar(), aliciSayisi() (+22 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "route.ts"
Cohesion: 0.11
Nodes (32): noktaOku(), POST(), CekiciRotaPanel(), CekiciRotaPanelProps, embedDirectionsUrl(), RotaSureleri, embedDirectionsUrl(), googleMapsDirUrl() (+24 more)

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
Nodes (20): GET(), addSmsKaydi(), escapeXml(), GondericiAdiSorguSonuc, logSmsKaydi(), netgsmGondericiAdlariSorgula(), netgsmKimlik(), netgsmOtpSmsGonder() (+12 more)

### Community 53 - "KayitKontenjanBilgi.tsx"
Cohesion: 0.22
Nodes (13): config, middleware(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli(), supabaseEksikEnvAlanlari(), supabaseYapilandirildi() (+5 more)

### Community 54 - "seo.ts"
Cohesion: 0.15
Nodes (5): metadata, metadata, SAYFALAR, CEKICI_GIRIS_SEO, SITE_URL

### Community 55 - "page.tsx"
Cohesion: 0.21
Nodes (13): CekiciKayitLayout(), metadata, HomePage(), metadata, MusteriAnaSayfa(), JsonLd(), JsonLdProps, CEKICI_KAYIT_SEO (+5 more)

### Community 56 - "cekici-puan.ts"
Cohesion: 0.23
Nodes (14): anlasilanIsSay(), cekiciPuanOzeti, computePuanFromTables(), fiyatGarantiPuaniHesapla(), normalizeTeklif(), ozetFromCounts(), teklifFiyatDegistiMi(), tercihPuaniHesapla() (+6 more)

### Community 57 - "NasilCalisirSerit.tsx"
Cohesion: 0.15
Nodes (25): POST(), MusteriAnaSayfaIcerik(), addTalep(), notifyMusteri(), CEKICI_ADIMLAR, SORUN_AKIS_ACIKLAMA, sorunAkisAciklama, sorunAkisAdimSayisi() (+17 more)

### Community 58 - "cerez-onay.ts"
Cohesion: 0.09
Nodes (47): geist, metadata, RootLayout(), viewport, CerezOnayBanner(), Gorunum, tercihKaydet(), GoogleAnalytics() (+39 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.10
Nodes (16): BelgeYuklemeAlani(), Props, ANCHOR_IDS, AVANTAJLAR, CekiciKayitLanding(), CekiciKayitLandingProps, GUVEN_MADDELERI, HIZMET_BOLGESI (+8 more)

### Community 61 - "kredi-odeme.ts"
Cohesion: 0.10
Nodes (12): OnayIcerik(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, Adim, SmsKaydi, BrandLogoYazili(), MobileShell(), MobileShellProps (+4 more)

### Community 62 - "getSupabaseAdmin"
Cohesion: 0.33
Nodes (8): GET(), GET(), cekiciBelgeleriniSil(), kayitKoduDogrula(), getSupabaseAdmin(), supabaseDbAktif(), davetKoduSutunuVar(), kampanyaKoduSutunuVar()

### Community 63 - "davet-panel.ts"
Cohesion: 0.15
Nodes (25): GET(), GET(), BOS_FORM, Sablon, GET(), GET(), SMS50_VARYANTLAR, sms50FooterSatirlari() (+17 more)

### Community 64 - "layout.tsx"
Cohesion: 0.11
Nodes (15): KrediPage(), OdemeOnayPage(), belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), Gorunum, SehirSiralama, DemoDurum (+7 more)

### Community 65 - "route.ts"
Cohesion: 0.15
Nodes (18): GET(), POST(), POST(), KULLANIMA_ACIK_ILLER, sehirKullanimAcikMi(), getCekicilerBildirimAdaylari(), updateTalep(), demoKatilMesaji() (+10 more)

### Community 66 - "page.tsx"
Cohesion: 0.19
Nodes (8): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesiProps, HizmetVerenSayimPanel(), PanelGirisForm(), useHizmetVerenSayim(), HizmetVerenSayimOzet

### Community 67 - "route.ts"
Cohesion: 0.83
Nodes (3): GET(), istemciIp(), ozelIp()

### Community 68 - "PanelCekiciHarita.tsx"
Cohesion: 0.23
Nodes (11): HaritaNokta, PanelCekiciHarita(), RENK, SehirAdet, haritaSehirNoktalari(), haritaYaricapLog(), IlKoordinat, ilKoordinatBul() (+3 more)

### Community 69 - "route.ts"
Cohesion: 0.67
Nodes (4): NETGSM_TR_CIFTE, netgsmSmsBirimHesapla(), netgsmSmsMesajGecerliMi(), netgsmSmsParcaSayisi()

### Community 70 - "SorunAkisOzeti.tsx"
Cohesion: 0.22
Nodes (9): adimAciklamaMetni(), Props, SorunAkisOzeti(), SorunAkisOzetiIcerik(), SorunSecimi(), SorunSecimiProps, TextArea(), SorunAkisAdim (+1 more)

### Community 71 - "musteri-profil.ts"
Cohesion: 0.36
Nodes (8): kayitliAdSoyadUygula(), depolama(), MusteriProfil, musteriProfilKaydet(), musteriProfilOku(), okuHarita(), ProfilHaritasi, yazHarita()

### Community 74 - "page.tsx"
Cohesion: 0.11
Nodes (23): TalepDurum, BolgeApiData, BolgeAyarlari(), BolgeAyarlariProps, BolgeApiData, CekiciAyarlarPanel(), DavetKoduDurum, GUNLER (+15 more)

### Community 75 - "getCekiciById"
Cohesion: 0.31
Nodes (7): POST(), PATCH(), davetKayitBonusTamamla(), getCekiciById(), kaydetDavetKullanim(), updateCekiciBelgeDurum(), BelgeDurum

### Community 76 - "teklif-db.ts"
Cohesion: 0.33
Nodes (8): listTekliflerByCekici(), listTekliflerByTalep(), listTekliflerByTalepIds(), teklifFromRow(), TeklifRow, teklifToRow(), upsertTeklif(), TeklifDurumu

### Community 77 - "KayitKontenjanBilgi.tsx"
Cohesion: 0.43
Nodes (4): KayitKontenjanBilgi(), Props, KayitKontenjanDurum, kayitKontenjanHesapla()

### Community 78 - "NasilCalisirSerit.tsx"
Cohesion: 0.29
Nodes (5): FormAdimi, NASIL_ADIMLAR, NasilAdim, NasilCalisirSerit(), Props

### Community 79 - "cekici-belge.ts"
Cohesion: 0.60
Nodes (4): belgeBase64Ayikla(), cekiciBelgeYukle(), IZINLI_MIME, uzanti()

### Community 80 - "talep-fotograf.ts"
Cohesion: 0.83
Nodes (3): fotografBase64Ayikla(), talepFotografYukle(), uzanti()

## Knowledge Gaps
- **327 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+322 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `getSupabaseAdmin` to `demo-oturum.ts`, `telefonNormalize`, `cekici-email-otp.ts`, `mappers.ts`, `ui.tsx`, `CekiciAyarlarPanel.tsx`, `memnuniyet.ts`, `db.ts`, `route.ts`, `ensureSeedData`, `route.ts`, `page.tsx`, `kredi-odeme.ts`, `route.ts`, `cekici-email-otp.ts`, `demo-responses.ts`, `kayit-kodu.ts`, `NasilCalisirSerit.tsx`, `route.ts`, `CerezOnayBanner.tsx`, `cekici-puan.ts`, `NasilCalisirSerit.tsx`, `davet-panel.ts`, `route.ts`, `getCekiciById`, `teklif-db.ts`, `cekici-belge.ts`, `talep-fotograf.ts`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `telefonNormalize()` connect `cekici-email-otp.ts` to `demo-oturum.ts`, `NasilCalisirSerit.tsx`, `musteri-profil.ts`, `google-maps.ts`, `MusteriAnaSayfa.tsx`, `kredi-odeme.ts`, `page.tsx`, `NasilCalisirSerit.tsx`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `Card()` connect `ensureSeedData` to `layout.tsx`, `page.tsx`, `mappers.ts`, `route.ts`, `route.ts`, `page.tsx`, `google-maps.ts`, `KayitKontenjanBilgi.tsx`, `NasilCalisirSerit.tsx`, `hizmet-veren-sayim.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `page.tsx`, `route.ts`, `kredi-odeme.ts`, `davet-panel.ts`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _327 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cekici-email-otp.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05143863769817968 - nodes in this community are weakly interconnected._
- **Should `mappers.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11333333333333333 - nodes in this community are weakly interconnected._
- **Should `ensureSeedData` be split into smaller, more focused modules?**
  _Cohesion score 0.08266129032258064 - nodes in this community are weakly interconnected._