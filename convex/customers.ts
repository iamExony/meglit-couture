import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("customers").collect();
    return items.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const get = query({
  args: { id: v.id("customers") },
  handler: async (ctx, { id }) => await ctx.db.get(id),
});

export const getByGoogleId = query({
  args: { googleId: v.string() },
  handler: async (ctx, { googleId }) =>
    await ctx.db
      .query("customers")
      .withIndex("by_googleId", (q) => q.eq("googleId", googleId))
      .first(),
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) =>
    await ctx.db
      .query("customers")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase()))
      .first(),
});

// Idempotent: insert on first sign-in, otherwise refresh profile fields.
export const upsertFromGoogle = mutation({
  args: {
    googleId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    picture: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, a) => {
    const email = a.email.toLowerCase();
    const existing = await ctx.db
      .query("customers")
      .withIndex("by_googleId", (q) => q.eq("googleId", a.googleId))
      .first();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        email,
        name: a.name ?? existing.name,
        firstName: a.firstName ?? existing.firstName,
        lastName: a.lastName ?? existing.lastName,
        picture: a.picture ?? existing.picture,
        emailVerified: a.emailVerified ?? existing.emailVerified,
        lastLoginAt: now,
      });
      return await ctx.db.get(existing._id);
    }
    const id = await ctx.db.insert("customers", {
      googleId: a.googleId,
      email,
      name: a.name,
      firstName: a.firstName,
      lastName: a.lastName,
      picture: a.picture,
      emailVerified: a.emailVerified ?? false,
      marketingOptIn: true,
      lastLoginAt: now,
      createdAt: now,
    });
    return await ctx.db.get(id);
  },
});

export const updateProfile = mutation({
  args: {
    id: v.id("customers"),
    patch: v.object({
      name: v.optional(v.string()),
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      phone: v.optional(v.string()),
      marketingOptIn: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { id, patch }) => {
    await ctx.db.patch(id, patch);
    return await ctx.db.get(id);
  },
});
