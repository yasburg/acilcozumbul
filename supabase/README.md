# Supabase veritabanı

Tüm uygulama verisi (çekiciler, talepler, OTP, SMS, ödemeler) artık Postgres’te tutulur. Yönetim paneli girişi için kullandığınız Supabase projesi ile aynı proje.

## Kurulum

1. [Supabase Dashboard](https://supabase.com/dashboard) → projeniz → **SQL Editor**
2. `migrations/001_initial.sql` içeriğini yapıştırıp **Run**  
   (Daha önce 001 çalıştırdıysanız ve migrate `permission denied` veriyorsa: `002_grants.sql`)
3. **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL` (zaten var)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (panel girişi)
   - **`service_role` key** → Railway’de `SUPABASE_SERVICE_ROLE_KEY` (gizli, sadece sunucu)

## Yerel JSON’dan taşıma

Railway volume veya `data/` klasöründeki dosyaları aktarmak için:

```bash
# .env içinde URL + service role olmalı
npm run migrate:supabase
```

Dosyalar: `cekiciler.json`, `talepler.json`, `sms-log.json`, `telefon-otp.json`, `odeme-bekleyen.json`

## Railway

- **`/app/data` volume artık zorunlu değil** (iş verisi Supabase’te)
- `SUPABASE_SERVICE_ROLE_KEY` mutlaka ekleyin
- Eski volume’deki JSON’u bir kez `migrate-json-to-supabase` ile yükleyin

## Memnuniyet değerlendirmesi

`migrations/003_memnuniyet.sql` — anlaşmadan 2 saat sonra müşteri puanı (1–5).

Test için kısa süre: `MEMNUNIYET_BEKLE_DK=1` (.env).

`005_memnuniyet_detay.sql` — genel / fiyat / süre puanları + SMS bayrağı.

Form açılınca müşteriye SMS (link: `/bekle/{talep-id}`). Ek olarak cron:
`POST /api/cron/memnuniyet-sms` + `Authorization: Bearer CRON_SECRET` (her 5–10 dk).

Panel toplu SMS arka plan kuyruğu: migration `033_panel_toplu_sms_isler.sql`
(+ `034_panel_toplu_sms_is_alicilar_kilit.sql`, kişiye özel link için `035_sms50_kisi_token.sql`).
Sunucu içinde ~8 sn’lik scheduler partileri sürdürür; sekme açık kalması gerekmez.
Ek kurtarma cron: `POST /api/cron/toplu-sms` + aynı `CRON_SECRET` (her 1–2 dk önerilir).

## Simülasyon ihale

`migrations/056_simulasyon_ihale.sql` — plan + side-table (çekici API’de flag yok).
`migrations/057_simulasyon_ayar.sql` — günlük adet aralıkları (1–5 / 6–20 / 20+), panelden düzenlenir.

- Akşam planlama: `POST /api/cron/simulasyon-planla` + `Authorization: Bearer CRON_SECRET` (günde 1)
- Aç/kapat: `POST /api/cron/simulasyon-calistir` + aynı secret (her 5–10 dk)
- Panel: `/panel/simulasyon`

## Güvenlik

Tablolarda RLS açık; anon key ile doğrudan okuma/yazma yok. API route’ları `SUPABASE_SERVICE_ROLE_KEY` ile sunucudan erişir.
