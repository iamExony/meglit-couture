import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Minimal .env.local loader (no dotenv dep)
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
if (!url) {
  console.error("NEXT_PUBLIC_CONVEX_URL not set");
  process.exit(1);
}

const SEED = [
  {
    name: "Palazzo Collection",
    slug: "palazzo",
    description: "Elegant wide-leg palazzo pants for every occasion",
    subcategories: ["Wide-Leg", "Silk", "Velvet", "Sets", "Pleated", "Evening"],
  },
  {
    name: "Branded Fabrics",
    slug: "fabric",
    description: "Premium fabrics for bespoke fashion creations",
    subcategories: ["Ankara", "Lace", "Brocade", "Adire", "Voile", "Printed"],
  },
  {
    name: "Complete Sets",
    slug: "sets",
    description: "Matching palazzo sets for effortless styling",
    subcategories: ["Two-Piece", "Three-Piece", "Co-ord"],
  },
  {
    name: "New Arrivals",
    slug: "new",
    description: "The latest additions to our collection",
    subcategories: [],
  },
  {
    name: "Dresses",
    slug: "dresses",
    description: "Statement dresses for every occasion",
    subcategories: ["Maxi", "Midi", "Mini", "Gown", "Cocktail"],
  },
  {
    name: "Tops & Blouses",
    slug: "tops",
    description: "Elegant tops, blouses and shirts",
    subcategories: ["Blouse", "Shirt", "Crop Top", "Tunic"],
  },
  {
    name: "Skirts",
    slug: "skirts",
    description: "Skirts in all silhouettes",
    subcategories: ["Maxi", "Midi", "Mini", "Pencil", "A-Line", "Pleated"],
  },
  {
    name: "Accessories",
    slug: "accessories",
    description: "Finishing touches for every outfit",
    subcategories: ["Bags", "Belts", "Jewelry", "Headwraps", "Scarves"],
  },
];

const client = new ConvexHttpClient(url);

let created = 0;
let skipped = 0;
let updated = 0;

for (const cat of SEED) {
  try {
    await client.mutation(api.categories.create, cat);
    created++;
    console.log(`✓ created: ${cat.name}`);
  } catch (e) {
    const msg = String(e?.message || e);
    if (/already exists/i.test(msg)) {
      // Update subcategories on existing entry
      try {
        const all = await client.query(api.categories.list, {});
        const existing = all.find((c) => c.slug === cat.slug);
        if (existing) {
          await client.mutation(api.categories.update, {
            id: existing._id,
            description: cat.description,
            subcategories: cat.subcategories,
          });
          updated++;
          console.log(`↻ updated: ${cat.name}`);
        } else {
          skipped++;
          console.log(`- skipped: ${cat.name} (${msg})`);
        }
      } catch (e2) {
        skipped++;
        console.log(`- skipped: ${cat.name} (${e2?.message || e2})`);
      }
    } else {
      console.error(`✗ failed: ${cat.name} - ${msg}`);
    }
  }
}

console.log(`\nDone. created=${created} updated=${updated} skipped=${skipped}`);
