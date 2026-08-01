import { describe, expect, it } from "vitest";
import {
  aylikRecurringOpts,
  garantiRecurringStartDate,
  garantiXmlIstekOlustur,
  orderIdTemizle,
} from "./payment";

const fakeCfg = {
  profil: "test" as const,
  mode: "TEST" as const,
  terminalId: "30691297",
  merchantId: "7000679",
  storeKey: "x",
  userId: "PROVAUT",
  provUserId: "PROVAUT",
  password: "x",
  hashSecret: "x",
  postUrl: "https://example.com",
  currencyCode: "949",
  language: "tr",
};

describe("garanti recurring xml", () => {
  it("aylık Recurring bloğu ekler", () => {
    const recurring = aylikRecurringOpts("20260801");
    expect(recurring).toEqual({
      totalPaymentNum: 12,
      frequencyType: "M",
      frequencyInterval: 1,
      startDate: "20260801",
    });

    const xml = garantiXmlIstekOlustur(
      fakeCfg,
      {
        HASHDATA: "ABC",
        CLIENT_IP: "1.1.1.1",
        CLIENT_EMAIL: "a@b.com",
        CARDNUMBER: "4282209004348015",
        EXPIRES: "0827",
        CVV2: "123",
        ORDERID: "order1",
        AMOUNT: "49900",
      },
      recurring
    );

    expect(xml).toContain("<Recurring>");
    expect(xml).toContain("<FrequencyType>M</FrequencyType>");
    expect(xml).toContain("<TotalPaymentNum>12</TotalPaymentNum>");
    expect(xml).toContain("<FrequencyInterval>1</FrequencyInterval>");
    expect(xml).toContain("<StartDate>20260801</StartDate>");
    expect(xml).toContain("<Type>sales</Type>");
  });

  it("peşin satışta Recurring yok", () => {
    const xml = garantiXmlIstekOlustur(fakeCfg, {
      HASHDATA: "ABC",
      CLIENT_IP: "1.1.1.1",
      CLIENT_EMAIL: "a@b.com",
      CARDNUMBER: "4282209004348015",
      EXPIRES: "0827",
      CVV2: "123",
      ORDERID: "order1",
      AMOUNT: "49900",
    });
    expect(xml).not.toContain("<Recurring>");
  });

  it("orderIdTemizle ve startDate", () => {
    expect(orderIdTemizle("a-b-c")).toBe("abc");
    expect(garantiRecurringStartDate(new Date("2026-08-02T12:00:00Z"))).toBe(
      "20260802"
    );
  });
});
