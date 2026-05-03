import { products as seedProducts } from "@/data/products";
import crypto from "node:crypto";
import { api } from "../../convex/_generated/api";
import { convex } from "@/lib/convexServer";

// In-memory data store for sections not yet migrated to Convex.
// Products live in Convex; orders/purchases/users/messages/activities are still in-memory (next migration phase).

const globalKey = Symbol.for("meglit.adminStore");

function createStore() {
  return {
    productsSeeded: false,
  };
}

if (!globalThis[globalKey]) {
  globalThis[globalKey] = createStore();
}

const store = globalThis[globalKey];

// ---------- Products (Convex-backed) ----------
function normalizeProduct(p) {
  if (!p) return p;
  // Expose Convex `_id` as `id` for the client; preserve legacyId separately.
  return { ...p, id: p._id, _id: p._id };
}

function parseListInput(value, sep) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return String(value).split(sep).map((s) => s.trim()).filter(Boolean);
}

function parseColorsInput(value) {
  if (Array.isArray(value)) {
    // Accept array of strings or { name, hex }
    return value
      .map((c) => {
        if (!c) return null;
        if (typeof c === "string") {
          const t = c.trim();
          if (!t) return null;
          // Allow "Name|#hex" string form
          const m = t.match(/^(.+?)\s*[|:]\s*(#[0-9a-fA-F]{3,8})$/);
          return m ? { name: m[1].trim(), hex: m[2] } : { name: t };
        }
        if (typeof c === "object" && c.name) {
          return c.hex ? { name: String(c.name), hex: String(c.hex) } : { name: String(c.name) };
        }
        return null;
      })
      .filter(Boolean);
  }
  if (!value) return [];
  return parseColorsInput(String(value).split(","));
}

async function ensureSeed() {
  if (store.productsSeeded) return;
  store.productsSeeded = true;
  try {
    await convex().mutation(api.products.seedIfEmpty, { products: seedProducts });
  } catch (err) {
    store.productsSeeded = false;
    throw err;
  }
}

export async function listProducts() {
  await ensureSeed();
  const products = await convex().query(api.products.list, {});
  return products.map(normalizeProduct);
}

export async function getProduct(id) {
  await ensureSeed();
  // id may be: Convex _id (string starting with table-prefix), slug, or legacy numeric id
  const asNum = Number(id);
  let prod = null;
  if (typeof id === "string" && id.length >= 20 && /^[a-z0-9]+$/i.test(id)) {
    try { prod = await convex().query(api.products.get, { id }); } catch { /* ignore */ }
  }
  if (!prod && Number.isFinite(asNum)) {
    prod = await convex().query(api.products.get, { legacyId: asNum });
  }
  if (!prod && typeof id === "string") {
    prod = await convex().query(api.products.get, { slug: id });
  }
  return normalizeProduct(prod);
}

export async function createProduct(data) {
  await ensureSeed();
  const args = {
    name: String(data.name || "Untitled"),
    slug: data.slug ? String(data.slug) : undefined,
    price: Number(data.price) || 0,
    originalPrice: data.originalPrice !== undefined && data.originalPrice !== "" ? Number(data.originalPrice) : undefined,
    cost: data.cost !== undefined && data.cost !== "" ? Number(data.cost) : undefined,
    category: data.category || undefined,
    subcategory: data.subcategory || undefined,
    description: data.description || undefined,
    details: parseListInput(data.details, "\n"),
    sizes: parseListInput(data.sizes, ","),
    sizeMeasurements: data.sizeMeasurements && typeof data.sizeMeasurements === "object" ? data.sizeMeasurements : undefined,
    colors: parseColorsInput(data.colors),
    images: parseListInput(data.images, "\n"),
    rating: data.rating !== undefined && data.rating !== "" ? Number(data.rating) : undefined,
    reviews: data.reviews !== undefined && data.reviews !== "" ? Number(data.reviews) : undefined,
    stock: data.stock !== undefined && data.stock !== "" ? Number(data.stock) : 0,
    featured: data.featured === true || data.featured === "true" ? true : data.featured === false ? false : undefined,
    newArrival: data.newArrival === true || data.newArrival === "true" ? true : data.newArrival === false ? false : undefined,
    badge: data.badge !== undefined ? String(data.badge) : undefined,
  };
  const prod = await convex().mutation(api.products.create, args);
  return normalizeProduct(prod);
}

export async function updateProduct(id, data) {
  await ensureSeed();
  // Resolve to Convex _id
  const target = await getProduct(id);
  if (!target) return null;
  const patch = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.slug !== undefined) patch.slug = data.slug;
  if (data.category !== undefined) patch.category = data.category;
  if (data.subcategory !== undefined) patch.subcategory = data.subcategory;
  if (data.description !== undefined) patch.description = data.description;
  ["price", "originalPrice", "cost", "rating", "reviews", "stock"].forEach((k) => {
    if (data[k] !== undefined && data[k] !== "") patch[k] = Number(data[k]);
  });
  if (data.details !== undefined) patch.details = parseListInput(data.details, "\n");
  if (data.sizes !== undefined) patch.sizes = parseListInput(data.sizes, ",");
  if (data.sizeMeasurements !== undefined) {
    patch.sizeMeasurements = data.sizeMeasurements && typeof data.sizeMeasurements === "object" ? data.sizeMeasurements : undefined;
  }
  if (data.colors !== undefined) patch.colors = parseColorsInput(data.colors);
  if (data.images !== undefined) patch.images = parseListInput(data.images, "\n");
  if (data.featured !== undefined) patch.featured = data.featured === true || data.featured === "true";
  if (data.newArrival !== undefined) patch.newArrival = data.newArrival === true || data.newArrival === "true";
  if (data.badge !== undefined) patch.badge = String(data.badge);
  const prod = await convex().mutation(api.products.update, { id: target._id, patch });
  return normalizeProduct(prod);
}

export async function deleteProduct(id) {
  await ensureSeed();
  const target = await getProduct(id);
  if (!target) return false;
  await convex().mutation(api.products.remove, { id: target._id });
  return true;
}

// ---------- Orders ----------
function normalizeOrder(o) {
  if (!o) return o;
  return { ...o, id: o.legacyId || o._id };
}

export async function listOrders() {
  const orders = await convex().query(api.orders.list, {});
  return (orders || []).map(normalizeOrder);
}

export async function getOrder(id) {
  if (!id) return null;
  const o = await convex().query(api.orders.findByKey, { key: String(id) });
  return o ? normalizeOrder(o) : null;
}

export async function addOrder(order) {
  // Validate stock availability up front so we never persist an order
  // that we can't actually fulfil. This is the source of truth — the
  // client-side caps are just UX hints.
  const stockItems = Array.isArray(order.items)
    ? order.items
        .map((it) => ({
          productId: it._id ?? it.productId ?? it.id ?? it.legacyId,
          quantity: it.quantity || 1,
        }))
        .filter((i) => i.productId !== undefined && i.productId !== null)
    : [];
  if (stockItems.length > 0) {
    try {
      const checks = await convex().query(api.products.checkStock, { items: stockItems });
      const insufficient = (checks || []).filter((r) => !r.ok);
      if (insufficient.length > 0) {
        const err = new Error(
          insufficient
            .map((r) =>
              r.name
                ? `${r.name}: only ${r.available} in stock (you requested ${r.requested})`
                : `A product is no longer available`
            )
            .join("; ")
        );
        err.code = "INSUFFICIENT_STOCK";
        err.details = insufficient;
        throw err;
      }
    } catch (err) {
      if (err && err.code === "INSUFFICIENT_STOCK") throw err;
      // If the stock check itself errors (network etc.), log but allow
      // the order through rather than blocking checkout entirely.
      console.error("[orders] checkStock failed", err);
    }
  }

  // Persist to Convex
  const created = await convex().mutation(api.orders.create, {
    legacyId: order.id,
    reference: order.reference,
    customer: order.customer,
    items: order.items || [],
    subtotal: typeof order.subtotal === "number" ? order.subtotal : undefined,
    shipping: typeof order.shipping === "number" ? order.shipping : undefined,
    total: Number(order.total) || 0,
    paymentReference: order.paymentReference || order.reference,
    paymentStatus: order.paymentStatus,
    status: order.status || "pending",
  });
  // Decrement product stock
  if (Array.isArray(order.items) && order.items.length > 0) {
    const items = order.items
      .map((it) => ({
        // Cart items spread the full product, so prefer the Convex _id and
        // fall back to legacyId / id / productId (legacy seed data).
        productId: it._id ?? it.productId ?? it.id ?? it.legacyId,
        quantity: it.quantity || 1,
      }))
      .filter((i) => i.productId !== undefined && i.productId !== null);
    if (items.length > 0) {
      try {
        await convex().mutation(api.products.decrementStock, { items });
      } catch (err) {
        console.error("[orders] decrementStock failed", err);
      }
    }
  }
  return normalizeOrder(created);
}

export async function updateOrderStatus(id, status) {
  const updated = await convex().mutation(api.orders.updateStatus, { key: String(id), status });
  return updated ? normalizeOrder(updated) : null;
}

// Atomically claim the right to send the receipt for an order. Returns true the
// first time it's called for a given key; false thereafter.
export async function claimOrderReceipt(id) {
  try {
    const res = await convex().mutation(api.orders.claimReceipt, { key: String(id) });
    return !!res?.ok;
  } catch (err) {
    console.error("[orders] claimReceipt failed", err);
    return false;
  }
}

// ---------- Purchases (inventory restocks) ----------
function normalizePurchase(p) {
  if (!p) return p;
  return { ...p, id: p._id, notes: p.note || p.notes || "" };
}

export async function listPurchases() {
  const items = await convex().query(api.purchases.list, {});
  return (items || []).map(normalizePurchase);
}

export async function addPurchase(data) {
  const product = await getProduct(data.productId);
  if (!product) return { error: "Product not found" };
  const quantity = Math.max(1, Number(data.quantity) || 0);
  const unitCost = Number(data.unitCost) || product.cost || 0;
  const created = await convex().mutation(api.purchases.create, {
    productId: product._id,
    productName: product.name,
    quantity,
    unitCost,
    supplier: data.supplier || undefined,
    note: data.notes || data.note || undefined,
  });
  return { purchase: normalizePurchase(created) };
}

export async function deletePurchase(id) {
  if (!id) return false;
  try {
    return await convex().mutation(api.purchases.remove, { id });
  } catch {
    return false;
  }
}

// ---------- Analytics ----------
export async function getAnalytics() {
  const orders = await listOrders();
  const purchases = await listPurchases();
  const products = await listProducts();
  const productById = new Map();
  for (const p of products) {
    productById.set(String(p._id), p);
    if (p.legacyId !== undefined) productById.set(String(p.legacyId), p);
  }

  const revenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const cogs = orders.reduce((sum, o) => {
    if (!Array.isArray(o.items)) return sum;
    return sum + o.items.reduce((s, it) => {
      const p = productById.get(String(it.id));
      return s + (p ? (p.cost || 0) * (it.quantity || 1) : 0);
    }, 0);
  }, 0);
  const purchaseSpend = purchases.reduce((s, p) => s + (p.total || 0), 0);
  const profit = revenue - cogs;

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const days = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, revenue: 0, orders: 0 });
  }
  for (const o of orders) {
    const ts = typeof o.createdAt === "number" ? o.createdAt : Date.parse(o.createdAt || "");
    const key = Number.isFinite(ts) ? new Date(ts).toISOString().slice(0, 10) : "";
    const day = days.find((d) => d.date === key);
    if (day) {
      day.revenue += Number(o.total) || 0;
      day.orders += 1;
    }
  }

  const productSales = {};
  for (const o of orders) {
    if (!Array.isArray(o.items)) continue;
    for (const it of o.items) {
      const pid = it._id ?? it.id ?? it.productId ?? it.legacyId ?? it.name;
      const key = String(pid);
      if (!productSales[key]) {
        productSales[key] = { id: pid, name: it.name, quantity: 0, revenue: 0 };
      }
      productSales[key].quantity += it.quantity || 1;
      productSales[key].revenue += (Number(it.price) || 0) * (it.quantity || 1);
    }
  }
  const topProducts = Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const LOW_STOCK_THRESHOLD = 10;
  const lowStock = products
    .filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => (a.stock || 0) - (b.stock || 0));
  const outOfStock = products.filter((p) => !p.stock || p.stock <= 0);
  const inventoryValue = products.reduce((s, p) => s + (p.cost || 0) * (p.stock || 0), 0);

  return {
    totals: {
      revenue,
      cogs,
      profit,
      purchaseSpend,
      orderCount: orders.length,
      productCount: products.length,
      inventoryValue,
    },
    statusCounts,
    salesOverTime: days,
    topProducts,
    lowStock: lowStock.map((p) => ({ id: p._id, name: p.name, stock: p.stock })),
    outOfStock: outOfStock.map((p) => ({ id: p._id, name: p.name })),
  };
}

// ---------- Users / Staff ----------
function hashPassword(password, salt) {
  const useSalt = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), useSalt, 64).toString("hex");
  return { salt: useSalt, hash };
}

export function verifyPassword(password, salt, hash) {
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(String(password), salt, 64).toString("hex");
  const a = Buffer.from(test, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function publicUser(u) {
  if (!u) return null;
  const { passwordHash, salt, ...rest } = u;
  void passwordHash; void salt;
  return { ...rest, id: rest._id };
}

let bootstrapEnsured = false;
export async function ensureBootstrapAdmin() {
  if (bootstrapEnsured) return;
  const username = process.env.ADMIN_USERNAME || "admin";
  // Check if any admin exists by trying to find this username
  const existing = await convex().query(api.users.getByUsername, { username });
  if (existing) {
    bootstrapEnsured = true;
    return;
  }
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const { salt, hash } = hashPassword(password);
  try {
    await convex().mutation(api.users.create, {
      username,
      name: "Administrator",
      email: "",
      role: "admin",
      active: true,
      bootstrap: true,
      passwordHash: hash,
      salt,
    });
  } catch { /* race: someone created it */ }
  bootstrapEnsured = true;
}

export async function listUsers() {
  await ensureBootstrapAdmin();
  const users = await convex().query(api.users.list, {});
  return (users || []).map((u) => ({ ...u, id: u._id }));
}

export async function listCustomers() {
  const [customers, orders] = await Promise.all([
    convex().query(api.customers.list, {}),
    convex().query(api.orders.list, {}),
  ]);
  const byEmail = new Map();
  const byCustomerId = new Map();
  for (const o of orders || []) {
    const c = o.customer || {};
    const total = Number(o.total || 0);
    const key = c.customerId;
    if (key) {
      const cur = byCustomerId.get(key) || { count: 0, spent: 0, lastAt: 0 };
      cur.count += 1;
      if (o.status === "paid") cur.spent += total;
      cur.lastAt = Math.max(cur.lastAt, o.createdAt || 0);
      byCustomerId.set(key, cur);
    } else if (typeof c.email === "string") {
      const e = c.email.toLowerCase();
      const cur = byEmail.get(e) || { count: 0, spent: 0, lastAt: 0 };
      cur.count += 1;
      if (o.status === "paid") cur.spent += total;
      cur.lastAt = Math.max(cur.lastAt, o.createdAt || 0);
      byEmail.set(e, cur);
    }
  }
  return (customers || [])
    .map((c) => {
      const stats =
        byCustomerId.get(c._id) ||
        byEmail.get(String(c.email || "").toLowerCase()) ||
        { count: 0, spent: 0, lastAt: 0 };
      return {
        id: c._id,
        googleId: c.googleId,
        email: c.email,
        name: c.name,
        firstName: c.firstName,
        lastName: c.lastName,
        picture: c.picture,
        phone: c.phone,
        marketingOptIn: c.marketingOptIn !== false,
        emailVerified: !!c.emailVerified,
        lastLoginAt: c.lastLoginAt || 0,
        createdAt: c.createdAt || c._creationTime || 0,
        orderCount: stats.count,
        totalSpent: stats.spent,
        lastOrderAt: stats.lastAt,
      };
    })
    .sort((a, b) => (b.lastLoginAt || b.createdAt) - (a.lastLoginAt || a.createdAt));
}

export async function getUserByUsername(username) {
  await ensureBootstrapAdmin();
  return await convex().query(api.users.getByUsername, { username: String(username) });
}

export async function getUserById(id) {
  if (!id) return null;
  try {
    return await convex().query(api.users.getRaw, { id });
  } catch {
    return null;
  }
}

export async function getPublicUser(id) {
  return publicUser(await getUserById(id));
}

export async function createUser(data, actor) {
  await ensureBootstrapAdmin();
  const username = String(data.username || "").trim();
  if (!username) return { error: "Username required" };
  const existing = await getUserByUsername(username);
  if (existing) return { error: "Username already exists" };
  const password = String(data.password || "");
  if (password.length < 6) return { error: "Password must be at least 6 characters" };
  const { salt, hash } = hashPassword(password);
  try {
    const created = await convex().mutation(api.users.create, {
      username,
      name: data.name || username,
      email: data.email || "",
      role: data.role === "admin" ? "admin" : "staff",
      active: data.active !== false,
      passwordHash: hash,
      salt,
    });
    logActivity({ actor: actor?.username || "system", action: "user.create", target: created.username, meta: { role: created.role } });
    return { user: { ...created, id: created._id } };
  } catch (e) {
    return { error: e?.message || "Failed to create user" };
  }
}

export async function updateUser(id, data, actor) {
  const user = await getUserById(id);
  if (!user) return { error: "User not found" };
  const patch = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.email !== undefined) patch.email = data.email;
  if (data.role !== undefined && (data.role === "admin" || data.role === "staff")) patch.role = data.role;
  if (data.active !== undefined) patch.active = Boolean(data.active);
  const updated = await convex().mutation(api.users.update, { id, ...patch });
  logActivity({ actor: actor?.username || "system", action: "user.update", target: user.username, meta: { fields: Object.keys(data) } });
  return { user: updated ? { ...updated, id: updated._id } : null };
}

export async function setUserPassword(id, password, actor) {
  const user = await getUserById(id);
  if (!user) return { error: "User not found" };
  if (String(password).length < 6) return { error: "Password must be at least 6 characters" };
  const { salt, hash } = hashPassword(password);
  await convex().mutation(api.users.setPassword, { id, passwordHash: hash, salt });
  logActivity({ actor: actor?.username || "system", action: "user.password", target: user.username });
  return { ok: true };
}

export async function deleteUser(id, actor) {
  const user = await getUserById(id);
  if (!user) return { error: "User not found" };
  if (user.bootstrap) return { error: "Cannot delete bootstrap admin" };
  await convex().mutation(api.users.remove, { id });
  logActivity({ actor: actor?.username || "system", action: "user.delete", target: user.username });
  return { ok: true };
}

// ---------- Activity log ----------
export function logActivity({ actor, action, target, meta }) {
  // Fire-and-forget — write to Convex
  try {
    convex().mutation(api.activities.log, {
      actor: actor || "system",
      action,
      target: target || undefined,
      meta: meta || undefined,
    }).catch(() => {});
  } catch { /* ignore */ }
  return { actor, action, target, meta, createdAt: new Date().toISOString() };
}

export async function listActivities({ actor, limit = 200 } = {}) {
  const items = await convex().query(api.activities.list, { actor, limit });
  return (items || []).map((a) => ({ ...a, id: a._id }));
}

// ---------- Messages ----------
export async function sendMessage({ fromId, toId, body }) {
  if (!fromId || !toId) return { error: "Invalid sender or recipient" };
  if (!body || !String(body).trim()) return { error: "Message is empty" };
  try {
    const msg = await convex().mutation(api.messages.send, {
      fromId,
      toId,
      body: String(body),
    });
    return { message: msg ? { ...msg, id: msg._id } : null };
  } catch (e) {
    return { error: e?.message || "Failed to send" };
  }
}

export async function listThread(userIdA, userIdB) {
  if (!userIdA || !userIdB) return [];
  const items = await convex().query(api.messages.thread, { userId: userIdA, partnerId: userIdB });
  return (items || []).map((m) => ({ ...m, id: m._id }));
}

export async function listThreadsForUser(userId) {
  if (!userId) return [];
  const items = await convex().query(api.messages.threadsForUser, { userId });
  return (items || []).map((t) => ({
    user: t.user ? { ...t.user, id: t.user._id } : null,
    lastMessage: t.lastMessage ? { ...t.lastMessage, id: t.lastMessage._id } : null,
    unread: t.unread,
  }));
}

export async function markThreadRead(userId, partnerId) {
  if (!userId || !partnerId) return;
  try { await convex().mutation(api.messages.markThreadRead, { userId, partnerId }); } catch { /* ignore */ }
}

export async function unreadCountForUser(userId) {
  if (!userId) return 0;
  return await convex().query(api.messages.unreadCount, { userId });
}
