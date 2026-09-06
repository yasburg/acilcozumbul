import { telefonNormalize } from "./telefon";
import { fetchHataMesaji } from "./sms-provider";

export interface WhatsAppConfig {
  token: string;
  phoneNumberId: string;
  businessAccountId?: string;
  apiVersion?: string;
  enabled: boolean;
  fallbackToSms: boolean;
  testPhones?: string[];
}

export interface WhatsAppGonderimSonuc {
  basarili: boolean;
  saglayici: "whatsapp" | "demo";
  mesajId?: string;
  hata?: string;
  hataKodu?: number | string;
  rawResponse?: unknown;
}

export interface WhatsAppTemplateComponent {
  type: "header" | "body" | "button";
  sub_type?: "url" | "quick_reply";
  index?: string;
  parameters: Array<{
    type: "text" | "currency" | "date_time" | "image" | "document" | "video";
    text?: string;
    [key: string]: unknown;
  }>;
}

export interface WhatsAppTemplatePayload {
  name: string;
  language: { code: string };
  components?: WhatsAppTemplateComponent[];
}

const DEFAULT_API_VERSION = "v22.0";

/**
 * WhatsApp Cloud API için ortam değişkenlerini okur.
 */
export function getWhatsAppConfig(): WhatsAppConfig {
  const token = (
    process.env.WHATSAPP_TOKEN ??
    process.env.WHATSAPP_ACCESS_TOKEN ??
    ""
  ).trim();
  const phoneNumberId = (
    process.env.WHATSAPP_PHONE_NUMBER_ID ??
    process.env.WHATSAPP_PHONE_ID ??
    ""
  ).trim();
  const businessAccountId = (
    process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ??
    process.env.WHATSAPP_WABA_ID ??
    ""
  ).trim();
  const apiVersion = (
    process.env.WHATSAPP_API_VERSION ?? DEFAULT_API_VERSION
  ).trim();

  const rawEnabled = process.env.WHATSAPP_ENABLED?.trim().toLowerCase();
  const rawChannel = process.env.NOTIFICATION_CHANNEL?.trim().toLowerCase();
  const enabled =
    rawEnabled === "1" ||
    rawEnabled === "true" ||
    rawEnabled === "evet" ||
    rawChannel === "whatsapp" ||
    rawChannel === "both";

  const rawFallback = process.env.WHATSAPP_FALLBACK_TO_SMS?.trim().toLowerCase();
  // Varsayılan: true (WhatsApp başarısız olursa SMS'e düşer)
  const fallbackToSms =
    rawFallback == null ||
    rawFallback === "" ||
    rawFallback === "1" ||
    rawFallback === "true" ||
    rawFallback === "evet";

  const rawTestPhones = process.env.WHATSAPP_TEST_PHONES?.trim() ?? "";
  const testPhones = rawTestPhones
    ? rawTestPhones
        .split(",")
        .map((t) => telefonNormalize(t.trim()))
        .filter(Boolean)
    : undefined;

  return {
    token,
    phoneNumberId,
    businessAccountId: businessAccountId || undefined,
    apiVersion: apiVersion || DEFAULT_API_VERSION,
    enabled,
    fallbackToSms,
    testPhones,
  };
}

/**
 * WhatsApp Cloud API yapılandırılmış mı?
 */
export function whatsappYapilandirildi(cfg?: WhatsAppConfig): boolean {
  const config = cfg ?? getWhatsAppConfig();
  return Boolean(config.token && config.phoneNumberId);
}

/**
 * WhatsApp genel olarak etkin mi?
 */
export function whatsappAktifMi(cfg?: WhatsAppConfig): boolean {
  const config = cfg ?? getWhatsAppConfig();
  return (
    whatsappYapilandirildi(config) &&
    (config.enabled || Boolean(config.testPhones && config.testPhones.length > 0))
  );
}

/**
 * Belirli bir telefon numarası için WhatsApp kullanılmalı mı?
 * - Eğer WHATSAPP_TEST_PHONES tanımlıysa, SADECE bu listedeki numaralar için WhatsApp çalışır.
 *   (Canlıda gerçek müşteriler ve çekiciler SMS almaya devam ederken, siz kendi numaranızla test edebilirsiniz).
 * - Tanımlı değilse, genel WHATSAPP_ENABLED değerine göre karar verilir.
 */
export function whatsappNumaraIcinAktifMi(
  telefon: string,
  cfg?: WhatsAppConfig
): boolean {
  const config = cfg ?? getWhatsAppConfig();
  if (!whatsappYapilandirildi(config)) return false;

  if (config.testPhones && config.testPhones.length > 0) {
    const norm = telefonNormalize(telefon);
    return config.testPhones.includes(norm);
  }

  return config.enabled;
}

/**
 * Türkiye cep telefonunu WhatsApp formatına (905XXXXXXXXX) dönüştürür.
 * E.164 standardı (+ işareti olmadan).
 */
export function telefonWhatsAppFormat(tel: string): string | null {
  const norm = telefonNormalize(tel);
  if (!/^05[0-9]{9}$/.test(norm)) return null;
  return `90${norm.slice(1)}`;
}

/**
 * Meta WhatsApp Cloud API hata kodlarını anlaşılır Türkçe mesajlara dönüştürür.
 */
export function metaHataAciklamasi(kod?: number | string, mesaj?: string): string {
  const k = String(kod ?? "");
  const aciklamalar: Record<string, string> = {
    "100": "Geçersiz parametre veya eksik şablon değişkeni",
    "190": "Geçersiz veya süresi dolmuş WhatsApp API Token",
    "131047":
      "24 saat kuralı aşımı: Kullanıcı son 24 saatte mesaj atmadığı için serbest metin gönderilemez, Meta onaylı Şablon (Template) kullanılmalıdır",
    "131026": "Mesaj iletilemedi (alıcı numarası WhatsApp kullanmıyor veya geçersiz)",
    "132000": "Şablon bulunamadı veya belirtilen dilde onaylanmamış",
    "132001": "Şablon parametre sayısı eşleşmiyor",
    "133004": "WhatsApp Business hesabı ödeme yöntemi veya limit hatası",
    "133010": "Telefon numarası henüz Meta tarafından doğrulanmamış",
    "130429": "Hız limiti aşıldı (Rate limit)",
  };

  if (k && aciklamalar[k]) {
    return `${k}: ${aciklamalar[k]}`;
  }
  return mesaj ? `${k ? k + ": " : ""}${mesaj}` : "Bilinmeyen Meta API hatası";
}

/**
 * WhatsApp Cloud API üzerinden serbest metin (Free-form text) mesajı gönderir.
 * Not: 24 saatlik müşteri penceresi içinde veya test geliştirici modunda geçerlidir.
 */
export async function sendWhatsAppText(
  telefon: string,
  mesaj: string,
  cfg?: WhatsAppConfig
): Promise<WhatsAppGonderimSonuc> {
  const config = cfg ?? getWhatsAppConfig();

  if (!whatsappYapilandirildi(config)) {
    return {
      basarili: false,
      saglayici: "demo",
      hata: "WhatsApp yapılandırılmamış (WHATSAPP_TOKEN ve WHATSAPP_PHONE_NUMBER_ID gereklidir)",
    };
  }

  const alici = telefonWhatsAppFormat(telefon);
  if (!alici) {
    return {
      basarili: false,
      saglayici: "whatsapp",
      hata: `Geçersiz WhatsApp telefon numarası: ${telefon}`,
    };
  }

  const apiVersion = config.apiVersion || DEFAULT_API_VERSION;
  const url = `https://graph.facebook.com/${apiVersion}/${config.phoneNumberId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: alici,
    type: "text",
    text: {
      preview_url: true,
      body: mesaj,
    },
  };

  return callMetaMessagesApi(url, config.token, body);
}

/**
 * WhatsApp Cloud API üzerinden Meta onaylı Şablon (Template) mesajı gönderir.
 */
export async function sendWhatsAppTemplate(
  telefon: string,
  template: WhatsAppTemplatePayload,
  cfg?: WhatsAppConfig
): Promise<WhatsAppGonderimSonuc> {
  const config = cfg ?? getWhatsAppConfig();

  if (!whatsappYapilandirildi(config)) {
    return {
      basarili: false,
      saglayici: "demo",
      hata: "WhatsApp yapılandırılmamış (WHATSAPP_TOKEN ve WHATSAPP_PHONE_NUMBER_ID gereklidir)",
    };
  }

  const alici = telefonWhatsAppFormat(telefon);
  if (!alici) {
    return {
      basarili: false,
      saglayici: "whatsapp",
      hata: `Geçersiz WhatsApp telefon numarası: ${telefon}`,
    };
  }

  const apiVersion = config.apiVersion || DEFAULT_API_VERSION;
  const url = `https://graph.facebook.com/${apiVersion}/${config.phoneNumberId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: alici,
    type: "template",
    template: {
      name: template.name,
      language: template.language || { code: "tr" },
      components: template.components || [],
    },
  };

  return callMetaMessagesApi(url, config.token, body);
}

/**
 * Meta Graph API çağrısını gerçekleştirir ve yanıtı ayrıştırır.
 */
async function callMetaMessagesApi(
  url: string,
  token: string,
  body: unknown
): Promise<WhatsAppGonderimSonuc> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const raw = await res.text();
    let data: {
      messages?: Array<{ id: string }>;
      error?: {
        message: string;
        type: string;
        code: number;
        error_subcode?: number;
        fbtrace_id?: string;
      };
    };

    try {
      data = JSON.parse(raw) as typeof data;
    } catch {
      console.error("[WhatsApp Cloud API] Yanıt JSON değil:", raw);
      return {
        basarili: false,
        saglayici: "whatsapp",
        hata: raw || `HTTP ${res.status}`,
      };
    }

    if (res.ok && data.messages && data.messages.length > 0) {
      return {
        basarili: true,
        saglayici: "whatsapp",
        mesajId: data.messages[0].id,
        rawResponse: data,
      };
    }

    if (data.error) {
      const err = data.error;
      const aciklama = metaHataAciklamasi(err.code, err.message);
      console.error("[WhatsApp Cloud API Hata]", err.code, aciklama);
      return {
        basarili: false,
        saglayici: "whatsapp",
        hataKodu: err.code,
        hata: aciklama,
        rawResponse: data,
      };
    }

    return {
      basarili: false,
      saglayici: "whatsapp",
      hata: raw || `HTTP ${res.status}`,
      rawResponse: data,
    };
  } catch (err) {
    const hata = fetchHataMesaji(err);
    console.error("[WhatsApp Cloud API Network Hata]", hata);
    return {
      basarili: false,
      saglayici: "whatsapp",
      hata,
    };
  }
}

/**
 * Standart Şablon Oluşturma Yardımcıları (Predefined Templates)
 */
export const WhatsAppTemplates = {
  /**
   * OTP / Doğrulama Kodu Şablonu
   * Şablon adı: dogrulama_kodu (AUTHENTICATION veya UTILITY)
   */
  otp(kod: string): WhatsAppTemplatePayload {
    return {
      name: "dogrulama_kodu",
      language: { code: "tr" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: String(kod).replace(/\D/g, "") }],
        },
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [{ type: "text", text: String(kod).replace(/\D/g, "") }],
        },
      ],
    };
  },

  /**
   * Yeni Talep Bildirimi (Çekiciye)
   * Şablon adı: yeni_talep_cekici
   * Parametreler: {{1}} Konum (İl/İlçe), {{2}} Talep Linki
   */
  yeniTalep(yer: string, link: string): WhatsAppTemplatePayload {
    return {
      name: "yeni_talep_cekici",
      language: { code: "tr" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: yer || "Bölgenizde" },
            { type: "text", text: link },
          ],
        },
      ],
    };
  },

  /**
   * Talep Alındı Bildirimi (Müşteriye)
   * Şablon adı: talep_alindi_musteri
   * Parametreler: {{1}} Takip Linki
   */
  talepAlindi(link: string): WhatsAppTemplatePayload {
    return {
      name: "talep_alindi_musteri",
      language: { code: "tr" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: link }],
        },
      ],
    };
  },

  /**
   * Yeni Teklif Geldi Bildirimi (Müşteriye)
   * Şablon adı: yeni_teklif_musteri
   * Parametreler: {{1}} Takip Linki
   */
  yeniTeklif(link: string): WhatsAppTemplatePayload {
    return {
      name: "yeni_teklif_musteri",
      language: { code: "tr" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: link }],
        },
      ],
    };
  },

  /**
   * Müşteri Çekiciyi Seçti Bildirimi (Kazanan Çekiciye)
   * Şablon adı: musteri_secildi_cekici
   * Parametreler: {{1}} Konum, {{2}} Müşteri Telefonu, {{3}} Talep Detay Linki
   */
  musteriSecildi(yer: string, musteriTelefon: string, link: string): WhatsAppTemplatePayload {
    return {
      name: "musteri_secildi_cekici",
      language: { code: "tr" },
      components: [
        {
          type: "body",
          parameters: [
            { type: "text", text: yer || "Bölgenizde" },
            { type: "text", text: musteriTelefon },
            { type: "text", text: link },
          ],
        },
      ],
    };
  },

  /**
   * Fatura Bildirimi
   * Şablon adı: fatura_bilgisi
   * Parametreler: {{1}} Fatura Linki
   */
  fatura(link: string): WhatsAppTemplatePayload {
    return {
      name: "fatura_bilgisi",
      language: { code: "tr" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: link }],
        },
      ],
    };
  },

  /**
   * Memnuniyet / Değerlendirme Formu
   * Şablon adı: memnuniyet_degerlendirme
   * Parametreler: {{1}} Değerlendirme Form Linki
   */
  memnuniyet(link: string): WhatsAppTemplatePayload {
    return {
      name: "memnuniyet_degerlendirme",
      language: { code: "tr" },
      components: [
        {
          type: "body",
          parameters: [{ type: "text", text: link }],
        },
      ],
    };
  },
};
