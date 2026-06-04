/** Onaylı rozetli teklifler üstte, sonra fiyata göre artan */
export function teklifleriSirala<
  T extends { fiyat: number; onayliCekici?: boolean },
>(teklifler: T[]): T[] {
  return [...teklifler].sort((a, b) => {
    const aR = a.onayliCekici ? 1 : 0;
    const bR = b.onayliCekici ? 1 : 0;
    if (aR !== bR) return bR - aR;
    return a.fiyat - b.fiyat;
  });
}
