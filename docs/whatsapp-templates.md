# WhatsApp Business Cloud API & Şablon (Template) Kurulum Rehberi

Bu belge, **AcilCozumBul** platformundaki tüm SMS bildirimlerinin (OTP kodları, çekici yeni talep uyarıları, müşteri teklif bildirimleri, fatura linkleri) WhatsApp Business Cloud API üzerinden gönderilebilmesi için gereken adımları ve Meta panelinde oluşturulması gereken **Mesaj Şablonlarını (Message Templates / HSM)** içerir.

---

## 1. Meta Developer & WhatsApp Business Kurulumu

1. [developers.facebook.com](https://developers.facebook.com/) adresine gidin.
2. Oluşturduğunuz uygulamanın panelinde sol menüden **WhatsApp > API Setup (API Kurulumu)** bölümüne gelin.
3. Buradan şu bilgileri kopyalayın:
   - **Temporary access token** (veya System User kalıcı token): `.env` dosyasında `WHATSAPP_TOKEN`
   - **Phone number ID**: `.env` dosyasında `WHATSAPP_PHONE_NUMBER_ID`
   - **WhatsApp Business Account ID**: `.env` dosyasında `WHATSAPP_BUSINESS_ACCOUNT_ID`
4. Test aşamasındaysanız (Sandbox modu):
   - "To" (Alıcı) alanına test yapacağınız kendi telefon numaranızı ekleyin ve gelen doğrulama kodunu girerek onaylayın.

---

## 2. Webhook Yapılandırması (Gelen İletim Raporları)

1. Sol menüden **WhatsApp > Configuration (Yapılandırma)** sayfasına gelin.
2. **Webhook** bölümünde **Edit** butonuna tıklayın:
   - **Callback URL**: `https://www.acilcozumbul.com/api/webhooks/whatsapp` (veya staging URL'iniz)
   - **Verify token**: `.env` dosyanızdaki `WHATSAPP_WEBHOOK_VERIFY_TOKEN` (örn. `acilcozumbul_wa_verify_secret`)
3. **Verify and Save** butonuna basın.
4. Alt kısımdaki **Webhook fields** alanında `messages` seçeneğini **Subscribe (Abone Ol)** yapın.

---

## 3. Meta Panelinde Oluşturulması Gereken Şablonlar

WhatsApp Business politikasında 24 saattir mesajlaşmadığınız kullanıcılara ilk mesajı atarken **onaylı şablon** zorunludur.

WhatsApp Manager'a gidin:
**WhatsApp Manager > Account Tools > Message Templates > Create Template**

Aşağıdaki şablonları Türkçe (`tr` veya Turkish) diliyle oluşturun:

### 1) OTP / Doğrulama Kodu Şablonu
- **Template Name:** `dogrulama_kodu`
- **Category:** `AUTHENTICATION` (veya `UTILITY`)
- **Language:** Turkish (`tr`)
- **Body:**
  ```text
  acilcozumbul.com doğrulama kodunuz: {{1}}. Bu kodu kimseyle paylaşmayın. 5 dakika geçerlidir.
  ```
- **Button (İsteğe bağlı):**
  - Type: URL / Copy Code
  - Text: `Kodu Kopyala`
- **Örnek Değer (Sample):** `{{1}}` -> `582914`

---

### 2) Çekici Yeni Talep Bildirimi
- **Template Name:** `yeni_talep_cekici`
- **Category:** `UTILITY`
- **Language:** Turkish (`tr`)
- **Body:**
  ```text
  Yeni yol yardım talebi: {{1}}.
  
  Talebi incelemek ve teklif vermek için aşağıdaki bağlantıya tıklayın:
  {{2}}
  ```
- **Örnek Değerler (Sample):**
  - `{{1}}` -> `Kadıköy / İstanbul`
  - `{{2}}` -> `https://www.acilcozumbul.com/t/abc123xyz`

---

### 3) Müşteri Talep Alındı Bildirimi
- **Template Name:** `talep_alindi_musteri`
- **Category:** `UTILITY`
- **Language:** Turkish (`tr`)
- **Body:**
  ```text
  acilcozumbul.com: Yol yardım talebiniz başarıyla alındı. Bölgenizdeki çekicilere iletildi.
  
  Gelen fiyat tekliflerini anlık takip etmek için:
  {{1}}
  ```
- **Örnek Değer:**
  - `{{1}}` -> `https://www.acilcozumbul.com/bekle/talep_123`

---

### 4) Müşteri Yeni Teklif Bildirimi
- **Template Name:** `yeni_teklif_musteri`
- **Category:** `UTILITY`
- **Language:** Turkish (`tr`)
- **Body:**
  ```text
  acilcozumbul.com: Aracınız için yeni bir çekici teklifi geldi!
  
  Teklifi incelemek ve kabul etmek için:
  {{1}}
  ```
- **Örnek Değer:**
  - `{{1}}` -> `https://www.acilcozumbul.com/bekle/talep_123`

---

### 5) Müşteri Sizi Seçti (İhale Kazanan Çekiciye)
- **Template Name:** `musteri_secildi_cekici`
- **Category:** `UTILITY`
- **Language:** Turkish (`tr`)
- **Body:**
  ```text
  Tebrikler! Müşteri sizi seçti ({{1}}).
  
  Müşteri İletişim Numarası: {{2}}
  Talep Detayları ve Yol Tarifi: {{3}}
  ```
- **Örnek Değerler:**
  - `{{1}}` -> `Kadıköy / İstanbul`
  - `{{2}}` -> `05321234567`
  - `{{3}}` -> `https://www.acilcozumbul.com/t/abc123xyz`

---

### 6) Fatura Bildirimi
- **Template Name:** `fatura_bilgisi`
- **Category:** `UTILITY`
- **Language:** Turkish (`tr`)
- **Body:**
  ```text
  acilcozumbul.com: Kredi yükleme faturanız oluşturulmuştur.
  
  Faturanızı görüntülemek ve indirmek için:
  {{1}}
  ```
- **Örnek Değer:**
  - `{{1}}` -> `https://www.acilcozumbul.com/fatura/abc`

---

### 7) Müşteri Memnuniyet Formu
- **Template Name:** `memnuniyet_degerlendirme`
- **Category:** `UTILITY`
- **Language:** Turkish (`tr`)
- **Body:**
  ```text
  acilcozumbul.com: Aldığınız yol yardım hizmetini değerlendirerek diğer sürücülere yardımcı olun.
  
  Hizmeti puanlamak için:
  {{1}}
  ```
- **Örnek Değer:**
  - `{{1}}` -> `https://www.acilcozumbul.com/bekle/talep_123`

---

## 4. Akıllı SMS Fallback (Yedekleme)

Sistemde `WHATSAPP_FALLBACK_TO_SMS=true` (varsayılan açık) olduğu sürece:
1. Şablonlar henüz Meta tarafından onaylanmamışsa,
2. Alıcı numara WhatsApp kullanmıyorsa,
3. Veya Meta API geçici bir kesinti yaşarsa,
Sistem otomatik ve anında mevcut **Netgsm SMS** altyapısına düşerek mesajı SMS ile iletir. Böylece hiçbir müşteri veya çekici bildirimi asla kaybolmaz.

---

## 5. Panelden Canlı Test

Yönetim panelinde `/panel/sms` sayfasına gidip **WhatsApp** sekmesine tıklayarak:
- WhatsApp API bağlantı durumunu görüntüleyebilir,
- Kendi numaranıza anında serbest metin veya şablon test mesajı gönderebilirsiniz.
