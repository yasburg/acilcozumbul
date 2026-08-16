import { fromTable } from "../pg";

export function supabaseDbAktif(): boolean {
  return true;
}

/** Sunucu API route’ları — Railway PostgreSQL client */
export function getSupabaseAdmin(): any {
  if (typeof window !== "undefined") {
    return {
      from: () => {
        throw new Error("getSupabaseAdmin cannot be executed on the client.");
      },
      rpc: async () => ({ data: null, error: null }),
    };
  }

  return {
    from: (tableName: string) => fromTable(tableName),
    rpc: async (_fnName: string, _args: any) => {
      return { data: null, error: null };
    },
  };
}

