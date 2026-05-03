import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: { customerId: v.string() },
  handler: async (ctx, { customerId }) => {
    const row = await ctx.db
      .query("carts")
      .withIndex("by_customerId", (q) => q.eq("customerId", customerId))
      .unique();
    return row || null;
  },
});

export const set = mutation({
  args: {
    customerId: v.string(),
    items: v.array(v.any()),
  },
  handler: async (ctx, { customerId, items }) => {
    const existing = await ctx.db
      .query("carts")
      .withIndex("by_customerId", (q) => q.eq("customerId", customerId))
      .unique();
    const updatedAt = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { items, updatedAt });
      return existing._id;
    }
    return await ctx.db.insert("carts", { customerId, items, updatedAt });
  },
});

export const clear = mutation({
  args: { customerId: v.string() },
  handler: async (ctx, { customerId }) => {
    const existing = await ctx.db
      .query("carts")
      .withIndex("by_customerId", (q) => q.eq("customerId", customerId))
      .unique();
    if (existing) await ctx.db.patch(existing._id, { items: [], updatedAt: Date.now() });
    return { ok: true };
  },
});
