import { randomUUID } from "crypto";
import { garantiConfigOku, garantiYapilandirildi } from "./config";
import { garantiHashHesapla, garantiXmlDeger } from "./hash";

export type GarantiOrderTxn = {
  orderId?: string;
  authAmount?: string;
  retrefNum?: string;
  origRetrefNum?: string;
  status?: string;
  responseCode?: string;
  lastTrxDate?: string;
  recurringLastPaymentNum?: string;
  recurringTotalPaymentNum?: string;
};

export type GarantiOrderListInqSonuc = {
  basarili: boolean;
  respCode: string;
  message?: string;
  transactions: GarantiOrderTxn[];
  raw?: string;
};

function formatTarihSaat(yyyymmdd: string, end: boolean): string {
  if (!/^\d{8}$/.test(yyyymmdd)) {
    throw new Error("Tarih YYYYMMDD olmalı.");
  }
  const y = yyyymmdd.slice(0, 4);
  const m = yyyymmdd.slice(4, 6);
  const d = yyyymmdd.slice(6, 8);
  return `${d}/${m}/${y} ${end ? "23:59" : "00:00"}`;
}

function parseOrderTxnList(xml: string): GarantiOrderTxn[] {
  const matches = xml.match(/<OrderTxn>([\s\S]*?)<\/OrderTxn>/g) ?? [];
  return matches.map((block) => ({
    orderId: garantiXmlDeger(block, "OrderID") || undefined,
    authAmount: garantiXmlDeger(block, "AuthAmount") || undefined,
    retrefNum: garantiXmlDeger(block, "RetrefNum") || undefined,
    origRetrefNum: garantiXmlDeger(block, "OrigRetrefNum") || undefined,
    status: garantiXmlDeger(block, "Status") || undefined,
    responseCode: garantiXmlDeger(block, "ResponseCode") || undefined,
    lastTrxDate: garantiXmlDeger(block, "LastTrxDate") || undefined,
    recurringLastPaymentNum:
      garantiXmlDeger(block, "RecurringLastPaymentNum") || undefined,
    recurringTotalPaymentNum:
      garantiXmlDeger(block, "RecurringTotalPaymentNum") || undefined,
  }));
}

export function garantiOrderListInqXmlOlustur(
  cfg: ReturnType<typeof garantiConfigOku>,
  data: {
    orderId: string;
    hashData: string;
    startDate: string;
    endDate: string;
    listPageNum: string;
    amount: string;
  }
): string {
  return `<?xml version="1.0" encoding="iso-8859-9"?>
<GVPSRequest>
  <Mode>${cfg.mode}</Mode>
  <Version>512</Version>
  <Terminal>
    <ProvUserID>${cfg.userId}</ProvUserID>
    <HashData>${data.hashData}</HashData>
    <UserID>${cfg.userId}</UserID>
    <ID>${cfg.terminalId}</ID>
    <MerchantID>${cfg.merchantId}</MerchantID>
  </Terminal>
  <Customer>
    <IPAddress>192.168.0.1</IPAddress>
    <EmailAddress>odeme@acilcozumbul.com</EmailAddress>
  </Customer>
  <Order>
    <OrderID>${data.orderId}</OrderID>
    <GroupID />
    <StartDate>${data.startDate}</StartDate>
    <EndDate>${data.endDate}</EndDate>
  </Order>
  <Transaction>
    <Type>orderlistinq</Type>
    <ListPageNum>${data.listPageNum}</ListPageNum>
    <Amount>${data.amount}</Amount>
    <CurrencyCode>${cfg.currencyCode}</CurrencyCode>
    <CardholderPresentCode />
    <MotoInd>N</MotoInd>
  </Transaction>
</GVPSRequest>`;
}

/**
 * Garanti tarih aralığı sipariş listesi (yenileme mutabakatı).
 * startDate/endDate: YYYYMMDD
 */
export async function garantiOrderListInq(opts: {
  startDate: string;
  endDate: string;
  listPageNum?: number;
}): Promise<GarantiOrderListInqSonuc> {
  if (!garantiYapilandirildi()) {
    return {
      basarili: false,
      respCode: "",
      message: "Garanti yapılandırılmamış.",
      transactions: [],
    };
  }

  const cfg = garantiConfigOku();
  const orderId = randomUUID().replace(/-/g, "").slice(0, 36);
  const amount = "10000";
  const hashData = garantiHashHesapla({
    orderId,
    terminalId: cfg.terminalId,
    cardNumber: "",
    amount,
    currency: cfg.currencyCode,
    password: cfg.password,
  });

  const xml = garantiOrderListInqXmlOlustur(cfg, {
    orderId,
    hashData,
    startDate: formatTarihSaat(opts.startDate, false),
    endDate: formatTarihSaat(opts.endDate, true),
    listPageNum: String(opts.listPageNum ?? 1),
    amount,
  });

  const response = await fetch(cfg.postUrl, {
    method: "POST",
    headers: { "Content-Type": "application/xml; charset=iso-8859-9" },
    body: xml,
  });

  if (!response.ok) {
    throw new Error(`Garanti orderlistinq HTTP: ${response.status}`);
  }

  const text = await response.text();
  const respCode =
    garantiXmlDeger(text, "Code").trim() ||
    garantiXmlDeger(text, "ReasonCode").trim();
  const basarili = respCode === "00" || respCode === "000";

  return {
    basarili,
    respCode,
    message:
      garantiXmlDeger(text, "ErrorMsg") ||
      garantiXmlDeger(text, "Message") ||
      undefined,
    transactions: parseOrderTxnList(text),
    raw: text,
  };
}
