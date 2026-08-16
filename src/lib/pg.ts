let pool: any = null;

async function getPgPool(): Promise<any> {
  if (typeof window !== "undefined") {
    throw new Error("getPgPool can only be called on the server.");
  }
  if (!pool) {
    const pgModule = await import("pg");
    const Pool = pgModule.Pool || pgModule.default?.Pool;
    const dbUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      "postgresql://postgres:mRdlyMtcLEzKjCKRYnBDGjLIWOjcqmnc@altaria.proxy.rlwy.net:32348/railway";

    pool = new Pool({
      connectionString: dbUrl,
      ssl: dbUrl.includes("proxy.rlwy.net")
        ? { rejectUnauthorized: false }
        : dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1") || dbUrl.includes(".railway.internal")
        ? false
        : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

export async function pgQuery<T = any>(
  text: string,
  params: any[] = []
): Promise<any> {
  if (typeof window !== "undefined") {
    return { rows: [] };
  }
  const p = await getPgPool();
  return p.query(text, params);
}

export class PgQueryBuilder<T = any> implements PromiseLike<{ data: T | null; error: any; count?: number | null }> {
  private tableName: string;
  private operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "UPSERT" = "SELECT";
  private selectCols: string = "*";
  private isHead: boolean = false;
  private countMode?: "exact";
  private whereClause: string[] = [];
  private params: any[] = [];
  private orderClause?: string;
  private limitNum?: number;
  private offsetNum?: number;
  private insertData?: any;
  private updateData?: any;
  private onConflictCols?: string;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = "*", opts?: { count?: "exact" | "planned" | "estimated"; head?: boolean }) {
    if (this.operation !== "INSERT" && this.operation !== "UPDATE" && this.operation !== "DELETE" && this.operation !== "UPSERT") {
      this.operation = "SELECT";
    }
    this.selectCols = columns === "*" ? "*" : columns;
    if (opts?.count === "exact") this.countMode = "exact";
    if (opts?.head) this.isHead = true;
    return this;
  }

  insert(values: any | any[], opts?: { onConflict?: string }) {
    this.operation = "INSERT";
    this.insertData = values;
    if (opts?.onConflict) this.onConflictCols = opts.onConflict;
    return this;
  }

  upsert(values: any | any[], opts?: { onConflict?: string }) {
    this.operation = "UPSERT";
    this.insertData = values;
    if (opts?.onConflict) this.onConflictCols = opts.onConflict;
    return this;
  }

  update(values: any) {
    this.operation = "UPDATE";
    this.updateData = values;
    return this;
  }

  delete() {
    this.operation = "DELETE";
    return this;
  }

  eq(column: string, value: any) {
    this.params.push(value);
    this.whereClause.push(`"${column}" = $${this.params.length}`);
    return this;
  }

  neq(column: string, value: any) {
    this.params.push(value);
    this.whereClause.push(`"${column}" != $${this.params.length}`);
    return this;
  }

  gt(column: string, value: any) {
    this.params.push(value);
    this.whereClause.push(`"${column}" > $${this.params.length}`);
    return this;
  }

  gte(column: string, value: any) {
    this.params.push(value);
    this.whereClause.push(`"${column}" >= $${this.params.length}`);
    return this;
  }

  lt(column: string, value: any) {
    this.params.push(value);
    this.whereClause.push(`"${column}" < $${this.params.length}`);
    return this;
  }

  lte(column: string, value: any) {
    this.params.push(value);
    this.whereClause.push(`"${column}" <= $${this.params.length}`);
    return this;
  }

  in(column: string, values: any[]) {
    if (!values || values.length === 0) {
      this.whereClause.push(`1 = 0`);
      return this;
    }
    const placeholders = values
      .map((val) => {
        this.params.push(val);
        return `$${this.params.length}`;
      })
      .join(", ");
    this.whereClause.push(`"${column}" IN (${placeholders})`);
    return this;
  }

  is(column: string, value: any) {
    if (value === null) {
      this.whereClause.push(`"${column}" IS NULL`);
    } else {
      this.params.push(value);
      this.whereClause.push(`"${column}" IS $${this.params.length}`);
    }
    return this;
  }

  not(column: string, operator: string, value: any) {
    if (operator === "is" && value === null) {
      this.whereClause.push(`"${column}" IS NOT NULL`);
    } else {
      this.params.push(value);
      this.whereClause.push(`NOT ("${column}" = $${this.params.length})`);
    }
    return this;
  }

  ilike(column: string, pattern: string) {
    this.params.push(pattern);
    this.whereClause.push(`"${column}" ILIKE $${this.params.length}`);
    return this;
  }

  like(column: string, pattern: string) {
    this.params.push(pattern);
    this.whereClause.push(`"${column}" LIKE $${this.params.length}`);
    return this;
  }

  or(orCondition: string) {
    const parts = orCondition.split(",");
    const subClauses: string[] = [];
    for (const part of parts) {
      const [col, op, ...valParts] = part.split(".");
      const valStr = valParts.join(".");
      const numVal = isNaN(Number(valStr)) ? valStr : Number(valStr);
      this.params.push(numVal);
      const paramIdx = `$${this.params.length}`;
      if (op === "gte") subClauses.push(`"${col}" >= ${paramIdx}`);
      else if (op === "lte") subClauses.push(`"${col}" <= ${paramIdx}`);
      else if (op === "eq") subClauses.push(`"${col}" = ${paramIdx}`);
      else subClauses.push(`"${col}" = ${paramIdx}`);
    }
    if (subClauses.length > 0) {
      this.whereClause.push(`(${subClauses.join(" OR ")})`);
    }
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    const dir = opts?.ascending === false ? "DESC" : "ASC";
    this.orderClause = `ORDER BY "${column}" ${dir}`;
    return this;
  }

  limit(count: number) {
    this.limitNum = count;
    return this;
  }

  range(from: number, to: number) {
    this.offsetNum = from;
    this.limitNum = to - from + 1;
    return this;
  }

  maybeSingle(): PromiseLike<{ data: T | null; error: any }> {
    this.isMaybeSingle = true;
    this.limitNum = 1;
    return this as any;
  }

  single(): PromiseLike<{ data: T | null; error: any }> {
    this.isSingle = true;
    this.limitNum = 1;
    return this as any;
  }

  private buildWhere(): string {
    return this.whereClause.length > 0
      ? `WHERE ${this.whereClause.join(" AND ")}`
      : "";
  }

  async execute(): Promise<{ data: any; error: any; count?: number | null }> {
    if (typeof window !== "undefined") {
      return { data: null, error: null };
    }
    try {
      if (this.operation === "SELECT") {
        let countVal: number | null = null;
        if (this.countMode === "exact") {
          const countSql = `SELECT COUNT(*) FROM public."${this.tableName}" ${this.buildWhere()}`;
          const countRes = await pgQuery(countSql, this.params);
          countVal = parseInt(countRes.rows[0]?.count ?? "0", 10);
        }

        if (this.isHead) {
          return { data: null, error: null, count: countVal };
        }

        const whereStr = this.buildWhere();
        const orderStr = this.orderClause ?? "";
        const limitStr = this.limitNum !== undefined ? `LIMIT ${this.limitNum}` : "";
        const offsetStr = this.offsetNum !== undefined ? `OFFSET ${this.offsetNum}` : "";

        const cols = this.selectCols === "*" ? "*" : this.selectCols;
        const sql = `SELECT ${cols} FROM public."${this.tableName}" ${whereStr} ${orderStr} ${limitStr} ${offsetStr}`.trim();

        const res = await pgQuery(sql, this.params);
        let data: any = res.rows;

        if (this.isSingle) {
          if (res.rows.length === 0) {
            return { data: null, error: { message: "Row not found", code: "PGRST116" }, count: countVal };
          }
          data = res.rows[0];
        } else if (this.isMaybeSingle) {
          data = res.rows.length > 0 ? res.rows[0] : null;
        }

        return { data, error: null, count: countVal };
      }

      if (this.operation === "INSERT" || this.operation === "UPSERT") {
        const rows = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
        if (rows.length === 0) return { data: [], error: null };

        const sample = rows[0];
        const keys = Object.keys(sample);
        const colNames = keys.map((k) => `"${k}"`).join(", ");

        const valuesSql: string[] = [];
        const params: any[] = [];

        for (const row of rows) {
          const rowPlaceholders: string[] = [];
          for (const key of keys) {
            params.push(row[key]);
            rowPlaceholders.push(`$${params.length}`);
          }
          valuesSql.push(`(${rowPlaceholders.join(", ")})`);
        }

        let sql = `INSERT INTO public."${this.tableName}" (${colNames}) VALUES ${valuesSql.join(", ")}`;

        if (this.onConflictCols || this.operation === "UPSERT") {
          const conflictCols = this.onConflictCols
            ? this.onConflictCols
                .split(",")
                .map((c) => `"${c.trim()}"`)
                .join(", ")
            : this.tableName.endsWith("_otp")
            ? `"telefon"`
            : this.tableName === "sehir_acilis"
            ? `"il"`
            : `"id"`;
          const updateAssigns = keys
            .map((k) => `"${k}" = EXCLUDED."${k}"`)
            .join(", ");
          sql += ` ON CONFLICT (${conflictCols}) DO UPDATE SET ${updateAssigns}`;
        }

        sql += ` RETURNING ${this.selectCols}`;

        const res = await pgQuery(sql, params);
        let data: any = res.rows;
        if (this.isSingle) {
          if (res.rows.length === 0) {
            return { data: null, error: { message: "Row not found", code: "PGRST116" } };
          }
          data = res.rows[0];
        } else if (this.isMaybeSingle) {
          data = res.rows.length > 0 ? res.rows[0] : null;
        } else if (!Array.isArray(this.insertData)) {
          data = res.rows[0] ?? null;
        }
        return { data, error: null };
      }

      if (this.operation === "UPDATE") {
        const keys = Object.keys(this.updateData);
        if (keys.length === 0) return { data: null, error: null };

        const setClauses: string[] = [];
        for (const key of keys) {
          this.params.push(this.updateData[key]);
          setClauses.push(`"${key}" = $${this.params.length}`);
        }

        const sql = `UPDATE public."${this.tableName}" SET ${setClauses.join(", ")} ${this.buildWhere()} RETURNING ${this.selectCols}`;
        const res = await pgQuery(sql, this.params);
        const data = this.isSingle || this.isMaybeSingle ? res.rows[0] ?? null : res.rows;
        return { data, error: null };
      }

      if (this.operation === "DELETE") {
        const sql = `DELETE FROM public."${this.tableName}" ${this.buildWhere()} RETURNING ${this.selectCols}`;
        const res = await pgQuery(sql, this.params);
        return { data: res.rows, error: null };
      }

      return { data: null, error: new Error("Unsupported operation") };
    } catch (error: any) {
      const errObj = {
        message: error?.message ?? String(error),
        code: error?.code ?? "500",
      };
      return { data: null, error: errObj };
    }
  }

  then<TResult1 = { data: T | null; error: any; count?: number | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: T | null; error: any; count?: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export function fromTable<T = any>(tableName: string): PgQueryBuilder<T> {
  return new PgQueryBuilder<T>(tableName);
}
