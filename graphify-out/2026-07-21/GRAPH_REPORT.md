# Graph Report - acilcozumbul  (2026-07-21)

## Corpus Check
- 354 files · ~374,802 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1492 nodes · 4634 edges · 68 communities (60 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.67)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `833f586b`
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
- [[_COMMUNITY_odeme.ts|odeme.ts]]
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

## Communities (68 total, 8 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.21
Nodes (19): POST(), GET(), POST(), bekleyenCekiciEpostaOtp(), cekiciEpostaDogrulandiMi(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder(), EmailOtpKayit (+11 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.26
Nodes (8): GET(), GET(), getCekiciler(), gonderimZamani(), onaylanmisSira(), RozetPanelOzet, rozetPanelVerisi, satirFromCekici()

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.15
Nodes (20): eslintConfig, main(), GET(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig (+12 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.19
Nodes (22): POST(), POST(), bekleyenCekiciKayitOtp(), cekiciKayitOtpDogrula(), cekiciKayitOtpGonder(), CekiciKayitOtpKayit, CekiciKayitOtpRow, cekiciKayitOtpTemizle() (+14 more)

### Community 4 - "seo.ts"
Cohesion: 0.17
Nodes (18): GET(), escapeXml(), GondericiAdiSorguSonuc, netgsmGondericiAdlariSorgula(), netgsmKimlik(), netgsmOtpSmsGonder(), netgsmXmlGonder(), netgsmYapilandirildi() (+10 more)

### Community 5 - "mappers.ts"
Cohesion: 0.30
Nodes (9): GET(), GET(), GET(), GET(), countSmsLog(), getSmsLog(), smsDurumu(), envInt() (+1 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.08
Nodes (42): noktaOku(), POST(), GET(), CekiciRotaPanelProps, embedDirectionsUrl(), googleMapsDirUrl(), MusteriCekiciTakipHarita(), MusteriCekiciTakipHaritaProps (+34 more)

### Community 7 - "ui.tsx"
Cohesion: 0.06
Nodes (24): Adim, DegerlendirmeSatir, Ozet, BOS_FORM, KampanyaSatir, KullanimSatir, Ozet, Ozet (+16 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (34): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+26 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.08
Nodes (47): GET(), POST(), POST(), POST(), GET(), GECERLI, POST(), DemoDurum (+39 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.17
Nodes (25): GET(), GET(), POST(), getDogrulanmisTelefon(), musteriTelCookieAyarla(), musteriTelCookieDegeri(), musteriTelCookieTemizle(), ayniIstanbulGunuMu() (+17 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.09
Nodes (44): bolgeOzet(), GET(), PUT(), cekiciTalepIlIlceyeUygunMu(), cekiciTalepMenzileUygunMu(), filtreleCekicilerBolge(), ilceEslesir(), normalize() (+36 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.23
Nodes (8): belgeBase64Ayikla(), cekiciBelgeYukle(), IZINLI_MIME, uzanti(), supabaseDbAktif(), fotografBase64Ayikla(), talepFotografYukle(), uzanti()

### Community 14 - "memnuniyet.ts"
Cohesion: 0.15
Nodes (26): GET(), GET(), GET(), PATCH(), POST(), ekleKampanya(), getKampanyaByKod(), getKampanyaKullanimlari() (+18 more)

### Community 15 - "db.ts"
Cohesion: 0.21
Nodes (19): POST(), POST(), IZINLI, POST(), POST(), POST(), SifremiUnuttumPage(), getCekiciByTelefon() (+11 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.21
Nodes (9): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), YasalSiteFooter(), dogumTarihiDogrula(), dogumTarihiMaxIso(), dogumTarihiMinIso() (+1 more)

### Community 17 - "route.ts"
Cohesion: 0.07
Nodes (31): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, metadata (+23 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.07
Nodes (41): GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI, funnelKaydet(), kayitliAdSoyadUygula(), MusteriAnaSayfa() (+33 more)

### Community 19 - "ensureSeedData"
Cohesion: 0.15
Nodes (19): garantiHashHesapla(), garantiXmlDeger(), GARANTI_HATA_KODLARI, garantiKodNormalize(), garantiMesajGenelMi(), garantiMusteriHataMesaji(), garantiYetersizBakiyeMetniMi(), GENEL_MESAJ_ORNEKLERI (+11 more)

### Community 20 - "page.tsx"
Cohesion: 0.11
Nodes (16): Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps, MemnuniyetFormu() (+8 more)

### Community 21 - "davet-panel.ts"
Cohesion: 0.14
Nodes (27): POST(), MusteriAnaSayfaIcerik(), adimAciklamaMetni(), Props, SorunAkisOzeti(), SorunAkisOzetiIcerik(), CEKICI_ADIMLAR, SORUN_AKIS_ACIKLAMA (+19 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.06
Nodes (99): POST(), GET(), POST(), POST(), POST(), POST(), GET(), GET() (+91 more)

### Community 24 - "page.tsx"
Cohesion: 0.17
Nodes (21): POST(), GET(), baseUrlFrom(), GET(), POST(), cekiciHizmetPuani, DegerlendirmeRow, getDegerlendirmeByTalepId() (+13 more)

### Community 25 - "kredi-odeme.ts"
Cohesion: 0.13
Nodes (18): GET(), GET(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), CekiciRow, krediOdemeFromRow(), KrediOdemeRow (+10 more)

### Community 26 - "route.ts"
Cohesion: 0.47
Nodes (5): FunnelOlay, funnelOlaySay(), FunnelOzet, funnelOzetHesapla(), talepTeklifVar()

### Community 27 - "page.tsx"
Cohesion: 0.13
Nodes (24): CekiciTalepClient(), TalepDurum, BADGE, CekiciPanelTabs(), Istatistik, PanelData, Tab, TalepKarti() (+16 more)

### Community 28 - "cekici-email-otp.ts"
Cohesion: 0.30
Nodes (10): PATCH(), POST(), sonKullanmaAyir(), tcKimlikGecerliMi(), vergiNoGecerliMi(), istemciIpAl(), faturaAlanlariniDogrula(), getBekleyenOdeme() (+2 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "demo-responses.ts"
Cohesion: 0.37
Nodes (12): envInt(), guvenlikSay(), IP_LIMIT(), IP_SAAT(), OTP_IP_DK(), OTP_IP_LIMIT(), otpFraudKontrol(), pencereBaslangic() (+4 more)

### Community 32 - "getCekiciById"
Cohesion: 0.34
Nodes (10): POST(), POST(), authAnonClient(), authSignIn(), cekiciAuthEmail(), cekiciAuthKullaniciOlustur(), cekiciAuthSifreDogrula(), cekiciAuthSifreGuncelle() (+2 more)

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.31
Nodes (10): bildirimRowsFromTalepler(), cekiciToRow(), dataDir, haricRowsFromTalepler(), main(), readJson(), supabase, talepToRow() (+2 more)

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.23
Nodes (7): metadata, PanelChrome(), LINKS, PanelNav(), NavSayacRozet(), PanelNavSayac, usePanelNavSayac()

### Community 35 - "NasilCalisirSerit.tsx"
Cohesion: 0.07
Nodes (40): config, middleware(), GET(), POST(), POST(), GET(), hataMesajiFromParam(), Ozet (+32 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "route.ts"
Cohesion: 0.27
Nodes (10): POST(), KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI, KrediPaket, krediPaketBul(), KrediPaketTl, krediTutarKurus(), krediTutarTL() (+2 more)

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
Cohesion: 0.23
Nodes (15): GET(), PUT(), davetKayitBaslangicKredisiFromSonuc(), davetKayitBonusTamamla(), davetKayitHazirla(), DavetKayitSonuc, davetKayitBaslangicKredisi(), davetKoduGecerliMi() (+7 more)

### Community 53 - "davet-kayit.ts"
Cohesion: 0.24
Nodes (9): GET(), GET(), KayitKontenjanBilgi(), Props, KayitKontenjanDurum, kayitKontenjanHesapla(), countCekiciler(), countCekicilerBelgeDurum() (+1 more)

### Community 54 - "page.tsx"
Cohesion: 0.29
Nodes (12): bekleyenCekiciSifreOtp(), cekiciSifreOtpDogrula(), cekiciSifreOtpGonder(), CekiciSifreOtpKayit, CekiciSifreOtpRow, cekiciSifreOtpTemizle(), fromRow(), otpGet() (+4 more)

### Community 55 - "route.ts"
Cohesion: 0.16
Nodes (10): belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), AnlasmaDurumu, BelgeDurum, OdemeTipi, SmsKaydi, TalepDurumu (+2 more)

### Community 56 - "route.ts"
Cohesion: 0.24
Nodes (8): DELETE(), GET(), cekiciAuthKullaniciSil(), cekiciBelgeleriniSil(), silCekiciCascade(), mockFrom, mockStorageFrom, cekiciPanelOzet

### Community 57 - "route.ts"
Cohesion: 0.16
Nodes (20): GET(), haftaBaslangici(), istanbulAyAnahtari(), kazananTeklifFiyati(), anlasilanIsSay(), cekiciPuanOzeti, computePuanFromTables(), fiyatGarantiPuaniHesapla() (+12 more)

### Community 58 - "cerez-onay.ts"
Cohesion: 0.10
Nodes (39): geist, metadata, RootLayout(), viewport, CerezOnayBanner(), Gorunum, tercihKaydet(), GoogleAnalytics() (+31 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.12
Nodes (11): BelgeYuklemeAlani(), Props, AVANTAJLAR, CekiciKayitLanding(), CekiciKayitLandingProps, GUVEN_MADDELERI, IS_AKISI, YORUMLAR (+3 more)

### Community 61 - "kredi-odeme.ts"
Cohesion: 0.10
Nodes (21): OnayIcerik(), KrediPage(), OdemeOnayPage(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, SmsKaydi, BrandLogoYazili(), MobileShell() (+13 more)

### Community 62 - "davet-panel.ts"
Cohesion: 0.24
Nodes (6): GET(), DavetKullanimRow, DavetKullanimSatir, DavetLiderSatir, DavetPanelOzet, getDavetPanelVerisi()

### Community 63 - "odeme.ts"
Cohesion: 0.29
Nodes (8): POST(), durumEtiket(), OnayliCekiciHesap(), olusturBekleyenRozetOdeme(), rozetIndirimYuzde(), odemeToRow(), BekleyenOdeme, OdemeFatura

### Community 69 - "teklif-db.ts"
Cohesion: 0.12
Nodes (36): GET(), addSmsKaydi(), addTalep(), bugunBaslangicIso(), getCekicilerBildirimAdaylari(), getTalepler(), getTaleplerBugun(), getTaleplerMemnuniyetBekleyen() (+28 more)

### Community 79 - "SorunTipiSecimi.tsx"
Cohesion: 0.11
Nodes (21): BolgeApiData, BolgeAyarlari(), BolgeAyarlariProps, BolgeApiData, CekiciAyarlarPanel(), DavetKoduAyarlari(), DavetKoduDurum, KisiselVeriGizlemeAyarlari() (+13 more)

## Knowledge Gaps
- **285 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+280 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `teklif-db.ts` to `demo-oturum.ts`, `telefonNormalize`, `getSupabaseAdmin`, `mappers.ts`, `google-maps.ts`, `CekiciPanelTabs.tsx`, `sms-provider.ts`, `CekiciAyarlarPanel.tsx`, `memnuniyet.ts`, `db.ts`, `route.ts`, `page.tsx`, `kredi-odeme.ts`, `route.ts`, `cekici-email-otp.ts`, `demo-responses.ts`, `getCekiciById`, `route.ts`, `CerezOnayBanner.tsx`, `davet-kayit.ts`, `page.tsx`, `route.ts`, `route.ts`, `davet-panel.ts`, `odeme.ts`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `telefonNormalize()` connect `CekiciPanelTabs.tsx` to `getCekiciById`, `getSupabaseAdmin`, `db.ts`, `MusteriAnaSayfa.tsx`, `davet-panel.ts`, `page.tsx`, `page.tsx`, `demo-responses.ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `Card()` connect `ui.tsx` to `NasilCalisirSerit.tsx`, `ensureSeedData`, `google-maps.ts`, `SorunTipiSecimi.tsx`, `hizmet-veren-sayim.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `davet-kayit.ts`, `route.ts`, `page.tsx`, `route.ts`, `kredi-odeme.ts`, `davet-panel.ts`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _285 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ensureSeedData` be split into smaller, more focused modules?**
  _Cohesion score 0.07756813417190776 - nodes in this community are weakly interconnected._
- **Should `ui.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06196078431372549 - nodes in this community are weakly interconnected._
- **Should `TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._