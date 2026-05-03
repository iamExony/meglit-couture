import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
export const list = query({
    args: { customerId: v.string() },
    handler: async (ctx, { customerId }) => {
        return await ctx.db
            .query("favorites")
            .withIndex("by_customerId", (q) => q.eq("customerId", customerId))
            .collect();
    },
});
export const add = mutation({
    args: { customerId: v.string(), productId: v.string() },
    handler: async (ctx, { customerId, productId }) => {
        const existing = await ctx.db
            .query("favorites")
            .withIndex("by_customer_product", (q) => q.eq("customerId", customerId).eq("productId", productId))
            .unique();
        if (existing)
            return existing._id;
        return await ctx.db.insert("favorites", {
            customerId,
            productId,
            createdAt: Date.now(),
        });
    },
});
export const remove = mutation({
    args: { customerId: v.string(), productId: v.string() },
    handler: async (ctx, { customerId, productId }) => {
        const existing = await ctx.db
            .query("favorites")
            .withIndex("by_customer_product", (q) => q.eq("customerId", customerId).eq("productId", productId))
            .unique();
        if (existing)
            await ctx.db.delete(existing._id);
        return { ok: true };
    },
});
export const toggle = mutation({
    args: { customerId: v.string(), productId: v.string() },
    handler: async (ctx, { customerId, productId }) => {
        const existing = await ctx.db
            .query("favorites")
            .withIndex("by_customer_product", (q) => q.eq("customerId", customerId).eq("productId", productId))
            .unique();
        if (existing) {
            await ctx.db.delete(existing._id);
            return { favorited: false };
        }
        await ctx.db.insert("favorites", {
            customerId,
            productId,
            createdAt: Date.now(),
        });
        return { favorited: true };
    },
});
