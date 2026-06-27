import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, customersTable, productsTable, tablesTable } from "@workspace/db";
import { eq, count, sum, desc, and, gte, lt } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const allOrders = await db.select().from(ordersTable);
    const paidOrders = allOrders.filter((o) => o.status === "paid");
    const todayOrders = allOrders.filter((o) => new Date(o.createdAt) >= todayStart);
    const todayPaid = todayOrders.filter((o) => o.status === "paid");
    const weekPaid = paidOrders.filter((o) => new Date(o.createdAt) >= weekStart);
    const monthPaid = paidOrders.filter((o) => new Date(o.createdAt) >= monthStart);

    const todaySales = todayPaid.reduce((a, o) => a + Number(o.total), 0);
    const weekSales = weekPaid.reduce((a, o) => a + Number(o.total), 0);
    const monthSales = monthPaid.reduce((a, o) => a + Number(o.total), 0);
    const totalSales = paidOrders.reduce((a, o) => a + Number(o.total), 0);
    const averageOrderValue = paidOrders.length > 0 ? totalSales / paidOrders.length : 0;

    const [{ cnt: totalCustomers }] = await db.select({ cnt: count() }).from(customersTable);
    const [{ cnt: totalProducts }] = await db.select({ cnt: count() }).from(productsTable);
    const tables = await db.select().from(tablesTable);
    const occupiedTables = tables.filter((t) => t.status === "occupied").length;
    const pendingOrders = allOrders.filter((o) => ["pending", "confirmed", "preparing"].includes(o.status)).length;

    res.json({
      todaySales: Number(todaySales.toFixed(2)),
      todayOrders: todayOrders.length,
      totalCustomers: Number(totalCustomers),
      totalProducts: Number(totalProducts),
      occupiedTables,
      totalTables: tables.length,
      pendingOrders,
      monthSales: Number(monthSales.toFixed(2)),
      weekSales: Number(weekSales.toFixed(2)),
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/sales-chart", async (req, res) => {
  try {
    const period = String(req.query.period ?? "daily");
    const allOrders = await db.select().from(ordersTable).where(eq(ordersTable.status, "paid"));
    const now = new Date();
    const result: Array<{ label: string; value: number; orders: number }> = [];

    if (period === "daily") {
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
        const dayOrders = allOrders.filter((o) => new Date(o.createdAt) >= day && new Date(o.createdAt) < dayEnd);
        const label = day.toLocaleDateString("ar-SA", { weekday: "short" });
        result.push({ label, value: Number(dayOrders.reduce((a, o) => a + Number(o.total), 0).toFixed(2)), orders: dayOrders.length });
      }
    } else if (period === "weekly") {
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (i * 7));
        const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((i - 1) * 7));
        const weekOrders = allOrders.filter((o) => new Date(o.createdAt) >= weekStart && new Date(o.createdAt) < weekEnd);
        result.push({ label: `أسبوع ${8 - i}`, value: Number(weekOrders.reduce((a, o) => a + Number(o.total), 0).toFixed(2)), orders: weekOrders.length });
      }
    } else if (period === "monthly") {
      for (let i = 11; i >= 0; i--) {
        const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const mOrders = allOrders.filter((o) => new Date(o.createdAt) >= m && new Date(o.createdAt) < mEnd);
        const label = m.toLocaleDateString("ar-SA", { month: "short" });
        result.push({ label, value: Number(mOrders.reduce((a, o) => a + Number(o.total), 0).toFixed(2)), orders: mOrders.length });
      }
    } else {
      for (let i = 4; i >= 0; i--) {
        const year = now.getFullYear() - i;
        const yOrders = allOrders.filter((o) => new Date(o.createdAt).getFullYear() === year);
        result.push({ label: String(year), value: Number(yOrders.reduce((a, o) => a + Number(o.total), 0).toFixed(2)), orders: yOrders.length });
      }
    }

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/top-products", async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const items = await db.select().from(orderItemsTable);
    const products = await db.select().from(productsTable);

    const grouped: Record<number, { totalSold: number; totalRevenue: number }> = {};
    for (const item of items) {
      if (!grouped[item.productId]) grouped[item.productId] = { totalSold: 0, totalRevenue: 0 };
      grouped[item.productId].totalSold += item.quantity;
      grouped[item.productId].totalRevenue += Number(item.totalPrice);
    }

    const result = Object.entries(grouped)
      .map(([pid, data]) => {
        const product = products.find((p) => p.id === Number(pid));
        if (!product) return null;
        return { id: product.id, name: product.name, totalSold: data.totalSold, totalRevenue: Number(data.totalRevenue.toFixed(2)), categoryName: "" };
      })
      .filter(Boolean)
      .sort((a, b) => b!.totalSold - a!.totalSold)
      .slice(0, limit);

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/recent-orders", async (req, res) => {
  try {
    const limit = Number(req.query.limit ?? 10);
    const rows = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(limit);
    const result = rows.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      discount: Number(o.discount),
      tax: Number(o.tax),
      total: Number(o.total),
      tableName: null,
      customerName: null,
      items: [],
    }));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
