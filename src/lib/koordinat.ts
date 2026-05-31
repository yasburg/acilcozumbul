export interface LatLng {
  lat: number;
  lng: number;
}

export function koordinatGecerli(k?: LatLng | null): k is LatLng {
  if (!k) return false;
  if (!Number.isFinite(k.lat) || !Number.isFinite(k.lng)) return false;
  if (k.lat === 0 && k.lng === 0) return false;
  return Math.abs(k.lat) <= 90 && Math.abs(k.lng) <= 180;
}

export function latLngStr(k: LatLng): string {
  return `${k.lat},${k.lng}`;
}
