import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Resolve a stored image (full URL or Convex storage ID) to a usable URL.
async function resolveImage(ctx: any, img: string): Promise<string> {
  if (!img) return img;
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("/")) {
    return img;
  }
  try {
    const url = await ctx.storage.getUrl(img);
    return url || img;
  } catch {
    return img;
  }
}

async function withResolvedImages(ctx: any, product: any) {
  if (!product) return product;
  const images = await Promise.all((product.images || []).map((i: string) => resolveImage(ctx, i)));
  return { ...product, images };
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db.query("products").collect();
    return await Promise.all(products.map((p) => withResolvedImages(ctx, p)));
  },
});

export const get = query({
  args: { id: v.optional(v.id("products")), slug: v.optional(v.string()), legacyId: v.optional(v.number()) },
  handler: async (ctx, args) => {
    let prod: any = null;
    if (args.id) prod = await ctx.db.get(args.id);
    else if (args.slug) {
      prod = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", args.slug!)).first();
    } else if (args.legacyId !== undefined) {
      prod = await ctx.db.query("products").filter((q) => q.eq(q.field("legacyId"), args.legacyId)).first();
    }
    return await withResolvedImages(ctx, prod);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    cost: v.optional(v.number()),
    category: v.optional(v.string()),
    subcategory: v.optional(v.string()),
    description: v.optional(v.string()),
    details: v.optional(v.array(v.string())),
    sizes: v.optional(v.array(v.string())),
    sizeMeasurements: v.optional(v.any()),
    colors: v.optional(v.array(v.any())),
    images: v.optional(v.array(v.string())),
    rating: v.optional(v.number()),
    reviews: v.optional(v.number()),
    stock: v.optional(v.number()),
    isNewArrival: v.optional(v.boolean()),
    isBestseller: v.optional(v.boolean()),
    isOnSale: v.optional(v.boolean()),
    featured: v.optional(v.boolean()),
    newArrival: v.optional(v.boolean()),
    badge: v.optional(v.string()),
    legacyId: v.optional(v.number()),
    vendorId: v.optional(v.id("vendors")),
    vendorStatus: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, a) => {
    const slug = (a.slug || a.name).toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const stock = a.stock ?? 0;
    const id = await ctx.db.insert("products", {
      name: a.name,
      slug,
      price: a.price,
      originalPrice: a.originalPrice ?? a.price,
      cost: a.cost ?? 0,
      category: a.category ?? "uncategorized",
      subcategory: a.subcategory ?? "",
      description: a.description ?? "",
      details: a.details ?? [],
      sizes: a.sizes ?? [],
      sizeMeasurements: a.sizeMeasurements ?? undefined,
      colors: a.colors ?? [],
      images: a.images ?? [],
      rating: a.rating ?? 0,
      reviews: a.reviews ?? 0,
      stock,
      inStock: stock > 0,
      isNewArrival: a.isNewArrival,
      isBestseller: a.isBestseller,
      isOnSale: a.isOnSale,
      featured: a.featured,
      newArrival: a.newArrival,
      badge: a.badge,
      legacyId: a.legacyId,
      vendorId: a.vendorId,
      vendorStatus: a.vendorStatus,
      tags: a.tags ?? [],
      createdAt: Date.now(),
    });
    return await withResolvedImages(ctx, await ctx.db.get(id));
  },
});

export const update = mutation({
  args: { id: v.id("products"), patch: v.any() },
  handler: async (ctx, { id, patch }) => {
    const existing = await ctx.db.get(id);
    if (!existing) return null;
    const merged: any = { ...patch };
    if (merged.stock !== undefined) merged.inStock = merged.stock > 0;
    await ctx.db.patch(id, merged);
    return await withResolvedImages(ctx, await ctx.db.get(id));
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    const prod: any = await ctx.db.get(id);
    if (prod && Array.isArray(prod.images)) {
      for (const img of prod.images) {
        if (img && !img.startsWith("http") && !img.startsWith("/")) {
          try { await ctx.storage.delete(img); } catch { /* ignore */ }
        }
      }
    }
    await ctx.db.delete(id);
    return true;
  },
});

export const decrementStock = mutation({
  args: { items: v.array(v.object({ productId: v.optional(v.union(v.number(), v.string())), quantity: v.number() })) },
  handler: async (ctx, { items }) => {
    for (const item of items) {
      if (item.productId === undefined || item.productId === null) continue;
      let prod: any = null;
      if (typeof item.productId === "number") {
        prod = await ctx.db.query("products").filter((q) => q.eq(q.field("legacyId"), item.productId)).first();
      } else {
        try { prod = await ctx.db.get(item.productId as any); } catch { /* ignore */ }
      }
      if (!prod) continue;
      const newStock = Math.max(0, (prod.stock || 0) - item.quantity);
      await ctx.db.patch(prod._id, { stock: newStock, inStock: newStock > 0 });
    }
  },
});

// Returns the live stock for the requested items so the order route can
// reject overselling before persisting an order.
export const checkStock = query({
  args: { items: v.array(v.object({ productId: v.optional(v.union(v.number(), v.string())), quantity: v.number() })) },
  handler: async (ctx, { items }) => {
    const results: { productId: any; name: string | null; available: number; requested: number; ok: boolean }[] = [];
    for (const item of items) {
      if (item.productId === undefined || item.productId === null) {
        results.push({ productId: item.productId, name: null, available: 0, requested: item.quantity, ok: false });
        continue;
      }
      let prod: any = null;
      if (typeof item.productId === "number") {
        prod = await ctx.db.query("products").filter((q) => q.eq(q.field("legacyId"), item.productId)).first();
      } else {
        try { prod = await ctx.db.get(item.productId as any); } catch { /* ignore */ }
      }
      const available = Number(prod?.stock || 0);
      results.push({
        productId: item.productId,
        name: prod?.name ?? null,
        available,
        requested: item.quantity,
        ok: !!prod && available >= item.quantity,
      });
    }
    return results;
  },
});

export const seedIfEmpty = mutation({
  args: { products: v.array(v.any()) },
  handler: async (ctx, { products }) => {
    const existing = await ctx.db.query("products").take(1);
    if (existing.length > 0) return { seeded: 0 };
    let count = 0;
    for (const p of products) {
      const stock = p.stock ?? (p.inStock ? 25 : 0);
      await ctx.db.insert("products", {
        legacyId: p.id,
        name: p.name,
        slug: p.slug || String(p.name).toLowerCase().replace(/\s+/g, "-"),
        price: p.price,
        originalPrice: p.originalPrice ?? p.price,
        cost: p.cost ?? Math.round(p.price * 0.55),
        category: p.category ?? "uncategorized",
        subcategory: p.subcategory ?? "",
        description: p.description ?? "",
        details: p.details ?? [],
        sizes: p.sizes ?? [],
        sizeMeasurements: p.sizeMeasurements ?? undefined,
        colors: p.colors ?? [],
        images: p.images ?? [],
        rating: p.rating ?? 0,
        reviews: p.reviews ?? 0,
        stock,
        inStock: stock > 0,
        isNewArrival: p.isNewArrival ?? p.newArrival,
        isBestseller: p.isBestseller,
        isOnSale: p.isOnSale,
        featured: p.featured,
        newArrival: p.newArrival,
        badge: p.badge,
        createdAt: Date.now(),
      });
      count++;
    }
    return { seeded: count };
  },
});

export const listByVendorStatus = query({
  args: { vendorStatus: v.string() },
  handler: async (ctx, { vendorStatus }) => {
    const products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("vendorStatus"), vendorStatus))
      .collect();
    return await Promise.all(products.map((p) => withResolvedImages(ctx, p)));
  },
});

export const countByVendorStatus = query({
  args: { vendorStatus: v.string() },
  handler: async (ctx, { vendorStatus }) => {
    const products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("vendorStatus"), vendorStatus))
      .collect();
    return products.length;
  },
});

export const setVendorStatus = mutation({
  args: { id: v.id("products"), vendorStatus: v.string() },
  handler: async (ctx, { id, vendorStatus }) => {
    await ctx.db.patch(id, { vendorStatus });
  },
});

// Client uploads file directly to this URL, then we save the returned storageId on the product.
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
