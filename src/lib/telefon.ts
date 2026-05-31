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

/** TR cep değil; muhtemelen yabancı veya hatalı ülke kodu */
export function telefonYabanciGorunuyorMu(tel: string): boolean {
  const raw = tel.trim();
  if (!raw || telefonGecerliMi(tel)) return false;

  const d = tel.replace(/\D/g, "");
  if (d.length < 9) return false;

  const normalized = telefonNormalize(tel);
  if (/^05[0-9]{9}$/.test(normalized)) return false;

  if (raw.startsWith("+") && !/^\+90\b/.test(raw.replace(/\s/g, ""))) {
    return true;
  }

  if (d.startsWith("90") && d.length >= 11) {
    const local = "0" + d.slice(2);
    if (!/^05[0-9]{9}$/.test(local)) return true;
  }

  if (d.length >= 10 && !d.startsWith("5") && !d.startsWith("05") && !d.startsWith("90")) {
    return true;
  }

  if (d.startsWith("0") && d.length >= 10 && !d.startsWith("05")) return true;

  return d.length >= 11 && !/^05[0-9]{9}$/.test(normalized);
}

export function telefonDogrulamaHatasi(tel: string): string {
  if (telefonGecerliMi(tel)) return "";

  if (telefonYabanciGorunuyorMu(tel)) {
    const destek = process.env.NEXT_PUBLIC_DESTEK_EMAIL?.trim();
    const iletisim = destek
      ? ` Şimdilik ${destek} adresinden bize yazabilirsiniz.`
      : " Şimdilik destek ekibimize e-posta ile ulaşabilirsiniz.";
    return (
      "Şu an yalnızca Türkiye cep telefonlarını (05XX…) destekliyoruz. " +
      "Yabancı numaralar için yakında e-posta doğrulaması ile devam edebileceksiniz; " +
      "sorununuzu çözmek için e-posta ile iletişime geçmenizi öneririz." +
      iletisim
    );
  }

  return "Geçerli bir Türkiye cep telefonu girin (05XX XXX XX XX).";
}

export function telefonMaskele(tel: string): string {
  const n = telefonNormalize(tel);
  if (n.length < 10) return tel;
  return `${n.slice(0, 4)} *** ** ${n.slice(-2)}`;
}
