import { v } from "convex/values";
import { mutation } from "./_generated/server";

// One-off backfill. Sets featured/newArrival/badge on existing products by slug.
export const backfillFlags = mutation({
  args: {
    items: v.array(
      v.object({
        slug: v.string(),
        featured: v.optional(v.boolean()),
        newArrival: v.optional(v.boolean()),
        badge: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, { items }) => {
    let updated = 0;
    for (const it of items) {
      const prod = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", it.slug))
        .first();
      if (!prod) continue;
      const patch: any = {};
      if (it.featured !== undefined) patch.featured = it.featured;
      if (it.newArrival !== undefined) {
        patch.newArrival = it.newArrival;
        patch.isNewArrival = it.newArrival;
      }
      if (it.badge !== undefined) patch.badge = it.badge;
      await ctx.db.patch(prod._id, patch);
      updated++;
    }
    return { updated };
  },
});

// Seed hair product categories and 5 demo hair products.
export const seedHairProducts = mutation({
  args: {},
  handler: async (ctx) => {
    // ── categories ────────────────────────────────────────────────────────────
    const hairCats = [
      { name: "Wigs", slug: "wigs", description: "Lace front, glueless, closure and frontal wigs", subcategories: ["Frontal Wigs", "Closure Wigs", "Glueless Wigs", "Headband Wigs", "Bob Wigs"] },
      { name: "Bundles & Deals", slug: "bundles-deals", description: "Single bundles, 3-bundle deals and bundle packages", subcategories: ["Single Bundles", "3-Bundle Deals", "Bundle + Closure Deals", "Bundle + Frontal Deals"] },
      { name: "Closures & Frontals", slug: "closures-frontals", description: "HD lace closures, frontals and 360 frontals", subcategories: ["Lace Closures", "Lace Frontals", "360 Frontals", "Kim K Closures"] },
      { name: "Clip-ins & Ponytails", slug: "clip-ins-ponytails", description: "Clip-in extensions, drawstring ponytails and tape-ins", subcategories: ["Clip-in Extensions", "Drawstring Ponytails", "Tape-ins"] },
    ];

    let catsAdded = 0;
    for (const c of hairCats) {
      const exists = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", c.slug)).first();
      if (!exists) {
        await ctx.db.insert("categories", { ...c, createdAt: Date.now() });
        catsAdded++;
      }
    }

    // ── products ──────────────────────────────────────────────────────────────
    const PLACEHOLDER = (seed: string) => `https://picsum.photos/seed/${seed}/600/800`;

    const hairProducts = [
      {
        name: "Luxury Vietnamese Bone Straight HD Lace Frontal Wig",
        slug: "vietnamese-bone-straight-hd-lace-frontal-wig",
        price: 85000,
        originalPrice: 110000,
        category: "Wigs",
        subcategory: "Frontal Wigs",
        description: "Premium 100% raw Vietnamese donor hair. 13x4 HD lace frontal wig with pre-plucked hairline and baby hairs. Bone straight texture that maintains its pattern through multiple washes.",
        details: ["100% Raw Vietnamese Hair", "13x4 HD Lace Frontal", "Pre-plucked with baby hairs", "180% Density", "Natural Color (1B)", "Lasts 2–3 years with proper care"],
        sizes: ["16 inches", "18 inches", "20 inches", "22 inches", "24 inches", "26 inches"],
        colors: [{ name: "Natural Black (1B)", hex: "#1a1007" }, { name: "Jet Black (1)", hex: "#0a0a0a" }],
        images: [PLACEHOLDER("hair-wig-1a"), PLACEHOLDER("hair-wig-1b")],
        stock: 12,
        inStock: true,
        featured: true,
        badge: "Best Seller",
        tags: ["Bone Straight", "HD Lace", "13x4 Frontal", "22 inches", "Natural Color (1B)", "Pre-plucked", "180% Density", "Vietnamese Raw", "Wigs", "Frontal Wigs"],
        rating: 4.9,
        reviews: 47,
        createdAt: Date.now(),
      },
      {
        name: "Raw Vietnamese Body Wave 3-Bundle Deal",
        slug: "vietnamese-body-wave-3-bundle-deal",
        price: 120000,
        originalPrice: 155000,
        category: "Bundles & Deals",
        subcategory: "3-Bundle Deals",
        description: "Luxurious raw Vietnamese body wave hair bundles. Sold as a set of 3 bundles. Natural wave pattern that can be straightened and curled repeatedly without losing its shape.",
        details: ["3 Bundles included", "100% Raw Vietnamese Hair", "Double drawn for fullness", "Natural Color (1B)", "Can be bleached and dyed", "Tangle-free and shed-free"],
        sizes: ["18 inches", "20 inches", "22 inches"],
        colors: [{ name: "Natural Black (1B)", hex: "#1a1007" }],
        images: [PLACEHOLDER("hair-bundle-2a"), PLACEHOLDER("hair-bundle-2b")],
        stock: 8,
        inStock: true,
        featured: true,
        badge: "New Arrival",
        tags: ["Body Wave", "Vietnamese Raw", "3-Bundle Deal", "22 inches", "Natural Color (1B)", "Double Drawn", "Bundles & Deals", "100% Raw Hair"],
        rating: 4.8,
        reviews: 23,
        createdAt: Date.now() - 1000,
      },
      {
        name: "HD Lace 5x5 Bone Straight Closure",
        slug: "hd-lace-5x5-bone-straight-closure",
        price: 35000,
        originalPrice: 45000,
        category: "Closures & Frontals",
        subcategory: "Lace Closures",
        description: "Invisible HD lace 5x5 closure with bone straight texture. The HD lace melts seamlessly into any skin tone, giving the most natural-looking part.",
        details: ["5x5 HD Lace Closure", "Bone Straight Texture", "Free Part / Middle Part", "Pre-plucked hairline", "150% Density", "Invisible knots"],
        sizes: ["14 inches", "16 inches", "18 inches", "20 inches"],
        colors: [{ name: "Natural Black (1B)", hex: "#1a1007" }, { name: "Jet Black (1)", hex: "#0a0a0a" }],
        images: [PLACEHOLDER("hair-closure-3a"), PLACEHOLDER("hair-closure-3b")],
        stock: 20,
        inStock: true,
        featured: false,
        newArrival: true,
        isNewArrival: true,
        badge: "New Arrival",
        tags: ["HD Lace", "5x5 Closure", "Bone Straight", "18 inches", "Natural Color (1B)", "Swiss Lace", "Closures & Frontals", "Pre-plucked"],
        rating: 4.7,
        reviews: 15,
        createdAt: Date.now() - 2000,
      },
      {
        name: "Kinky Curly Glueless HD Lace Front Wig",
        slug: "kinky-curly-glueless-hd-lace-wig",
        price: 95000,
        originalPrice: 125000,
        category: "Wigs",
        subcategory: "Glueless Wigs",
        description: "Stunning kinky curly Brazilian luxury hair in a glueless HD lace front wig. Wear it straight from the box — no glue, no gel needed. The adjustable straps and combs keep it secure all day.",
        details: ["Glueless — no glue needed", "13x4 HD Lace Front", "Brazilian Luxury Hair", "180% Density", "Kinky Curly texture", "Adjustable elastic band + combs"],
        sizes: ["16 inches", "18 inches", "20 inches", "22 inches"],
        colors: [{ name: "Natural Black (1B)", hex: "#1a1007" }],
        images: [PLACEHOLDER("hair-curly-4a"), PLACEHOLDER("hair-curly-4b")],
        stock: 6,
        inStock: true,
        featured: true,
        badge: "Limited Edition",
        tags: ["Kinky Curly", "Glueless", "HD Lace", "20 inches", "Natural Color (1B)", "180% Density", "Brazilian Luxury", "Wigs", "Glueless Wigs"],
        rating: 4.8,
        reviews: 31,
        createdAt: Date.now() - 3000,
      },
      {
        name: "Brazilian Body Wave 13x4 Lace Frontal — 24 inch",
        slug: "brazilian-body-wave-13x4-lace-frontal-24inch",
        price: 55000,
        originalPrice: 70000,
        category: "Closures & Frontals",
        subcategory: "Lace Frontals",
        description: "Silky Brazilian luxury body wave 13x4 lace frontal. Perfect for creating a full lace install. Pairs beautifully with body wave bundles for a seamless blend.",
        details: ["13x4 HD Lace Frontal", "Brazilian Luxury Hair", "Body Wave Texture", "Pre-plucked + baby hairs", "Ear to ear coverage", "Can be dyed up to 613"],
        sizes: ["20 inches", "22 inches", "24 inches", "26 inches"],
        colors: [{ name: "Natural Black (1B)", hex: "#1a1007" }, { name: "613 Blonde", hex: "#f5d78e" }],
        images: [PLACEHOLDER("hair-frontal-5a"), PLACEHOLDER("hair-frontal-5b")],
        stock: 14,
        inStock: true,
        featured: false,
        newArrival: true,
        isNewArrival: true,
        badge: "New Arrival",
        tags: ["Body Wave", "13x4 Frontal", "HD Lace", "24 inches", "Natural Color (1B)", "Pre-plucked", "Brazilian Luxury", "Closures & Frontals"],
        rating: 4.6,
        reviews: 19,
        createdAt: Date.now() - 4000,
      },
    ];

    let prodsAdded = 0;
    for (const p of hairProducts) {
      const exists = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", p.slug)).first();
      if (!exists) {
        await ctx.db.insert("products", p as any);
        prodsAdded++;
      }
    }

    return { catsAdded, prodsAdded };
  },
});

// Update images on the 5 seeded hair products with real Pexels photos.
export const updateHairProductImages = mutation({
  args: {},
  handler: async (ctx) => {
    const PX = (id: number) =>
      `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;

    const updates: { slug: string; images: string[] }[] = [
      {
        slug: "vietnamese-bone-straight-hd-lace-frontal-wig",
        images: [PX(17320163), PX(17320162)],
      },
      {
        slug: "vietnamese-body-wave-3-bundle-deal",
        images: [PX(14730877), PX(29824659)],
      },
      {
        slug: "hd-lace-5x5-bone-straight-closure",
        images: [PX(13074451), PX(17320165)],
      },
      {
        slug: "kinky-curly-glueless-hd-lace-wig",
        images: [PX(6923437), PX(6923442)],
      },
      {
        slug: "brazilian-body-wave-13x4-lace-frontal-24inch",
        images: [PX(4130535), PX(4130536)],
      },
    ];

    let updated = 0;
    for (const u of updates) {
      const prod = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", u.slug)).first();
      if (prod) {
        await ctx.db.patch(prod._id, { images: u.images });
        updated++;
      }
    }
    return { updated };
  },
});

// Backfill per-size measurements. Items: { slug, sizeMeasurements: { [size]: { Wst, Hps, ... } } }.
export const backfillSizeMeasurements = mutation({
  args: {
    items: v.array(
      v.object({
        slug: v.string(),
        sizeMeasurements: v.any(),
      })
    ),
  },
  handler: async (ctx, { items }) => {
    let updated = 0;
    for (const it of items) {
      const prod = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", it.slug))
        .first();
      if (!prod) continue;
      await ctx.db.patch(prod._id, { sizeMeasurements: it.sizeMeasurements });
      updated++;
    }
    return { updated };
  },
});

// Seed bag and shoe categories + demo products.
export const seedBagsAndShoes = mutation({
  args: {},
  handler: async (ctx) => {
    const PX = (id: number) =>
      `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;

    // ── categories ────────────────────────────────────────────────────────────
    const cats = [
      // bags
      { name: "Handbags", slug: "handbags", description: "Tote bags, shoulder bags, crossbody bags and clutches", subcategories: ["Tote Bags", "Shoulder Bags", "Crossbody Bags", "Clutch Bags", "Satchels", "Mini Bags"] },
      { name: "Backpacks", slug: "backpacks", description: "Fashion backpacks and mini backpacks", subcategories: ["Fashion Backpacks", "Mini Backpacks", "Laptop Bags"] },
      { name: "Wallets & Purses", slug: "wallets-purses", description: "Card holders, coin purses and long wallets", subcategories: ["Card Holders", "Coin Purses", "Long Wallets", "Wristlets"] },
      { name: "Travel Bags", slug: "travel-bags", description: "Duffel bags, weekend bags and gym bags", subcategories: ["Duffel Bags", "Weekend Bags", "Gym Bags"] },
      // shoes
      { name: "Heels", slug: "heels", description: "Stilettos, block heels, wedge heels and platform heels", subcategories: ["Stilettos", "Block Heels", "Wedge Heels", "Kitten Heels", "Platform Heels"] },
      { name: "Flats & Loafers", slug: "flats-loafers", description: "Ballet flats, loafers, mules and slides", subcategories: ["Ballet Flats", "Loafers", "Mules", "Slides", "Mary Janes"] },
      { name: "Sandals", slug: "sandals", description: "Strappy sandals, flat sandals and heeled sandals", subcategories: ["Strappy Sandals", "Flat Sandals", "Heeled Sandals", "Gladiator Sandals"] },
      { name: "Sneakers & Casual", slug: "sneakers-casual", description: "Classic sneakers, platform sneakers and chunky sneakers", subcategories: ["Classic Sneakers", "Platform Sneakers", "Chunky Sneakers", "Slip-ons"] },
      { name: "Boots", slug: "boots", description: "Ankle boots, knee-high boots and chelsea boots", subcategories: ["Ankle Boots", "Knee-High Boots", "Chelsea Boots", "Combat Boots"] },
    ];

    let catsAdded = 0;
    for (const c of cats) {
      const exists = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", c.slug)).first();
      if (!exists) {
        await ctx.db.insert("categories", { ...c, createdAt: Date.now() });
        catsAdded++;
      }
    }

    // ── products ──────────────────────────────────────────────────────────────
    const products: any[] = [
      // ── Bags ────────────────────────────────────────────────────────────────
      {
        name: "Premium Croc-Print Leather Tote Bag",
        slug: "premium-croc-print-leather-tote-bag",
        price: 42000,
        originalPrice: 58000,
        category: "Handbags",
        subcategory: "Tote Bags",
        description: "Luxurious large tote bag in crocodile-print genuine leather. Spacious interior with multiple pockets — perfect for work or weekend outings.",
        details: ["Croc-print genuine leather", "Magnetic snap closure", "Interior zip pocket + 2 open pockets", "Adjustable shoulder strap included", "Dimensions: 38cm × 30cm × 12cm"],
        sizes: [],
        colors: [{ name: "Black", hex: "#111111" }, { name: "Brown", hex: "#5c3a1e" }],
        images: [PX(27046143), PX(18601494)],
        stock: 18,
        inStock: true,
        featured: true,
        badge: "Best Seller",
        tags: ["Tote Bag", "Genuine Leather", "Croc Print", "Large", "Black", "Magnetic Snap", "Multiple Compartments"],
        rating: 4.8,
        reviews: 34,
        createdAt: Date.now(),
      },
      {
        name: "Structured Crossbody Shoulder Bag",
        slug: "structured-crossbody-shoulder-bag",
        price: 28500,
        originalPrice: 38000,
        category: "Handbags",
        subcategory: "Crossbody Bags",
        description: "Elegant structured crossbody bag in smooth faux leather. Compact yet spacious with a detachable chain strap — transitions effortlessly from day to evening.",
        details: ["Smooth faux leather exterior", "Flap closure with magnetic snap", "Detachable gold-tone chain strap", "Interior card slots and zip pocket", "Dimensions: 22cm × 15cm × 8cm"],
        sizes: [],
        colors: [{ name: "Black", hex: "#111111" }, { name: "Red", hex: "#c0392b" }, { name: "Navy", hex: "#1a2a4a" }],
        images: [PX(7953286), PX(4830924)],
        stock: 25,
        inStock: true,
        featured: true,
        newArrival: true,
        isNewArrival: true,
        badge: "New Arrival",
        tags: ["Crossbody Bag", "Faux Leather", "Small", "Black", "Flap", "Detachable Strap", "Adjustable Strap"],
        rating: 4.7,
        reviews: 21,
        createdAt: Date.now() - 1000,
      },
      // ── Shoes ────────────────────────────────────────────────────────────────
      {
        name: "Patent Stiletto Chain-Detail Heels",
        slug: "patent-stiletto-chain-detail-heels",
        price: 35000,
        originalPrice: 48000,
        category: "Heels",
        subcategory: "Stilettos",
        description: "Head-turning patent leather stilettos with delicate gold chain ankle detail. A statement heel that elevates any evening look.",
        details: ["Patent leather upper", "Gold chain ankle detail", "Pointed toe", "Stiletto heel — approx. 10cm", "Padded insole for comfort", "Rubber sole"],
        sizes: ["Size 36", "Size 37", "Size 38", "Size 39", "Size 40", "Size 41"],
        colors: [{ name: "Black", hex: "#111111" }],
        images: [PX(17826424), PX(134064)],
        stock: 15,
        inStock: true,
        featured: true,
        badge: "Best Seller",
        tags: ["Heels", "Stilettos", "Patent Leather", "High Heel (4\"+)", "Pointed Toe", "Ankle Strap", "Evening", "Formal", "Black"],
        rating: 4.9,
        reviews: 28,
        createdAt: Date.now() - 2000,
      },
      {
        name: "Buckle-Strap Block Heel Ankle Boots",
        slug: "buckle-strap-block-heel-ankle-boots",
        price: 48000,
        originalPrice: 65000,
        category: "Boots",
        subcategory: "Ankle Boots",
        description: "Edgy yet refined ankle boots with multi-buckle straps and a stable block heel. Pairs perfectly with jeans or a mini skirt for an effortlessly cool look.",
        details: ["Faux leather upper", "Side zip entry", "3 adjustable buckle straps", "Block heel — approx. 7cm", "Round toe", "Lug sole for grip"],
        sizes: ["Size 36", "Size 37", "Size 38", "Size 39", "Size 40", "Size 41"],
        colors: [{ name: "Black", hex: "#111111" }, { name: "Brown", hex: "#5c3a1e" }],
        images: [PX(31450744), PX(26856061)],
        stock: 10,
        inStock: true,
        featured: false,
        newArrival: true,
        isNewArrival: true,
        badge: "New Arrival",
        tags: ["Boots", "Ankle Boots", "Faux Leather", "Mid Heel (2-3\")", "Round Toe", "Buckle", "Zip", "Casual", "Party"],
        rating: 4.6,
        reviews: 12,
        createdAt: Date.now() - 3000,
      },
    ];

    let prodsAdded = 0;
    for (const p of products) {
      const exists = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", p.slug)).first();
      if (!exists) {
        await ctx.db.insert("products", p);
        prodsAdded++;
      }
    }

    return { catsAdded, prodsAdded };
  },
});

// Add 5 more bags and 5 more shoes across different subcategories.
export const seedMoreBagsAndShoes = mutation({
  args: {},
  handler: async (ctx) => {
    const PX = (id: number) =>
      `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;

    const products: any[] = [
      // ── 5 more Bags ──────────────────────────────────────────────────────────
      {
        name: "Satin Evening Clutch Bag",
        slug: "satin-evening-clutch-bag",
        price: 18500,
        originalPrice: 26000,
        category: "Handbags",
        subcategory: "Clutch Bags",
        description: "Elegant satin evening clutch with a gold-tone clasp. The perfect finishing touch for weddings, dinners, or any formal occasion.",
        details: ["Satin exterior with silk lining", "Gold-tone clasp closure", "Interior card slot", "Wrist strap included", "Dimensions: 23cm × 13cm"],
        sizes: [],
        colors: [{ name: "Champagne", hex: "#f0d58c" }, { name: "Black", hex: "#111111" }, { name: "Dusty Rose", hex: "#c4a0a0" }],
        images: [PX(9327162), PX(27046143)],
        stock: 22, inStock: true, featured: false, newArrival: true, isNewArrival: true, badge: "New Arrival",
        tags: ["Clutch", "Satin", "Small", "Champagne", "Flap", "Evening", "Wedding", "Formal"],
        rating: 4.7, reviews: 11, createdAt: Date.now() - 500,
      },
      {
        name: "Quilted Mini Leather Shoulder Bag",
        slug: "quilted-mini-leather-shoulder-bag",
        price: 24000,
        originalPrice: 33000,
        category: "Handbags",
        subcategory: "Mini Bags",
        description: "Chic quilted mini shoulder bag with a delicate chain strap. Compact enough for evenings, roomy enough for your essentials.",
        details: ["Quilted faux leather exterior", "Gold chain strap (adjustable)", "Zip-top closure", "1 interior slip pocket", "Dimensions: 18cm × 12cm × 6cm"],
        sizes: [],
        colors: [{ name: "Black", hex: "#111111" }, { name: "Beige", hex: "#d4c4a8" }, { name: "Red", hex: "#c0392b" }],
        images: [PX(18601494), PX(7953286)],
        stock: 30, inStock: true, featured: true, badge: "Best Seller",
        tags: ["Mini Bag", "Shoulder Bag", "Faux Leather", "Mini", "Black", "Zipper", "Adjustable Strap", "Evening", "Party"],
        rating: 4.8, reviews: 19, createdAt: Date.now() - 1500,
      },
      {
        name: "Oversized Canvas Fashion Backpack",
        slug: "oversized-canvas-fashion-backpack",
        price: 28000,
        originalPrice: 38000,
        category: "Backpacks",
        subcategory: "Fashion Backpacks",
        description: "Trendy oversized canvas backpack with leather-look trim. Fits a 15-inch laptop plus all your daily essentials in style.",
        details: ["Heavy-duty canvas with faux leather trim", "Top carry handle + padded shoulder straps", "Zip main compartment + front pocket", "Interior laptop sleeve (fits 15\")", "Dimensions: 40cm × 30cm × 14cm"],
        sizes: [],
        colors: [{ name: "Camel", hex: "#c19a6b" }, { name: "Black", hex: "#111111" }],
        images: [PX(4830924), PX(9327162)],
        stock: 15, inStock: true, newArrival: true, isNewArrival: true, badge: "New Arrival",
        tags: ["Backpack", "Fashion Backpack", "Canvas", "Large", "Camel", "Zipper", "Multiple Compartments", "Laptop Compartment", "Casual"],
        rating: 4.6, reviews: 8, createdAt: Date.now() - 2500,
      },
      {
        name: "Leather Zip-Around Long Wallet",
        slug: "leather-zip-around-long-wallet",
        price: 13500,
        originalPrice: 19000,
        category: "Wallets & Purses",
        subcategory: "Long Wallets",
        description: "Sleek zip-around long wallet in smooth genuine leather. Multiple card slots and a full-length notes compartment keep you organised.",
        details: ["Genuine leather exterior", "360° zip closure", "12 card slots", "2 note compartments", "Zip coin pocket", "Dimensions: 19cm × 9.5cm"],
        sizes: [],
        colors: [{ name: "Black", hex: "#111111" }, { name: "Tan", hex: "#c4a06a" }, { name: "Navy", hex: "#1a2a4a" }],
        images: [PX(7953286), PX(27046143)],
        stock: 40, inStock: true, badge: "",
        tags: ["Long Wallet", "Genuine Leather", "Small", "Black", "Zipper", "Multiple Compartments"],
        rating: 4.7, reviews: 26, createdAt: Date.now() - 3500,
      },
      {
        name: "Large Faux Leather Weekend Duffel",
        slug: "large-faux-leather-weekend-duffel",
        price: 68000,
        originalPrice: 90000,
        category: "Travel Bags",
        subcategory: "Weekend Bags",
        description: "Spacious faux leather duffel — your perfect weekend travel companion. Structured base keeps it upright with a removable shoulder strap.",
        details: ["Faux leather with fabric lining", "Top zip closure with double sliders", "Removable + adjustable shoulder strap", "Interior zip pocket + 2 slip pockets", "External front zip pocket", "Dimensions: 55cm × 28cm × 28cm"],
        sizes: [],
        colors: [{ name: "Black", hex: "#111111" }, { name: "Brown", hex: "#5c3a1e" }],
        images: [PX(18601494), PX(4830924)],
        stock: 10, inStock: true, featured: true, badge: "Limited Edition",
        tags: ["Duffel Bag", "Weekend Bag", "Faux Leather", "Extra Large", "Black", "Zipper", "Detachable Strap", "Multiple Compartments"],
        rating: 4.9, reviews: 7, createdAt: Date.now() - 4500,
      },
      // ── 5 more Shoes ─────────────────────────────────────────────────────────
      {
        name: "Strappy Heeled Toe-Ring Sandals",
        slug: "strappy-heeled-toe-ring-sandals",
        price: 24500,
        originalPrice: 34000,
        category: "Sandals",
        subcategory: "Heeled Sandals",
        description: "Sultry strappy sandals with a toe ring detail and comfortable block heel. Ankle buckle for a secure, custom fit.",
        details: ["Faux leather straps", "Toe-ring detail", "Ankle buckle closure", "Block heel — approx. 7cm", "Open toe", "Non-slip sole"],
        sizes: ["Size 36", "Size 37", "Size 38", "Size 39", "Size 40", "Size 41"],
        colors: [{ name: "Black", hex: "#111111" }, { name: "Nude", hex: "#d4a880" }, { name: "Gold", hex: "#c9a84c" }],
        images: [PX(10827097), PX(17826424)],
        stock: 20, inStock: true, featured: true, badge: "Best Seller",
        tags: ["Sandals", "Heeled Sandals", "Faux Leather", "Mid Heel (2-3\")", "Open Toe", "Buckle", "Ankle Strap", "Evening", "Party"],
        rating: 4.8, reviews: 22, createdAt: Date.now() - 5000,
      },
      {
        name: "Pointed-Toe Patent Ballet Flats",
        slug: "pointed-toe-patent-ballet-flats",
        price: 19500,
        originalPrice: 27000,
        category: "Flats & Loafers",
        subcategory: "Ballet Flats",
        description: "Classic pointed-toe ballet flats in glossy patent leather. Timeless, versatile, and effortlessly chic — from office to brunch.",
        details: ["Patent leather upper", "Pointed toe", "Slip-on style", "Cushioned insole", "Rubber sole", "Flat profile"],
        sizes: ["Size 36", "Size 37", "Size 38", "Size 39", "Size 40", "Size 41"],
        colors: [{ name: "Black", hex: "#111111" }, { name: "Nude", hex: "#d4a880" }, { name: "Red", hex: "#c0392b" }],
        images: [PX(134064), PX(26856061)],
        stock: 35, inStock: true, newArrival: true, isNewArrival: true, badge: "New Arrival",
        tags: ["Flats", "Ballet Flats", "Patent Leather", "Flat", "Pointed Toe", "Slip-on", "Casual", "Office", "Formal"],
        rating: 4.6, reviews: 14, createdAt: Date.now() - 6000,
      },
      {
        name: "Chunky Lug-Sole Platform Sneakers",
        slug: "chunky-lug-sole-platform-sneakers",
        price: 42000,
        originalPrice: 56000,
        category: "Sneakers & Casual",
        subcategory: "Platform Sneakers",
        description: "Fashion-forward chunky sneakers with an ultra-thick lug sole. Pairs with everything from mini skirts to wide-leg trousers.",
        details: ["Faux leather upper", "Lace-up closure", "Chunky lug platform sole — approx. 4cm", "Padded collar and tongue", "Round toe", "Lightweight construction"],
        sizes: ["Size 36", "Size 37", "Size 38", "Size 39", "Size 40", "Size 41", "Size 42"],
        colors: [{ name: "White", hex: "#ffffff" }, { name: "Black", hex: "#111111" }],
        images: [PX(26856061), PX(10827097)],
        stock: 18, inStock: true, featured: true, badge: "New Arrival",
        tags: ["Sneakers", "Platform Sneakers", "Faux Leather", "Low Heel (1-2\")", "Round Toe", "Lace-up", "Casual", "Party"],
        rating: 4.7, reviews: 17, createdAt: Date.now() - 7000,
      },
      {
        name: "Rope Espadrille Wedge Heels",
        slug: "rope-espadrille-wedge-heels",
        price: 29000,
        originalPrice: 40000,
        category: "Heels",
        subcategory: "Wedge Heels",
        description: "Vacation-ready espadrille wedge heels with a natural rope sole and canvas upper. Comfort meets style for long summer days.",
        details: ["Canvas upper", "Natural jute rope wrapped wedge — approx. 8cm", "Ankle tie closure", "Open toe", "Cushioned footbed", "Lightweight and breathable"],
        sizes: ["Size 36", "Size 37", "Size 38", "Size 39", "Size 40", "Size 41"],
        colors: [{ name: "Natural", hex: "#c9b88e" }, { name: "Black", hex: "#111111" }, { name: "White", hex: "#f5f5f5" }],
        images: [PX(17826424), PX(134064)],
        stock: 14, inStock: true, badge: "",
        tags: ["Heels", "Wedge Heels", "Fabric", "High Heel (4\"+)", "Open Toe", "Casual", "Beach", "Party"],
        rating: 4.5, reviews: 9, createdAt: Date.now() - 8000,
      },
      {
        name: "Over-the-Knee Stretch Flat Boots",
        slug: "over-the-knee-stretch-flat-boots",
        price: 72000,
        originalPrice: 95000,
        category: "Boots",
        subcategory: "Knee-High Boots",
        description: "Sleek over-the-knee stretch boots in smooth faux leather. The pull-on stretch panel wraps the leg for an elegant, flattering silhouette.",
        details: ["Faux leather upper with stretch panel", "Pull-on style", "Round toe", "Low block heel — approx. 3cm", "Side zip for easy entry", "Soft lining for comfort"],
        sizes: ["Size 36", "Size 37", "Size 38", "Size 39", "Size 40", "Size 41"],
        colors: [{ name: "Black", hex: "#111111" }, { name: "Brown", hex: "#5c3a1e" }],
        images: [PX(31450744), PX(26856061)],
        stock: 8, inStock: true, featured: true, badge: "Limited Edition",
        tags: ["Boots", "Knee-High Boots", "Faux Leather", "Low Heel (1-2\")", "Round Toe", "Zip", "Formal", "Evening", "Party"],
        rating: 4.9, reviews: 6, createdAt: Date.now() - 9000,
      },
    ];

    let prodsAdded = 0;
    for (const p of products) {
      const exists = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", p.slug)).first();
      if (!exists) {
        await ctx.db.insert("products", p);
        prodsAdded++;
      }
    }
    return { prodsAdded };
  },
});

// Patch any products in fabric/palazzo categories whose images are broken (local paths, picsum, etc.).
export const fixBrokenImages = mutation({
  args: {},
  handler: async (ctx) => {
    const PX = (id: number) =>
      `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;

    // Fabric textile images — verified to be accessible Pexels photos
    const FABRIC_POOL = [PX(6069093), PX(3812584), PX(4993160), PX(7319081)];
    const PALAZZO_POOL = [PX(3373730), PX(6193110), PX(4855416), PX(6069093)];

    const all = await ctx.db.query("products").collect();
    let updated = 0;

    for (const p of all) {
      const images: string[] = p.images || [];
      const hasBroken = images.length === 0 || images.some(
        (img: string) =>
          img.startsWith("/") ||
          img.includes("picsum") ||
          img.includes("placeholder") ||
          (img.startsWith("http") && !img.includes("pexels.com") && !img.includes("convex.cloud"))
      );
      if (!hasBroken) continue;

      const cat = String(p.category || "").toLowerCase();
      let pool: string[];
      if (cat === "palazzo") pool = PALAZZO_POOL;
      else if (cat === "fabrics" || cat === "fabric") pool = FABRIC_POOL;
      else continue; // skip other categories — they have their own fix mutations

      const newImages = [pool[updated % pool.length], pool[(updated + 1) % pool.length]];
      await ctx.db.patch(p._id, { images: newImages });
      updated++;
    }
    return { updated };
  },
});

// Normalize inconsistent category names so shop filters work correctly.
// "fabric"/"Fabric" → "Fabrics", "palazzo" → "Palazzo"
export const normalizeCategoryNames = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("products").collect();
    let updated = 0;
    for (const p of all) {
      const cat = String(p.category || "").trim();
      const lower = cat.toLowerCase();
      let canonical: string | null = null;
      if (lower === "fabric" || lower === "fabrics") canonical = "Fabrics";
      else if (lower === "palazzo") canonical = "Palazzo";
      if (!canonical || p.category === canonical) continue;
      await ctx.db.patch(p._id, { category: canonical });
      updated++;
    }
    return { updated };
  },
});

// Patch specific products with images that match their names.
export const updateSpecificProductImages = mutation({
  args: {},
  handler: async (ctx) => {
    const PX = (id: number) =>
      `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;

    // Images chosen to align with each product type.
    // Palazzo fashion → lifestyle/fashion photos; Fabric → textile/material close-ups.
    const updates = [
      // ── Palazzo clothing ──────────────────────────────────────────────────────
      { slug: "sapphire-silk-palazzo",    name: "Sapphire Silk Palazzo",    images: [PX(3651769), PX(1536619)] },
      { slug: "casual-chic-palazzo-set",  name: "Casual Chic Palazzo Set",  images: [PX(5868756), PX(3373735)] },
      { slug: "sequin-evening-palazzo",   name: "Sequin Evening Palazzo",   images: [PX(3184337), PX(3810153)] },
      { slug: "pleated-palazzo-trousers", name: "Pleated Palazzo Trousers", images: [PX(4219511), PX(3373739)] },
      { slug: "royal-palazzo-elegance",   name: "Royal Palazzo Elegance",   images: [PX(2220316), PX(4219514)] },
      // ── Fabric textiles ───────────────────────────────────────────────────────
      { slug: "swiss-voile-fabric",       name: "Swiss Voile Fabric",       images: [PX(7319081), PX(6193110)] },
      { slug: "jacquard-brocade-fabric",  name: "Jacquard Brocade Fabric",  images: [PX(4993160), PX(4855416)] },
      { slug: "ankara-premium-fabric",    name: "Ankara Premium Fabric",    images: [PX(6626903), PX(6626918)] },
    ];

    let patched = 0;
    for (const u of updates) {
      // Try slug first, fall back to exact name match
      let prod: any = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", u.slug)).first();
      if (!prod) {
        prod = await ctx.db.query("products").filter((q) => q.eq(q.field("name"), u.name)).first();
      }
      if (prod) {
        await ctx.db.patch(prod._id, { images: u.images });
        patched++;
      }
    }
    return { patched };
  },
});

// Seed jewelry categories + 5 demo products.
export const seedJewelry = mutation({
  args: {},
  handler: async (ctx) => {
    const PX = (id: number) =>
      `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;

    const cats = [
      { name: "Earrings",           slug: "earrings",           description: "Studs, hoops, drops and ear cuffs", subcategories: ["Stud Earrings", "Hoop Earrings", "Drop Earrings", "Ear Cuffs", "Cluster Earrings"] },
      { name: "Bangles & Bracelets",slug: "bangles-bracelets",  description: "Bangles, charm bracelets, cuffs and beaded bracelets", subcategories: ["Bangles", "Charm Bracelets", "Cuff Bracelets", "Tennis Bracelets", "Beaded Bracelets"] },
      { name: "Necklaces",          slug: "necklaces",          description: "Pendant necklaces, layered chains and chokers", subcategories: ["Pendant Necklaces", "Layered Chains", "Chokers", "Statement Necklaces", "Pearl Necklaces"] },
      { name: "Rings",              slug: "rings",              description: "Cocktail rings, bands and statement rings", subcategories: ["Cocktail Rings", "Bands", "Statement Rings", "Stacking Rings", "Knuckle Rings"] },
      { name: "Sets & Bundles",     slug: "sets-bundles",       description: "Coordinated jewelry sets and gift bundles", subcategories: ["Necklace & Earring Sets", "Full Jewelry Sets", "Bracelet Sets"] },
    ];

    let catsAdded = 0;
    for (const c of cats) {
      const exists = await ctx.db.query("categories").withIndex("by_slug", (q) => q.eq("slug", c.slug)).first();
      if (!exists) {
        await ctx.db.insert("categories", { ...c, createdAt: Date.now() });
        catsAdded++;
      }
    }

    const products: any[] = [
      {
        name: "Classic Gold Hoop Earrings",
        slug: "classic-gold-hoop-earrings",
        price: 8500,
        originalPrice: 12000,
        category: "Earrings",
        subcategory: "Hoop Earrings",
        description: "Timeless large gold hoop earrings — the ultimate wardrobe staple. Lightweight, hypoallergenic and suitable for sensitive ears.",
        details: ["18k gold-plated brass", "Diameter: 5cm", "Secure lever-back closure", "Hypoallergenic", "Lightweight — barely feel them"],
        sizes: [],
        colors: [{ name: "Gold", hex: "#c9a84c" }, { name: "Rose Gold", hex: "#b76e79" }],
        images: [PX(5985085), PX(3266700)],
        stock: 50, inStock: true, featured: true, badge: "Best Seller",
        tags: ["Earrings", "Hoop Earrings", "Gold Plated", "Gold", "Classic", "Everyday Wear", "Formal", "Party"],
        rating: 4.9, reviews: 62, createdAt: Date.now(),
      },
      {
        name: "Crystal Charm Bangle Set",
        slug: "crystal-charm-bangle-set",
        price: 14500,
        originalPrice: 20000,
        category: "Bangles & Bracelets",
        subcategory: "Charm Bracelets",
        description: "A set of three stackable bangles adorned with cubic zirconia charms. Mix and match for a personalised wrist stack.",
        details: ["Set of 3 bangles", "Gold-plated with CZ charms", "Interior diameter: 6.5cm", "Lobster-claw clasp on charm bangle", "Tarnish-resistant"],
        sizes: [],
        colors: [{ name: "Gold", hex: "#c9a84c" }, { name: "Rose Gold", hex: "#b76e79" }, { name: "Silver", hex: "#c0c0c0" }],
        images: [PX(3266700), PX(5119773)],
        stock: 35, inStock: true, featured: true, newArrival: true, isNewArrival: true, badge: "New Arrival",
        tags: ["Bangles", "Charm Bracelet", "Cubic Zirconia", "Gold Plated", "Gold", "Minimalist", "Everyday Wear", "Gift"],
        rating: 4.8, reviews: 38, createdAt: Date.now() - 1000,
      },
      {
        name: "Layered Dainty Gold Chain Necklace",
        slug: "layered-dainty-gold-chain-necklace",
        price: 12000,
        originalPrice: 17000,
        category: "Necklaces",
        subcategory: "Layered Chains",
        description: "Three dainty gold chains pre-layered to give an effortlessly stacked look. One simple clasp — no more tangled necklaces.",
        details: ["Set of 3 pre-layered chains", "18k gold plated over brass", "Lengths: 40cm, 45cm, 50cm", "Lobster-claw clasp + 5cm extender", "Tarnish-resistant coating"],
        sizes: [],
        colors: [{ name: "Gold", hex: "#c9a84c" }, { name: "Silver", hex: "#c0c0c0" }],
        images: [PX(2735970), PX(5119778)],
        stock: 45, inStock: true, featured: true, badge: "Best Seller",
        tags: ["Necklace", "Layered Chain", "Gold Plated", "Gold", "Minimalist", "Everyday Wear", "Office", "Gift"],
        rating: 4.8, reviews: 44, createdAt: Date.now() - 2000,
      },
      {
        name: "Pearl Cluster Cocktail Ring",
        slug: "pearl-cluster-cocktail-ring",
        price: 9500,
        originalPrice: 14000,
        category: "Rings",
        subcategory: "Cocktail Rings",
        description: "Glamorous cluster cocktail ring with freshwater pearl-style cabochons set in a gold-tone frame. A head-turner for any occasion.",
        details: ["Gold-plated setting", "Pearl-style resin cabochons", "Adjustable band (fits sizes 16–19mm)", "Tarnish resistant", "Hypoallergenic"],
        sizes: [],
        colors: [{ name: "Gold & Pearl", hex: "#c9a84c" }, { name: "Silver & Pearl", hex: "#c0c0c0" }],
        images: [PX(6616860), PX(5985092)],
        stock: 28, inStock: true, featured: false, newArrival: true, isNewArrival: true, badge: "New Arrival",
        tags: ["Ring", "Cocktail Ring", "Pearl", "Gold Plated", "Gold", "Statement", "Party", "Wedding", "Formal"],
        rating: 4.7, reviews: 21, createdAt: Date.now() - 3000,
      },
      {
        name: "Bridal Gold Jewelry Full Set",
        slug: "bridal-gold-jewelry-full-set",
        price: 38000,
        originalPrice: 55000,
        category: "Sets & Bundles",
        subcategory: "Full Jewelry Sets",
        description: "Complete bridal jewelry set — statement necklace, matching drop earrings, cuff bracelet and cocktail ring. All packaged in a luxury gift box.",
        details: ["4-piece set: necklace + earrings + bracelet + ring", "18k gold plated with crystal detailing", "Gift box included", "Adjustable ring and extendable bracelet", "Hypoallergenic"],
        sizes: [],
        colors: [{ name: "Gold", hex: "#c9a84c" }, { name: "Rose Gold", hex: "#b76e79" }],
        images: [PX(5119778), PX(2735970)],
        stock: 15, inStock: true, featured: true, badge: "Limited Edition",
        tags: ["Jewelry Set", "Bridal Set", "Gold Plated", "Crystal", "Gold", "Bridal", "Wedding", "Formal", "Gift"],
        rating: 4.9, reviews: 18, createdAt: Date.now() - 4000,
      },
    ];

    let prodsAdded = 0;
    for (const p of products) {
      const exists = await ctx.db.query("products").withIndex("by_slug", (q) => q.eq("slug", p.slug)).first();
      if (!exists) {
        await ctx.db.insert("products", p);
        prodsAdded++;
      }
    }
    return { catsAdded, prodsAdded };
  },
});
