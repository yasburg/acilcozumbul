# SEO Faz E — Kalite kapısı

Crawl bütçesi savunması: ince veya düşük öncelikli ilçe×hizmet (ve seyrek olarak ilçe hub) URL’lerini **noindex + sitemap dışı** bırakır. Trafik artırıcı değildir; Faz B şehir allowlist’inin kombinasyon katmanıdır.

## Ne yapar / ne yapmaz

| Yapar | Yapmaz |
| --- | --- |
| `src/lib/seo-kalite-kapisi.ts` ile skor + fail nedeni | GSC Coverage otomasyonu |
| Büyük-5 içinde hizmet + periferi budaması | Sahte LocalBusiness / rating |
| Hub noindex (yalnız tüm çocuklar fail) | Rehber (Faz F) değişikliği |
| Sitemap + `noIndex` metadata hizası | Canonical / 301 merge (sonraki PR) |

Canlı sayfalar **200** kalır; CTA çalışır. Yalnızca index sinyali kapatılır.

## İlişki: Faz B → E → G

1. **Faz B:** `SEO_DERIN_SEHIRLER` (istanbul, ankara, izmir, bursa, antalya). Diğer illerde ilçe×hizmet zaten noindex.
2. **Faz E (bu):** Derin şehirlerde ek kapı — her kombinasyon indexlenmez.
3. **Faz G:** Yeni şehir eklemek = `SEO_DERIN_SEHIRLER += slug`. Kapı zorunlu; aksi halde URL şişmesi Faz B’yi geri alır.

## İlçe×hizmet noindex kriterleri

`seoIlceHizmetIndexlensinMi(sehir, ilce, hizmet)`:

1. Şehir derin değilse → **noindex** (Faz B).
2. Derinse `seoIlceHizmetKaliteSonuc` → `gecer` false ise **noindex**.

Kapı fail (`gecer: false`) koşulları (hepsi AND geçmeli):

| Kontrol | Eşik | Kaynak |
| --- | --- | --- |
| **Kapsama alanları** | title, description, h1, ≥2 paragraf, ≥2 FAQ, ctaEtiket | `ilceHizmetIcerik` |
| **Kapsama proxy** | Hizmet ∈ `SEO_KALITE_ONCELIK_HIZMETLER` **ve** ilçe ∉ `SEO_KALITE_PERIFERI_ILCELER` | Sabit listeler (DB yok) |
| **CTA** | `seoTalepOlusturYolu` → `/talep-olustur?sehir=…&hizmet=…` | `seo-talep` |
| **Benzerlik (ince)** | İsimler çıkarılınca şablon Jaccard ≥ 0.85 → `ince` uyarısı | Fail **değil** (şu an tüm gövde şablon) |

### Öncelik hizmetler (Model A)

`cekici`, `lastikci`, `aku-takviye`

Index dışı (derin şehirde bile): `oto-anahtarci`, `yakit-yardimi`, `yol-yardim`, `arac-tasima`.

### Periferi ilçeler (Model B, muhafazakâr)

İlçe nüfus tablosu yok. Küçük **exclude** listesi (`SEO_KALITE_PERIFERI_ILCELER`) — uzak / düşük yoğunluk proxy. Örnek: İstanbul `adalar`, `sile`, `catalca`, `silivri`.

## İlçe hub noindex (muhafazakâr)

`seoIlceIndexlensinMi(sehir, ilce)`:

- **Derin olmayan** iller: hub her zaman index (Faz B koruması).
- **Derin** iller: hub noindex **yalnız** tüm 7 ilçe×hizmet kapıdan düşüyorsa (tipik: periferi ilçe) **veya** hub içerik/CTA bozuksa.
- Merkez ilçede 3 öncelik hizmet geçtiği için hub **açık kalır**.

False-positive az tutmak için önce periferi listesini genişletmeyin; GSC soft-404 kanıtı sonrası sıkılaştırın.

## Eşik nasıl ayarlanır?

| Ne | Nerede | Etki |
| --- | --- | --- |
| Daha az ixh index | `SEO_KALITE_ONCELIK_HIZMETLER` küçült / periferi genişlet | Sitemap küçülür |
| Daha çok ixh index | Hizmet ekle (örn. `yol-yardim`) / periferi daralt | Crawl artar |
| İnce’yi hard-fail yap | `seoIlceHizmetKaliteSonuc` içinde `ince && …` | Şablon override’sız her şey düşer — şu an **yapma** |
| Benzerlik eşiği | `SEO_KALITE_BENZERLIK_ESIK` (0.85) | Yalnız uyarı kalibrasyonu |

Yerel paragraf / override eklendikçe `ince` uyarısı azalır; o zaman ince’yi fail’e bağlamak anlamlı olur.

## Kod dokunuşları

- Kapı: `src/lib/seo-kalite-kapisi.ts`
- Yayın API: `src/data/seo-yayin.ts` (`seoIlceHizmetIndexlensinMi`, `seoIlceIndexlensinMi`, `seoSitemapIlceSluglari`)
- Sitemap: `src/app/sitemap.ts`
- Metadata: `[sehir]/[segment]/page.tsx` (hub), `[hizmet]/page.tsx` (ixh)

## Test

```bash
npx vitest run src/lib/seo-kalite-kapisi.test.ts src/data/seo-yayin.test.ts src/app/sitemap.test.ts
```
