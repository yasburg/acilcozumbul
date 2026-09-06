import { NextRequest, NextResponse } from "next/server";
import {
  getWhatsAppConfig,
  sendWhatsAppTemplate,
  sendWhatsAppText,
  whatsappAktifMi,
  whatsappYapilandirildi,
  WhatsAppTemplates,
} from "@/lib/whatsapp-provider";
import { telefonGecerliMi } from "@/lib/telefon";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getWhatsAppConfig();
  return NextResponse.json({
    yapilandirildi: whatsappYapilandirildi(config),
    aktif: whatsappAktifMi(config),
    phoneNumberId: config.phoneNumberId ? `${config.phoneNumberId.slice(0, 4)}...${config.phoneNumberId.slice(-4)}` : null,
    businessAccountId: config.businessAccountId ? `${config.businessAccountId.slice(0, 4)}...${config.businessAccountId.slice(-4)}` : null,
    fallbackToSms: config.fallbackToSms,
    apiVersion: config.apiVersion,
  });
}

type TestBody = {
  telefon?: string;
  mesaj?: string;
  sablon?: "otp" | "yeni_talep" | "talep_alindi" | "yeni_teklif" | "musteri_secildi";
};

export async function POST(request: NextRequest) {
  let body: TestBody;
  try {
    body = (await request.json()) as TestBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON verisi." }, { status: 400 });
  }

  const tel = body.telefon?.trim() ?? "";
  if (!tel || !telefonGecerliMi(tel)) {
    return NextResponse.json(
      { error: "Geçerli bir Türkiye cep telefonu girin (örn. 05XXXXXXXXX)." },
      { status: 400 }
    );
  }

  if (body.sablon) {
    let tpl;
    switch (body.sablon) {
      case "otp":
        tpl = WhatsAppTemplates.otp("123456");
        break;
      case "yeni_talep":
        tpl = WhatsAppTemplates.yeniTalep(
          "Kadıköy / İstanbul",
          "https://www.acilcozumbul.com/test-talep"
        );
        break;
      case "talep_alindi":
        tpl = WhatsAppTemplates.talepAlindi(
          "https://www.acilcozumbul.com/test-bekle"
        );
        break;
      case "yeni_teklif":
        tpl = WhatsAppTemplates.yeniTeklif(
          "https://www.acilcozumbul.com/test-teklif"
        );
        break;
      case "musteri_secildi":
        tpl = WhatsAppTemplates.musteriSecildi(
          "Kadıköy / İstanbul",
          "05320000000",
          "https://www.acilcozumbul.com/test-detay"
        );
        break;
    }

    if (tpl) {
      const sonuc = await sendWhatsAppTemplate(tel, tpl);
      return NextResponse.json(sonuc);
    }
  }

  const mesaj = body.mesaj?.trim() || "acilcozumbul.com: Bu bir test WhatsApp mesajıdır.";
  const sonuc = await sendWhatsAppText(tel, mesaj);
  return NextResponse.json(sonuc);
}
