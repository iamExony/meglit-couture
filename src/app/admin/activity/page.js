"use client";
import { useEffect, useState } from "react";

const ACTION_LABELS = {
  "auth.login": "logged in",
  "product.create": "created product",
  "product.update": "updated product",
  "product.delete": "deleted product",
  "order.status": "changed order status",
  "purchase.create": "recorded purchase",
  "purchase.delete": "reversed purchase",
  "user.create": "created user",
  "user.update": "updated user",
  "user.delete": "deleted user",
  "user.password": "changed password for",
};

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actorFilter, setActorFilter] = useState("");

  async function load() {
    setLoading(true);
    const url = actorFilter ? `/api/admin/activity?actor=${encodeURIComponent(actorFilter)}` : "/api/admin/activity";
    const res = await fetch(url);
    if (res.ok) {
      const d = await res.json();
      setActivities(d.activities || []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [actorFilter]);

  const actors = Array.from(new Set(activities.map((a) => a.actor)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs uppercase tracking-wider text-ink-500">Filter:</span>
        <button
          onClick={() => setActorFilter("")}
          className={`px-3 py-1 rounded-full text-xs ${actorFilter === "" ? "bg-brand-950 text-white" : "bg-white border border-brand-200 text-ink-700"}`}
        >
          All
        </button>
        {actors.map((a) => (
          <button
            key={a}
            onClick={() => setActorFilter(a)}
            className={`px-3 py-1 rounded-full text-xs ${actorFilter === a ? "bg-brand-950 text-white" : "bg-white border border-brand-200 text-ink-700"}`}
          >
            @{a}
          </button>
        ))}
      </div>

      <div className="bg-white border border-brand-100 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-ink-500">Loading...</div>
        ) : activities.length === 0 ? (
          <div className="p-6 text-center text-ink-500">No activity yet.</div>
        ) : (
          <ul className="divide-y divide-brand-100">
            {activities.map((a) => (
              <li key={a.id} className="px-4 py-3 flex items-start gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center font-semibold text-xs uppercase shrink-0">
                  {a.actor.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div>
                    <span className="font-medium text-brand-950">@{a.actor}</span>{" "}
                    <span className="text-ink-700">{ACTION_LABELS[a.action] || a.action}</span>
                    {a.target && <span className="text-ink-950 font-medium"> {a.target}</span>}
                  </div>
                  {a.meta && (
                    <div className="text-xs text-ink-500 mt-0.5 font-mono truncate">{JSON.stringify(a.meta)}</div>
                  )}
                </div>
                <div className="text-xs text-ink-500 whitespace-nowrap">{new Date(a.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
