// Applies supabase/migrations/*.sql in order. Usage: npm run db:migrate
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

process.loadEnvFile(".env.local");
const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error("SUPABASE_DB_URL is empty in .env.local (Supabase → Settings → Database → Connection string → URI).");
  process.exit(1);
}

const sql = postgres(url, { ssl: "require", max: 1, onnotice: () => {} });
const dir = join(process.cwd(), "supabase", "migrations");

try {
  await sql`create table if not exists public._migrations (name text primary key, applied_at timestamptz not null default now())`;
  const done = new Set((await sql`select name from public._migrations`).map((r) => r.name));
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    if (done.has(f)) {
      console.log(`skip  ${f}`);
      continue;
    }
    await sql.begin(async (tx) => {
      await tx.unsafe(readFileSync(join(dir, f), "utf8"));
      await tx`insert into public._migrations (name) values (${f})`;
    });
    console.log(`apply ${f}`);
  }
  console.log("migrations up to date");
} catch (e) {
  console.error("migration failed:", e.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
