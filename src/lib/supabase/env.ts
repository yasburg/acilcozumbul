export function supabaseYapilandirildi(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

/** Virgülle ayrılmış izinli yönetici e-postaları (boş = Supabase’de oturum açan herkes) */
export function panelAdminEpostalari(): string[] {
  const raw = process.env.PANEL_ADMIN_EMAILS?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function panelEpostaIzinli(eposta: string | undefined): boolean {
  const izinli = panelAdminEpostalari();
  if (izinli.length === 0) return !!eposta;
  if (!eposta) return false;
  return izinli.includes(eposta.trim().toLowerCase());
}
