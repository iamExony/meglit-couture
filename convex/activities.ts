import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { actor: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, { actor, limit }) => {
    let docs;
    if (actor) {
      docs = await ctx.db.query("activities").withIndex("by_actor", (q) => q.eq("actor", actor)).collect();
    } else {
      docs = await ctx.db.query("activities").collect();
    }
    docs.sort((a, b) => b.createdAt - a.createdAt);
    return docs.slice(0, limit ?? 200);
  },
});

export const log = mutation({
  args: {
    actor: v.string(),
    action: v.string(),
    target: v.optional(v.string()),
    meta: v.optional(v.any()),
  },
  handler: async (ctx, a) => {
    await ctx.db.insert("activities", {
      actor: a.actor,
      action: a.action,
      target: a.target,
      meta: a.meta,
      createdAt: Date.now(),
    });
  },
});
