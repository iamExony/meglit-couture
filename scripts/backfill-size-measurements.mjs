import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { products as SEED } from "../src/data/products.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// Load .env.local
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

// Standard women's wear measurements (inches), graded by size.
// Fields match MEASUREMENT_FIELDS in admin/products/page.js:
//   Wst (Waist), Hps (Hips), Bst (Bust), Lgth (Length),
//   Insm (Inseam), Otsm (Outseam), Shldr (Shoulder)
const SIZE_GRADE = {
  XS: { Wst: "24", Hps: "34", Bst: "32", Shldr: "14" },
  S:  { Wst: "26", Hps: "36", Bst: "34", Shldr: "14.5" },
  M:  { Wst: "28", Hps: "38", Bst: "36", Shldr: "15" },
  L:  { Wst: "30", Hps: "40", Bst: "38", Shldr: "15.5" },
  XL: { Wst: "32", Hps: "42", Bst: "40", Shldr: "16" },
  XXL: { Wst: "34", Hps: "44", Bst: "42", Shldr: "16.5" },
  XXXL: { Wst: "36", Hps: "46", Bst: "44", Shldr: "17" },
};

// Bottoms (palazzo/trousers): waist, hips, length, inseam, outseam.
function bottomMeasurements(size) {
  const g = SIZE_GRADE[size];
  if (!g) return null;
  return {
    Wst: g.Wst,
    Hps: g.Hps,
    Lgth: "42",   // total length (waist → hem)
    Insm: "31",   // inseam stays roughly constant across sizes
    Otsm: "42",
  };
}

// Tops / dresses: bust, shoulder, length, waist (for fitted tops).
function topMeasurements(size) {
  const g = SIZE_GRADE[size];
  if (!g) return null;
  return {
    Bst: g.Bst,
    Wst: g.Wst,
    Shldr: g.Shldr,
    Lgth: "26", // top length
  };
}

// Two-piece set: include both top + bottom fields.
function setMeasurements(size) {
  const g = SIZE_GRADE[size];
  if (!g) return null;
  return {
    Bst: g.Bst,
    Wst: g.Wst,
    Hps: g.Hps,
    Shldr: g.Shldr,
    Lgth: "24",   // top length
    Insm: "31",
    Otsm: "42",
  };
}

function buildForProduct(p) {
  const sizes = Array.isArray(p.sizes) ? p.sizes : [];
  if (sizes.length === 0) return null;

  // Fabric items: convert yard sizes into inches.
  // 1 yard = 36 inches. Standard bolt width ≈ 54".
  if (p.category === "fabric") {
    const out = {};
    for (const size of sizes) {
      const m = String(size).match(/(\d+(?:\.\d+)?)\s*yards?/i);
      if (!m) continue;
      const yards = parseFloat(m[1]);
      out[size] = {
        Lgth: String(Math.round(yards * 36)),
        Wdth: "54",
      };
    }
    return Object.keys(out).length > 0 ? out : null;
  }

  let pick = bottomMeasurements;
  if (p.subcategory === "sets") pick = setMeasurements;
  // Future categories like "tops" or "dresses" should map to topMeasurements here.

  const out = {};
  for (const size of sizes) {
    const m = pick(size);
    if (m) out[size] = m;
  }
  return Object.keys(out).length > 0 ? out : null;
}

const items = [];
for (const p of SEED) {
  const sm = buildForProduct(p);
  if (sm) items.push({ slug: p.slug, sizeMeasurements: sm });
}

console.log(`Submitting size measurements for ${items.length} of ${SEED.length} products…`);

const client = new ConvexHttpClient(url);
const res = await client.mutation(api.migrations.backfillSizeMeasurements, { items });
console.log("Backfill result:", res);
