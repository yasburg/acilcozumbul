# Video demo modu

Geçici mock ihalelerle çekici ve müşteri akışını kaydetmek için panel kontrollü demo oturumu.

## Önkoşullar

- Supabase migration `016_demo_oturum.sql` uygulanmış olmalı
- `DEMO_MODE_ENABLED` varsayılan olarak açık; kapatmak için `DEMO_MODE_ENABLED=false`

## Akış

1. **Yönetim paneli** → [Demo](/panel/demo)
2. Gerçek bir çekici seçin → **Demo başlat** (varsayılan 5 dk)
3. Aynı tarayıcıda o çekici hesabıyla [giriş](/cekici/giris) yapın
4. Çekici panelinde **İhaleler** sekmesinde mock talepler görünür (amber “Demo modu” bandı)
5. Panelden simülasyon adımlarını çalıştırın:
   - **İhaleyi aç** — gizli talebi çekiciye bildirir
   - **Rakip teklifi** / **Benim teklifim** — müşteri ekranına teklif ekler
   - **Yeni teklif SMS** — müşteri bildirimi simülasyonu
   - **Müşteri seçti** — kazanan belirlenir
6. Müşteri ekranı: paneldeki **Müşteri linki** (`/bekle/demo-…`) — aynı tarayıcıda açın (demo çerezi gerekir)

## Teknik notlar

- Oturum `demo_oturum` tablosunda; `acil_demo` httpOnly çerezi ile eşleşir
- Mock talep id’leri `demo-` öneki ile başlar; `talepler` / `cekiciler` tablolarına yazılmaz
- Çekici katılım ve teklif demo modda kredi düşmez, SMS gönderilmez
- Oturum süresi dolunca veya **Durdur** ile silinir

## API

| Endpoint | Açıklama |
|----------|----------|
| `POST /api/panel/demo/baslat` | `{ cekiciId, sureDk? }` — çerez set eder |
| `POST /api/panel/demo/durdur` | Oturumu sonlandırır |
| `GET /api/panel/demo/durum` | Aktif oturum + SMS özeti |
| `POST /api/panel/demo/simule` | `{ olay }` — simülasyon adımı |
| `GET /api/cekici/demo-durum` | Çekici paneli bandı için |
