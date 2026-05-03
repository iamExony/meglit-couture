import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    return orders.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const listByCustomer = query({
  args: { customerId: v.optional(v.string()), email: v.optional(v.string()) },
  handler: async (ctx, { customerId, email }) => {
    const all = await ctx.db.query("orders").collect();
    // Build a set of emails to match against (case-insensitive).
    const emails = new Set<string>();
    if (email) emails.add(email.toLowerCase());
    if (customerId) {
      try {
        const cust: any = await ctx.db.get(customerId as any);
        if (cust?.email) emails.add(String(cust.email).toLowerCase());
      } catch {
        // ignore: customerId may not be a valid doc id
      }
    }
    const filtered = all.filter((o: any) => {
      const c = o.customer || {};
      if (customerId && c.customerId === customerId) return true;
      if (emails.size > 0 && typeof c.email === "string" && emails.has(c.email.toLowerCase())) return true;
      return false;
    });
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => await ctx.db.get(id),
});

async function resolveByKey(ctx: any, key: string) {
  let o = await ctx.db
    .query("orders")
    .withIndex("by_legacyId", (q: any) => q.eq("legacyId", key))
    .first();
  if (o) return o;
  o = await ctx.db
    .query("orders")
    .withIndex("by_reference", (q: any) => q.eq("reference", key))
    .first();
  if (o) return o;
  try {
    return await ctx.db.get(key as any);
  } catch {
    return null;
  }
}

export const findByKey = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => await resolveByKey(ctx, key),
});

export const create = mutation({
  args: {
    legacyId: v.optional(v.string()),
    reference: v.optional(v.string()),
    customer: v.any(),
    items: v.array(v.any()),
    subtotal: v.optional(v.number()),
    shipping: v.optional(v.number()),
    total: v.number(),
    paymentReference: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const id = await ctx.db.insert("orders", {
      legacyId: a.legacyId,
      reference: a.reference,
      customer: a.customer,
      items: a.items,
      subtotal: a.subtotal,
      shipping: a.shipping,
      total: a.total,
      paymentReference: a.paymentReference ?? a.reference,
      paymentStatus: a.paymentStatus ?? "pending",
      status: a.status ?? "pending",
      createdAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const updateStatus = mutation({
  args: { key: v.string(), status: v.string() },
  handler: async (ctx, { key, status }) => {
    const o: any = await resolveByKey(ctx, key);
    if (!o) return null;
    await ctx.db.patch(o._id, { status, updatedAt: Date.now() });
    return await ctx.db.get(o._id);
  },
});

// Atomically claims the right to send the receipt. Returns true the first time,
// false on subsequent calls — used to prevent duplicate emails when both the
// verify endpoint and webhook fire for the same payment.
export const claimReceipt = mutation({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const o: any = await resolveByKey(ctx, key);
    if (!o) return { ok: false, reason: "not_found" };
    if (o.receiptSentAt) return { ok: false, reason: "already_sent" };
    await ctx.db.patch(o._id, { receiptSentAt: Date.now() });
    return { ok: true };
  },
});
