import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
export const list = query({
    args: { activeOnly: v.optional(v.boolean()) },
    handler: async (ctx, { activeOnly }) => {
        const all = await ctx.db.query("subscribers").collect();
        const filtered = activeOnly ? all.filter((s) => s.active) : all;
        return filtered.sort((a, b) => b.subscribedAt - a.subscribedAt);
    },
});
export const subscribe = mutation({
    args: {
        email: v.string(),
        name: v.optional(v.string()),
        source: v.optional(v.string()),
    },
    handler: async (ctx, { email, name, source }) => {
        const normalized = email.trim().toLowerCase();
        if (!normalized)
            return { ok: false, error: "Email required" };
        const existing = await ctx.db
            .query("subscribers")
            .withIndex("by_email", (q) => q.eq("email", normalized))
            .unique();
        if (existing) {
            if (!existing.active) {
                await ctx.db.patch(existing._id, {
                    active: true,
                    subscribedAt: Date.now(),
                    unsubscribedAt: undefined,
                    name: name || existing.name,
                    source: source || existing.source,
                });
                return { ok: true, reactivated: true };
            }
            return { ok: true, alreadySubscribed: true };
        }
        await ctx.db.insert("subscribers", {
            email: normalized,
            name,
            source,
            active: true,
            subscribedAt: Date.now(),
        });
        return { ok: true, created: true };
    },
});
export const unsubscribe = mutation({
    args: { email: v.string() },
    handler: async (ctx, { email }) => {
        const normalized = email.trim().toLowerCase();
        const existing = await ctx.db
            .query("subscribers")
            .withIndex("by_email", (q) => q.eq("email", normalized))
            .unique();
        if (!existing)
            return { ok: true };
        await ctx.db.patch(existing._id, { active: false, unsubscribedAt: Date.now() });
        return { ok: true };
    },
});
