import { garantiXmlDeger } from "./hash";
import { garantiKodNormalize } from "./hata-mesaji";

export type GarantiYanitAlanlari = {
  respCode: string;
  errorMsg: string;
  message: string;
  sysErrMsg: string;
  hostMsg: string;
  refNo: string;
};

function responseBloklari(xml: string): string[] {
  return [...xml.matchAll(/<Response>([\s\S]*?)<\/Response>/gi)].map(
    (m) => m[1] ?? ""
  );
}

/** HOST yanıtını tercih et; yoksa son Response bloğu */
function tercihEdilenBlok(xml: string): string {
  const bloklar = responseBloklari(xml);
  if (!bloklar.length) return xml;
  const host = bloklar.find((b) => /<Source>\s*HOST\s*<\/Source>/i.test(b));
  return host ?? bloklar[bloklar.length - 1] ?? xml;
}

function sayisalKodMu(kod: string): boolean {
  return /^\d+$/.test(kod.trim());
}

/**
 * Garanti XML yanıtından müşteri mesajı için alanları çıkarır.
 * Code "Declined" gibi metinse ReasonCode’a düşer; CurrencyCode ile karışmaz.
 */
export function garantiYanitAlanlari(xml: string): GarantiYanitAlanlari {
  const blok = tercihEdilenBlok(xml);
  const rawCode = garantiXmlDeger(blok, "Code").trim();
  const reasonCode = garantiXmlDeger(blok, "ReasonCode").trim();
  const message = garantiXmlDeger(blok, "Message").trim();
  const errorMsg = garantiXmlDeger(blok, "ErrorMsg").trim();
  const sysErrMsg = garantiXmlDeger(blok, "SysErrMsg").trim();
  const hostMsg = garantiXmlDeger(blok, "HostMsg").trim();
  const refNo =
    garantiXmlDeger(blok, "RetrefNum").trim() ||
    garantiXmlDeger(xml, "RetrefNum").trim();

  let respCode = rawCode;
  if (!sayisalKodMu(rawCode) && sayisalKodMu(reasonCode)) {
    respCode = reasonCode;
  } else if (
    sayisalKodMu(rawCode) &&
    garantiKodNormalize(rawCode) === "00" &&
    /declin/i.test(message) &&
    sayisalKodMu(reasonCode) &&
    garantiKodNormalize(reasonCode) !== "00"
  ) {
    // Nadir: Code=00 + Message=Declined, asıl ret ReasonCode’da
    respCode = reasonCode;
  } else if (!rawCode && sayisalKodMu(reasonCode)) {
    respCode = reasonCode;
  }

  return {
    respCode,
    errorMsg,
    message,
    sysErrMsg,
    hostMsg,
    refNo,
  };
}
