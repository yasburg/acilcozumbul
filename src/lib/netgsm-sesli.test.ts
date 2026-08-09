import { describe, expect, it } from "vitest";
import {
  basitSesliXml,
  sesliGonderimPenceresi,
  telefonVoiceFormat,
} from "./netgsm-sesli";

describe("telefonVoiceFormat", () => {
  it("05… → 5…", () => {
    expect(telefonVoiceFormat("05321234567")).toBe("5321234567");
  });
  it("5… kabul", () => {
    expect(telefonVoiceFormat("5321234567")).toBe("5321234567");
  });
  it("geçersiz", () => {
    expect(telefonVoiceFormat("02121234567")).toBeNull();
  });
});

describe("sesliGonderimPenceresi", () => {
  it("ddMMyyyy / HHmm ve 2 saat pencere", () => {
    const now = new Date("2026-08-09T10:05:00+03:00");
    const p = sesliGonderimPenceresi(now, 2);
    expect(p.startdate).toBe("09082026");
    expect(p.starttime).toBe("1005");
    expect(p.stopdate).toBe("09082026");
    expect(p.stoptime).toBe("1205");
  });
});

describe("basitSesliXml", () => {
  it("audioid + no içerir, key=0", () => {
    const xml = basitSesliXml({
      usercode: "u",
      password: "p",
      audioId: "170247953",
      telefonVoice: "5321234567",
      startdate: "09082026",
      starttime: "1000",
      stopdate: "09082026",
      stoptime: "1200",
      filter: "0",
    });
    expect(xml).toContain("<audioid>170247953</audioid>");
    expect(xml).toContain("<no>5321234567</no>");
    expect(xml).toContain("<key>0</key>");
    expect(xml).toContain("<filter>0</filter>");
  });

  it("relationid sanitize eder", () => {
    const xml = basitSesliXml({
      usercode: "u",
      password: "p",
      audioId: "1",
      telefonVoice: "5321234567",
      startdate: "09082026",
      starttime: "1000",
      stopdate: "09082026",
      stoptime: "1200",
      relationid: "t:abc<script>:c:1",
    });
    expect(xml).toContain("<relationid>t:abcscript:c:1</relationid>");
    expect(xml).not.toContain("<script>");
  });

  it("key=1 + url + tuş 9 keyinfo üretir", () => {
    const xml = basitSesliXml({
      usercode: "u",
      password: "p",
      audioId: "170280647",
      telefonVoice: "5321234567",
      startdate: "09082026",
      starttime: "1000",
      stopdate: "09082026",
      stoptime: "1200",
      key: 1,
      url: "https://www.acilcozumbul.com/api/webhooks/netgsm/sesli?secret=x",
      keyinfo: [{ tus: 9, text: "Bildirim SMS oldu." }],
      relationid: "t:t1:c:c1",
    });
    expect(xml).toContain("<key>1</key>");
    expect(xml).toContain(
      "<url>https://www.acilcozumbul.com/api/webhooks/netgsm/sesli?secret=x</url>"
    );
    expect(xml).toContain("<keyinfo>9</keyinfo>");
    expect(xml).toContain("<text>Bildirim SMS oldu.</text>");
    expect(xml).toContain("<relationid>t:t1:c:c1</relationid>");
  });
});
