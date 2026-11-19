// Uploads public/catalog/** to Cloudinary as <CLOUDINARY_FOLDER>/catalog/<dir>/<name>.
// Usage: npm run cloudinary:upload   (reads .env.local)
import { readdirSync, statSync } from "node:fs";
import { join, relative, extname, sep } from "node:path";
import { v2 as cloudinary } from "cloudinary";

process.loadEnvFile(".env.local");
const { NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
const folder = process.env.CLOUDINARY_FOLDER || "storefront";
if (!cloud || !key || !secret) {
  console.error("Missing Cloudinary env vars in .env.local");
  process.exit(1);
}
cloudinary.config({ cloud_name: cloud, api_key: key, api_secret: secret, secure: true });

const root = join(process.cwd(), "public", "catalog");
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(jpe?g|png|webp)$/i.test(name)) files.push(p);
  }
};
walk(root);

let ok = 0;
const failed = [];
for (const file of files) {
  const rel = relative(root, file).split(sep).join("/");
  const publicId = `${folder}/catalog/${rel.slice(0, -extname(rel).length)}`;
  try {
    await cloudinary.uploader.upload(file, {
      public_id: publicId,
      overwrite: true,
      invalidate: true,
      resource_type: "image",
      tags: ["storefront", "catalog"],
    });
    ok++;
    process.stdout.write(".");
  } catch (e) {
    failed.push(`${rel}: ${e?.message ?? e}`);
  }
}
console.log(`\nuploaded ${ok}/${files.length} to ${folder}/catalog/`);
if (failed.length) console.log("FAILED:\n" + failed.join("\n"));
process.exit(failed.length ? 1 : 0);
