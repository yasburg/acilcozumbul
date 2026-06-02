import crypto from "crypto";

export function garantiHashHesapla(data: {
  orderId: string;
  terminalId: string;
  cardNumber: string;
  amount: string;
  currency: string;
  password: string;
}): string {
  const hashedPassword = crypto
    .createHash("sha1")
    .update(data.password + "0" + data.terminalId, "latin1")
    .digest("hex")
    .toUpperCase();

  const hashString = [
    data.orderId,
    data.terminalId,
    data.cardNumber,
    data.amount,
    data.currency,
    hashedPassword,
  ].join("");

  return crypto.createHash("sha512").update(hashString, "latin1").digest("hex").toUpperCase();
}

export function garantiXmlDeger(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>(.*?)</${tag}>`, "i"));
  return match ? match[1] : "";
}
