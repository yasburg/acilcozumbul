import { type NextRequest } from "next/server";
import { updatePanelSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updatePanelSession(request);
}

export const config = {
  matcher: ["/panel/:path*", "/api/panel/:path*"],
};
