import { describe, expect, it } from "vitest";
import {
  efaturamBelgeHazirMi,
  efaturamBelgeHataliMi,
} from "./belge-indir";

describe("efaturamBelgeHazirMi", () => {
  it("READY_TO_BE_REPORTED + status string 205 kabul eder", () => {
    expect(
      efaturamBelgeHazirMi({
        gibStatus: "READY_TO_BE_REPORTED",
        status: "205",
      })
    ).toBe(true);
  });

  it("REPORTED kabul eder", () => {
    expect(efaturamBelgeHazirMi({ gibStatus: "REPORTED", status: 10 })).toBe(
      true
    );
  });

  it("bekleyen durumu reddeder", () => {
    expect(efaturamBelgeHazirMi({ gibStatus: "WAITING", status: "100" })).toBe(
      false
    );
  });
});

describe("efaturamBelgeHataliMi", () => {
  it("FAILED kabul eder", () => {
    expect(efaturamBelgeHataliMi({ gibStatus: "FAILED" })).toBe(true);
  });
});
