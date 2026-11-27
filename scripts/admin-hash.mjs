// Prints an ADMIN_PASSWORD_HASH value for the owner login (PBKDF2-SHA256, random salt).
// The password is read from stdin so it never lands in shell history.
//   PowerShell:  "your new password" | npm run -s admin:hash
//   bash:        printf '%s' 'your new password' | npm run -s admin:hash
// Put the output in .env.local and in Vercel as ADMIN_PASSWORD_HASH.
import { webcrypto as crypto } from "node:crypto";

const chunks = [];
for await (const c of process.stdin) chunks.push(c);
const password = Buffer.concat(chunks).toString("utf8").replace(/\r?\n$/, "");
if (password.length < 10) {
  console.error("Use a password of at least 10 characters.");
  process.exit(1);
}

const b64u = (b) => Buffer.from(b).toString("base64url");
const iterations = 310_000;
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
console.log(`pbkdf2-sha256:${iterations}:${b64u(salt)}:${b64u(bits)}`);
