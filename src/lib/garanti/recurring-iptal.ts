import { garantiConfigOku, garantiYapilandirildi } from "./config";
import { garantiHashHesapla, garantiXmlDeger } from "./hash";
import { orderIdTemizle } from "./payment";

/**
 * Best-effort Garanti recurring durdurma.
 * Banka yanıtı başarısız olsa bile uygulama tarafı cancelled işaretlenir.
 */
export async function garantiRecurringIptalDene(opts: {
  orderId: string;
  originalRetrefNum?: string;
  amountKurus: number;
  clientIp?: string;
}): Promise<{ denendi: boolean; basarili: boolean; respCode?: string; mesaj?: string }> {
  if (!garantiYapilandirildi()) {
    return { denendi: false, basarili: false, mesaj: "Garanti yapılandırılmamış." };
  }

  const cfg = garantiConfigOku();
  const orderId = orderIdTemizle(opts.orderId);
  if (!orderId) {
    return { denendi: false, basarili: false, mesaj: "Geçersiz orderId." };
  }

  const amount = String(opts.amountKurus);
  const hash = garantiHashHesapla({
    orderId,
    terminalId: cfg.terminalId,
    cardNumber: "",
    amount,
    currency: cfg.currencyCode,
    password: cfg.password,
  });

  const retref = opts.originalRetrefNum ?? "";
  const xml = `<?xml version="1.0" encoding="iso-8859-9"?>
<GVPSRequest>
  <Mode>${cfg.mode}</Mode>
  <Version>512</Version>
  <Terminal>
    <ProvUserID>${cfg.provUserId}</ProvUserID>
    <HashData>${hash}</HashData>
    <UserID>${cfg.userId}</UserID>
    <ID>${cfg.terminalId}</ID>
    <MerchantID>${cfg.merchantId}</MerchantID>
  </Terminal>
  <Customer>
    <IPAddress>${opts.clientIp ?? "192.168.0.1"}</IPAddress>
    <EmailAddress>odeme@acilcozumbul.com</EmailAddress>
  </Customer>
  <Order>
    <OrderID>${orderId}</OrderID>
    <GroupID />
    <Recurring>
      <Type>D</Type>
      <TotalPaymentNum>0</TotalPaymentNum>
      <FrequencyType>M</FrequencyType>
      <FrequencyInterval>1</FrequencyInterval>
    </Recurring>
  </Order>
  <Transaction>
    <Type>void</Type>
    <Amount>${amount}</Amount>
    <CurrencyCode>${cfg.currencyCode}</CurrencyCode>
    <OriginalRetrefNum>${retref}</OriginalRetrefNum>
    <CardholderPresentCode>0</CardholderPresentCode>
    <MotoInd>N</MotoInd>
  </Transaction>
</GVPSRequest>`;

  try {
    const response = await fetch(cfg.postUrl, {
      method: "POST",
      headers: { "Content-Type": "application/xml; charset=iso-8859-9" },
      body: xml,
    });
    const text = await response.text();
    const respCode =
      garantiXmlDeger(text, "Code").trim() ||
      garantiXmlDeger(text, "ReasonCode").trim();
    const basarili = respCode === "00" || respCode === "000";
    return {
      denendi: true,
      basarili,
      respCode,
      mesaj:
        garantiXmlDeger(text, "ErrorMsg") ||
        garantiXmlDeger(text, "Message") ||
        undefined,
    };
  } catch (e) {
    return {
      denendi: true,
      basarili: false,
      mesaj: e instanceof Error ? e.message : "Garanti iptal hatası",
    };
  }
}
