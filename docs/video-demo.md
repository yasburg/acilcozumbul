# Video demo modu

Geçici mock ihalelerle çekici ve müşteri akışını kaydetmek için panel kontrollü demo oturumu.

Production `talepler` / `cekiciler` / kredi / SMS loglarına yazılmaz; state `demo_oturum` JSONB satırında tutulur.

## Önkoşullar

- Supabase migration `016_demo_oturum.sql` uygulanmış olmalı
- `DEMO_MODE_ENABLED` varsayılan olarak açık; kapatmak için `DEMO_MODE_ENABLED=false`

## Akış

1. **Yönetim paneli** → [Demo](/panel/demo)
2. Gerçek bir çekici seçin → **Demo başlat** (varsayılan 5 dk)
3. Aynı tarayıcıda o çekici hesabıyla [giriş](/cekici/giris) yapın (`acil_demo` çerezi bu tarayıcıda kalmalı)
4. Çekici panelinde amber **Demo modu — gerçek veri değişmiyor** şeridi ve 🎬 rozeti görünür; İhaleler sekmesinde mock talepler listelenir
5. Panelden simülasyon adımlarını çalıştırın:
   - **İhaleyi aç** — gizli talebi çekiciye bildirir (+ demo SMS)
   - **Rakip teklifi** / **Benim teklifim** — müşteri ekranına teklif ekler
   - **Yeni teklif SMS** — müşteri bildirimi simülasyonu
   - **Müşteri seçti** — kazanan belirlenir (veya müşteri bekle ekranından teklif seçin)
   - **Yeni gizli ihale** — ek kilitli talep (+ demo SMS kutusu)
6. Müşteri ekranı: paneldeki **Müşteri linki** (`/bekle/demo-…`) — aynı tarayıcıda açın (demo çerezi gerekir)
7. İsteğe bağlı: [`/demo/sms`](/demo/sms) — aktif oturumun simüle SMS’leri üstte listelenir
8. Süre dolunca veya **Durdur** → oturum + çerez silinir; prod veri aynı kalır

## Teknik notlar

- Oturum `demo_oturum` tablosunda; `acil_demo` httpOnly çerezi ile eşleşir
- Mock talep id’leri `demo-` öneki ile başlar; overlay yalnızca çerezi olan tarayıcıda görünür
- Çekici katılım, teklif ve müşteri teklif seçimi demo modda DB/kredi/SMS yazmaz
- Demo UI’da ad / telefon / adres yarı maskelenir (sosyal medya kaydı için)
- Oturum süresi dolunca satır silinir; durum endpoint’i süresi dolmuş çerezi de temizler

## API

| Endpoint | Açıklama |
|----------|----------|
| `POST /api/panel/demo/baslat` | `{ cekiciId, sureDk? }` — çerez set eder |
| `POST /api/panel/demo/durdur` | Oturumu sonlandırır |
| `GET /api/panel/demo/durum` | Aktif oturum + SMS özeti |
| `POST /api/panel/demo/simule` | `{ olay }` — simülasyon adımı |
| `GET /api/cekici/demo-durum` | Çekici paneli demo göstergesi |
| `POST /api/talep/[id]/teklif-sec` | `demo-*` id’lerde overlay seçim |
| `GET /api/demo/sms` | Prod log + (çerez varsa) video-demo SMS |
