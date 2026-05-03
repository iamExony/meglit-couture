"use client";
import { useEffect, useRef, useState } from "react";

export default function MessagesPage() {
  const [me, setMe] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [thread, setThread] = useState(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  async function loadShell() {
    const [meRes, contactsRes, threadsRes] = await Promise.all([
      fetch("/api/admin/me"),
      fetch("/api/admin/messages/contacts"),
      fetch("/api/admin/messages"),
    ]);
    if (meRes.ok) setMe((await meRes.json()).user);
    if (contactsRes.ok) setContacts((await contactsRes.json()).contacts || []);
    if (threadsRes.ok) setThreads((await threadsRes.json()).threads || []);
  }

  async function loadThread(id) {
    if (!id) { setThread(null); return; }
    const res = await fetch(`/api/admin/messages?with=${id}`);
    if (res.ok) {
      setThread(await res.json());
      // Refresh thread sidebar to clear unread
      const t = await fetch("/api/admin/messages");
      if (t.ok) setThreads((await t.json()).threads || []);
    }
  }

  useEffect(() => { loadShell(); }, []);
  useEffect(() => { loadThread(activeId); }, [activeId]);

  // Poll active thread for new messages
  useEffect(() => {
    if (!activeId) return;
    const t = setInterval(() => loadThread(activeId), 5000);
    return () => clearInterval(t);
  }, [activeId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [thread]);

  async function send(e) {
    e.preventDefault();
    if (!body.trim() || !activeId) return;
    setSending(true);
    try {
      const res = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toId: activeId, body }),
      });
      if (res.ok) {
        setBody("");
        await loadThread(activeId);
      }
    } finally {
      setSending(false);
    }
  }

  // Build sidebar: union of threads + contacts (so you can start a new one)
  const threadIds = new Set(threads.map((t) => t.user.id));
  const sidebar = [
    ...threads.map((t) => ({ user: t.user, lastMessage: t.lastMessage, unread: t.unread })),
    ...contacts.filter((c) => !threadIds.has(c.id)).map((c) => ({ user: c, lastMessage: null, unread: 0 })),
  ];

  return (
    <div className="bg-white border border-brand-100 rounded-xl overflow-hidden h-[calc(100vh-180px)] flex">
      {/* Sidebar */}
      <div className="w-72 border-r border-brand-100 flex flex-col">
        <div className="px-4 py-3 border-b border-brand-100 text-xs uppercase tracking-wider text-ink-500">
          Conversations
        </div>
        <div className="flex-1 overflow-y-auto">
          {sidebar.length === 0 && <div className="p-6 text-center text-ink-500 text-sm">No contacts.</div>}
          {sidebar.map((s) => (
            <button
              key={s.user.id}
              onClick={() => setActiveId(s.user.id)}
              className={`w-full text-left px-4 py-3 border-b border-brand-50 hover:bg-brand-50 ${
                activeId === s.user.id ? "bg-brand-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center font-semibold text-xs uppercase shrink-0">
                  {(s.user.name || s.user.username).slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-brand-950 truncate">{s.user.name || s.user.username}</div>
                    {s.unread > 0 && (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">{s.unread}</span>
                    )}
                  </div>
                  <div className="text-xs text-ink-500 truncate">
                    {s.lastMessage ? s.lastMessage.body : <span className="italic">No messages yet</span>}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeId || !thread ? (
          <div className="flex-1 flex items-center justify-center text-ink-500 text-sm">
            {activeId ? "Loading..." : "Select a conversation."}
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-brand-100">
              <div className="font-medium text-brand-950">{thread.partner.name || thread.partner.username}</div>
              <div className="text-xs text-ink-500 capitalize">{thread.partner.role}</div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-brand-50/40">
              {thread.messages.length === 0 && (
                <div className="text-center text-ink-500 text-sm py-8">No messages yet. Say hello.</div>
              )}
              {thread.messages.map((m) => {
                const mine = m.fromId === me?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                      mine ? "bg-accent-600 text-white rounded-br-sm" : "bg-white border border-brand-100 text-ink-950 rounded-bl-sm"
                    }`}>
                      <div className="whitespace-pre-wrap break-words">{m.body}</div>
                      <div className={`text-[10px] mt-1 ${mine ? "text-white/70" : "text-ink-500"}`}>
                        {new Date(m.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={send} className="p-3 border-t border-brand-100 flex gap-2">
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
              <button
                type="submit"
                disabled={sending || !body.trim()}
                className="bg-accent-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-700 disabled:opacity-60"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
