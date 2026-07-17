import { garantiConfigOku } from "./config";
import { garantiMusteriHataMesaji } from "./hata-mesaji";
import { garantiHashHesapla, garantiXmlDeger } from "./hash";

const BASARI_KODLARI = new Set(["00", "000"]);

export type GarantiKrediOdemeIstegi = {
  orderId: string;
  amountKurus: number;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  clientIp: string;
  email?: string;
};

export type GarantiOdemeSonuc = {
  basarili: boolean;
  respCode?: string;
  message?: string;
  /** Bankadan ham ErrorMsg / Message (log için) */
  bankaMesaji?: string;
  refNo?: string;
};

function orderIdTemizle(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 36);
}

/** Response bloğundan alan oku; yoksa tüm XML */
function yanitAlan(xml: string, tag: string): string {
  const blok = xml.match(/<Response>([\s\S]*?)<\/Response>/i)?.[1] ?? xml;
  return garantiXmlDeger(blok, tag);
}

function xmlIstekOlustur(
  cfg: ReturnType<typeof garantiConfigOku>,
  tx: Record<string, string>
): string {
  return `<?xml version="1.0" encoding="iso-8859-9"?>
<GVPSRequest>
  <Mode>${cfg.mode}</Mode>
  <Version>512</Version>
  <Terminal>
    <ProvUserID>${cfg.provUserId}</ProvUserID>
    <HashData>${tx.HASHDATA}</HashData>
    <UserID>${cfg.userId}</UserID>
    <ID>${cfg.terminalId}</ID>
    <MerchantID>${cfg.merchantId}</MerchantID>
  </Terminal>
  <Customer>
    <IPAddress>${tx.CLIENT_IP}</IPAddress>
    <EmailAddress>${tx.CLIENT_EMAIL}</EmailAddress>
  </Customer>
  <Card>
    <Number>${tx.CARDNUMBER}</Number>
    <ExpireDate>${tx.EXPIRES}</ExpireDate>
    <CVV2>${tx.CVV2}</CVV2>
  </Card>
  <Order>
    <OrderID>${tx.ORDERID}</OrderID>
    <GroupID />
  </Order>
  <Transaction>
    <Type>sales</Type>
    <Amount>${tx.AMOUNT}</Amount>
    <CurrencyCode>${cfg.currencyCode}</CurrencyCode>
    <CardholderPresentCode>0</CardholderPresentCode>
    <MotoInd>N</MotoInd>
    <InstallmentCnt>0</InstallmentCnt>
  </Transaction>
</GVPSRequest>`;
}

export async function garantiKrediOdemesiYap(
  istek: GarantiKrediOdemeIstegi
): Promise<GarantiOdemeSonuc> {
  const cfg = garantiConfigOku();
  const orderId = orderIdTemizle(istek.orderId);
  if (!orderId) {
    throw new Error("Geçersiz sipariş numarası.");
  }

  const cardNumber = istek.cardNumber.replace(/\D/g, "");
  const expiryMonth = istek.expiryMonth.padStart(2, "0");
  const expiryYear = istek.expiryYear.padStart(2, "0").slice(-2);
  const amount = String(istek.amountKurus);

  const hash = garantiHashHesapla({
    orderId,
    terminalId: cfg.terminalId,
    cardNumber,
    amount,
    currency: cfg.currencyCode,
    password: cfg.password,
  });

  const tx = {
    ORDERID: orderId,
    AMOUNT: amount,
    CARDNUMBER: cardNumber,
    EXPIRES: `${expiryMonth}${expiryYear}`,
    CVV2: istek.cvv,
    CLIENT_IP: istek.clientIp,
    CLIENT_EMAIL: istek.email ?? "odeme@acilcozumbul.com",
    HASHDATA: hash,
  };

  const response = await fetch(cfg.postUrl, {
    method: "POST",
    headers: { "Content-Type": "application/xml; charset=iso-8859-9" },
    body: xmlIstekOlustur(cfg, tx),
  });

  if (!response.ok) {
    throw new Error(`Garanti HTTP hatası: ${response.status}`);
  }

  const text = await response.text();
  const respCode = yanitAlan(text, "Code") || garantiXmlDeger(text, "Code");
  const errorMsg = yanitAlan(text, "ErrorMsg");
  const message = yanitAlan(text, "Message");
  const sysErrMsg = yanitAlan(text, "SysErrMsg");
  const basarili = BASARI_KODLARI.has(respCode);

  const musteriMesaji = basarili
    ? message || undefined
    : garantiMusteriHataMesaji({
        respCode,
        errorMsg,
        message,
        sysErrMsg,
      });

  return {
    basarili,
    respCode,
    message: musteriMesaji,
    bankaMesaji: errorMsg || message || sysErrMsg || undefined,
    refNo: yanitAlan(text, "RetrefNum") || undefined,
  };
}
