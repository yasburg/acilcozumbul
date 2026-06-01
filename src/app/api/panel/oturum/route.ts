import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";

/** Tarayıcıda panel yöneticisi oturumu var mı (çekici panelinde link göstermek için) */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email || !panelEpostaIzinli(user.email)) {
      return NextResponse.json({ yetkili: false });
    }

    return NextResponse.json({ yetkili: true, eposta: user.email });
  } catch {
    return NextResponse.json({ yetkili: false });
  }
}
