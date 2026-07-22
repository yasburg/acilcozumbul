import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { panelEpostaIzinli } from "@/lib/supabase/env";
import {
  MIGRATION_033_MESAJ,
  topluSmsIsTablolariVar,
} from "@/lib/supabase/toplu-sms-schema";
import { iptalTopluSmsIs } from "@/lib/toplu-sms-is-db";

async function panelKullanici() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !panelEpostaIzinli(user.email)) return null;
  return user;
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await panelKullanici();
  if (!user) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  if (!(await topluSmsIsTablolariVar())) {
    return NextResponse.json(
      { error: MIGRATION_033_MESAJ, migrationGerekli: true },
      { status: 503 }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "İş id gerekli." }, { status: 400 });
  }

  const is = await iptalTopluSmsIs(id);
  if (!is) {
    return NextResponse.json({ error: "İş bulunamadı." }, { status: 404 });
  }
  return NextResponse.json({ is });
}
