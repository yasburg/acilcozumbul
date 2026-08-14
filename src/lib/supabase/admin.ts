import { fromTable } from "../pg";

export function supabaseDbAktif(): boolean {
  return true;
}

/** Sunucu API route’ları — Railway PostgreSQL client */
export function getSupabaseAdmin(): any {
  return {
    from: (tableName: string) => fromTable(tableName),
    rpc: async (_fnName: string, _args: any) => {
      return { data: null, error: null };
    },
  };
}
