import { describe, expect, it } from "vitest";
import { cekiciAuthEmail } from "./cekici-auth";

describe("cekiciAuthEmail", () => {
  it("telefonu Auth e-postasına çevirir", () => {
    expect(cekiciAuthEmail("0532 111 22 33")).toBe(
      "05321112233@cekici.acilcozumbul.internal"
    );
    expect(cekiciAuthEmail("5321112233")).toBe(
      "05321112233@cekici.acilcozumbul.internal"
    );
  });
});
