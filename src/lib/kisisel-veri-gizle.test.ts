import { describe, expect, it } from "vitest";
import { adGoster, soyadGoster, telefonGoster } from "./kisisel-veri-gizle";

describe("kisisel veri gizle", () => {
  it("açıkken orijinal değerleri gösterir", () => {
    expect(adGoster("Ayşe", false)).toBe("Ayşe");
    expect(soyadGoster("Yılmaz", false)).toBe("Yılmaz");
    expect(telefonGoster("05321234567", false)).toBe("05321234567");
  });

  it("gizleyince ad soyad telefon maskeler", () => {
    expect(adGoster("Ayşe", true)).toBe("••••");
    expect(soyadGoster("Yılmaz", true)).toBe("•");
    expect(telefonGoster("05321234567", true)).toBe("•••• ••• •• ••");
  });
});
