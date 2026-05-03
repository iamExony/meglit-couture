import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
export const list = query({
    args: {},
    handler: async (ctx) => {
        const all = await ctx.db.query("contactMessages").collect();
        return all.sort((a, b) => b.createdAt - a.createdAt);
    },
});
export const create = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        subject: v.optional(v.string()),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("contactMessages", {
            ...args,
            handled: false,
            createdAt: Date.now(),
        });
    },
});
export const setHandled = mutation({
    args: { id: v.id("contactMessages"), handled: v.boolean() },
    handler: async (ctx, { id, handled }) => {
        await ctx.db.patch(id, { handled });
        return { ok: true };
    },
});
