import { describe, expect, it } from "vitest";
import { googleMapsRotaUrl } from "./harita-yonlendirme";

const cekici = { lat: 41.02, lng: 28.98 };
const hizmetAlan = { lat: 41.01, lng: 28.97 };
const hedef = { lat: 41.03, lng: 29.0 };

describe("yol hesabı sırası", () => {
  it("Google rota: çekici → hizmet alan (waypoint) → hedef", () => {
    const url = googleMapsRotaUrl(hizmetAlan, { cekici, hedef });
    expect(url).toContain("origin=41.02%2C28.98");
    expect(url).toContain("waypoints=41.01%2C28.97");
    expect(url).toContain("destination=41.03%2C29");
    /* destination hizmet alan olmamalı (hedef varken) */
    expect(url).not.toMatch(/destination=41\.01/);
  });
});
