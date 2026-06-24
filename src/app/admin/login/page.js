"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const from = search.get("from") || "/admin";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError("");
  }, [username, password]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Login failed");
        return;
      }
      router.replace(from);
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-brand-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-brand-100 p-8">
        <div className="text-center mb-6">
          <div className="font-heading text-2xl font-bold text-brand-950 tracking-[0.08em]">MEGLIT</div>
          <div className="text-[10px] tracking-[0.35em] text-accent-600 uppercase font-medium mt-0.5">Admin Sign-in</div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-600 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2.5 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-600 mb-1">Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2.5 border border-brand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-950 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-brand-900 transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-[11px] text-ink-400 text-center mt-6">
          Use the credentials set in your <code>.env.local</code> file.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
