import { epostaGecerliMi, tcKimlikGecerliMi, vergiNoGecerliMi } from "./eposta";
import type { OdemeFatura } from "./types";

export function faturaAlanlariniDogrula(
  f: Partial<OdemeFatura> & { faturaEposta?: string }
): { ok: true; data: OdemeFatura } | { ok: false; hata: string } {
  const eposta = (f.faturaEposta ?? "").trim();
  if (eposta && !epostaGecerliMi(eposta)) {
    return { ok: false, hata: "Geçerli bir fatura e-postası girin." };
  }

  const kurumsal = Boolean(f.kurumsal);
  const tc = f.faturaTcKimlik?.trim();
  if (tc && !tcKimlikGecerliMi(tc)) {
    return { ok: false, hata: "TC kimlik numarası geçersiz." };
  }

  if (kurumsal) {
    const unvan = f.sirketUnvan?.trim();
    const vergi = f.vergiNo?.trim();
    if (!unvan) {
      return { ok: false, hata: "Kurumsal fatura için şirket ünvanı girin." };
    }
    if (!vergi || !vergiNoGecerliMi(vergi)) {
      return {
        ok: false,
        hata: "Kurumsal fatura için geçerli vergi numarası (10–11 hane) girin.",
      };
    }
  }

  return {
    ok: true,
    data: {
      faturaEposta: eposta ? eposta.toLowerCase() : undefined,
      faturaAdres: f.faturaAdres?.trim() || undefined,
      faturaTcKimlik: tc || undefined,
      kurumsal,
      sirketUnvan: kurumsal ? f.sirketUnvan?.trim() : undefined,
      vergiNo: kurumsal ? f.vergiNo?.replace(/\D/g, "") : undefined,
    },
  };
}
