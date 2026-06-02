export type GarantiMode = "TEST" | "PROD";
export type GarantiProfil = "test" | "prod";

export type GarantiConfig = {
  profil: GarantiProfil;
  mode: GarantiMode;
  terminalId: string;
  merchantId: string;
  storeKey: string;
  userId: string;
  provUserId: string;
  password: string;
  hashSecret: string;
  postUrl: string;
  currencyCode: string;
  language: string;
};

const RESMI_TEST_TERMINAL = "30691297";
const RESMI_TEST_MERCHANT = "7000679";
const RESMI_TEST_POST_URL =
  "https://sanalposprovtest.garantibbva.com.tr/VPServlet";

/** GARANTI_TEST_* boşken (sadece development) — yanlış GARANTI_* ile karışmasın */
const RESMI_TEST_VARSAYILAN: Partial<Record<GarantiAlan, string>> = {
  POST_URL: RESMI_TEST_POST_URL,
  MERCHANT_ID: RESMI_TEST_MERCHANT,
  TERMINAL_ID: RESMI_TEST_TERMINAL,
  USER_ID: "PROVAUT",
  PROV_USER_ID: "PROVAUT",
  PASSWORD: "123qweASD/",
  STORE_KEY: "12345678",
  HASH_SECRET: "12345678",
  CURRENCY_CODE: "949",
  LANGUAGE: "tr",
};

let sonVarsayilanTestKullanimi = false;

export function garantiResmiTestVarsayilanKullanildi(): boolean {
  return sonVarsayilanTestKullanimi;
}

function envTemizle(deger: string | undefined): string {
  if (!deger) return "";
  return deger.trim().replace(/^["']|["']$/g, "");
}

type GarantiAlan =
  | "TERMINAL_ID"
  | "MERCHANT_ID"
  | "USER_ID"
  | "PROV_USER_ID"
  | "PASSWORD"
  | "STORE_KEY"
  | "HASH_SECRET"
  | "POST_URL"
  | "CURRENCY_CODE"
  | "LANGUAGE";

/** Outfica / eski projeler: GARANTI_TEST_* (test) ve GARANTI_* (canlı) */
export function garantiProfilOku(): GarantiProfil {
  const zorla = envTemizle(process.env.GARANTI_USE_TEST).toLowerCase();
  if (zorla === "true" || zorla === "1") return "test";
  if (zorla === "false" || zorla === "0") return "prod";

  const testUrl = envTemizle(process.env.GARANTI_TEST_POST_URL);
  const prodUrl = envTemizle(process.env.GARANTI_POST_URL);
  const testMerchant = envTemizle(process.env.GARANTI_TEST_MERCHANT_ID);
  const prodMerchant = envTemizle(process.env.GARANTI_MERCHANT_ID);
  const testSifre = envTemizle(process.env.GARANTI_TEST_PASSWORD);
  const testTerminal = envTemizle(process.env.GARANTI_TEST_TERMINAL_ID);

  const testBloğuDolu = Boolean(
    testMerchant || testUrl || testSifre || testTerminal
  );

  if (process.env.NODE_ENV !== "production" && testBloğuDolu) {
    return "test";
  }

  // Sadece GARANTI_* dolu ama URL test ise (eski proje düzeni)
  if (
    process.env.NODE_ENV !== "production" &&
    prodUrl.includes("provtest") &&
    !prodUrl.includes("sanalposprov.garanti.com.tr/VPServlet")
  ) {
    return "test";
  }

  if (prodUrl && !prodUrl.includes("provtest") && prodMerchant) return "prod";
  if (testBloğuDolu) return "test";
  return "prod";
}

function envGarantiAlan(alan: GarantiAlan, profil: GarantiProfil): string {
  const testVal = envTemizle(process.env[`GARANTI_TEST_${alan}`]);
  const prodVal = envTemizle(process.env[`GARANTI_${alan}`]);

  if (profil === "test") {
    if (testVal) return testVal;
    if (
      process.env.NODE_ENV !== "production" &&
      RESMI_TEST_VARSAYILAN[alan]
    ) {
      sonVarsayilanTestKullanimi = true;
      return RESMI_TEST_VARSAYILAN[alan]!;
    }
    return prodVal;
  }
  return prodVal || testVal;
}

function modUrlDen(postUrl: string): GarantiMode {
  const zorla = envTemizle(process.env.GARANTI_MODE).toUpperCase();
  if (zorla === "TEST" || zorla === "PROD") return zorla;
  const url = postUrl.toLowerCase();
  if (url.includes("provtest") || url.includes("test.garanti")) return "TEST";
  return "PROD";
}

export function garantiModuOku(): GarantiMode {
  const cfg = garantiConfigOku();
  return cfg.mode;
}

export function garantiYapilandirildi(): boolean {
  const cfg = garantiConfigOku();
  return Boolean(
    cfg.terminalId &&
      cfg.merchantId &&
      cfg.userId &&
      cfg.password &&
      cfg.postUrl &&
      (cfg.hashSecret || cfg.storeKey)
  );
}

export function garantiYapilandirmaOzeti(): {
  profil: GarantiProfil;
  mod: GarantiMode;
  postUrl: string;
  terminalId: string;
  merchantId: string;
  userId: string;
  provUserId: string;
  uyarilar: string[];
} {
  const cfg = garantiConfigOku();
  const uyarilar: string[] = [];

  uyarilar.push(
    cfg.profil === "test"
      ? "Aktif profil: GARANTI_TEST_* (geliştirme)"
      : "Aktif profil: GARANTI_* (canlı)"
  );
  if (garantiResmiTestVarsayilanKullanildi()) {
    uyarilar.push(
      "GARANTI_TEST_* boş — resmi demo terminal (30691297 / 7000679) kullanıldı. Kendi test değerleriniz için .env doldurun."
    );
  }

  if (!cfg.postUrl.includes("VPServlet")) {
    uyarilar.push("POST_URL VPServlet olmalı.");
  }
  if (!cfg.terminalId) {
    uyarilar.push(
      cfg.profil === "test"
        ? "GARANTI_TEST_TERMINAL_ID boş — test için 30691297 yazın."
        : "GARANTI_TERMINAL_ID boş."
    );
  }
  if (!cfg.merchantId) {
    uyarilar.push(
      cfg.profil === "test"
        ? "GARANTI_TEST_MERCHANT_ID boş — test için 7000679 yazın."
        : "GARANTI_MERCHANT_ID boş."
    );
  }
  if (!cfg.password) {
    uyarilar.push(
      cfg.profil === "test"
        ? "GARANTI_TEST_PASSWORD boş — test için 123qweASD/ (resmi doküman)."
        : "GARANTI_PASSWORD boş."
    );
  }
  if (cfg.mode === "TEST" && !cfg.postUrl.includes("provtest")) {
    uyarilar.push("TEST modu ama URL provtest değil.");
  }
  if (
    cfg.mode === "TEST" &&
    cfg.merchantId === RESMI_TEST_MERCHANT &&
    cfg.terminalId &&
    cfg.terminalId !== RESMI_TEST_TERMINAL
  ) {
    uyarilar.push(
      `Merchant 7000679 ile terminal ${RESMI_TEST_TERMINAL} eşleşmeli (sizde farklı terminal).`
    );
  }

  return {
    profil: cfg.profil,
    mod: cfg.mode,
    postUrl: cfg.postUrl,
    terminalId: cfg.terminalId ? `${cfg.terminalId.slice(0, 2)}***` : "",
    merchantId: cfg.merchantId ? `${cfg.merchantId.slice(0, 2)}***` : "",
    userId: cfg.userId,
    provUserId: cfg.provUserId,
    uyarilar,
  };
}

export function garantiConfigOku(): GarantiConfig {
  sonVarsayilanTestKullanimi = false;
  const profil = garantiProfilOku();
  const postUrl = envGarantiAlan("POST_URL", profil);
  const mode = modUrlDen(postUrl);

  const terminalId = envGarantiAlan("TERMINAL_ID", profil);
  const merchantId = envGarantiAlan("MERCHANT_ID", profil);

  const userId = envGarantiAlan("USER_ID", profil) || "PROVAUT";
  const provUserId =
    envGarantiAlan("PROV_USER_ID", profil) || userId || "PROVAUT";
  const storeKey = envGarantiAlan("STORE_KEY", profil);
  const hashSecret =
    envGarantiAlan("HASH_SECRET", profil) || storeKey || "12345678";

  return {
    profil,
    mode,
    terminalId,
    merchantId,
    storeKey,
    userId,
    provUserId,
    password: envGarantiAlan("PASSWORD", profil),
    hashSecret,
    postUrl,
    currencyCode:
      envGarantiAlan("CURRENCY_CODE", profil) || "949",
    language: envGarantiAlan("LANGUAGE", profil) || "tr",
  };
}
