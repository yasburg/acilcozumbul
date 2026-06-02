/** E-posta normalize (küçük harf, trim) */
export function epostaNormalize(ham: string): string {
  return ham.trim().toLowerCase();
}

export function epostaGecerliMi(ham: string): boolean {
  const e = epostaNormalize(ham);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;
}

export function epostaDogrulamaHatasi(ham: string): string {
  if (!ham.trim()) return "E-posta adresi girin.";
  if (!epostaGecerliMi(ham)) return "Geçerli bir e-posta adresi girin.";
  return "Geçersiz e-posta.";
}

/** TC kimlik (11 hane, isteğe bağlı alan için basit doğrulama) */
export function tcKimlikGecerliMi(ham: string): boolean {
  const t = ham.replace(/\D/g, "");
  if (t.length !== 11 || t[0] === "0") return false;
  const d = t.split("").map(Number);
  const tek = d[0] + d[2] + d[4] + d[6] + d[8];
  const cift = d[1] + d[3] + d[5] + d[7];
  const h10 = (tek * 7 - cift) % 10;
  if (h10 !== d[9]) return false;
  const h11 = (d.slice(0, 10).reduce((a, b) => a + b, 0) % 10);
  return h11 === d[10];
}

/** Vergi no (10 veya 11 hane) */
export function vergiNoGecerliMi(ham: string): boolean {
  const v = ham.replace(/\D/g, "");
  return v.length === 10 || v.length === 11;
}
