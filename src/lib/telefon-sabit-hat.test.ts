import { describe, expect, it } from "vitest";
import {
  telefonGecerliMi,
  telefonSabitHatMi,
} from "./telefon";

describe("telefonSabitHatMi", () => {
  it("İstanbul / Ankara sabit hatlarını tanır", () => {
    expect(telefonSabitHatMi("02121234567")).toBe(true);
    expect(telefonSabitHatMi("0312 555 44 33")).toBe(true);
    expect(telefonSabitHatMi("2121234567")).toBe(true);
    expect(telefonSabitHatMi("+90 212 123 45 67")).toBe(true);
  });

  it("cep numaralarını sabit hat saymaz", () => {
    expect(telefonSabitHatMi("05321234567")).toBe(false);
    expect(telefonSabitHatMi("5321234567")).toBe(false);
    expect(telefonGecerliMi("05321234567")).toBe(true);
  });
});
