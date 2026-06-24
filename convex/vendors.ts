import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    if (status) {
      return await ctx.db
        .query("vendors")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
    }
    return await ctx.db.query("vendors").collect();
  },
});

export const get = query({
  args: { id: v.id("vendors") },
  handler: async (ctx, { id }) => await ctx.db.get(id),
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) =>
    await ctx.db
      .query("vendors")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first(),
});

export const apply = mutation({
  args: {
    storeName: v.string(),
    contactName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    description: v.optional(v.string()),
    passwordHash: v.string(),
    salt: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("vendors")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
    if (existing) throw new Error("An account with this email already exists.");
    return await ctx.db.insert("vendors", {
      ...args,
      email: args.email.toLowerCase(),
      status: "pending",
      appliedAt: Date.now(),
    });
  },
});

export const approve = mutation({
  args: { id: v.id("vendors"), approvedBy: v.optional(v.string()) },
  handler: async (ctx, { id, approvedBy }) => {
    await ctx.db.patch(id, { status: "active", approvedAt: Date.now() });
  },
});

export const reject = mutation({
  args: { id: v.id("vendors") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "rejected" });
  },
});

export const suspend = mutation({
  args: { id: v.id("vendors") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "suspended" });
  },
});

export const remove = mutation({
  args: { id: v.id("vendors") },
  handler: async (ctx, { id }) => {
    // Disassociate products so they don't have a dangling vendorId
    const products = await ctx.db
      .query("products")
      .withIndex("by_vendor", (q) => q.eq("vendorId", id))
      .collect();
    for (const p of products) {
      await ctx.db.patch(p._id, { vendorId: undefined, vendorStatus: undefined });
    }
    await ctx.db.delete(id);
  },
});

export const updatePassword = mutation({
  args: {
    id: v.id("vendors"),
    passwordHash: v.string(),
    salt: v.string(),
  },
  handler: async (ctx, { id, passwordHash, salt }) => {
    await ctx.db.patch(id, { passwordHash, salt });
  },
});

export const updateBankDetails = mutation({
  args: {
    id: v.id("vendors"),
    bankName: v.string(),
    bankCode: v.string(),
    accountNumber: v.string(),
    accountName: v.string(),
    paystackRecipientCode: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...details }) => {
    await ctx.db.patch(id, details);
  },
});

export const updateEarnings = mutation({
  args: {
    id: v.id("vendors"),
    addPending: v.optional(v.number()),
    addPaidOut: v.optional(v.number()),
    subtractPending: v.optional(v.number()),
  },
  handler: async (ctx, { id, addPending, addPaidOut, subtractPending }) => {
    const vendor = await ctx.db.get(id);
    if (!vendor) return;
    const patch: any = {};
    if (addPending) {
      patch.pendingPayout = (vendor.pendingPayout || 0) + addPending;
      patch.totalEarnings = (vendor.totalEarnings || 0) + addPending;
    }
    if (subtractPending) {
      patch.pendingPayout = Math.max(0, (vendor.pendingPayout || 0) - subtractPending);
    }
    if (addPaidOut) {
      patch.totalPaidOut = (vendor.totalPaidOut || 0) + addPaidOut;
    }
    await ctx.db.patch(id, patch);
  },
});

// Vendor payouts
export const listPayouts = query({
  args: { vendorId: v.optional(v.id("vendors")) },
  handler: async (ctx, { vendorId }) => {
    if (vendorId) {
      return await ctx.db
        .query("vendorPayouts")
        .withIndex("by_vendor", (q) => q.eq("vendorId", vendorId))
        .collect();
    }
    return await ctx.db.query("vendorPayouts").collect();
  },
});

export const createPayout = mutation({
  args: {
    vendorId: v.id("vendors"),
    orderId: v.id("orders"),
    orderReference: v.optional(v.string()),
    saleAmount: v.number(),
    commissionRate: v.number(),
    commissionAmount: v.number(),
    vendorAmount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("vendorPayouts", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const markPayoutPaid = mutation({
  args: {
    id: v.id("vendorPayouts"),
    paystackTransferCode: v.optional(v.string()),
    paystackTransferRef: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, { ...fields, status: "paid", paidAt: Date.now() });
  },
});

export const markPayoutFailed = mutation({
  args: { id: v.id("vendorPayouts") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "failed" });
  },
});

async function resolveProductImages(ctx: any, product: any) {
  if (!product) return product;
  const images = await Promise.all(
    (product.images || []).map(async (img: string) => {
      if (!img) return img;
      if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/")) return img;
      try { return (await ctx.storage.getUrl(img)) || img; } catch { return img; }
    })
  );
  return { ...product, images };
}

// Products belonging to a vendor
export const listProducts = query({
  args: { vendorId: v.id("vendors") },
  handler: async (ctx, { vendorId }) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_vendor", (q) => q.eq("vendorId", vendorId))
      .collect();
    return await Promise.all(products.map((p: any) => resolveProductImages(ctx, p)));
  },
});
