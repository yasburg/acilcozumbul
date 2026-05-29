/** Türkiye cep: 05XXXXXXXXX veya 5XXXXXXXXX */
export function telefonNormalize(tel: string): string {
  let d = tel.replace(/\D/g, "");
  if (d.startsWith("90") && d.length === 12) d = "0" + d.slice(2);
  if (d.length === 10 && d.startsWith("5")) d = "0" + d;
  return d;
}

export function telefonGecerliMi(tel: string): boolean {
  const n = telefonNormalize(tel);
  return /^05[0-9]{9}$/.test(n);
}

export function telefonMaskele(tel: string): string {
  const n = telefonNormalize(tel);
  if (n.length < 10) return tel;
  return `${n.slice(0, 4)} *** ** ${n.slice(-2)}`;
}
