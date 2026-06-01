import { redirect } from "next/navigation";

/** Eski adres — giriş tek kapıdan: /cekici/giris */
export default async function PanelGirisRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  params.set("eposta", "1");
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const hata = typeof sp.hata === "string" ? sp.hata : undefined;
  if (next) params.set("next", next);
  if (hata) params.set("hata", hata);
  redirect(`/cekici/giris?${params.toString()}`);
}
