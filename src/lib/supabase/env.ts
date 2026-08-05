export {
  panelAdminEpostalari,
  panelEpostaIzinli,
  panelMuhasebeEpostalari,
  panelMuhasebeAnaSayfa,
  panelMuhasebeApiIzinli,
  panelMuhasebeSayfaIzinli,
  panelRol,
  type PanelRol,
} from "../panel-yetki";

export function supabaseEksikEnvAlanlari(): string[] {
  const eksik: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    eksik.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()) {
    eksik.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return eksik;
}

export function supabaseYapilandirildi(): boolean {
  return supabaseEksikEnvAlanlari().length === 0;
}

export function supabaseYapilandirmaHataMesaji(): string {
  const eksik = supabaseEksikEnvAlanlari();
  if (eksik.length === 0) return "";
  return `.env dosyanıza ekleyin: ${eksik.join(", ")} (Supabase Dashboard → Project Settings → API).`;
}
