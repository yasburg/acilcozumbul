import { NextResponse } from "next/server";
import {
  demoCookieOturumId,
  DEMO_COOKIE,
  durdurDemoOturum,
} from "@/lib/demo-oturum";

export async function POST() {
  const id = await demoCookieOturumId();
  if (id) await durdurDemoOturum(id);

  const res = NextResponse.json({ mesaj: "Demo oturumu sonlandırıldı." });
  res.cookies.set(DEMO_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
