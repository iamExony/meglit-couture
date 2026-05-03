import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function publicUser(u: any) {
  if (!u) return null;
  const { passwordHash, salt, ...rest } = u;
  return rest;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map(publicUser);
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    return await ctx.db.query("users").withIndex("by_username", (q) => q.eq("username", username)).first();
  },
});

export const get = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => publicUser(await ctx.db.get(id)),
});

export const getRaw = query({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => await ctx.db.get(id),
});

export const create = mutation({
  args: {
    username: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.string()),
    active: v.optional(v.boolean()),
    bootstrap: v.optional(v.boolean()),
    passwordHash: v.string(),
    salt: v.string(),
  },
  handler: async (ctx, a) => {
    const existing = await ctx.db.query("users").withIndex("by_username", (q) => q.eq("username", a.username)).first();
    if (existing) throw new Error("Username already exists");
    const id = await ctx.db.insert("users", {
      username: a.username,
      name: a.name ?? a.username,
      email: a.email ?? "",
      role: a.role === "admin" ? "admin" : "staff",
      active: a.active ?? true,
      bootstrap: a.bootstrap,
      passwordHash: a.passwordHash,
      salt: a.salt,
      createdAt: Date.now(),
    });
    return publicUser(await ctx.db.get(id));
  },
});

export const update = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.string()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const u = await ctx.db.get(id);
    if (!u) return null;
    const clean: any = {};
    if (patch.name !== undefined) clean.name = patch.name;
    if (patch.email !== undefined) clean.email = patch.email;
    if (patch.role !== undefined) clean.role = patch.role === "admin" ? "admin" : "staff";
    if (patch.active !== undefined) clean.active = patch.active;
    await ctx.db.patch(id, clean);
    return publicUser(await ctx.db.get(id));
  },
});

export const setPassword = mutation({
  args: { id: v.id("users"), passwordHash: v.string(), salt: v.string() },
  handler: async (ctx, { id, passwordHash, salt }) => {
    await ctx.db.patch(id, { passwordHash, salt });
    return true;
  },
});

export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return true;
  },
});
