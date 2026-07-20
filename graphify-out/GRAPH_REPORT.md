# Graph Report - acilcozumbul  (2026-07-20)

## Corpus Check
- 351 files · ~374,311 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1480 nodes · 4587 edges · 70 communities (62 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4b93a5dc`
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
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_teklif-db.ts|teklif-db.ts]]
- [[_COMMUNITY_Ölçeklenebilirlik regression smoke checklist|Ölçeklenebilirlik regression smoke checklist]]
- [[_COMMUNITY_verify-teklif-backfill.mjs|verify-teklif-backfill.mjs]]
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

## Communities (70 total, 8 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.19
Nodes (21): POST(), GET(), POST(), POST(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder() (+13 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.21
Nodes (6): gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi, satirFromCekici()

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.08
Nodes (38): eslintConfig, main(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku() (+30 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.20
Nodes (23): POST(), POST(), bekleyenCekiciKayitOtp(), cekiciKayitOtpDogrula(), cekiciKayitOtpGonder(), CekiciKayitOtpKayit, CekiciKayitOtpRow, cekiciKayitOtpTemizle() (+15 more)

### Community 4 - "seo.ts"
Cohesion: 0.17
Nodes (18): GET(), escapeXml(), GondericiAdiSorguSonuc, netgsmGondericiAdlariSorgula(), netgsmKimlik(), netgsmOtpSmsGonder(), netgsmXmlGonder(), netgsmYapilandirildi() (+10 more)

### Community 5 - "mappers.ts"
Cohesion: 0.19
Nodes (12): GET(), GET(), GET(), Saglik, countSmsLog(), getSmsLog(), getTaleplerSince(), hizmetVerenSayimHesapla() (+4 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.08
Nodes (38): GET(), CekiciRotaPanelProps, embedDirectionsUrl(), googleMapsDirUrl(), MusteriCekiciTakipHarita(), MusteriCekiciTakipHaritaProps, TakipVerisi, mesafeKmHaversine() (+30 more)

### Community 7 - "ui.tsx"
Cohesion: 0.08
Nodes (17): DegerlendirmeSatir, Ozet, Ozet, ArizaFotografAlani(), ArizaFotografAlaniProps, formatKalan(), MemnuniyetBekle(), FormAdimi (+9 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (34): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+26 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.25
Nodes (10): insertTeklif(), listTekliflerByCekici(), listTekliflerByTalepIds(), setKaybedenTeklifler(), teklifFromRow(), TeklifRow, teklifToRow(), updateTeklifDurum() (+2 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.26
Nodes (15): GET(), ayniIstanbulGunuMu(), bekleyenOtpBilgisi(), istanbulGunAnahtari(), istanbulGunSonunaKalanSn(), otpDogrula(), otpEskiKayitlariTemizle(), otpFromRow() (+7 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.09
Nodes (47): bolgeOzet(), GET(), PUT(), POST(), KayitIcerik(), cekiciTalepBolgesineUygunMu(), cekiciTalepIlIlceyeUygunMu(), cekiciTalepMenzileUygunMu() (+39 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.19
Nodes (17): GET(), POST(), POST(), POST(), GET(), PUT(), saatGecerliMi(), GET() (+9 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.08
Nodes (46): GET(), GET(), PUT(), GET(), GET(), PATCH(), POST(), BOS_FORM (+38 more)

### Community 15 - "db.ts"
Cohesion: 0.42
Nodes (13): POST(), POST(), POST(), SifremiUnuttumPage(), getCekiciByTelefon(), otpBasariMesaji(), otpBekleyenMesaji(), otpGelmediMesaji() (+5 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.14
Nodes (10): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitKontenjanBilgi(), Props, Props, YasalOnayKutusu(), YasalSiteFooter() (+2 more)

### Community 17 - "route.ts"
Cohesion: 0.07
Nodes (31): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, metadata (+23 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.14
Nodes (23): CekiciRotaPanel(), embedDirectionsUrl(), RotaSureleri, GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI (+15 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.15
Nodes (26): POST(), GET(), baseUrlFrom(), GET(), POST(), cekiciHizmetPuani, DegerlendirmeRow, getDegerlendirmeByTalepId() (+18 more)

### Community 20 - "page.tsx"
Cohesion: 0.14
Nodes (13): BekleIcerik(), Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps (+5 more)

### Community 21 - "davet-panel.ts"
Cohesion: 0.20
Nodes (14): config, middleware(), POST(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli(), supabaseEksikEnvAlanlari() (+6 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.05
Nodes (119): GET(), POST(), GET(), rotaKoordinatlari(), POST(), GET(), listeDurumuBelirle(), toOzet() (+111 more)

### Community 24 - "page.tsx"
Cohesion: 0.13
Nodes (8): OnayIcerik(), Adim, SmsKaydi, BrandLogoYazili(), MobileShell(), MobileShellProps, PanelGirisFormProps, SifreAlani

### Community 25 - "kredi-odeme.ts"
Cohesion: 0.11
Nodes (19): GET(), GET(), hizmetBolgeleriFlatten(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), cekiciFromRow(), CekiciRow (+11 more)

### Community 26 - "route.ts"
Cohesion: 0.19
Nodes (19): IZINLI, POST(), POST(), GET(), POST(), FunnelOlay, funnelOlayKaydet(), funnelOlaySay() (+11 more)

### Community 27 - "page.tsx"
Cohesion: 0.11
Nodes (27): CekiciTalepClient(), TalepDurum, CekiciAyarlarPanel(), DavetKoduAyarlari(), KisiselVeriGizlemeAyarlari(), BADGE, CekiciPanelTabs(), Istatistik (+19 more)

### Community 28 - "cekici-email-otp.ts"
Cohesion: 0.22
Nodes (13): PATCH(), GET(), POST(), sonKullanmaAyir(), tcKimlikGecerliMi(), vergiNoGecerliMi(), istemciIpAl(), faturaAlanlariniDogrula() (+5 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "demo-responses.ts"
Cohesion: 0.37
Nodes (12): envInt(), guvenlikSay(), IP_LIMIT(), IP_SAAT(), OTP_IP_DK(), OTP_IP_LIMIT(), otpFraudKontrol(), pencereBaslangic() (+4 more)

### Community 32 - "getCekiciById"
Cohesion: 0.24
Nodes (13): anlasilanIsSay(), cekiciPuanOzeti, computePuanFromTables(), fiyatGarantiPuaniHesapla(), normalizeTeklif(), ozetFromCounts(), tercihPuaniHesapla(), gorunurTercihPuani() (+5 more)

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.31
Nodes (10): bildirimRowsFromTalepler(), cekiciToRow(), dataDir, haricRowsFromTalepler(), main(), readJson(), supabase, talepToRow() (+2 more)

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.23
Nodes (7): metadata, PanelChrome(), LINKS, PanelNav(), NavSayacRozet(), PanelNavSayac, usePanelNavSayac()

### Community 35 - "NasilCalisirSerit.tsx"
Cohesion: 0.05
Nodes (55): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimGostergesi(), HizmetVerenSayimGostergesiProps, useAnimatedNumber(), MusteriAnaSayfaIcerik(), HizmetVerenSayimPanel() (+47 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "route.ts"
Cohesion: 0.21
Nodes (15): POST(), POST(), KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI, KrediPaket, krediPaketBul(), krediPaketOdenecekTL(), KrediPaketTl (+7 more)

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
Cohesion: 0.36
Nodes (8): kayitliAdSoyadUygula(), depolama(), MusteriProfil, musteriProfilKaydet(), musteriProfilOku(), okuHarita(), ProfilHaritasi, yazHarita()

### Community 53 - "davet-kayit.ts"
Cohesion: 0.19
Nodes (12): GET(), POST(), GET(), POST(), GET(), GET(), PATCH(), GET() (+4 more)

### Community 54 - "page.tsx"
Cohesion: 0.18
Nodes (20): POST(), authAnonClient(), authSignIn(), cekiciAuthEmail(), cekiciAuthKullaniciOlustur(), cekiciAuthSifreDogrula(), cekiciAuthSifreGuncelle(), cekiciSifreyiAuthaTasi() (+12 more)

### Community 55 - "route.ts"
Cohesion: 0.32
Nodes (3): POST(), POST(), getCekiciByToken()

### Community 56 - "route.ts"
Cohesion: 0.19
Nodes (13): cekiciAuthKullaniciSil(), belgeBase64Ayikla(), cekiciBelgeYukle(), IZINLI_MIME, uzanti(), cekiciBelgeleriniSil(), silCekiciCascade(), mockFrom (+5 more)

### Community 57 - "route.ts"
Cohesion: 0.52
Nodes (6): GET(), haftaBaslangici(), istanbulAyAnahtari(), kazananTeklifFiyati(), getTaleplerByKazananCekici(), countHaricByCekici()

### Community 58 - "cerez-onay.ts"
Cohesion: 0.11
Nodes (30): geist, metadata, RootLayout(), viewport, CerezOnayBanner(), Gorunum, tercihKaydet(), GoogleAnalytics() (+22 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.11
Nodes (16): belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), BelgeYuklemeAlani(), Props, AVANTAJLAR, CekiciKayitLanding(), CekiciKayitLandingProps (+8 more)

### Community 61 - "kredi-odeme.ts"
Cohesion: 0.12
Nodes (20): KrediPage(), OdemeOnayPage(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, MemnuniyetFormu(), MemnuniyetFormuProps, funnelKaydet(), Field (+12 more)

### Community 62 - "davet-panel.ts"
Cohesion: 0.24
Nodes (6): GET(), DavetKullanimRow, DavetKullanimSatir, DavetLiderSatir, DavetPanelOzet, getDavetPanelVerisi()

### Community 63 - "route.ts"
Cohesion: 0.60
Nodes (4): noktaOku(), POST(), istemciYerelMi(), yerelOrtamMi()

### Community 64 - "route.ts"
Cohesion: 0.70
Nodes (4): GET(), countCekiciler(), countCekicilerBelgeDurum(), countTalepler()

### Community 65 - "page.tsx"
Cohesion: 0.25
Nodes (8): DELETE(), GET(), DemoDurum, DemoSms, kalanSureFormat(), PanelDemoPage(), SIMULE_ADIMLAR, cekiciPanelOzet

### Community 69 - "teklif-db.ts"
Cohesion: 0.13
Nodes (26): GET(), addSmsKaydi(), addTalep(), bugunBaslangicIso(), getCekicilerBildirimAdaylari(), getTalepler(), getTaleplerBugun(), getTaleplerMemnuniyetBekleyen() (+18 more)

### Community 79 - "SorunTipiSecimi.tsx"
Cohesion: 0.17
Nodes (16): BolgeApiData, BolgeAyarlari(), BolgeAyarlariProps, BolgeApiData, DavetKoduDurum, GUNLER, MusaitlikAyarlari(), Durum (+8 more)

## Knowledge Gaps
- **284 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+279 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `route.ts` to `demo-oturum.ts`, `getSupabaseAdmin`, `mappers.ts`, `google-maps.ts`, `CekiciPanelTabs.tsx`, `sms-provider.ts`, `CekiciAyarlarPanel.tsx`, `memnuniyet.ts`, `db.ts`, `ensureSeedData`, `route.ts`, `kredi-odeme.ts`, `route.ts`, `cekici-email-otp.ts`, `demo-responses.ts`, `getCekiciById`, `route.ts`, `davet-kayit.ts`, `page.tsx`, `route.ts`, `route.ts`, `davet-panel.ts`, `route.ts`, `teklif-db.ts`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `Card()` connect `ui.tsx` to `page.tsx`, `telefonNormalize`, `NasilCalisirSerit.tsx`, `mappers.ts`, `ensureSeedData`, `memnuniyet.ts`, `SorunTipiSecimi.tsx`, `hizmet-veren-sayim.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `page.tsx`, `kredi-odeme.ts`, `page.tsx`, `route.ts`, `kredi-odeme.ts`, `davet-panel.ts`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `telefonNormalize()` connect `getSupabaseAdmin` to `CekiciPanelTabs.tsx`, `sms-provider.ts`, `db.ts`, `MusteriAnaSayfa.tsx`, `CerezOnayBanner.tsx`, `page.tsx`, `route.ts`, `page.tsx`, `demo-responses.ts`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _284 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cekici-email-otp.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08489795918367347 - nodes in this community are weakly interconnected._
- **Should `ensureSeedData` be split into smaller, more focused modules?**
  _Cohesion score 0.08421985815602837 - nodes in this community are weakly interconnected._
- **Should `ui.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08387096774193549 - nodes in this community are weakly interconnected._