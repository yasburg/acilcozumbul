import { describe, expect, it } from "vitest";
import { garantiOrderListInqXmlOlustur } from "./orderlistinq";

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

describe("orderlistinq xml", () => {
  it("orderlistinq tipi ve tarih alanları", () => {
    const xml = garantiOrderListInqXmlOlustur(fakeCfg, {
      orderId: "inq1",
      hashData: "HASH",
      startDate: "01/08/2026 00:00",
      endDate: "02/08/2026 23:59",
      listPageNum: "1",
      amount: "10000",
    });
    expect(xml).toContain("<Type>orderlistinq</Type>");
    expect(xml).toContain("<StartDate>01/08/2026 00:00</StartDate>");
    expect(xml).toContain("<EndDate>02/08/2026 23:59</EndDate>");
    expect(xml).toContain("<ListPageNum>1</ListPageNum>");
  });
});
