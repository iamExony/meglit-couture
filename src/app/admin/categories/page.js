"use client";
import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | category
  const [form, setForm] = useState({ name: "", description: "", subcategories: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCats(data.categories || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setForm({ name: "", description: "", subcategories: "" });
    setEditing("new");
  }

  function openEdit(c) {
    setForm({
      name: c.name || "",
      description: c.description || "",
      subcategories: Array.isArray(c.subcategories) ? c.subcategories.join(", ") : "",
    });
    setEditing(c);
  }

  function close() {
    setEditing(null);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const subcategories = form.subcategories
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      if (editing === "new") {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, description: form.description, subcategories }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Failed to create");
          return;
        }
      } else {
        const res = await fetch(`/api/admin/categories/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, description: form.description, subcategories }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Failed to update");
          return;
        }
      }
      await load();
      close();
    } finally {
      setSaving(false);
    }
  }

  async function remove(c) {
    if (!confirm(`Delete category "${c.name}"? Existing products will keep their category value.`)) return;
    await fetch(`/api/admin/categories/${c._id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-950">Categories</h1>
          <p className="text-sm text-ink-500">Define categories and subcategories for products.</p>
        </div>
        <button
          onClick={openNew}
          className="bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-700"
        >
          + New Category
        </button>
      </div>

      <div className="bg-white border border-brand-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-ink-500">Loading...</div>
        ) : cats.length === 0 ? (
          <div className="p-6 text-ink-500 text-sm">No categories yet. Create one to get started.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-brand-50">
              <tr className="text-left text-xs uppercase tracking-wider text-ink-600">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Subcategories</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c._id} className="border-t border-brand-100 hover:bg-brand-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-950">{c.name}</div>
                    {c.description && <div className="text-xs text-ink-500 mt-0.5">{c.description}</div>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-600">{c.slug}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(c.subcategories || []).map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 bg-brand-100 text-brand-950 rounded">
                          {s}
                        </span>
                      ))}
                      {(!c.subcategories || c.subcategories.length === 0) && (
                        <span className="text-xs text-ink-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(c)} className="text-accent-700 hover:underline text-xs mr-3">Edit</button>
                    <button onClick={() => remove(c)} className="text-red-600 hover:underline text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto"
          onClick={close}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100">
              <h2 className="font-heading text-lg font-semibold text-brand-950">
                {editing === "new" ? "New Category" : `Edit: ${editing.name}`}
              </h2>
              <button onClick={close} className="text-ink-500 hover:text-ink-950">✕</button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <label className="block">
                <span className="block text-xs uppercase tracking-wider text-ink-600 mb-1">Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </label>
              <label className="block">
                <span className="block text-xs uppercase tracking-wider text-ink-600 mb-1">Description (optional)</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </label>
              <label className="block">
                <span className="block text-xs uppercase tracking-wider text-ink-600 mb-1">
                  Subcategories (comma separated)
                </span>
                <input
                  type="text"
                  value={form.subcategories}
                  onChange={(e) => setForm({ ...form, subcategories: e.target.value })}
                  placeholder="e.g. Sets, Tops, Trousers"
                  className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-brand-100">
                <button type="button" onClick={close} className="px-4 py-2 text-sm text-ink-700 hover:bg-brand-50 rounded-lg">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-brand-950 text-white text-sm rounded-lg hover:bg-brand-900 disabled:opacity-60"
                >
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
