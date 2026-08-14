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
  return [];
}

export function supabaseYapilandirildi(): boolean {
  return true;
}

export function supabaseYapilandirmaHataMesaji(): string {
  return "";
}
