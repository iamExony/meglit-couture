import { query } from "./_generated/server";
export const overview = query({
    args: {},
    handler: async (ctx) => {
        const products = await ctx.db.query("products").collect();
        const orders = await ctx.db.query("orders").collect();
        const purchases = await ctx.db.query("purchases").collect();
        const validOrders = orders.filter((o) => o.status !== "cancelled" && o.status !== "refunded");
        const totalRevenue = validOrders.reduce((s, o) => s + (o.total || 0), 0);
        const totalCost = purchases.reduce((s, p) => s + (p.total || 0), 0);
        const profit = totalRevenue - totalCost;
        const ordersByStatus = {};
        for (const o of orders)
            ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;
        const salesByDay = {};
        for (const o of validOrders) {
            const day = new Date(o.createdAt).toISOString().slice(0, 10);
            salesByDay[day] = (salesByDay[day] || 0) + (o.total || 0);
        }
        const productSales = {};
        for (const o of validOrders) {
            for (const item of o.items || []) {
                const key = String(item.productId ?? item.name);
                if (!productSales[key])
                    productSales[key] = { name: item.name, qty: 0, revenue: 0 };
                productSales[key].qty += item.quantity;
                productSales[key].revenue += item.price * item.quantity;
            }
        }
        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
        const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
        return {
            totals: {
                revenue: totalRevenue,
                cost: totalCost,
                profit,
                orders: orders.length,
                products: products.length,
                lowStock,
            },
            ordersByStatus,
            salesByDay,
            topProducts,
        };
    },
});
