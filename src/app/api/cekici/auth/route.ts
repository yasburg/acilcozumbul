import { NextRequest, NextResponse } from "next/server";

/**
 * Ham `cekiciler.token` ile oturum açma kapatıldı.
 * SMS kısa linki `/t/{kod}` çerezi sunucuda set eder.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      error:
        "Bu giriş yolu kapatıldı. SMS bağlantısını kullanın veya şifreyle giriş yapın.",
    },
    { status: 410 }
  );
}
