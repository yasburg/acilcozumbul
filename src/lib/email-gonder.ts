export type EpostaSonuc = {
  basarili: boolean;
  demo?: boolean;
  hata?: string;
};

export async function epostaGonder(
  alici: string,
  konu: string,
  metin: string
): Promise<EpostaSonuc> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM?.trim() || "acilcozumbul <noreply@acilcozumbul.com>";

  if (!apiKey) {
    console.log(`[EMAIL DEMO] → ${alici}\nKonu: ${konu}\n${metin}`);
    return { basarili: true, demo: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [alici],
        subject: konu,
        text: metin,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { basarili: false, hata: err || `HTTP ${res.status}` };
    }
    return { basarili: true };
  } catch (e) {
    return {
      basarili: false,
      hata: e instanceof Error ? e.message : "E-posta gönderilemedi",
    };
  }
}
