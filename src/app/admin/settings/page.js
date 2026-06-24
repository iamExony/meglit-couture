"use client";
import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
  const [commission, setCommission] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        const rate = data.settings?.vendor_commission_rate;
        setCommission(rate !== undefined ? String(Math.round(rate * 100)) : "15");
      })
      .catch(() => setCommission("15"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    const pct = parseFloat(commission);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      setError("Enter a number between 0 and 100.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "vendor_commission_rate", value: pct / 100 }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-heading font-bold text-brand-950 mb-1">Settings</h1>
      <p className="text-ink-500 text-sm mb-8">Platform-wide configuration for Meglit Couture.</p>

      <div className="bg-white border border-brand-100 rounded-lg divide-y divide-brand-100">
        {/* Commission Rate */}
        <div className="p-6">
          <h2 className="text-sm font-semibold text-ink-800 mb-1">Vendor Commission Rate</h2>
          <p className="text-xs text-ink-500 mb-4">
            Meglit's cut of every vendor sale. Vendors receive{" "}
            <span className="font-medium text-ink-700">
              {commission ? `${Math.round(100 - parseFloat(commission))}%` : "—"}
            </span>{" "}
            of each sale price, and Meglit keeps{" "}
            <span className="font-medium text-accent-700">
              {commission ? `${commission}%` : "—"}
            </span>.
          </p>
          {loading ? (
            <div className="w-5 h-5 border-2 border-brand-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <form onSubmit={handleSave} className="flex items-end gap-4">
              <div>
                <label className="text-[11px] font-semibold text-ink-700 uppercase tracking-wider block mb-2">
                  Commission (%)
                </label>
                <div className="flex items-center border border-brand-200 bg-brand-50 rounded overflow-hidden w-32">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={commission}
                    onChange={(e) => { setCommission(e.target.value); setSaved(false); }}
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm text-ink-900 outline-none"
                  />
                  <span className="px-3 text-ink-400 text-sm font-medium">%</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="bg-brand-950 text-white text-xs font-semibold uppercase tracking-wider px-6 py-2.5 rounded hover:bg-brand-800 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              {saved && (
                <span className="text-xs text-green-700 font-medium">Saved!</span>
              )}
            </form>
          )}
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>

        {/* Example — payout preview */}
        {commission && !isNaN(parseFloat(commission)) && (
          <div className="p-6 bg-brand-50">
            <p className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider mb-3">Payout Preview</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[5000, 15000, 50000].map((price) => {
                const rate = parseFloat(commission) / 100;
                const vendor = price * (1 - rate);
                const meglit = price * rate;
                return (
                  <div key={price} className="bg-white border border-brand-100 rounded p-3">
                    <p className="text-[11px] text-ink-400 mb-1">Sale: ₦{price.toLocaleString()}</p>
                    <p className="text-xs font-semibold text-green-700">Vendor: ₦{vendor.toLocaleString()}</p>
                    <p className="text-xs font-semibold text-accent-700">Meglit: ₦{meglit.toLocaleString()}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
