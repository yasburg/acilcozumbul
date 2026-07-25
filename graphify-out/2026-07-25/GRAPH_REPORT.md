# Graph Report - acilcozumbul  (2026-07-25)

## Corpus Check
- 434 files · ~410,173 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1828 nodes · 5815 edges · 76 communities (67 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.64)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ce4a5e83`
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
- [[_COMMUNITY_hizmet-veren-sayim.ts|hizmet-veren-sayim.ts]]
- [[_COMMUNITY_MusteriAnaSayfa.tsx|MusteriAnaSayfa.tsx]]
- [[_COMMUNITY_ensureSeedData|ensureSeedData]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_MusteriCekiciTakipHarita.tsx|MusteriCekiciTakipHarita.tsx]]
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
- [[_COMMUNITY_updateCekici|updateCekici]]
- [[_COMMUNITY_Yapılacaklar|Yapılacaklar]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_AGENTS|AGENTS.md]]
- [[_COMMUNITY_next.config.ts|next.config.ts]]
- [[_COMMUNITY_postcss.config.mjs|postcss.config.mjs]]
- [[_COMMUNITY_cerezAnalitikAktif|cerezAnalitikAktif]]
- [[_COMMUNITY_CerezOnayBanner.tsx|CerezOnayBanner.tsx]]
- [[_COMMUNITY_KayitKontenjanBilgi.tsx|KayitKontenjanBilgi.tsx]]
- [[_COMMUNITY_seo.ts|seo.ts]]
- [[_COMMUNITY_CerezOnayBanner.tsx|CerezOnayBanner.tsx]]
- [[_COMMUNITY_cekici-puan.ts|cekici-puan.ts]]
- [[_COMMUNITY_PanelCekiciHarita.tsx|PanelCekiciHarita.tsx]]
- [[_COMMUNITY_cerez-onay.ts|cerez-onay.ts]]
- [[_COMMUNITY_payment.ts|payment.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_kredi-odeme.ts|kredi-odeme.ts]]
- [[_COMMUNITY_getSupabaseAdmin|getSupabaseAdmin]]
- [[_COMMUNITY_davet-panel.ts|davet-panel.ts]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_toplu-sms-gecmis-db.ts|toplu-sms-gecmis-db.ts]]
- [[_COMMUNITY_Ölçeklenebilirlik regression smoke checklist|Ölçeklenebilirlik regression smoke checklist]]
- [[_COMMUNITY_verify-teklif-backfill.mjs|verify-teklif-backfill.mjs]]
- [[_COMMUNITY_cekici-sifre-otp.ts|cekici-sifre-otp.ts]]
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
- `main()` --calls--> `garantiKrediOdemesiYap()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/garanti/payment.ts
- `main()` --calls--> `garantiSmokeKartOku()`  [INFERRED]
  scripts/garanti-smoke.ts → src/lib/garanti/smoke-kart.ts
- `main()` --calls--> `krediTutarKurus()`  [EXTRACTED]
  scripts/garanti-smoke.ts → src/lib/kredi-fiyat.ts

## Import Cycles
- None detected.

## Communities (76 total, 9 thin omitted)

### Community 0 - "demo-oturum.ts"
Cohesion: 0.23
Nodes (13): GET(), GET(), panelKullanici(), POST(), NETGSM_TR_CIFTE, netgsmSmsBirimHesapla(), netgsmSmsMesajGecerliMi(), netgsmSmsParcaSayisi() (+5 more)

### Community 1 - "telefonNormalize"
Cohesion: 0.06
Nodes (69): bolgeOzet(), GET(), POST(), PUT(), GET(), POST(), GET(), POST() (+61 more)

### Community 2 - "cekici-email-otp.ts"
Cohesion: 0.16
Nodes (18): eslintConfig, main(), GET(), envGarantiAlan(), envTemizle(), GarantiAlan, GarantiConfig, garantiConfigOku() (+10 more)

### Community 3 - "getSupabaseAdmin"
Cohesion: 0.15
Nodes (19): garantiHashHesapla(), garantiXmlDeger(), GARANTI_HATA_KODLARI, garantiKodNormalize(), garantiMesajGenelMi(), garantiMusteriHataMesaji(), garantiYetersizBakiyeMetniMi(), GENEL_MESAJ_ORNEKLERI (+11 more)

### Community 4 - "seo.ts"
Cohesion: 0.18
Nodes (9): hataMesajiFromParam(), Ozet, PanelIcerik(), HizmetVerenSayimPanel(), KullaniciSayisiGrafik(), Mod, Pencere, PanelGirisForm() (+1 more)

### Community 5 - "mappers.ts"
Cohesion: 0.19
Nodes (9): GET(), GET(), getKrediOdemeById(), kaydetKrediOdeme(), listeleKrediOdemeler(), krediOdemeFromRow(), KrediOdemeRow, krediOdemeToRow() (+1 more)

### Community 6 - "ensureSeedData"
Cohesion: 0.26
Nodes (10): POST(), KrediPage(), KREDI_PAKET_TL_LISTESI, KREDI_PAKETLERI, KrediPaket, krediPaketBul(), krediPaketOdenecekTL(), KrediPaketTl (+2 more)

### Community 7 - "ui.tsx"
Cohesion: 0.24
Nodes (9): GET(), POST(), PATCH(), belgeBase64Ayikla(), cekiciBelgeYukle(), IZINLI_MIME, uzanti(), updateCekiciBelgeDurum() (+1 more)

### Community 8 - "TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com"
Cohesion: 0.06
Nodes (34): 10. Haftalık takvim, 11. Ücretli reklam (kısa), 12. İlk 30 gün checklist, 13. Kaçınılacaklar, 14. Ölçüm, 1. Konumlandırma (her yerde aynı), 2. Profil metinleri, 3. Sabitlenecek 3 Reels (özet) (+26 more)

### Community 9 - "scripts"
Cohesion: 0.06
Nodes (35): dependencies, @netgsm/sms, next, posthog-js, posthog-node, react, react-dom, @supabase/ssr (+27 more)

### Community 10 - "google-maps.ts"
Cohesion: 0.07
Nodes (36): GenelTelefon, KampanyaSablon, KuyrukIs, kuyrukIsBaslik(), ListeAlici, ListeOzet, OncekiMod, PanelTopluSmsPage() (+28 more)

### Community 11 - "CekiciPanelTabs.tsx"
Cohesion: 0.12
Nodes (25): MusteriAnaSayfaIcerik(), adimAciklamaMetni(), Props, SorunAkisOzeti(), SorunAkisOzetiIcerik(), CEKICI_ADIMLAR, SORUN_AKIS_ACIKLAMA, sorunAkisAciklama (+17 more)

### Community 12 - "sms-provider.ts"
Cohesion: 0.07
Nodes (30): metadata, CekiciKayitLayout(), metadata, metadata, metadata, metadata, metadata, metadata (+22 more)

### Community 13 - "CekiciAyarlarPanel.tsx"
Cohesion: 0.10
Nodes (38): hizmetBolgeleriFlatten(), addTalep(), bugunBaslangicIso(), getCekiciByDogrulanmisFaturaEposta(), getTalepler(), getTaleplerBugun(), getTaleplerMemnuniyetBekleyen(), hydrateTalep() (+30 more)

### Community 14 - "memnuniyet.ts"
Cohesion: 0.38
Nodes (5): hedefAltYazi(), KonumGuncellemeGostergesi(), renkKaristir(), TURUNCU, YESIL

### Community 15 - "db.ts"
Cohesion: 0.22
Nodes (26): GET(), rotaKoordinatlari(), POST(), listeDurumuBelirle(), toOzet(), KULLANIMA_ACIK_ILLER, sehirBeklemeMesaji(), sehirKullanimAcikMi() (+18 more)

### Community 16 - "hizmet-veren-sayim.ts"
Cohesion: 0.12
Nodes (19): AlanHatalari, BOS_ALAN_HATALARI, KayitAlan, KayitIcerik(), KayitKontenjanBilgi(), Props, Props, YasalOnayKutusu() (+11 more)

### Community 17 - "hizmet-veren-sayim.ts"
Cohesion: 0.16
Nodes (17): GET(), HizmetVerenSayimAlani(), HizmetVerenSayimGostergesi(), HizmetVerenSayimGostergesiProps, useAnimatedNumber(), useHizmetVerenSayim(), cevrimiciJitterFaktor(), cevrimiciJitterUygula() (+9 more)

### Community 18 - "MusteriAnaSayfa.tsx"
Cohesion: 0.30
Nodes (8): POST(), GET(), panelKullanici(), POST(), kayitFunnelAktifListe(), kayitFunnelOzetHesapla(), supabaseDbAktif(), topluSmsIsTablolariVar()

### Community 19 - "ensureSeedData"
Cohesion: 0.06
Nodes (14): DegerlendirmeSatir, Ozet, Ozet, Ozet, Saglik, ArizaFotografAlaniProps, formatKalan(), MemnuniyetBekle() (+6 more)

### Community 20 - "page.tsx"
Cohesion: 0.11
Nodes (16): Durum, MemnuniyetState, TeklifOzet, Asama, ASAMA_METIN, IhaleBekleAnimasyon(), IhaleBekleAnimasyonProps, MemnuniyetFormu() (+8 more)

### Community 21 - "MusteriCekiciTakipHarita.tsx"
Cohesion: 0.08
Nodes (42): noktaOku(), POST(), GET(), CekiciRotaPanelProps, embedDirectionsUrl(), googleMapsDirUrl(), MusteriCekiciTakipHarita(), MusteriCekiciTakipHaritaProps (+34 more)

### Community 22 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "route.ts"
Cohesion: 0.09
Nodes (22): OnayIcerik(), KREDI_ODEME_ADIMLARI, ROZET_ODEME_ADIMLARI, SmsKaydi, BrandLogoYazili(), ADIMLAR, GUVEN, SSS (+14 more)

### Community 24 - "page.tsx"
Cohesion: 0.07
Nodes (42): POST(), GET(), GET(), baseUrlFrom(), GET(), POST(), anlasilanIsSay(), cekiciPuanOzeti (+34 more)

### Community 25 - "kredi-odeme.ts"
Cohesion: 0.10
Nodes (34): GET(), POST(), cekiciTalepBolgesineUygunMu(), cekiciTalepSorununaUygunMu(), getCekicilerBildirimAdaylari(), anlasamadiSonrasiIhaleyiSurdur(), cekiciAcikTalepUygunMu(), cekiciBildirimKrediTutari() (+26 more)

### Community 26 - "route.ts"
Cohesion: 0.23
Nodes (16): Ctx, DELETE(), panelKullanici(), PATCH(), GET(), panelKullanici(), POST(), guncelleSmsSablon() (+8 more)

### Community 27 - "page.tsx"
Cohesion: 0.09
Nodes (32): OdemeOnayPage(), CekiciTalepClient(), TalepDurum, CekiciKart(), Gorunum, SehirSiralama, CekiciAyarlarPanel(), DavetKoduAyarlari() (+24 more)

### Community 28 - "cekici-email-otp.ts"
Cohesion: 0.33
Nodes (9): GET(), getSms50TiklamaSaatIzgarasi(), getSms50VaryantOzetleri(), sms50Oran(), sms50TiklamaGunSaat(), Sms50TiklamaSaatIzgarasi, sms50TiklamaSatirlarindanIzgara(), Sms50VaryantOzet (+1 more)

### Community 29 - "cekici-puan.ts"
Cohesion: 0.15
Nodes (12): API yüzeyi, Güvenlik ve izolasyon, Kapsam dışı (ilk PR), Kayıt akışı önerisi (video senaryosu), Mevcut kodla ilişki, Problem, Test planı, UI değişiklikleri (+4 more)

### Community 30 - "demo-responses.ts"
Cohesion: 0.17
Nodes (18): POST(), GET(), POST(), getCurrentCekici(), bekleyenCekiciEpostaOtp(), cekiciEpostaOtpDogrula(), cekiciEpostaOtpGonder(), EmailOtpKayit (+10 more)

### Community 32 - "kayit-kodu.ts"
Cohesion: 0.39
Nodes (7): GET(), PUT(), saatGecerliMi(), cekiciMusaitMi(), istanbulGunVeDakika(), musaitlikOzeti(), saatMetniDakika()

### Community 33 - "migrate-json-to-supabase.mjs"
Cohesion: 0.31
Nodes (10): bildirimRowsFromTalepler(), cekiciToRow(), dataDir, haricRowsFromTalepler(), main(), readJson(), supabase, talepToRow() (+2 more)

### Community 34 - "PanelChrome.tsx"
Cohesion: 0.23
Nodes (7): metadata, PanelChrome(), LINKS, PanelNav(), NavSayacRozet(), PanelNavSayac, usePanelNavSayac()

### Community 35 - "NasilCalisirSerit.tsx"
Cohesion: 0.18
Nodes (22): register(), otpSil(), otpSil(), getSupabaseAdmin(), ekleTopluSmsGecmisAlicilar(), genelDeftereYaz(), aliciSayisi(), calisanIsler (+14 more)

### Community 36 - "Supabase veritabanı"
Cohesion: 0.29
Nodes (6): Güvenlik, Kurulum, Memnuniyet değerlendirmesi, Railway, Supabase veritabanı, Yerel JSON’dan taşıma

### Community 37 - "Video demo modu"
Cohesion: 0.33
Nodes (5): Akış, API, Teknik notlar, Video demo modu, Önkoşullar

### Community 38 - "route.ts"
Cohesion: 0.07
Nodes (40): CekiciRotaPanel(), embedDirectionsUrl(), RotaSureleri, GpsHttpsBanner(), GpsHttpsBannerProps, KonumIzniYardim(), KonumIzniYardimProps, ADIM_OLAYLARI (+32 more)

### Community 39 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 40 - "route.ts"
Cohesion: 0.16
Nodes (17): POST(), POST(), GET(), PUT(), POST(), GET(), GET(), GET() (+9 more)

### Community 41 - "updateCekici"
Cohesion: 0.16
Nodes (24): POST(), POST(), GET(), GET(), POST(), GET(), BekleIcerik(), teklifFiyatDegistiMi() (+16 more)

### Community 51 - "cerezAnalitikAktif"
Cohesion: 0.50
Nodes (6): PanelLinkHaritasiPage(), sms50LinkHaritasi(), normalizeBase(), smsBaseUrl(), smsHostNormalize(), yerelVeyaOzelAgUrl()

### Community 52 - "CerezOnayBanner.tsx"
Cohesion: 0.48
Nodes (5): GET(), GET(), countCekiciler(), countCekicilerBelgeDurum(), countTalepler()

### Community 53 - "KayitKontenjanBilgi.tsx"
Cohesion: 0.19
Nodes (13): config, middleware(), POST(), GET(), panelAdminEpostalari(), panelEpostaIzinli(), supabaseEksikEnvAlanlari(), supabaseYapilandirildi() (+5 more)

### Community 54 - "seo.ts"
Cohesion: 0.10
Nodes (41): GET(), GET(), POST(), POST(), POST(), GET(), GECERLI, POST() (+33 more)

### Community 55 - "CerezOnayBanner.tsx"
Cohesion: 0.57
Nodes (4): PATCH(), tcKimlikGecerliMi(), vergiNoGecerliMi(), faturaAlanlariniDogrula()

### Community 56 - "cekici-puan.ts"
Cohesion: 0.10
Nodes (37): GET(), GET(), PUT(), GET(), GET(), PATCH(), POST(), davetKayitBaslangicKredisiFromSonuc() (+29 more)

### Community 57 - "PanelCekiciHarita.tsx"
Cohesion: 0.23
Nodes (11): HaritaNokta, PanelCekiciHarita(), RENK, SehirAdet, haritaSehirNoktalari(), haritaYaricapLog(), IlKoordinat, ilKoordinatBul() (+3 more)

### Community 58 - "cerez-onay.ts"
Cohesion: 0.07
Nodes (54): geist, metadata, RootLayout(), viewport, bannerServerSnapshot(), bannerSnapshot(), bannerSubscribe(), CerezOnayBanner() (+46 more)

### Community 59 - "payment.ts"
Cohesion: 0.33
Nodes (6): admin, anon, authEmail(), main(), service, url

### Community 60 - "route.ts"
Cohesion: 0.09
Nodes (17): belgeDurumEtiket(), CekiciDetay, PanelCekiciDetayPage(), BelgeYuklemeAlani(), Props, ANCHOR_IDS, AVANTAJLAR, CekiciKayitLanding() (+9 more)

### Community 61 - "kredi-odeme.ts"
Cohesion: 0.09
Nodes (25): Adim, BOS_FORM, KampanyaSatir, KullanimSatir, Ozet, BolgeAyarlari(), BolgeAyarlariProps, DavetKoduDurum (+17 more)

### Community 62 - "getSupabaseAdmin"
Cohesion: 0.06
Nodes (58): POST(), POST(), PUT(), POST(), GET(), DELETE(), GET(), DemoDurum (+50 more)

### Community 63 - "davet-panel.ts"
Cohesion: 0.17
Nodes (20): GET(), BOS_FORM, Sablon, GET(), GET(), SMS50_KAYIT_FUNNEL_HARITASI, SMS50_VARYANTLAR, sms50FooterSatirlari() (+12 more)

### Community 64 - "layout.tsx"
Cohesion: 0.26
Nodes (12): POST(), POST(), cekiciEpostaDogrulandiMi(), epostaNormalize(), olusturBekleyenOdeme(), olusturBekleyenRozetOdeme(), rozetIndirimYuzde(), odemeFromRow() (+4 more)

### Community 66 - "page.tsx"
Cohesion: 0.26
Nodes (11): GET(), GET(), cekiciKayitGunSerisi(), cekiciKayitSerisiPencere(), gunEkle(), countSmsLog(), getSmsLog(), getTaleplerSince() (+3 more)

### Community 67 - "route.ts"
Cohesion: 0.83
Nodes (3): GET(), istemciIp(), ozelIp()

### Community 69 - "route.ts"
Cohesion: 0.52
Nodes (6): GET(), haftaBaslangici(), istanbulAyAnahtari(), kazananTeklifFiyati(), getTaleplerByKazananCekici(), countHaricByCekici()

### Community 71 - "toplu-sms-gecmis-db.ts"
Cohesion: 0.21
Nodes (16): POST(), GET(), POST(), panelKullanici(), POST(), createClient(), topluSmsGecmisTablolariVar(), chunk() (+8 more)

### Community 76 - "cekici-sifre-otp.ts"
Cohesion: 0.05
Nodes (123): POST(), POST(), POST(), POST(), POST(), POST(), POST(), IZINLI (+115 more)

### Community 85 - "page.tsx"
Cohesion: 0.29
Nodes (7): GET(), gonderimZamani(), onaylanmisSira(), RozetPanelOzet, RozetPanelSatir, rozetPanelVerisi, satirFromCekici()

### Community 89 - "kredi-fiyat.ts"
Cohesion: 0.36
Nodes (9): GET(), POST(), sonKullanmaAyir(), garantiYapilandirildi(), istemciIpAl(), tlTutarKurus(), getBekleyenOdeme(), guncelleBekleyenOdemeFatura() (+1 more)

## Knowledge Gaps
- **353 isolated node(s):** `eslintConfig`, `config`, `nextConfig`, `name`, `version` (+348 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getSupabaseAdmin()` connect `NasilCalisirSerit.tsx` to `demo-oturum.ts`, `telefonNormalize`, `mappers.ts`, `ui.tsx`, `CekiciAyarlarPanel.tsx`, `db.ts`, `MusteriAnaSayfa.tsx`, `page.tsx`, `kredi-odeme.ts`, `route.ts`, `cekici-email-otp.ts`, `demo-responses.ts`, `route.ts`, `updateCekici`, `CerezOnayBanner.tsx`, `seo.ts`, `cekici-puan.ts`, `getSupabaseAdmin`, `davet-panel.ts`, `layout.tsx`, `page.tsx`, `route.ts`, `toplu-sms-gecmis-db.ts`, `cekici-sifre-otp.ts`, `kredi-fiyat.ts`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Why does `Card()` connect `ensureSeedData` to `seo.ts`, `mappers.ts`, `route.ts`, `google-maps.ts`, `hizmet-veren-sayim.ts`, `cerezAnalitikAktif`, `page.tsx`, `MusteriCekiciTakipHarita.tsx`, `route.ts`, `page.tsx`, `page.tsx`, `route.ts`, `kredi-odeme.ts`, `getSupabaseAdmin`, `davet-panel.ts`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `telefonNormalize()` connect `cekici-sifre-otp.ts` to `demo-oturum.ts`, `NasilCalisirSerit.tsx`, `route.ts`, `toplu-sms-gecmis-db.ts`, `google-maps.ts`, `page.tsx`, `getSupabaseAdmin`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `config`, `nextConfig` to the rest of the system?**
  _353 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `telefonNormalize` be split into smaller, more focused modules?**
  _Cohesion score 0.057631257631257635 - nodes in this community are weakly interconnected._
- **Should `TikTok ve Instagram Tanıtım Rehberi — acilcozumbul.com` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._