const TTL_MS = 60 * 60 * 1000; // 1 hour
const encoder = new TextEncoder();

function getSecret() {
  return process.env.VENDOR_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || "meglit-vendor-dev-secret";
}

async function hmacHex(data) {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const buf = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createResetToken(vendor) {
  const ts = Date.now().toString();
  const sig = await hmacHex(`${vendor._id}|${vendor.email}|${vendor.passwordHash}|${ts}`);
  const raw = `${vendor._id}|${ts}|${sig}`;
  return Buffer.from(raw).toString("base64url");
}

export async function verifyResetToken(token, vendor) {
  if (!token || typeof token !== "string") return null;
  let raw;
  try { raw = Buffer.from(token, "base64url").toString("utf-8"); } catch { return null; }

  const parts = raw.split("|");
  if (parts.length !== 3) return null;
  const [id, ts, sig] = parts;

  if (id !== String(vendor._id)) return null;

  const age = Date.now() - Number(ts);
  if (Number.isNaN(age) || age > TTL_MS) return null;

  const expected = await hmacHex(`${id}|${vendor.email}|${vendor.passwordHash}|${ts}`);
  if (!timingSafeEqual(sig, expected)) return null;

  return { vendorId: id };
}

// Extract vendorId from token without verifying — only used to look up the vendor
// before doing full verification. Safe because full HMAC check always follows.
export function peekVendorId(token) {
  try {
    const raw = Buffer.from(token, "base64url").toString("utf-8");
    return raw.split("|")[0] || null;
  } catch { return null; }
}
