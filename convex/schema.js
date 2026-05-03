import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
export default defineSchema({
    products: defineTable({
        legacyId: v.optional(v.number()),
        name: v.string(),
        slug: v.string(),
        price: v.number(),
        originalPrice: v.optional(v.number()),
        cost: v.optional(v.number()),
        category: v.string(),
        subcategory: v.optional(v.string()),
        description: v.optional(v.string()),
        details: v.array(v.string()),
        sizes: v.array(v.string()),
        sizeMeasurements: v.optional(v.any()), // { S: { Wst: "26", Hps: "36", ... }, ... }
        colors: v.array(v.any()), // string or { name, hex }
        images: v.array(v.string()),
        rating: v.optional(v.number()),
        reviews: v.optional(v.number()),
        stock: v.number(),
        inStock: v.boolean(),
        isNewArrival: v.optional(v.boolean()),
        isBestseller: v.optional(v.boolean()),
        isOnSale: v.optional(v.boolean()),
        featured: v.optional(v.boolean()),
        newArrival: v.optional(v.boolean()),
        badge: v.optional(v.string()),
        createdAt: v.number(),
    }).index("by_slug", ["slug"]),
    orders: defineTable({
        legacyId: v.optional(v.string()), // e.g. "ORD-1234567890"
        reference: v.optional(v.string()), // payment reference
        customer: v.any(),
        items: v.array(v.any()),
        subtotal: v.optional(v.number()),
        shipping: v.optional(v.number()),
        total: v.number(),
        paymentReference: v.optional(v.string()),
        paymentStatus: v.optional(v.string()),
        status: v.string(),
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
        receiptSentAt: v.optional(v.number()),
    })
        .index("by_status", ["status"])
        .index("by_reference", ["reference"])
        .index("by_legacyId", ["legacyId"]),
    purchases: defineTable({
        productId: v.optional(v.union(v.number(), v.string())),
        productName: v.string(),
        quantity: v.number(),
        unitCost: v.number(),
        total: v.number(),
        supplier: v.optional(v.string()),
        note: v.optional(v.string()),
        createdAt: v.number(),
    }),
    users: defineTable({
        username: v.string(),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        role: v.string(), // "admin" | "staff"
        active: v.boolean(),
        bootstrap: v.optional(v.boolean()),
        passwordHash: v.string(),
        salt: v.string(),
        createdAt: v.number(),
    }).index("by_username", ["username"]),
    activities: defineTable({
        actor: v.string(),
        action: v.string(),
        target: v.optional(v.string()),
        meta: v.optional(v.any()),
        createdAt: v.number(),
    }).index("by_actor", ["actor"]),
    messages: defineTable({
        fromId: v.id("users"),
        toId: v.id("users"),
        body: v.string(),
        createdAt: v.number(),
        readBy: v.array(v.id("users")),
    })
        .index("by_from", ["fromId"])
        .index("by_to", ["toId"]),
    categories: defineTable({
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        subcategories: v.array(v.string()),
        createdAt: v.number(),
    }).index("by_slug", ["slug"]),
    // Storefront customers (separate from admin/staff `users` table). Created on
    // first Google sign-in.
    customers: defineTable({
        googleId: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        picture: v.optional(v.string()),
        emailVerified: v.optional(v.boolean()),
        phone: v.optional(v.string()),
        marketingOptIn: v.optional(v.boolean()),
        lastLoginAt: v.optional(v.number()),
        createdAt: v.number(),
    })
        .index("by_googleId", ["googleId"])
        .index("by_email", ["email"]),
    // One row per signed-in customer holding their cart. Cart items mirror the
    // shape used by CartContext on the client.
    carts: defineTable({
        customerId: v.string(),
        items: v.array(v.any()),
        updatedAt: v.number(),
    }).index("by_customerId", ["customerId"]),
    // One row per (customer, product) pair.
    favorites: defineTable({
        customerId: v.string(),
        productId: v.string(),
        createdAt: v.number(),
    })
        .index("by_customerId", ["customerId"])
        .index("by_customer_product", ["customerId", "productId"]),
    // Newsletter subscribers (no auth required to subscribe).
    subscribers: defineTable({
        email: v.string(),
        name: v.optional(v.string()),
        source: v.optional(v.string()), // e.g. "footer", "newsletter-section", "checkout"
        active: v.boolean(),
        subscribedAt: v.number(),
        unsubscribedAt: v.optional(v.number()),
    }).index("by_email", ["email"]),
    // Inbound contact-us messages (also emailed to info@).
    contactMessages: defineTable({
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        subject: v.optional(v.string()),
        message: v.string(),
        handled: v.optional(v.boolean()),
        createdAt: v.number(),
    }).index("by_handled", ["handled"]),
});
