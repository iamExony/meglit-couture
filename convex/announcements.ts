import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("announcements").order("desc").collect();
  },
});

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("announcements")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .first();
  },
});

export const create = mutation({
  args: {
    message: v.string(),
    code: v.optional(v.string()),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("announcements", {
      message: args.message,
      code: args.code,
      type: args.type,
      isPublished: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("announcements"),
    message: v.optional(v.string()),
    code: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Not found");
    const clean: any = { updatedAt: Date.now() };
    if (patch.message !== undefined) clean.message = patch.message;
    if (patch.type !== undefined) clean.type = patch.type;
    if ("code" in patch) clean.code = patch.code;
    await ctx.db.patch(id, clean);
    return await ctx.db.get(id);
  },
});

export const togglePublish = mutation({
  args: { id: v.id("announcements") },
  handler: async (ctx, { id }) => {
    const ann = await ctx.db.get(id);
    if (!ann) throw new Error("Not found");
    if (!ann.isPublished) {
      const others = await ctx.db
        .query("announcements")
        .withIndex("by_published", (q) => q.eq("isPublished", true))
        .collect();
      for (const o of others) {
        await ctx.db.patch(o._id, { isPublished: false, updatedAt: Date.now() });
      }
    }
    await ctx.db.patch(id, { isPublished: !ann.isPublished, updatedAt: Date.now() });
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("announcements") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return true;
  },
});
