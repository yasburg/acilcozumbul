# Graph Report - acilcozumbul  (2026-07-22)

## Corpus Check
- 400 files · ~395,778 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1678 nodes · 5250 edges · 74 communities (66 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a033d9d7`
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
- [[_COMMUNITY_admin.ts|admin.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_sorun-tipleri.ts|sorun-tipleri.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_Ölçeklenebilirlik regression smoke checklist|Ölçeklenebilirlik regression smoke checklist]]
- [[_COMMUNITY_verify-teklif-backfill.mjs|verify-teklif-backfill.mjs]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_telefonNormalize|telefonNormalize]]

## God Nodes (most connected - your core abstractions)
1. `getSupabaseAdmin()` - 163 edges
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

## Communities (74 total, 8 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.17
Nodes (19): eslintConfig, main(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku() (+11 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.16
Nodes (32): GET(), rotaKoordinatlari(), POST(), listeDurumuBelirle(), toOzet(), cekiciTalepBolgesineUygunMu(), cekiciTalepSorununaUygunMu(), demoListeDurumuBelirle() (+24 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.22
Nodes (17): GET(), ayniIstanbulGunuMu(), bekleyenOtpBilgisi(), istanbulGunAnahtari(), istanbulGunSonunaKalanSn(), otpDogrula(), otpEskiKayitlariTemizle(), otpFromRow() (+9 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.16
Nodes (19): garantiHashHesapla(), garantiXmlDeger(), GARANTI_HATA_KODLARI, garantiKodNormalize(), garantiMesajGenelMi(), garantiMusteriHataMesaji(), garantiYetersizBakiyeMetniMi(), GENEL_MESAJ_ORNEKLERI (+11 more)

### Community 4 - "seo.ts"
Cohesion: 0.18
Nodes (22): POST(), GET(), GET(), POST(), GET(), BekleIcerik(), cekiciPuanOzetleri(), teklifFiyatDegistiMi() (+14 more)

### Community 5 - "mappers.ts"
Cohesion: 0.06
Nodes (85): GET(), POST(), POST(), POST(), POST(), POST(), GET(), PUT() (+77 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.07
Nodes (24): DegerlendirmeSatir, Ozet, BOS_FORM, KampanyaSatir, KullanimSatir, Ozet, Ozet, BOS_FORM (+16 more)

### Community 7 - "ui.tsx"
Cohesion: 0.27
Nodes (6): POST(), POST(), POST(), getCurrentCekici(), getCekiciByToken(), rozetIndirimYuzde()

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (35): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+27 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.10
Nodes (29): GenelTelefon, KampanyaSablon, KuyrukIs, ListeAlici, ListeOzet, OncekiMod, PanelTopluSmsPage(), Sekme (+21 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.44
Nodes (12): POST(), POST(), POST(), SifremiUnuttumPage(), otpBasariMesaji(), otpBekleyenMesaji(), otpGelmediMesaji(), OtpGonderimSonuc (+4 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.07
Nodes (32): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, metadata (+24 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.19
Nodes (17): PATCH(), GET(), POST(), sonKullanmaAyir(), tcKimlikGecerliMi(), vergiNoGecerliMi(), istemciIpAl(), faturaAlanlariniDogrula() (+9 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.07
Nodes (48): GET(), GET(), PUT(), GET(), GET(), GET(), PATCH(), POST() (+40 more)

### Community 15 - "db.ts"
Cohesion: 0.22
Nodes (13): config, middleware(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli(), supabaseEksikEnvAlanlari(), supabaseYapilandirildi() (+5 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.17
Nodes (14): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), Props, YasalOnayKutusu(), DOGUM_AYLARI, dogumAyGunSayisi() (+6 more)

### Community 17 - "route.ts"
Cohesion: 0.06
Nodes (58): bolgeOzet(), GET(), POST(), PUT(), POST(), GET(), GET(), cekiciTalepIlIlceyeUygunMu() (+50 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.10
Nodes (29): CekiciRotaPanel(), embedDirectionsUrl(), RotaSureleri, GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI (+21 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.20
Nodes (17): GET(), haftaBaslangici(), istanbulAyAnahtari(), kazananTeklifFiyati(), anlasilanIsSay(), cekiciPuanOzeti, computePuanFromTables(), fiyatGarantiPuaniHesapla() (+9 more)

### Community 20 - "page.tsx"
Cohesion: 0.11
Nodes (16): Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps, MemnuniyetFormu() (+8 more)

### Community 21 - "davet-panel.ts"
Cohesion: 0.16
Nodes (14): adimAciklamaMetni(), Props, SorunAkisOzeti(), SorunAkisOzetiIcerik(), SorunSecimi(), SorunSecimiProps, CEKICI_ADIMLAR, SORUN_AKIS_ACIKLAMA (+6 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.09
Nodes (45): GET(), GET(), POST(), GET(), POST(), POST(), GET(), GECERLI (+37 more)

### Community 24 - "page.tsx"
Cohesion: 0.18
Nodes (20): POST(), GET(), baseUrlFrom(), GET(), POST(), DegerlendirmeRow, getDegerlendirmeByTalepId(), getDegerlendirmelerByCekiciId() (+12 more)

### Community 25 - "kredi-odeme.ts"
Cohesion: 0.29
Nodes (10): GET(), chunk(), ekleTopluSmsGecmisAlicilar(), genelDeftereYaz(), getTopluSmsGenelTelefonlar(), getTopluSmsListeAlicilar(), getTopluSmsListeler(), TopluSmsGenelTelefon (+2 more)

### Community 26 - "route.ts"
Cohesion: 0.22
Nodes (17): Ctx, DELETE(), panelKullanici(), PATCH(), GET(), panelKullanici(), POST(), guncelleSmsSablon() (+9 more)

### Community 27 - "page.tsx"
Cohesion: 0.10
Nodes (28): CekiciTalepClient(), TalepDurum, CekiciKart(), Gorunum, SehirSiralama, KisiselVeriGizlemeAyarlari(), BADGE, CekiciPanelTabs() (+20 more)

### Community 28 - "cekici-email-otp.ts"
Cohesion: 0.11
Nodes (38): PATCH(), GET(), addCekici(), addTalep(), getCekiciByDogrulanmisFaturaEposta(), getCekicilerBildirimAdaylari(), getTalepler(), getTaleplerMemnuniyetBekleyen() (+30 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "demo-responses.ts"
Cohesion: 0.23
Nodes (18): GET(), POST(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder(), EmailOtpKayit, EmailOtpRow (+10 more)

### Community 32 - "getCekiciById"
Cohesion: 0.25
Nodes (13): POST(), POST(), POST(), panelKullanici(), POST(), GET(), panelKullanici(), POST() (+5 more)

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.31
Nodes (10): bildirimRowsFromTalepler(), cekiciToRow(), dataDir, haricRowsFromTalepler(), main(), readJson(), supabase, talepToRow() (+2 more)

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.23
Nodes (7): metadata, PanelChrome(), LINKS, PanelNav(), NavSayacRozet(), PanelNavSayac, usePanelNavSayac()

### Community 35 - "NasilCalisirSerit.tsx"
Cohesion: 0.19
Nodes (19): register(), baslatTopluSmsGecmisListe(), aliciSayisi(), calisanIsler, calistirTopluSmsIsi(), ensureTopluSmsScheduler(), getTopluSmsIs(), GlobalScheduler (+11 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "route.ts"
Cohesion: 0.08
Nodes (42): noktaOku(), POST(), GET(), CekiciRotaPanelProps, embedDirectionsUrl(), googleMapsDirUrl(), MusteriCekiciTakipHarita(), MusteriCekiciTakipHaritaProps (+34 more)

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.38
Nodes (5): hedefAltYazi(), KonumGuncellemeGostergesi(), renkKaristir(), TURUNCU, YESIL

### Community 41 - "route.ts"
Cohesion: 0.23
Nodes (11): IZINLI, POST(), POST(), FunnelOlay, funnelOlayKaydet(), funnelOlaySay(), FunnelOzet, funnelOzetHesapla() (+3 more)

### Community 52 - "CerezOnayBanner.tsx"
Cohesion: 0.14
Nodes (21): GET(), addSmsKaydi(), escapeXml(), GondericiAdiSorguSonuc, logSmsKaydi(), netgsmGondericiAdlariSorgula(), netgsmKimlik(), netgsmOtpSmsGonder() (+13 more)

### Community 53 - "KayitKontenjanBilgi.tsx"
Cohesion: 0.24
Nodes (9): GET(), GET(), KayitKontenjanBilgi(), Props, KayitKontenjanDurum, kayitKontenjanHesapla(), countCekiciler(), countCekicilerBelgeDurum() (+1 more)

### Community 54 - "ArizaFotografAlani.tsx"
Cohesion: 0.25
Nodes (12): POST(), POST(), KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI, KrediPaket, krediPaketBul(), krediPaketOdenecekTL(), KrediPaketTl (+4 more)

### Community 55 - "route.ts"
Cohesion: 0.37
Nodes (12): envInt(), guvenlikSay(), IP_LIMIT(), IP_SAAT(), OTP_IP_DK(), OTP_IP_LIMIT(), otpFraudKontrol(), pencereBaslangic() (+4 more)

### Community 56 - "route.ts"
Cohesion: 0.23
Nodes (11): HaritaNokta, PanelCekiciHarita(), RENK, SehirAdet, haritaSehirNoktalari(), haritaYaricapLog(), IlKoordinat, ilKoordinatBul() (+3 more)

### Community 57 - "NasilCalisirSerit.tsx"
Cohesion: 0.11
Nodes (25): GET(), hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesi(), HizmetVerenSayimGostergesiProps, useAnimatedNumber(), HizmetVerenSayimPanel() (+17 more)

### Community 58 - "cerez-onay.ts"
Cohesion: 0.10
Nodes (40): geist, metadata, RootLayout(), viewport, CerezOnayBanner(), Gorunum, tercihKaydet(), GoogleAnalytics() (+32 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.09
Nodes (18): belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), BelgeYuklemeAlani(), Props, ANCHOR_IDS, AVANTAJLAR, CekiciKayitLanding() (+10 more)

### Community 61 - "kredi-odeme.ts"
Cohesion: 0.09
Nodes (23): OnayIcerik(), KrediPage(), OdemeOnayPage(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, Adim, SmsKaydi, BrandLogoYazili() (+15 more)

### Community 62 - "page.tsx"
Cohesion: 0.52
Nodes (4): GET(), KULLANIMA_ACIK_ILLER, sehirBeklemeMesaji(), sehirKullanimAcikMi()

### Community 63 - "davet-panel.ts"
Cohesion: 0.23
Nodes (15): GET(), GET(), GET(), SMS50_VARYANTLAR, sms50FooterSatirlari(), sms50KayitUrl(), sms50KisaPath(), sms50KisaUrl() (+7 more)

### Community 64 - "layout.tsx"
Cohesion: 0.09
Nodes (22): DELETE(), GET(), GET(), GET(), DemoDurum, DemoSms, kalanSureFormat(), PanelDemoPage() (+14 more)

### Community 66 - "admin.ts"
Cohesion: 0.17
Nodes (13): GET(), GET(), GET(), Saglik, bugunBaslangicIso(), countSmsLog(), getSmsLog(), getTaleplerBugun() (+5 more)

### Community 67 - "route.ts"
Cohesion: 0.83
Nodes (3): GET(), istemciIp(), ozelIp()

### Community 68 - "sorun-tipleri.ts"
Cohesion: 0.13
Nodes (27): POST(), POST(), demoKatil(), demoKatilMesaji(), anlasamadiSonrasiIhaleyiSurdur(), cekiciBildirimKrediTutari(), cekiciPremiumSmsAktifMi(), cekiciTalepSmsAdayiMi() (+19 more)

### Community 69 - "route.ts"
Cohesion: 0.36
Nodes (8): panelKullanici(), POST(), NETGSM_TR_CIFTE, netgsmSmsBirimHesapla(), netgsmSmsMesajGecerliMi(), netgsmSmsParcaSayisi(), sendPanelTopluSms(), kaydetTopluSmsGecmis()

### Community 71 - "route.ts"
Cohesion: 0.18
Nodes (20): POST(), MusteriAnaSayfaIcerik(), HIZMET_QUERY_HARITASI, hizmetQuerydenSorunTipi(), SORUN_ARAC_MODELI_TIPLERI, SORUN_CAGRI_BUTON, SORUN_FOTOGRAF_TIPLERI, SORUN_HEDEF_KONUM_ATLANIR (+12 more)

### Community 74 - "page.tsx"
Cohesion: 0.15
Nodes (15): BolgeApiData, BolgeAyarlari(), BolgeAyarlariProps, BolgeApiData, CekiciAyarlarPanel(), Durum, PremiumSmsAyarlari(), IlceSecimi() (+7 more)

### Community 77 - "telefonNormalize"
Cohesion: 0.52
Nodes (5): GET(), getDogrulanmisTelefon(), musteriTelCookieAyarla(), musteriTelCookieDegeri(), musteriTelCookieTemizle()

## Knowledge Gaps
- **323 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+318 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `cekici-email-otp.ts` to `cekici-email-otp.ts`, `seo.ts`, `mappers.ts`, `ui.tsx`, `CekiciPanelTabs.tsx`, `CekiciAyarlarPanel.tsx`, `memnuniyet.ts`, `route.ts`, `ensureSeedData`, `route.ts`, `page.tsx`, `kredi-odeme.ts`, `route.ts`, `demo-responses.ts`, `getCekiciById`, `NasilCalisirSerit.tsx`, `route.ts`, `CerezOnayBanner.tsx`, `KayitKontenjanBilgi.tsx`, `ArizaFotografAlani.tsx`, `route.ts`, `davet-panel.ts`, `layout.tsx`, `admin.ts`, `sorun-tipleri.ts`, `route.ts`?**
  _High betweenness centrality (0.103) - this node is a cross-community bridge._
- **Why does `telefonNormalize()` connect `mappers.ts` to `getCekiciById`, `cekici-email-otp.ts`, `NasilCalisirSerit.tsx`, `route.ts`, `route.ts`, `google-maps.ts`, `CekiciPanelTabs.tsx`, `telefonNormalize`, `MusteriAnaSayfa.tsx`, `route.ts`, `kredi-odeme.ts`, `page.tsx`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `Card()` connect `ensureSeedData` to `layout.tsx`, `admin.ts`, `route.ts`, `google-maps.ts`, `page.tsx`, `memnuniyet.ts`, `hizmet-veren-sayim.ts`, `route.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `KayitKontenjanBilgi.tsx`, `NasilCalisirSerit.tsx`, `page.tsx`, `route.ts`, `kredi-odeme.ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _323 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `mappers.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05554575912537471 - nodes in this community are weakly interconnected._
- **Should `ensureSeedData` be split into smaller, more focused modules?**
  _Cohesion score 0.06736353077816493 - nodes in this community are weakly interconnected._
- **Should `TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._