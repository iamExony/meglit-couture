import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { products as SEED } from "../src/data/products.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env.local");
try {
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) { console.error("NEXT_PUBLIC_CONVEX_URL missing"); process.exit(1); }

const client = new ConvexHttpClient(url);

const items = SEED.map((p) => ({
  slug: p.slug,
  featured: !!p.featured,
  newArrival: !!p.newArrival,
  badge: p.badge || "",
}));

const res = await client.mutation(api.migrations.backfillFlags, { items });
console.log("Backfill result:", res, "of", items.length);
