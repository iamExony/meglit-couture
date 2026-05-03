// One-off test: sends a sample receipt email via Resend.
// Usage: node scripts/send-test-receipt.mjs <recipient-email>

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

const to = process.argv[2];
if (!to) {
  console.error("Usage: node scripts/send-test-receipt.mjs <recipient-email>");
  process.exit(1);
}

const { sendOrderReceiptEmail } = await import("../src/lib/mail.js");

const sampleOrder = {
  reference: "MGL-TEST-" + Date.now(),
  customer: {
    firstName: "Anthony",
    lastName: "Ezeonyemaechi",
    email: to,
    address: "12 Adeola Odeku Street",
    city: "Victoria Island",
    state: "Lagos",
  },
  items: [
    {
      name: "Royal Palazzo Elegance",
      quantity: 1,
      price: 28500,
      size: "M",
      color: { name: "Royal Blue" },
    },
    {
      name: "Sapphire Silk Palazzo",
      quantity: 2,
      price: 34000,
      size: "L",
      color: { name: "Sapphire Blue" },
    },
  ],
  subtotal: 96500,
  shipping: 0,
  total: 96500,
};

console.log(`Sending test receipt to ${to}…`);
const result = await sendOrderReceiptEmail(sampleOrder);
console.log("Result:", result);
