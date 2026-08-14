import { getPanelSession } from "@/lib/panel-auth";

export async function createClient() {
  const session = await getPanelSession();
  return {
    auth: {
      getUser: async () => {
        if (!session) return { data: { user: null }, error: null };
        return {
          data: {
            user: {
              id: session.email,
              email: session.email,
              role: session.role,
            },
          },
          error: null,
        };
      },
      signOut: async () => ({ error: null }),
    },
  };
}
