import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("purchases").collect();
    return items.sort((a, b) => b.createdAt - a.createdAt);
  },
});

async function adjustStock(ctx: any, productId: any, delta: number) {
  if (productId === undefined || productId === null) return;
  let prod: any = null;
  if (typeof productId === "number") {
    prod = await ctx.db
      .query("products")
      .filter((q: any) => q.eq(q.field("legacyId"), productId))
      .first();
  } else {
    try { prod = await ctx.db.get(productId); } catch { /* ignore */ }
  }
  if (prod) {
    const newStock = Math.max(0, (prod.stock || 0) + delta);
    await ctx.db.patch(prod._id, { stock: newStock, inStock: newStock > 0 });
  }
}

export const create = mutation({
  args: {
    productId: v.optional(v.union(v.number(), v.string())),
    productName: v.string(),
    quantity: v.number(),
    unitCost: v.number(),
    supplier: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, a) => {
    const total = a.quantity * a.unitCost;
    const id = await ctx.db.insert("purchases", {
      productId: a.productId,
      productName: a.productName,
      quantity: a.quantity,
      unitCost: a.unitCost,
      total,
      supplier: a.supplier,
      note: a.note,
      createdAt: Date.now(),
    });
    await adjustStock(ctx, a.productId, a.quantity);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("purchases") },
  handler: async (ctx, { id }) => {
    const p: any = await ctx.db.get(id);
    if (!p) return false;
    // reverse stock
    await adjustStock(ctx, p.productId, -p.quantity);
    await ctx.db.delete(id);
    return true;
  },
});
