import { v } from "convex/values";
import { mutation } from "./_generated/server";
// One-off backfill. Sets featured/newArrival/badge on existing products by slug.
export const backfillFlags = mutation({
    args: {
        items: v.array(v.object({
            slug: v.string(),
            featured: v.optional(v.boolean()),
            newArrival: v.optional(v.boolean()),
            badge: v.optional(v.string()),
        })),
    },
    handler: async (ctx, { items }) => {
        let updated = 0;
        for (const it of items) {
            const prod = await ctx.db
                .query("products")
                .withIndex("by_slug", (q) => q.eq("slug", it.slug))
                .first();
            if (!prod)
                continue;
            const patch = {};
            if (it.featured !== undefined)
                patch.featured = it.featured;
            if (it.newArrival !== undefined) {
                patch.newArrival = it.newArrival;
                patch.isNewArrival = it.newArrival;
            }
            if (it.badge !== undefined)
                patch.badge = it.badge;
            await ctx.db.patch(prod._id, patch);
            updated++;
        }
        return { updated };
    },
});
// Backfill per-size measurements. Items: { slug, sizeMeasurements: { [size]: { Wst, Hps, ... } } }.
export const backfillSizeMeasurements = mutation({
    args: {
        items: v.array(v.object({
            slug: v.string(),
            sizeMeasurements: v.any(),
        })),
    },
    handler: async (ctx, { items }) => {
        let updated = 0;
        for (const it of items) {
            const prod = await ctx.db
                .query("products")
                .withIndex("by_slug", (q) => q.eq("slug", it.slug))
                .first();
            if (!prod)
                continue;
            await ctx.db.patch(prod._id, { sizeMeasurements: it.sizeMeasurements });
            updated++;
        }
        return { updated };
    },
});
