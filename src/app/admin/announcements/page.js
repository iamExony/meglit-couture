"use client";
import { useEffect, useState } from "react";

const TYPES = [
  { value: "free-delivery", label: "Free Delivery", color: "bg-green-100 text-green-700" },
  { value: "flash-sale",    label: "Flash Sale",    color: "bg-red-100 text-red-700" },
  { value: "promo",         label: "Promo",         color: "bg-accent-100 text-accent-700" },
  { value: "general",       label: "General",       color: "bg-brand-100 text-brand-700" },
];

const EMPTY = { message: "", code: "", type: "general" };

function typeMeta(type) {
  return TYPES.find((t) => t.value === type) || TYPES[3];
}

export default function AnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "new" | announcement object
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/announcements");
    const data = await res.json();
    setItems(data.announcements || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setForm(EMPTY);
    setModal("new");
  }

  function openEdit(ann) {
    setForm({ message: ann.message || "", code: ann.code || "", type: ann.type || "general" });
    setModal(ann);
  }

  function close() { setModal(null); }

  async function save(e) {
    e.preventDefault();
    if (!form.message.trim()) return;
    setSaving(true);
    try {
      const body = { message: form.message.trim(), code: form.code.trim() || undefined, type: form.type };
      if (modal === "new") {
        await fetch("/api/admin/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await fetch(`/api/admin/announcements/${modal._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      await load();
      close();
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(ann) {
    setToggling(ann._id);
    try {
      await fetch(`/api/admin/announcements/${ann._id}`, { method: "PATCH" });
      await load();
    } finally {
      setToggling(null);
    }
  }

  async function del(ann) {
    if (!confirm(`Delete "${ann.message}"?`)) return;
    setDeleting(ann._id);
    try {
      await fetch(`/api/admin/announcements/${ann._id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((i) => i._id !== ann._id));
    } finally {
      setDeleting(null);
    }
  }

  const published = items.find((i) => i.isPublished);

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-brand-950">Announcement Bar</h2>
          <p className="text-sm text-ink-400 mt-0.5">Manage the promotional banner shown at the top of every page.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-brand-950 text-white px-4 py-2 text-sm font-medium hover:bg-brand-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Announcement
        </button>
      </div>

      {/* Live preview */}
      {published && (
        <div className="bg-brand-950 text-white text-center py-2.5 text-[11px] tracking-[0.15em] uppercase mb-6 rounded">
          {published.message}
          {published.code && (
            <> &mdash; Code: <span className="text-accent-400 font-semibold">{published.code}</span></>
          )}
        </div>
      )}

      {/* Info note */}
      <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded p-3 mb-6 text-sm text-blue-800">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Only <strong className="mx-1">one</strong> announcement can be published at a time. Publishing a new one automatically unpublishes the current one.
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-ink-400">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-ink-400 border border-dashed border-brand-200 rounded">
          No announcements yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((ann) => {
            const meta = typeMeta(ann.type);
            const isToggling = toggling === ann._id;
            const isDeleting = deleting === ann._id;
            return (
              <div
                key={ann._id}
                className={`bg-white border rounded-lg p-4 flex items-start gap-4 transition-all ${
                  ann.isPublished ? "border-accent-300 shadow-sm" : "border-brand-100"
                }`}
              >
                {/* Published indicator */}
                <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${ann.isPublished ? "bg-green-500" : "bg-brand-200"}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.color}`}>
                      {meta.label}
                    </span>
                    {ann.isPublished && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-brand-950 truncate">{ann.message}</p>
                  {ann.code && (
                    <p className="text-xs text-ink-400 mt-0.5">
                      Code: <span className="font-mono font-semibold text-accent-600">{ann.code}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Publish / Unpublish */}
                  <button
                    onClick={() => togglePublish(ann)}
                    disabled={isToggling}
                    className={`text-[11px] font-semibold px-3 py-1.5 rounded transition-colors ${
                      ann.isPublished
                        ? "bg-brand-100 text-brand-800 hover:bg-brand-200"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {isToggling ? "…" : ann.isPublished ? "Unpublish" : "Publish"}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(ann)}
                    className="p-1.5 text-ink-400 hover:text-brand-950 transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => del(ann)}
                    disabled={isDeleting}
                    className="p-1.5 text-ink-300 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100">
              <h3 className="font-heading text-base font-semibold text-brand-950">
                {modal === "new" ? "New Announcement" : "Edit Announcement"}
              </h3>
              <button onClick={close} className="text-ink-400 hover:text-brand-950">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={save} className="p-6 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-xs font-semibold text-ink-700 uppercase tracking-wider mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                      className={`px-3 py-2 text-xs font-semibold rounded border transition-all text-left ${
                        form.type === t.value
                          ? "border-brand-950 bg-brand-950 text-white"
                          : "border-brand-200 text-ink-600 hover:border-brand-400"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-ink-700 uppercase tracking-wider mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="e.g. Free delivery on orders over ₦50,000"
                  required
                  className="w-full border border-brand-200 px-3 py-2 text-sm focus:outline-none focus:border-brand-950 rounded"
                />
                <p className="text-[11px] text-ink-400 mt-1">This text appears in the announcement bar at the top of every page.</p>
              </div>

              {/* Code */}
              <div>
                <label className="block text-xs font-semibold text-ink-700 uppercase tracking-wider mb-1.5">
                  Promo Code <span className="text-ink-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. MEGLIT10"
                  className="w-full border border-brand-200 px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-950 rounded"
                />
              </div>

              {/* Preview */}
              {form.message && (
                <div>
                  <p className="text-[11px] text-ink-400 uppercase tracking-wider font-semibold mb-1.5">Preview</p>
                  <div className="bg-brand-950 text-white text-center py-2 text-[11px] tracking-[0.15em] uppercase rounded">
                    {form.message}
                    {form.code && (
                      <> &mdash; Code: <span className="text-accent-400 font-semibold">{form.code}</span></>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={close}
                  className="flex-1 border border-brand-200 text-ink-700 py-2 text-sm font-medium hover:bg-brand-50 transition-colors rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.message.trim()}
                  className="flex-1 bg-brand-950 text-white py-2 text-sm font-medium hover:bg-brand-800 transition-colors disabled:opacity-50 rounded"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
