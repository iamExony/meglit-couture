"use client";
import { useEffect, useState } from "react";

const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Citibank", code: "023" },
  { name: "EcoBank", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank (FCMB)", code: "214" },
  { name: "Globus Bank", code: "00103" },
  { name: "Guaranty Trust Bank (GTBank)", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Keystone Bank", code: "082" },
  { name: "Kuda Bank", code: "50211" },
  { name: "Moniepoint MFB", code: "50515" },
  { name: "Opay", code: "100004" },
  { name: "Palmpay", code: "100033" },
  { name: "Polaris Bank", code: "076" },
  { name: "Providus Bank", code: "101" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "SunTrust Bank", code: "100" },
  { name: "Titan Trust Bank", code: "102" },
  { name: "Union Bank", code: "032" },
  { name: "United Bank for Africa (UBA)", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "VFD MFB", code: "566" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
].sort((a, b) => a.name.localeCompare(b.name));

export default function VendorSettingsPage() {
  const [form, setForm] = useState({ bankName: "", bankCode: "", accountNumber: "", accountName: "" });
  const [hasDetails, setHasDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetch("/api/vendor/bank")
      .then((r) => r.json())
      .then((d) => {
        if (d.bankCode) setForm({ bankName: d.bankName, bankCode: d.bankCode, accountNumber: d.accountNumber, accountName: d.accountName });
        setHasDetails(d.hasDetails || false);
      })
      .finally(() => setLoading(false));
  }, []);

  function set(k, v) {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "bankCode") {
        const bank = NIGERIAN_BANKS.find((b) => b.code === v);
        if (bank) next.bankName = bank.name;
      }
      return next;
    });
  }

  async function save(e) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      const res = await fetch("/api/vendor/bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg({ type: "success", text: "Bank details saved. Payouts will be sent to this account." });
        setHasDetails(true);
      } else {
        setMsg({ type: "error", text: data.error || "Failed to save." });
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-6 h-6 border-2 border-brand-950 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="font-heading text-2xl font-bold text-brand-950 mb-1">Payout Settings</h1>
      <p className="text-ink-500 text-sm mb-8">
        Enter your bank details so Meglit can send your earnings automatically when orders are delivered.
      </p>

      {hasDetails && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 mb-6 rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Bank details are on file. You can update them below.
        </div>
      )}

      {msg && (
        <div className={`text-sm px-4 py-3 mb-6 rounded-lg border ${msg.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          {msg.text}
        </div>
      )}

      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-ink-700 uppercase tracking-wider mb-1.5">Bank</label>
          <select
            value={form.bankCode}
            onChange={(e) => set("bankCode", e.target.value)}
            className="w-full border border-brand-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:border-brand-950 transition-colors rounded-lg"
            required
          >
            <option value="">— Select your bank —</option>
            {NIGERIAN_BANKS.map((b) => (
              <option key={b.code} value={b.code}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-700 uppercase tracking-wider mb-1.5">
            Account Number <span className="text-ink-400 normal-case font-normal">(10 digits)</span>
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={10}
            value={form.accountNumber}
            onChange={(e) => set("accountNumber", e.target.value.replace(/\D/g, ""))}
            className="w-full border border-brand-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:border-brand-950 transition-colors rounded-lg font-mono tracking-wider"
            placeholder="0123456789"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-700 uppercase tracking-wider mb-1.5">
            Account Name <span className="text-ink-400 normal-case font-normal">(exactly as on your bank)</span>
          </label>
          <input
            type="text"
            value={form.accountName}
            onChange={(e) => set("accountName", e.target.value)}
            className="w-full border border-brand-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:border-brand-950 transition-colors rounded-lg"
            placeholder="John Doe"
            required
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-brand-950 text-white font-semibold text-sm py-3 rounded-lg hover:bg-brand-900 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Bank Details"}
          </button>
        </div>
      </form>

      <div className="mt-8 bg-brand-50 border border-brand-100 rounded-lg p-4 text-sm text-ink-600">
        <p className="font-semibold text-ink-800 mb-1">How payouts work</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Customer places and pays for an order containing your product.</li>
          <li>Meglit ships the order and marks it as delivered.</li>
          <li>Your share (sale minus {" "}Meglit's commission) is automatically transferred to this account.</li>
          <li>You'll see the payout reflected in your Payouts page.</li>
        </ol>
      </div>
    </div>
  );
}
