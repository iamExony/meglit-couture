"use client";
import { useEffect, useState } from "react";
import PasswordInput from "@/components/PasswordInput";

const EMPTY = { username: "", name: "", email: "", role: "staff", password: "", active: true };

export default function StaffPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | "new" | user
  const [form, setForm] = useState(EMPTY);
  const [pwTarget, setPwTarget] = useState(null);
  const [pwValue, setPwValue] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/staff");
    if (res.ok) {
      const d = await res.json();
      setUsers(d.users || []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setForm(EMPTY);
    setError("");
    setEditing("new");
  }

  function openEdit(u) {
    setForm({ ...EMPTY, ...u, password: "" });
    setError("");
    setEditing(u);
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      let res;
      if (editing === "new") {
        res = await fetch("/api/admin/staff", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch(`/api/admin/staff/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, role: form.role, active: form.active }),
        });
      }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Failed");
        return;
      }
      await load();
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u) {
    await fetch(`/api/admin/staff/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !u.active }),
    });
    await load();
  }

  async function remove(u) {
    if (!confirm(`Permanently delete "${u.username}"?`)) return;
    const res = await fetch(`/api/admin/staff/${u.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Delete failed");
    }
    await load();
  }

  async function changePassword(e) {
    e.preventDefault();
    if (!pwTarget) return;
    const res = await fetch(`/api/admin/staff/${pwTarget.id}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwValue }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Failed");
      return;
    }
    setPwTarget(null);
    setPwValue("");
    alert("Password updated.");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={openNew} className="bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-700">
          + Add Staff
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
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-brand-100 hover:bg-brand-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-brand-950">{u.name || u.username}</div>
                      <div className="text-xs text-ink-500">@{u.username}</div>
                    </td>
                    <td className="px-4 py-3 text-ink-700">{u.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs capitalize font-medium ${
                        u.role === "admin" ? "bg-accent-100 text-accent-800" : "bg-blue-100 text-blue-700"
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        u.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>{u.active ? "Active" : "Inactive"}</span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap text-xs">
                      <button onClick={() => openEdit(u)} className="text-accent-700 hover:underline mr-3">Edit</button>
                      <button onClick={() => { setPwTarget(u); setPwValue(""); }} className="text-blue-700 hover:underline mr-3">Password</button>
                      <button onClick={() => toggleActive(u)} className="text-amber-700 hover:underline mr-3">
                        {u.active ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => remove(u)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-ink-500">No users.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <Modal title={editing === "new" ? "New Staff" : `Edit: ${editing.username}`} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="p-6 space-y-4">
            <Field label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} required disabled={editing !== "new"} />
            <Field label="Display Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-ink-600 mb-1">Role</span>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            {editing === "new" && (
              <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Active
            </label>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex justify-end gap-3 pt-3 border-t border-brand-100">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-ink-700 hover:bg-brand-50 rounded-lg">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-brand-950 text-white text-sm rounded-lg hover:bg-brand-900 disabled:opacity-60">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {pwTarget && (
        <Modal title={`Reset password for @${pwTarget.username}`} onClose={() => setPwTarget(null)}>
          <form onSubmit={changePassword} className="p-6 space-y-4">
            <Field label="New password" type="password" value={pwValue} onChange={setPwValue} required />
            <div className="flex justify-end gap-3 pt-3 border-t border-brand-100">
              <button type="button" onClick={() => setPwTarget(null)} className="px-4 py-2 text-sm text-ink-700 hover:bg-brand-50 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-brand-950 text-white text-sm rounded-lg hover:bg-brand-900">Update</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-100">
          <h2 className="font-heading text-lg font-semibold text-brand-950">{title}</h2>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-950">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, disabled }) {
  const inputClass = "w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:bg-brand-50";
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-ink-600 mb-1">{label}</span>
      {type === "password" ? (
        <PasswordInput
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className={inputClass}
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          className={inputClass}
        />
      )}
    </label>
  );
}
