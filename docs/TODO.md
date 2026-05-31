# Yapılacaklar

## Yabancı telefon → e-posta doğrulaması (ileride)

**Durum:** Şu an sadece Türkiye cep (`05XXXXXXXXX`) destekleniyor. Yabancı numara girildiğinde kullanıcıya bilgi mesajı gösteriliyor; akış ilerlemiyor.

**Hedef (sonra):**

- [ ] Yabancı numara algılama (mevcut `telefonYabanciGorunuyorMu`) ile alternatif akış
- [ ] Müşteri talep formunda e-posta alanı + doğrulama kodu (SMTP veya Supabase Auth magic link)
- [ ] Çekici kayıt/giriş için e-posta alternatifi (veya sadece müşteri tarafı)
- [ ] `NEXT_PUBLIC_DESTEK_EMAIL` / destek süreci ile uyum
- [ ] Netgsm yerine e-posta şablonları (TR/EN)
- [ ] Supabase: `telefon_otp` benzeri `email_otp` tablosu veya Auth

**Şimdilik:** Destek mesajı — “e-posta doğrulaması yakında; sorununuzu çözmek için e-posta ile iletişime geçin.”
