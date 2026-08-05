# Staging — stage.acilcozumbul.com

Railway project `acilcozumbul` → environment **staging** (production’dan kopyalandı).

## DNS (Squarespace)

DNS `acilcozumbul.com` Squarespace’te. Aşağıdaki kayıtları ekleyin:

| Tip | Host | Değer |
|-----|------|--------|
| CNAME | `stage` | `mduhocmn.up.railway.app` |
| TXT | `_railway-verify.stage` | `railway-verify=50fdb183024999505b31fe6d2e634f459f968f137b0f9bed801e16386a0246c9` |

Doğrulama: `railway domain status stage.acilcozumbul.com -e staging -s acilcozumbul`

## Ortam değişkenleri (staging)

- `NEXT_PUBLIC_BASE_URL=https://stage.acilcozumbul.com`
- `SMS_BASE_URL=https://stage.acilcozumbul.com`
- `NEXT_PUBLIC_APP_ENV=staging` → robots noindex + X-Robots-Tag
- `SMS_TESTER_ONLY=1`

**Not:** Staging şu an production ile aynı Supabase’i kullanır. Ayrı DB isterseniz yeni Supabase project + env güncellemesi gerekir.

## ACB rebrand önizleme

`NEXT_PUBLIC_APP_ENV=staging` iken uygulama yeni ACB markasını gösterir (`html.brand-acb`):

- Logo / ikon / OG: `public/brand/acb/`
- Palette: krem `#EAF0CE`, yeşil butonlar `#089B2D`, turuncu uyarı `#FF9B42`, koyu metin `#1B2D2A`
- Yükleme: `ACB-Animation-pingpong.svg` (Spinner)

Production bu değişikliklerden etkilenmez. Yerelde denemek için: `NEXT_PUBLIC_APP_ENV=staging npm run dev`

## Deploy

`main` push → production. Staging için Railway dashboard’dan redeploy veya:

```bash
railway redeploy -s acilcozumbul -e staging --yes
```
