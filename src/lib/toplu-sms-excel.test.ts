import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { exceldenTopluSmsAliciOku } from "./toplu-sms-excel";

function csvBuffer(csv: string): ArrayBuffer {
  const wb = XLSX.read(csv, { type: "string" });
  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

describe("exceldenTopluSmsAliciOku Meta lead", () => {
  it("phone_number + full_name + p:+90… okur", () => {
    const csv = [
      "id,full_name,phone_number,email",
      "l:1,Ali Yılmaz,p:+905321234567,a@b.com",
      "l:2,Ayşe Demir,p:+905559876543,b@c.com",
    ].join("\n");
    const { alicilar, ozet } = exceldenTopluSmsAliciOku(csvBuffer(csv));
    expect(ozet.gecerli).toBe(2);
    expect(alicilar.map((a) => a.telefon)).toEqual([
      "05321234567",
      "05559876543",
    ]);
    expect(alicilar.map((a) => a.ad)).toEqual(["Ali Yılmaz", "Ayşe Demir"]);
  });

  it("id sütununu telefon sanmaz", () => {
    const csv = [
      "id,phone_number",
      "l:999,p:+905551112233",
    ].join("\n");
    const { alicilar, ozet } = exceldenTopluSmsAliciOku(csvBuffer(csv));
    expect(ozet.gecerli).toBe(1);
    expect(alicilar[0]?.telefon).toBe("05551112233");
  });
});
