const COOKIE_NAME = "meglit_vendor";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const SEP = "|";

const encoder = new TextEncoder();

function getSecret() {
  return process.env.VENDOR_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || "meglit-vendor-dev-secret";
}

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function sign(value) {
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bufToHex(sig);
}

export async function createVendorToken({ id, email }) {
  const payload = `${id}${SEP}${encodeURIComponent(email)}${SEP}${Date.now()}`;
  const sig = await sign(payload);
  return `${payload}${SEP}${sig}`;
}

export async function verifyVendorToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(SEP);
  if (parts.length !== 4) return null;
  const [id, email, ts, sig] = parts;
  const expected = await sign(`${id}${SEP}${email}${SEP}${ts}`);
  if (!timingSafeEqual(sig, expected)) return null;
  const age = Date.now() - Number(ts);
  if (Number.isNaN(age) || age > MAX_AGE_MS) return null;
  return { id, email: decodeURIComponent(email) };
}

// Password hashing (same approach as admin auth)
export async function hashPassword(password) {
  const salt = bufToHex(crypto.getRandomValues(new Uint8Array(16)));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(salt));
  return { hash: bufToHex(sig), salt };
}

export async function verifyPassword(password, hash, salt) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(salt));
  return timingSafeEqual(bufToHex(sig), hash);
}

export const VENDOR_COOKIE = COOKIE_NAME;
export const VENDOR_COOKIE_MAX_AGE = Math.floor(MAX_AGE_MS / 1000);
