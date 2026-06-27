import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, tablesTable, customersTable, productsTable } from "@workspace/db";
import { eq, and, desc, inArray } from "drizzle-orm";

const router = Router();

async function buildOrderResponse(order: typeof ordersTable.$inferSelect) {
  const items = await db.select().from(orderItemsTable).where(eq(orderItemsTable.orderId, order.id));
  let tableName: string | null = null;
  let customerName: string | null = null;
  if (order.tableId) {
    const [t] = await db.select().from(tablesTable).where(eq(tablesTable.id, order.tableId));
    tableName = t?.name ?? null;
  }
  if (order.customerId) {
    const [c] = await db.select().from(customersTable).where(eq(customersTable.id, order.customerId));
    customerName = c?.name ?? null;
  }
  return {
    ...order,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    tax: Number(order.tax),
    total: Number(order.total),
    tableName,
    customerName,
    items: items.map((i) => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      totalPrice: Number(i.totalPrice),
    })),
  };
}

function generateOrderNumber() {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

router.get("/orders", async (req, res) => {
  try {
    const { status, type, date } = req.query;
    let rows = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    if (status) rows = rows.filter((o) => o.status === status);
    if (type) rows = rows.filter((o) => o.type === type);
    if (date) {
      const d = new Date(String(date));
      rows = rows.filter((o) => {
        const od = new Date(o.createdAt);
        return od.toDateString() === d.toDateString();
      });
    }
    const result = await Promise.all(rows.map(buildOrderResponse));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const { type, tableId, customerId, items, discount, notes } = req.body;
    const TAX_RATE = 0.15;

    let subtotal = 0;
    const enrichedItems: Array<{ productId: number; productName: string; productNameAr: string; quantity: number; unitPrice: number; totalPrice: number; notes?: string }> = [];
    for (const item of items) {
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
      if (!product) continue;
      const qty = Number(item.quantity);
      const price = Number(product.price);
      enrichedItems.push({
        productId: product.id,
        productName: product.name,
        productNameAr: product.nameAr,
        quantity: qty,
        unitPrice: price,
        totalPrice: price * qty,
        notes: item.notes,
      });
      subtotal += price * qty;
    }
    const discountAmt = Number(discount ?? 0);
    const tax = (subtotal - discountAmt) * TAX_RATE;
    const total = subtotal - discountAmt + tax;

    const [order] = await db.insert(ordersTable).values({
      orderNumber: generateOrderNumber(),
      type: type ?? "dine_in",
      tableId: tableId ? Number(tableId) : null,
      customerId: customerId ? Number(customerId) : null,
      subtotal: String(subtotal.toFixed(2)),
      discount: String(discountAmt.toFixed(2)),
      tax: String(tax.toFixed(2)),
      total: String(total.toFixed(2)),
      notes,
    }).returning();

    if (tableId) {
      await db.update(tablesTable).set({ status: "occupied", currentOrderId: order.id }).where(eq(tablesTable.id, Number(tableId)));
    }

    if (enrichedItems.length > 0) {
      await db.insert(orderItemsTable).values(
        enrichedItems.map((i) => ({
          orderId: order.id,
          productId: i.productId,
          productName: i.productName,
          productNameAr: i.productNameAr,
          quantity: i.quantity,
          unitPrice: String(i.unitPrice),
          totalPrice: String(i.totalPrice),
          notes: i.notes,
        }))
      );
    }

    res.status(201).json(await buildOrderResponse(order));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/kitchen", async (req, res) => {
  try {
    const rows = await db.select().from(ordersTable)
      .where(inArray(ordersTable.status, ["confirmed", "preparing"]))
      .orderBy(ordersTable.createdAt);
    const result = await Promise.all(rows.map(buildOrderResponse));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!order) return res.status(404).json({ error: "Not found" });
    res.json(await buildOrderResponse(order));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { type, tableId, customerId, items, discount, notes } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (type !== undefined) updates.type = type;
    if (tableId !== undefined) updates.tableId = tableId ? Number(tableId) : null;
    if (customerId !== undefined) updates.customerId = customerId ? Number(customerId) : null;
    if (notes !== undefined) updates.notes = notes;

    if (items !== undefined) {
      const TAX_RATE = 0.15;
      let subtotal = 0;
      await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, id));
      const enrichedItems = [];
      for (const item of items) {
        const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
        if (!product) continue;
        const qty = Number(item.quantity);
        const price = Number(product.price);
        enrichedItems.push({ productId: product.id, productName: product.name, productNameAr: product.nameAr, quantity: qty, unitPrice: price, totalPrice: price * qty, notes: item.notes });
        subtotal += price * qty;
      }
      const discountAmt = Number(discount ?? 0);
      const tax = (subtotal - discountAmt) * TAX_RATE;
      updates.subtotal = String(subtotal.toFixed(2));
      updates.discount = String(discountAmt.toFixed(2));
      updates.tax = String(tax.toFixed(2));
      updates.total = String((subtotal - discountAmt + tax).toFixed(2));
      if (enrichedItems.length > 0) {
        await db.insert(orderItemsTable).values(enrichedItems.map((i) => ({
          orderId: id, productId: i.productId, productName: i.productName, productNameAr: i.productNameAr,
          quantity: i.quantity, unitPrice: String(i.unitPrice), totalPrice: String(i.totalPrice), notes: i.notes,
        })));
      }
    }

    const [order] = await db.update(ordersTable).set(updates).where(eq(ordersTable.id, id)).returning();
    if (!order) return res.status(404).json({ error: "Not found" });
    res.json(await buildOrderResponse(order));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(orderItemsTable).where(eq(orderItemsTable.orderId, id));
    await db.delete(ordersTable).where(eq(ordersTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/orders/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const [order] = await db.update(ordersTable).set({ status, updatedAt: new Date() }).where(eq(ordersTable.id, id)).returning();
    if (!order) return res.status(404).json({ error: "Not found" });
    if (status === "paid" || status === "cancelled") {
      if (order.tableId) {
        await db.update(tablesTable).set({ status: "available", currentOrderId: null }).where(eq(tablesTable.id, order.tableId));
      }
    }
    res.json(await buildOrderResponse(order));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders/:id/pay", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { paymentMethod, discount, amountPaid } = req.body;
    const [existing] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (!existing) return res.status(404).json({ error: "Not found" });

    const TAX_RATE = 0.15;
    const subtotal = Number(existing.subtotal);
    const discountAmt = Number(discount ?? existing.discount ?? 0);
    const tax = (subtotal - discountAmt) * TAX_RATE;
    const total = subtotal - discountAmt + tax;

    const [order] = await db.update(ordersTable).set({
      status: "paid",
      paymentMethod,
      discount: String(discountAmt.toFixed(2)),
      tax: String(tax.toFixed(2)),
      total: String(total.toFixed(2)),
      updatedAt: new Date(),
    }).where(eq(ordersTable.id, id)).returning();

    if (order.tableId) {
      await db.update(tablesTable).set({ status: "available", currentOrderId: null }).where(eq(tablesTable.id, order.tableId));
    }

    if (order.customerId) {
      const points = Math.floor(total / 10);
      const [cust] = await db.select().from(customersTable).where(eq(customersTable.id, order.customerId));
      if (cust) {
        await db.update(customersTable).set({
          loyaltyPoints: cust.loyaltyPoints + points,
          totalOrders: cust.totalOrders + 1,
          totalSpent: String((Number(cust.totalSpent) + total).toFixed(2)),
        }).where(eq(customersTable.id, order.customerId));
      }
    }

    res.json(await buildOrderResponse(order));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
