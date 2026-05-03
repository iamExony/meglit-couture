// Edge-compatible auth using Web Crypto API.

const COOKIE_NAME = "meglit_admin";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "meglit-dev-secret-change-me";
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

// Token format: id.username.role.timestamp.signature
export async function createSessionToken({ id, username, role }) {
  const payload = `${id}.${encodeURIComponent(username)}.${role}.${Date.now()}`;
  const sig = await sign(payload);
  return `${payload}.${sig}`;
}

export async function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 5) return null;
  const [id, username, role, ts, sig] = parts;
  const expected = await sign(`${id}.${username}.${role}.${ts}`);
  if (!timingSafeEqual(sig, expected)) return null;
  const age = Date.now() - Number(ts);
  if (Number.isNaN(age) || age > MAX_AGE_MS) return null;
  return { id, username: decodeURIComponent(username), role };
}

export const ADMIN_COOKIE = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE = Math.floor(MAX_AGE_MS / 1000);
