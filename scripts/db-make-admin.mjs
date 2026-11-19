// Promotes an existing account to admin. Usage: npm run db:make-admin -- you@example.com
import postgres from "postgres";

process.loadEnvFile(".env.local");
const email = process.argv[2];
if (!email || !process.env.SUPABASE_DB_URL) {
  console.error("Usage: npm run db:make-admin -- <email>   (needs SUPABASE_DB_URL in .env.local)");
  process.exit(1);
}
const sql = postgres(process.env.SUPABASE_DB_URL, { ssl: "require", max: 1 });
try {
  const rows = await sql`update public.profiles set role = 'admin' where lower(email) = lower(${email}) returning id`;
  console.log(rows.length ? `${email} is now an admin` : `No account found for ${email} — sign up first.`);
} finally {
  await sql.end();
}
