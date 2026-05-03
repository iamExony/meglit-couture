import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
export const send = mutation({
    args: { fromId: v.id("users"), toId: v.id("users"), body: v.string() },
    handler: async (ctx, { fromId, toId, body }) => {
        const trimmed = body.trim();
        if (!trimmed)
            throw new Error("Empty body");
        const id = await ctx.db.insert("messages", {
            fromId,
            toId,
            body: trimmed,
            createdAt: Date.now(),
            readBy: [fromId],
        });
        return await ctx.db.get(id);
    },
});
export const thread = query({
    args: { userId: v.id("users"), partnerId: v.id("users") },
    handler: async (ctx, { userId, partnerId }) => {
        const all = await ctx.db.query("messages").collect();
        return all
            .filter((m) => (m.fromId === userId && m.toId === partnerId) ||
            (m.fromId === partnerId && m.toId === userId))
            .sort((a, b) => a.createdAt - b.createdAt);
    },
});
export const threadsForUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const all = await ctx.db.query("messages").collect();
        const partners = new Map();
        for (const m of all) {
            const partnerId = m.fromId === userId ? m.toId : m.toId === userId ? m.fromId : null;
            if (!partnerId)
                continue;
            const key = partnerId.toString();
            const existing = partners.get(key) || { partnerId, lastMessage: null, unread: 0 };
            if (!existing.lastMessage ||
                m.createdAt > existing.lastMessage.createdAt) {
                existing.lastMessage = m;
            }
            if (m.toId === userId && !m.readBy.includes(userId))
                existing.unread += 1;
            partners.set(key, existing);
        }
        const result = [];
        for (const t of partners.values()) {
            const partner = await ctx.db.get(t.partnerId);
            if (partner) {
                const { passwordHash, salt, ...pub } = partner;
                result.push({ user: pub, lastMessage: t.lastMessage, unread: t.unread });
            }
        }
        result.sort((a, b) => (b.lastMessage?.createdAt || 0) - (a.lastMessage?.createdAt || 0));
        return result;
    },
});
export const markThreadRead = mutation({
    args: { userId: v.id("users"), partnerId: v.id("users") },
    handler: async (ctx, { userId, partnerId }) => {
        const all = await ctx.db.query("messages").collect();
        for (const m of all) {
            if (m.fromId === partnerId && m.toId === userId && !m.readBy.includes(userId)) {
                await ctx.db.patch(m._id, { readBy: [...m.readBy, userId] });
            }
        }
    },
});
export const unreadCount = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const all = await ctx.db.query("messages").collect();
        return all.filter((m) => m.toId === userId && !m.readBy.includes(userId)).length;
    },
});
