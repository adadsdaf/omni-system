import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, productsTable, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/reports/sales", async (req, res) => {
  try {
    const { from, to } = req.query;
    let orders = await db.select().from(ordersTable).where(eq(ordersTable.status, "paid"));

    if (from) orders = orders.filter((o) => new Date(o.createdAt) >= new Date(String(from)));
    if (to) orders = orders.filter((o) => new Date(o.createdAt) <= new Date(String(to)));

    const totalRevenue = orders.reduce((a, o) => a + Number(o.total), 0);
    const totalDiscount = orders.reduce((a, o) => a + Number(o.discount), 0);
    const totalTax = orders.reduce((a, o) => a + Number(o.tax), 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    const byPaymentMethod: Record<string, { count: number; total: number }> = {};
    const byOrderType: Record<string, { count: number; total: number }> = {};

    for (const o of orders) {
      const pm = o.paymentMethod ?? "cash";
      if (!byPaymentMethod[pm]) byPaymentMethod[pm] = { count: 0, total: 0 };
      byPaymentMethod[pm].count++;
      byPaymentMethod[pm].total += Number(o.total);

      if (!byOrderType[o.type]) byOrderType[o.type] = { count: 0, total: 0 };
      byOrderType[o.type].count++;
      byOrderType[o.type].total += Number(o.total);
    }

    res.json({
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders: orders.length,
      totalDiscount: Number(totalDiscount.toFixed(2)),
      totalTax: Number(totalTax.toFixed(2)),
      averageOrderValue: Number(averageOrderValue.toFixed(2)),
      byPaymentMethod: Object.entries(byPaymentMethod).map(([method, data]) => ({
        method,
        count: data.count,
        total: Number(data.total.toFixed(2)),
      })),
      byOrderType: Object.entries(byOrderType).map(([type, data]) => ({
        type,
        count: data.count,
        total: Number(data.total.toFixed(2)),
      })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reports/products", async (req, res) => {
  try {
    const { from, to } = req.query;
    let items = await db.select().from(orderItemsTable);
    const products = await db.select({ product: productsTable, categoryName: categoriesTable.nameAr })
      .from(productsTable).leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id));

    const grouped: Record<number, { totalSold: number; totalRevenue: number; prices: number[] }> = {};
    for (const item of items) {
      if (!grouped[item.productId]) grouped[item.productId] = { totalSold: 0, totalRevenue: 0, prices: [] };
      grouped[item.productId].totalSold += item.quantity;
      grouped[item.productId].totalRevenue += Number(item.totalPrice);
      grouped[item.productId].prices.push(Number(item.unitPrice));
    }

    const result = Object.entries(grouped)
      .map(([pid, data]) => {
        const found = products.find((p) => p.product.id === Number(pid));
        if (!found) return null;
        return {
          id: found.product.id,
          name: found.product.name,
          nameAr: found.product.nameAr,
          categoryName: found.categoryName ?? "",
          totalSold: data.totalSold,
          totalRevenue: Number(data.totalRevenue.toFixed(2)),
          averagePrice: Number((data.prices.reduce((a, b) => a + b, 0) / data.prices.length).toFixed(2)),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.totalRevenue - a!.totalRevenue);

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
