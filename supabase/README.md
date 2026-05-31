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

## Güvenlik

Tablolarda RLS açık; anon key ile doğrudan okuma/yazma yok. API route’ları `SUPABASE_SERVICE_ROLE_KEY` ile sunucudan erişir.
