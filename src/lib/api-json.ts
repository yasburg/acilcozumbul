/** fetch yanıtını güvenli JSON'a çevirir (boş gövde / HTML hata sayfası) */
export async function parseJsonYanit<T = Record<string, unknown>>(
  res: Response
): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    if (!res.ok) {
      throw new Error(
        `Sunucu yanıt vermedi (${res.status}). Veritabanı migration 007 uygulandı mı?`
      );
    }
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    const ozet = text.replace(/\s+/g, " ").slice(0, 160);
    throw new Error(
      res.ok
        ? "Sunucu yanıtı okunamadı."
        : `Sunucu hatası (${res.status})${ozet ? `: ${ozet}` : ""}`
    );
  }
}
