"use client";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const NGN = (n) => `₦${(Number(n) || 0).toLocaleString("en-NG")}`;

// Measurement features captured per size. Key = short code stored on the product;
// label = long form shown to admin & customer.
const MEASUREMENT_FIELDS = [
  { key: "Wst", label: "Waist" },
  { key: "Hps", label: "Hips" },
  { key: "Bst", label: "Bust" },
  { key: "Lgth", label: "Length" },
  { key: "Insm", label: "Inseam" },
  { key: "Otsm", label: "Outseam" },
  { key: "Shldr", label: "Shoulder" },
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const BADGE_OPTIONS = ["", "Best Seller", "New Arrival", "Limited Edition", "Sale", "Sold Out", "Pre-order"];

// ── Hair ──────────────────────────────────────────────────────────────────────
const HAIR_CATEGORIES = [
  { name: "Wigs", subcategories: ["Frontal Wigs", "Closure Wigs", "Glueless Wigs", "Headband Wigs", "Bob Wigs"] },
  { name: "Bundles & Deals", subcategories: ["Single Bundles", "3-Bundle Deals", "Bundle + Closure Deals", "Bundle + Frontal Deals"] },
  { name: "Closures & Frontals", subcategories: ["Lace Closures", "Lace Frontals", "360 Frontals", "Kim K Closures"] },
  { name: "Clip-ins & Ponytails", subcategories: ["Clip-in Extensions", "Drawstring Ponytails", "Tape-ins"] },
  { name: "Shop By Texture", subcategories: ["Straight", "Wavy", "Curly", "Coily & Yaki"] },
  { name: "Shop By Hair Origin", subcategories: ["Raw Vietnamese", "Raw Cambodian", "Luxury Virgin"] },
];
const HAIR_TAG_GROUPS = [
  { label: "Type", tags: ["Wigs", "Frontal Wigs", "Closure Wigs", "Glueless Wigs", "Headband Wigs", "Bob Wigs", "Single Bundle", "3-Bundle Deal", "Bundle + Closure Deal", "Bundle + Frontal Deal", "Lace Closure", "Lace Frontal", "360 Frontal", "Kim K Closure", "Clip-in Extensions", "Drawstring Ponytails", "Tape-ins"] },
  { label: "Texture", tags: ["Bone Straight", "Silky Straight", "Body Wave", "Water Wave", "Deep Wave", "Kinky Curly", "Jerry Curly", "Kinky Straight", "Yaki Straight", "Wavy", "Coily"] },
  { label: "Origin", tags: ["Vietnamese Raw", "Raw Cambodian", "Brazilian Luxury", "Luxury Virgin", "100% Raw Hair", "Unprocessed", "Vietnamese Donor", "Cambodian Donor", "Donor Hair"] },
  { label: "Length", tags: ["10 inches", "12 inches", "14 inches", "16 inches", "18 inches", "20 inches", "22 inches", "24 inches", "26 inches", "28 inches", "30 inches"] },
  { label: "Color", tags: ["Natural Color (1B)", "Jet Black (1)", "613 Blonde", "Piano Color", "Burgundy", "Auburn", "Highlights"] },
  { label: "Lace & Cap", tags: ["HD Lace", "Transparent Lace", "Swiss Lace", "13x4 Frontal", "13x6 Frontal", "5x5 Closure", "4x4 Closure", "360 Lace", "Glueless", "Pre-plucked"] },
  { label: "Density & Quality", tags: ["180% Density", "150% Density", "200% Density", "Double Drawn", "Single Drawn", "Luxury Package", "DIY Install", "Temporary", "10-Piece Set", "Drawstring"] },
];

// ── Bags ──────────────────────────────────────────────────────────────────────
const BAG_CATEGORIES = [
  { name: "Handbags", subcategories: ["Tote Bags", "Shoulder Bags", "Crossbody Bags", "Clutch Bags", "Satchels", "Mini Bags"] },
  { name: "Backpacks", subcategories: ["Fashion Backpacks", "Mini Backpacks", "Laptop Bags"] },
  { name: "Wallets & Purses", subcategories: ["Card Holders", "Coin Purses", "Long Wallets", "Wristlets"] },
  { name: "Travel Bags", subcategories: ["Duffel Bags", "Weekend Bags", "Gym Bags"] },
];
const BAG_TAG_GROUPS = [
  { label: "Bag Type", tags: ["Handbag", "Tote Bag", "Shoulder Bag", "Crossbody Bag", "Clutch", "Satchel", "Mini Bag", "Backpack", "Fashion Backpack", "Mini Backpack", "Card Holder", "Long Wallet", "Wristlet", "Duffel Bag", "Weekend Bag", "Gym Bag"] },
  { label: "Material", tags: ["Genuine Leather", "Faux Leather", "PU Leather", "Canvas", "Suede", "Patent Leather", "Straw", "Fabric", "Croc Print"] },
  { label: "Bag Size", tags: ["Mini", "Small", "Medium", "Large", "Extra Large"] },
  { label: "Bag Color", tags: ["Black", "Brown", "Tan", "Nude", "White", "Red", "Navy", "Camel", "Grey", "Multi-color"] },
  { label: "Closure", tags: ["Zipper", "Magnetic Snap", "Drawstring", "Open Top", "Buckle", "Flap"] },
  { label: "Features", tags: ["Adjustable Strap", "Detachable Strap", "Multiple Compartments", "Laptop Compartment", "Waterproof", "Anti-theft"] },
];

// ── Shoes ─────────────────────────────────────────────────────────────────────
const SHOE_CATEGORIES = [
  { name: "Heels", subcategories: ["Stilettos", "Block Heels", "Wedge Heels", "Kitten Heels", "Platform Heels"] },
  { name: "Flats & Loafers", subcategories: ["Ballet Flats", "Loafers", "Mules", "Slides", "Mary Janes"] },
  { name: "Sandals", subcategories: ["Strappy Sandals", "Flat Sandals", "Heeled Sandals", "Gladiator Sandals"] },
  { name: "Sneakers & Casual", subcategories: ["Classic Sneakers", "Platform Sneakers", "Chunky Sneakers", "Slip-ons"] },
  { name: "Boots", subcategories: ["Ankle Boots", "Knee-High Boots", "Chelsea Boots", "Combat Boots"] },
];
const SHOE_TAG_GROUPS = [
  { label: "Shoe Type", tags: ["Heels", "Stilettos", "Block Heels", "Wedge", "Kitten Heels", "Platform Heels", "Flats", "Ballet Flats", "Loafers", "Mules", "Slides", "Sandals", "Sneakers", "Ankle Boots", "Knee-High Boots", "Chelsea Boots", "Combat Boots"] },
  { label: "Heel Height", tags: ["Flat", "Low Heel (1-2\")", "Mid Heel (2-3\")", "High Heel (4\"+)", "Extra High (5\"+)"] },
  { label: "Shoe Material", tags: ["Leather", "Faux Leather", "Suede", "Patent Leather", "Satin", "Fabric", "Metallic"] },
  { label: "Toe Shape", tags: ["Round Toe", "Pointed Toe", "Open Toe", "Square Toe", "Peep Toe", "Almond Toe"] },
  { label: "Shoe Closure", tags: ["Lace-up", "Buckle", "Slip-on", "Zip", "Hook & Loop", "Ankle Strap"] },
  { label: "Shoe Size", tags: ["Size 36", "Size 37", "Size 38", "Size 39", "Size 40", "Size 41", "Size 42", "Size 43"] },
  { label: "Occasion", tags: ["Casual", "Formal", "Evening", "Office", "Wedding", "Beach", "Party"] },
];

// ── Jewelry ───────────────────────────────────────────────────────────────────
const JEWELRY_CATEGORIES = [
  { name: "Earrings",            subcategories: ["Stud Earrings", "Hoop Earrings", "Drop Earrings", "Ear Cuffs", "Cluster Earrings"] },
  { name: "Bangles & Bracelets", subcategories: ["Bangles", "Charm Bracelets", "Cuff Bracelets", "Tennis Bracelets", "Beaded Bracelets"] },
  { name: "Necklaces",           subcategories: ["Pendant Necklaces", "Layered Chains", "Chokers", "Statement Necklaces", "Pearl Necklaces"] },
  { name: "Rings",               subcategories: ["Cocktail Rings", "Bands", "Statement Rings", "Stacking Rings", "Knuckle Rings"] },
  { name: "Sets & Bundles",      subcategories: ["Necklace & Earring Sets", "Full Jewelry Sets", "Bracelet Sets"] },
];
const JEWELRY_TAG_GROUPS = [
  { label: "Jewelry Type", tags: ["Earrings", "Stud Earrings", "Hoop Earrings", "Drop Earrings", "Ear Cuffs", "Bangles", "Charm Bracelet", "Cuff Bracelet", "Tennis Bracelet", "Beaded Bracelet", "Necklace", "Pendant Necklace", "Layered Chain", "Choker", "Statement Necklace", "Pearl Necklace", "Ring", "Cocktail Ring", "Statement Ring", "Stacking Ring", "Jewelry Set", "Bridal Set"] },
  { label: "Metal & Material", tags: ["Gold Plated", "Silver", "Rose Gold", "Sterling Silver", "Brass", "Stainless Steel", "Gold-filled", "Rhodium Plated"] },
  { label: "Gemstone", tags: ["Cubic Zirconia", "Crystal", "Pearl", "Turquoise", "Onyx", "Coral", "Beads", "No Gemstone"] },
  { label: "Finish", tags: ["Gold", "Silver", "Rose Gold", "Gunmetal", "Two-tone", "Oxidized", "Matte"] },
  { label: "Style", tags: ["Minimalist", "Statement", "Bohemian", "Classic", "Modern", "Bridal", "Vintage", "Casual"] },
  { label: "Occasion", tags: ["Everyday Wear", "Formal", "Wedding", "Party", "Office", "Gift"] },
];

// ── Perfume ───────────────────────────────────────────────────────────────────
const PERFUME_CATEGORIES = [
  { name: "Eau de Parfum",    subcategories: ["Women's EDP", "Men's EDP", "Unisex EDP"] },
  { name: "Eau de Toilette",  subcategories: ["Women's EDT", "Men's EDT", "Unisex EDT"] },
  { name: "Body Mist & Spray", subcategories: ["Women's Body Mist", "Men's Body Mist", "Unisex Body Mist"] },
  { name: "Perfume Oil",      subcategories: ["Roll-on Oils", "Concentrated Perfume Oils"] },
  { name: "Fragrance Sets",   subcategories: ["Gift Sets", "Mini Travel Sets", "Matching Body Sets"] },
];
const PERFUME_TAG_GROUPS = [
  { label: "Scent Family", tags: ["Floral", "Fruity", "Woody", "Oriental", "Fresh", "Citrus", "Musky", "Gourmand", "Aquatic", "Spicy", "Amber", "Powdery"] },
  { label: "Concentration", tags: ["Eau de Parfum (EDP)", "Eau de Toilette (EDT)", "Parfum / Extrait", "Body Mist", "Perfume Oil", "Cologne"] },
  { label: "Gender", tags: ["For Her", "For Him", "Unisex"] },
  { label: "Top Notes", tags: ["Rose", "Jasmine", "Bergamot", "Lemon", "Orange", "Lavender", "Vanilla", "Oud", "Sandalwood", "Musk", "Cedarwood", "Patchouli"] },
  { label: "Occasion", tags: ["Everyday", "Evening", "Office", "Date Night", "Wedding", "Summer", "Winter", "Gift"] },
  { label: "Brand Type", tags: ["Niche Fragrance", "Designer", "Arabian Oud", "Local Brand", "Luxury"] },
];

// ── Unified helpers ────────────────────────────────────────────────────────────
const ALL_CUSTOM_CATEGORIES = [...HAIR_CATEGORIES, ...BAG_CATEGORIES, ...SHOE_CATEGORIES, ...JEWELRY_CATEGORIES, ...PERFUME_CATEGORIES];
const HAIR_CAT_NAMES     = new Set(HAIR_CATEGORIES.map((c) => c.name));
const BAG_CAT_NAMES      = new Set(BAG_CATEGORIES.map((c) => c.name));
const SHOE_CAT_NAMES     = new Set(SHOE_CATEGORIES.map((c) => c.name));
const JEWELRY_CAT_NAMES  = new Set(JEWELRY_CATEGORIES.map((c) => c.name));
const PERFUME_CAT_NAMES  = new Set(PERFUME_CATEGORIES.map((c) => c.name));

function getTagGroups(category) {
  if (HAIR_CAT_NAMES.has(category))    return HAIR_TAG_GROUPS;
  if (BAG_CAT_NAMES.has(category))     return BAG_TAG_GROUPS;
  if (SHOE_CAT_NAMES.has(category))    return SHOE_TAG_GROUPS;
  if (JEWELRY_CAT_NAMES.has(category)) return JEWELRY_TAG_GROUPS;
  if (PERFUME_CAT_NAMES.has(category)) return PERFUME_TAG_GROUPS;
  return [...HAIR_TAG_GROUPS, ...BAG_TAG_GROUPS, ...SHOE_TAG_GROUPS, ...JEWELRY_TAG_GROUPS, ...PERFUME_TAG_GROUPS];
}

function normalizeColor(c) {
  if (!c) return null;
  if (typeof c === "string") {
    const t = c.trim();
    if (!t) return null;
    const m = t.match(/^(.+?)\s*[|:]\s*(#[0-9a-fA-F]{3,8})$/);
    return m ? { name: m[1].trim(), hex: m[2] } : { name: t, hex: "" };
  }
  if (typeof c === "object" && c.name) return { name: String(c.name), hex: String(c.hex || "") };
  return null;
}

const EMPTY = {
  name: "",
  slug: "",
  price: "",
  originalPrice: "",
  cost: "",
  category: "",
  subcategory: "",
  description: "",
  details: "",
  sizes: "",
  sizeMeasurements: {},
  colors: "",
  images: "",
  stock: "",
  featured: false,
  newArrival: false,
  badge: "",
  tags: [],
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | product object
  const [form, setForm] = useState(EMPTY);
  const [colorItems, setColorItems] = useState([]); // [{ name, hex }]
  const [saving, setSaving] = useState(false);
  const [imageItems, setImageItems] = useState([]); // [{ key, preview }]
  const [uploading, setUploading] = useState(false);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);

  async function load() {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      fetch("/api/admin/products"),
      fetch("/api/admin/categories"),
    ]);
    const pData = await pRes.json();
    const cData = await cRes.json().catch(() => ({}));
    setProducts(pData.products || []);
    setCategories(cData.categories || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setForm(EMPTY);
    setImageItems([]);
    setColorItems([]);
    setEditing("new");
  }

  function openEdit(p) {
    setForm({
      ...EMPTY,
      ...p,
      details: Array.isArray(p.details) ? p.details.join("\n") : p.details || "",
      sizes: Array.isArray(p.sizes) ? p.sizes.join(", ") : p.sizes || "",
      sizeMeasurements: p.sizeMeasurements && typeof p.sizeMeasurements === "object" ? p.sizeMeasurements : {},
      colors: "",
      images: Array.isArray(p.images) ? p.images.join("\n") : p.images || "",
      tags: Array.isArray(p.tags) ? p.tags : [],
    });
    const imgs = Array.isArray(p.images) ? p.images : [];
    setImageItems(imgs.map((u) => ({ key: u, preview: u })));
    const cols = Array.isArray(p.colors) ? p.colors.map(normalizeColor).filter(Boolean) : [];
    setColorItems(cols);
    setEditing(p);
  }

  function close() {
    setEditing(null);
    setForm(EMPTY);
    setImageItems([]);
    setColorItems([]);
  }

  async function handleUpload(files) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const newItems = [];
      for (const file of files) {
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error("Upload failed");
        const { storageId } = await res.json();
        newItems.push({ key: storageId, preview: URL.createObjectURL(file) });
      }
      const next = [...imageItems, ...newItems];
      setImageItems(next);
      setForm((f) => ({ ...f, images: next.map((i) => i.key).join("\n") }));
    } catch (err) {
      alert("Upload failed: " + (err.message || "unknown"));
    } finally {
      setUploading(false);
    }
  }

  function removeImage(idx) {
    const next = imageItems.filter((_, i) => i !== idx);
    setImageItems(next);
    setForm((f) => ({ ...f, images: next.map((i) => i.key).join("\n") }));
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        colors: colorItems.filter((c) => c.name?.trim()).map((c) => (c.hex ? { name: c.name.trim(), hex: c.hex } : { name: c.name.trim() })),
      };
      if (editing === "new") {
        await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(`/api/admin/products/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      await load();
      close();
    } finally {
      setSaving(false);
    }
  }

  async function remove(p) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
    await load();
  }

  const filtered = products.filter((p) =>
    !filter || p.name.toLowerCase().includes(filter.toLowerCase()) || p.category?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <input
          type="search"
          placeholder="Search products..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-brand-200 rounded-lg text-sm w-full sm:w-64"
        />
        <button onClick={openNew} className="bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-700">
          + Add Product
        </button>
      </div>

      <div className="bg-white border border-brand-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-ink-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50">
                <tr className="text-left text-xs uppercase tracking-wider text-ink-600">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t border-brand-100 hover:bg-brand-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded" />
                        )}
                        <div>
                          <div className="font-medium text-brand-950">{p.name}</div>
                          <div className="text-xs text-ink-500">#{p.legacyId ?? String(p.id).slice(-6)} · {p.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize">{p.category}</td>
                    <td className="px-4 py-3 text-right font-medium">{NGN(p.price)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        (p.stock || 0) === 0 ? "bg-red-100 text-red-700" : (p.stock || 0) <= 5 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                      }`}>
                        {p.stock ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(p)} className="text-accent-700 hover:underline text-xs mr-3">Edit</button>
                      <button onClick={() => remove(p)} className="text-red-600 hover:underline text-xs">Delete</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-ink-500">No products.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto" onClick={close}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100">
              <h2 className="font-heading text-lg font-semibold text-brand-950">
                {editing === "new" ? "New Product" : `Edit: ${editing.name}`}
              </h2>
              <button onClick={close} className="text-ink-500 hover:text-ink-950">✕</button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} placeholder="auto-generated if blank" />
                <SelectWithCustom
                  label="Badge"
                  value={form.badge}
                  options={BADGE_OPTIONS}
                  onChange={(v) => setForm({ ...form, badge: v })}
                  placeholder="Choose or type..."
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Price (₦)" type="number" value={form.price} onChange={(v) => setForm({ ...form, price: v })} required />
                <Field label="Original Price (₦)" type="number" value={form.originalPrice} onChange={(v) => setForm({ ...form, originalPrice: v })} />
                <Field label="Cost (₦)" type="number" value={form.cost} onChange={(v) => setForm({ ...form, cost: v })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <CategorySelect
                  label="Category"
                  value={form.category}
                  categories={categories}
                  onChange={(v) => setForm({ ...form, category: v, subcategory: "" })}
                />
                <SubcategorySelect
                  label="Subcategory"
                  value={form.subcategory}
                  category={form.category}
                  categories={categories}
                  onChange={(v) => setForm({ ...form, subcategory: v })}
                />
                <Field label="Stock" type="number" value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} />
              </div>
              <Textarea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
              <Textarea label="Details (one per line)" value={form.details} onChange={(v) => setForm({ ...form, details: v })} />
              <SizesPicker
                value={form.sizes}
                onChange={(v) => setForm({ ...form, sizes: v })}
              />
              <ColorsPicker value={colorItems} onChange={setColorItems} />
              <SizeMeasurements
                sizes={parseSizesInput(form.sizes)}
                value={form.sizeMeasurements}
                onChange={(next) => setForm({ ...form, sizeMeasurements: next })}
              />
              <Textarea label="Image URLs / IDs (one per line — auto-managed below)" value={form.images} onChange={(v) => {
                setForm({ ...form, images: v });
                const lines = v.split(/\n+/).map((s) => s.trim()).filter(Boolean);
                setImageItems(lines.map((k) => ({ key: k, preview: k.startsWith("http") || k.startsWith("/") ? k : null })));
              }} />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase tracking-wider text-ink-600">Product Images</span>
                  <label className="px-3 py-1.5 bg-brand-100 hover:bg-brand-200 text-xs rounded-lg cursor-pointer">
                    {uploading ? "Uploading..." : "+ Upload"}
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => { handleUpload(Array.from(e.target.files || [])); e.target.value = ""; }}
                    />
                  </label>
                </div>
                {imageItems.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {imageItems.map((item, i) => (
                      <div key={i} className="relative group">
                        {item.preview ? (
                          <img src={item.preview} alt="" className="w-full h-24 object-cover rounded border border-brand-200" />
                        ) : (
                          <div className="w-full h-24 flex items-center justify-center bg-brand-50 rounded border border-brand-200 text-[10px] text-ink-500 px-1 break-all text-center">
                            {item.key.slice(0, 16)}…
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full opacity-0 group-hover:opacity-100"
                          title="Remove"
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <TagsPicker value={form.tags} onChange={(v) => setForm({ ...form, tags: v })} tagGroups={getTagGroups(form.category)} />
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!form.newArrival} onChange={(e) => setForm({ ...form, newArrival: e.target.checked })} />
                  New Arrival
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-brand-100">
                <button type="button" onClick={close} className="px-4 py-2 text-sm text-ink-700 hover:bg-brand-50 rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-brand-950 text-white text-sm rounded-lg hover:bg-brand-900 disabled:opacity-60">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-ink-600 mb-1">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
    </label>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-ink-600 mb-1">{label}</span>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 font-mono"
      />
    </label>
  );
}

function parseSizesInput(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return String(value).split(",").map((s) => s.trim()).filter(Boolean);
}

function SizeMeasurements({ sizes, value, onChange }) {
  if (!sizes || sizes.length === 0) {
    return (
      <div className="text-xs text-ink-500 italic border border-dashed border-brand-200 rounded-lg p-3">
        Add sizes above to enter per-size measurements (Waist, Hips, Bust, Length, Inseam, Outseam, Shoulder).
      </div>
    );
  }
  const map = value && typeof value === "object" ? value : {};
  const setField = (size, key, v) => {
    const next = { ...map, [size]: { ...(map[size] || {}), [key]: v } };
    if (!v) delete next[size][key];
    onChange(next);
  };
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-ink-600 mb-2">Size Measurements (optional)</div>
      <div className="space-y-3">
        {sizes.map((size) => (
          <div key={size} className="border border-brand-100 rounded-lg p-3">
            <div className="text-xs font-semibold text-brand-950 mb-2">Size {size}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MEASUREMENT_FIELDS.map((f) => (
                <label key={f.key} className="block">
                  <span className="block text-[10px] uppercase tracking-wider text-ink-500 mb-1">
                    {f.label} <span className="text-ink-400">({f.key})</span>
                  </span>
                  <input
                    type="text"
                    value={(map[size] && map[size][f.key]) ?? ""}
                    onChange={(e) => setField(size, f.key, e.target.value)}
                    placeholder="--"
                    className="w-full px-2 py-1.5 border border-brand-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----- Category / subcategory selects -----
function mergeWithCustomCategories(dbCategories) {
  const all = [...ALL_CUSTOM_CATEGORIES];
  for (const c of dbCategories) {
    if (!all.find((h) => h.name === c.name)) all.push(c);
  }
  return all;
}

function CategorySelect({ label, value, categories, onChange }) {
  const merged = mergeWithCustomCategories(categories);
  const options = merged.map((c) => c.name);
  const isOther = value && !options.includes(value);
  return (
    <div>
      <span className="block text-xs uppercase tracking-wider text-ink-600 mb-1">{label}</span>
      <select
        value={isOther ? "__custom" : value || ""}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "__custom") onChange("");
          else onChange(v);
        }}
        className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
      >
        <option value="">— Choose —</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
        <option value="__custom">Other (type below)</option>
      </select>
      {(isOther || value === "" || merged.length === 0) && (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={merged.length === 0 ? "No categories yet — type freely" : "Custom category"}
          className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      )}
    </div>
  );
}

function SubcategorySelect({ label, value, category, categories, onChange }) {
  const merged = mergeWithCustomCategories(categories);
  const cat = merged.find((c) => c.name === category);
  const options = cat?.subcategories || [];
  const isOther = value && !options.includes(value);
  return (
    <div>
      <span className="block text-xs uppercase tracking-wider text-ink-600 mb-1">{label}</span>
      <select
        value={isOther ? "__custom" : value || ""}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "__custom") onChange("");
          else onChange(v);
        }}
        disabled={!category}
        className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:bg-brand-50 disabled:text-ink-400"
      >
        <option value="">{category ? "— Choose —" : "Select category first"}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
        <option value="__custom">Other (type below)</option>
      </select>
      {category && (isOther || (value === "" && options.length === 0)) && (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Custom subcategory"
          className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      )}
    </div>
  );
}

function TagsPicker({ value, onChange, tagGroups = HAIR_TAG_GROUPS }) {
  const [openGroups, setOpenGroups] = useState({});
  const [custom, setCustom] = useState("");
  const selected = Array.isArray(value) ? value : [];

  function toggle(tag) {
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag]);
  }
  function addCustom(e) {
    e.preventDefault();
    const t = custom.trim();
    if (t && !selected.includes(t)) onChange([...selected, t]);
    setCustom("");
  }

  return (
    <div>
      <span className="block text-xs uppercase tracking-wider text-ink-600 mb-2">Product Tags <span className="normal-case font-normal text-ink-400">(type, material, size…)</span></span>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((tag) => (
            <span key={tag} className="flex items-center gap-1 bg-accent-100 text-accent-800 text-[11px] px-2 py-0.5 rounded-full font-medium">
              {tag}
              <button type="button" onClick={() => toggle(tag)} className="text-accent-500 hover:text-accent-900 font-bold leading-none ml-0.5">×</button>
            </span>
          ))}
        </div>
      )}
      <div className="border border-brand-200 rounded-lg overflow-hidden divide-y divide-brand-100">
        {tagGroups.map((group) => {
          const isOpen = openGroups[group.label];
          const n = group.tags.filter((t) => selected.includes(t)).length;
          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => setOpenGroups((s) => ({ ...s, [group.label]: !s[group.label] }))}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-ink-700 hover:bg-brand-50 transition-colors text-left"
              >
                <span>{group.label}{n > 0 && <span className="ml-1.5 text-accent-600">({n})</span>}</span>
                <svg className={`w-3.5 h-3.5 text-ink-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isOpen && (
                <div className="px-3 py-2.5 bg-brand-50/50 flex flex-wrap gap-x-4 gap-y-2">
                  {group.tags.map((tag) => (
                    <label key={tag} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={selected.includes(tag)} onChange={() => toggle(tag)} className="w-3.5 h-3.5 accent-accent-600 rounded" />
                      <span className="text-xs text-ink-700">{tag}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <form onSubmit={addCustom} className="flex gap-2 mt-2">
        <input type="text" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Add custom tag…"
          className="flex-1 px-3 py-1.5 border border-brand-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent-500" />
        <button type="submit" className="px-3 py-1.5 bg-brand-100 hover:bg-brand-200 text-xs rounded-lg transition-colors font-medium">Add</button>
      </form>
    </div>
  );
}

function SelectWithCustom({ label, value, options, onChange, placeholder }) {
  const [customMode, setCustomMode] = useState(() => Boolean(value && !options.includes(value)));
  return (
    <div>
      <span className="block text-xs uppercase tracking-wider text-ink-600 mb-1">{label}</span>
      <select
        value={customMode ? "__custom" : value || ""}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "__custom") { setCustomMode(true); onChange(""); }
          else { setCustomMode(false); onChange(v); }
        }}
        className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
      >
        {options.map((o) => (
          <option key={o || "__none"} value={o}>{o || "— None —"}</option>
        ))}
        <option value="__custom">Other (type below)</option>
      </select>
      {customMode && (
        <input
          type="text"
          autoFocus
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1 w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      )}
    </div>
  );
}

// ----- Sizes picker (standard checkboxes + custom) -----
function SizesPicker({ value, onChange }) {
  const current = parseSizesInput(value);
  const standardSelected = current.filter((s) => SIZE_OPTIONS.includes(s));
  const custom = current.filter((s) => !SIZE_OPTIONS.includes(s));
  const [customInput, setCustomInput] = useState(custom.join(", "));

  function toggle(size) {
    const has = standardSelected.includes(size);
    const next = has ? standardSelected.filter((s) => s !== size) : [...standardSelected, size];
    const customs = customInput.split(",").map((s) => s.trim()).filter(Boolean);
    onChange([...next, ...customs].join(", "));
  }
  function setCustoms(v) {
    setCustomInput(v);
    const customs = v.split(",").map((s) => s.trim()).filter(Boolean);
    onChange([...standardSelected, ...customs].join(", "));
  }

  return (
    <div>
      <span className="block text-xs uppercase tracking-wider text-ink-600 mb-2">Sizes</span>
      <div className="flex flex-wrap gap-2 mb-2">
        {SIZE_OPTIONS.map((s) => {
          const active = standardSelected.includes(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => toggle(s)}
              className={`px-3 py-1.5 text-xs border rounded-lg transition-colors ${
                active ? "border-brand-950 bg-brand-950 text-white" : "border-brand-200 text-ink-700 hover:border-brand-950"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>
      <input
        type="text"
        value={customInput}
        onChange={(e) => setCustoms(e.target.value)}
        placeholder="Custom sizes (e.g. 6 Yards, Free Size) — comma separated"
        className="w-full px-3 py-2 border border-brand-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent-500"
      />
    </div>
  );
}

// ----- Colors picker (name + hex with native picker) -----
function ColorsPicker({ value, onChange }) {
  const items = Array.isArray(value) ? value : [];

  function update(idx, patch) {
    const next = items.map((it, i) => (i === idx ? { ...it, ...patch } : it));
    onChange(next);
  }
  function add() {
    onChange([...items, { name: "", hex: "#000000" }]);
  }
  function removeAt(idx) {
    onChange(items.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-ink-600">Colors</span>
        <button
          type="button"
          onClick={add}
          className="px-3 py-1 text-xs bg-brand-100 hover:bg-brand-200 rounded-lg"
        >
          + Add color
        </button>
      </div>
      {items.length === 0 ? (
        <div className="text-xs text-ink-500 italic border border-dashed border-brand-200 rounded-lg p-3">
          No colors yet. Click + Add color to choose one.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((c, i) => {
            const hex = /^#[0-9a-fA-F]{6}$/.test(c.hex || "") ? c.hex : "#000000";
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="relative w-10 h-10 rounded border border-brand-200 overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0" style={{ backgroundColor: hex }} />
                  <input
                    type="color"
                    value={hex}
                    onChange={(e) => update(i, { hex: e.target.value })}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title="Pick color"
                  />
                </div>
                <input
                  type="text"
                  value={c.name || ""}
                  onChange={(e) => update(i, { name: e.target.value })}
                  placeholder="Color name (e.g. Royal Blue)"
                  className="flex-1 px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <input
                  type="text"
                  value={c.hex || ""}
                  onChange={(e) => update(i, { hex: e.target.value })}
                  placeholder="#000000"
                  className="w-28 px-2 py-2 border border-brand-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
