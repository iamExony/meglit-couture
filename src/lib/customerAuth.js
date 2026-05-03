// Edge-compatible HMAC-signed session cookie for storefront customers.
// Mirrors the admin auth pattern but uses a separate cookie + secret.

const COOKIE_NAME = "meglit_customer";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSecret() {
  return (
    process.env.CUSTOMER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    "meglit-dev-secret-change-me"
  );
}

const encoder = new TextEncoder();

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
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += bytes[i].toString(16).padStart(2, "0");
  return s;
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

// Token format: id|email|timestamp|signature
// We use `|` as the delimiter (not `.`) because URI-encoded emails still
// contain literal dots (e.g. `user%40gmail.com`), which would break a
// `.split(".")`-based parser. `|` never appears in a Convex id, an email,
// or a hex signature, and is safe inside an HTTP cookie value.
const SEP = "|";
const LEGACY_SEP = ".";

function buildPayload(id, email, ts) {
  return `${id}${SEP}${encodeURIComponent(email)}${SEP}${ts}`;
}

export async function createCustomerToken({ id, email }) {
  const payload = buildPayload(id, email, Date.now());
  const sig = await sign(payload);
  return `${payload}${SEP}${sig}`;
}

async function verifyParts(id, email, ts, sig) {
  const expected = await sign(`${id}${SEP}${email}${SEP}${ts}`);
  if (!timingSafeEqual(sig, expected)) return null;
  const age = Date.now() - Number(ts);
  if (Number.isNaN(age) || age > MAX_AGE_MS) return null;
  return { id, email: decodeURIComponent(email) };
}

async function verifyLegacyParts(id, email, ts, sig) {
  // Legacy `.`-delimited token kept so existing sessions don't get
  // logged out the moment we deploy the new format.
  const expected = await signLegacy(`${id}.${email}.${ts}`);
  if (!timingSafeEqual(sig, expected)) return null;
  const age = Date.now() - Number(ts);
  if (Number.isNaN(age) || age > MAX_AGE_MS) return null;
  return { id, email: decodeURIComponent(email) };
}

async function signLegacy(value) {
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bufToHex(sig);
}

export async function verifyCustomerToken(token) {
  if (!token || typeof token !== "string") return null;

  // Preferred new format: id|email|ts|sig
  if (token.includes(SEP)) {
    const parts = token.split(SEP);
    if (parts.length !== 4) return null;
    const [id, email, ts, sig] = parts;
    return verifyParts(id, email, ts, sig);
  }

  // Legacy format: id.email.ts.sig — emails may contain dots in the
  // domain, so reconstruct by taking first part as id, last two as ts/sig
  // and joining everything in the middle as the (encoded) email.
  const parts = token.split(LEGACY_SEP);
  if (parts.length < 4) return null;
  const id = parts[0];
  const sig = parts[parts.length - 1];
  const ts = parts[parts.length - 2];
  const email = parts.slice(1, parts.length - 2).join(LEGACY_SEP);
  return verifyLegacyParts(id, email, ts, sig);
}

export const CUSTOMER_COOKIE = COOKIE_NAME;
export const CUSTOMER_COOKIE_MAX_AGE = Math.floor(MAX_AGE_MS / 1000);
