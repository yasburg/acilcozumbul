import { parseJsonYanit } from "./api-json";

/** Çekici oturum çerezinin API isteklerinde gönderilmesi */
export function cekiciFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  return fetch(input, { credentials: "include", ...init });
}

export { parseJsonYanit as cekiciJson };
