import { describe, expect, it } from "vitest";
import {
  garantiKodNormalize,
  garantiMesajGenelMi,
  garantiMusteriHataMesaji,
  garantiYetersizBakiyeMetniMi,
} from "./hata-mesaji";
import { garantiYanitAlanlari } from "./yanit";

describe("garantiMusteriHataMesaji", () => {
  it("51 kodunda yetersiz bakiye mesajı verir", () => {
    expect(
      garantiMusteriHataMesaji({
        respCode: "51",
        message: "Declined",
      })
    ).toMatch(/yetersiz|limit/i);
  });

  it("14 kodunu 'kart numarası hatalı' diye göstermez", () => {
    const msg = garantiMusteriHataMesaji({
      respCode: "14",
      message: "Declined",
    });
    expect(msg).not.toMatch(/numarası hatalı/i);
    expect(msg).toMatch(/limit|CVV|son kullanma/i);
  });

  it("kod 14 olsa bile banka yetersiz bakiye derse onu gösterir", () => {
    expect(
      garantiMusteriHataMesaji({
        respCode: "14",
        errorMsg: "Not sufficient funds",
        message: "Declined",
      })
    ).toMatch(/yetersiz|limit/i);
  });

  it("Message=Declined + 51 → yetersiz", () => {
    expect(
      garantiMusteriHataMesaji({
        respCode: "51",
        message: "Declined",
        errorMsg: "Declined",
      })
    ).toMatch(/yetersiz|limit/i);
  });
});

describe("garantiYanitAlanlari", () => {
  it("HOST Code’unu tercih eder", () => {
    const xml = `
      <GVPSResponse>
        <Transaction>
          <Response>
            <Source>GVPS</Source>
            <Code>92</Code>
            <Message>Error</Message>
          </Response>
          <Response>
            <Source>HOST</Source>
            <Code>51</Code>
            <ReasonCode>00</ReasonCode>
            <Message>Declined</Message>
            <ErrorMsg></ErrorMsg>
          </Response>
        </Transaction>
      </GVPSResponse>`;
    expect(garantiYanitAlanlari(xml).respCode).toBe("51");
  });

  it("Code=Declined iken ReasonCode kullanır", () => {
    const xml = `
      <Response>
        <Source>HOST</Source>
        <Code>Declined</Code>
        <ReasonCode>51</ReasonCode>
        <Message>Declined</Message>
      </Response>`;
    expect(garantiYanitAlanlari(xml).respCode).toBe("51");
  });
});

describe("yardımcılar", () => {
  it("kod normalize", () => {
    expect(garantiKodNormalize("051")).toBe("51");
  });

  it("Declined geneldir", () => {
    expect(garantiMesajGenelMi("Declined")).toBe(true);
  });

  it("yetersiz bakiye metnini tanır", () => {
    expect(garantiYetersizBakiyeMetniMi("Not sufficient funds")).toBe(true);
    expect(garantiYetersizBakiyeMetniMi("Declined")).toBe(false);
  });
});
