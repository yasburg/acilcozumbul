import { describe, expect, it } from "vitest";
import {
  appleMapsRotaUrl,
  googleMapsRotaUrl,
  haritaSecenekleri,
} from "./harita-yonlendirme";

const musteri = { lat: 41.01, lng: 28.97 };
const cekici = { lat: 41.02, lng: 28.98 };
const hedef = { lat: 41.03, lng: 29.0 };

describe("harita-yonlendirme", () => {
  it("google rota url müşteri ve hedef", () => {
    const url = googleMapsRotaUrl(musteri, { cekici, hedef });
    expect(url).toContain("google.com/maps/dir");
    expect(url).toContain("origin=41.02%2C28.98");
    expect(url).toContain("waypoints=41.01%2C28.97");
    expect(url).toContain("destination=41.03%2C29");
  });

  it("apple rota url çoklu durak", () => {
    const url = appleMapsRotaUrl(musteri, { cekici, hedef });
    expect(url).toContain("maps.apple.com");
    expect(url).toContain("saddr=41.02%2C28.98");
    expect(url).toContain("daddr=41.01%2C28.97");
    expect(url).toContain("daddr=41.03%2C29");
  });

  it("haritaSecenekleri iki uygulama döner", () => {
    const sec = haritaSecenekleri(musteri, { cekici });
    expect(sec).toHaveLength(2);
    expect(sec.map((s) => s.id).sort()).toEqual(["apple", "google"]);
  });
});
