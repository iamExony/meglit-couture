import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function slugify(s: string) {
  return String(s || "").toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const cats = await ctx.db.query("categories").collect();
    return cats.sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    subcategories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, a) => {
    const slug = slugify(a.slug || a.name);
    if (!slug) throw new Error("Invalid name");
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (existing) throw new Error("Category already exists");
    const subs = Array.from(new Set((a.subcategories || []).map((s) => String(s).trim()).filter(Boolean)));
    const id = await ctx.db.insert("categories", {
      name: a.name.trim(),
      slug,
      description: a.description || "",
      subcategories: subs,
      createdAt: Date.now(),
    });
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    subcategories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, a) => {
    const existing = await ctx.db.get(a.id);
    if (!existing) return null;
    const patch: any = {};
    if (a.name !== undefined) patch.name = a.name.trim();
    if (a.description !== undefined) patch.description = a.description;
    if (a.subcategories !== undefined) {
      patch.subcategories = Array.from(new Set(a.subcategories.map((s) => String(s).trim()).filter(Boolean)));
    }
    await ctx.db.patch(a.id, patch);
    return await ctx.db.get(a.id);
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return true;
  },
});
