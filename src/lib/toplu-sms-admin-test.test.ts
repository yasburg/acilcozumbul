import { describe, expect, it } from "vitest";
import {
  TOPLU_SMS_ADMIN_TEST_TELEFON,
  topluSmsAdminTestIleBaslat,
} from "./toplu-sms-admin-test";

describe("topluSmsAdminTestIleBaslat", () => {
  it("listeye admin’i başa ekler", () => {
    expect(topluSmsAdminTestIleBaslat(["05321111111", "05322222222"])).toEqual([
      TOPLU_SMS_ADMIN_TEST_TELEFON,
      "05321111111",
      "05322222222",
    ]);
  });

  it("admin zaten varsa başa taşır, çiftlemez", () => {
    expect(
      topluSmsAdminTestIleBaslat([
        "05321111111",
        "0537 250 05 86",
        "05322222222",
      ])
    ).toEqual([
      TOPLU_SMS_ADMIN_TEST_TELEFON,
      "05321111111",
      "05322222222",
    ]);
  });

  it("boş listede yalnız admin kalır", () => {
    expect(topluSmsAdminTestIleBaslat([])).toEqual([
      TOPLU_SMS_ADMIN_TEST_TELEFON,
    ]);
  });
});
