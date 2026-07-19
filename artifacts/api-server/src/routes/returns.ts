import { Router } from "express";
import { db } from "../lib/sqlite";
import { getAuthUser } from "./auth";

const router = Router();

function requireAuth(req: any, res: any): any {
  const user = getAuthUser(req);
  if (!user) { res.status(401).json({ error: "غير مصرح" }); return null; }
  return user;
}

function requireAdmin(req: any, res: any): boolean {
  const user = getAuthUser(req);
  if (!user || (user.role !== "admin" && user.role !== "developer")) {
    res.status(403).json({ error: "غير مصرح" });
    return false;
  }
  return true;
}

router.get("/returns", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { startDate, endDate, search } = req.query as any;
  let sql = `
    SELECT r.*, u.name as cashier_name, c.name as customer_name
    FROM returns r
    LEFT JOIN users u ON u.id=r.user_id
    LEFT JOIN customers c ON c.id=r.customer_id
    WHERE 1=1
  `;
  const params: any[] = [];
  if (startDate) { sql += " AND DATE(r.created_at)>=?"; params.push(startDate); }
  if (endDate) { sql += " AND DATE(r.created_at)<=?"; params.push(endDate); }
  if (search) { sql += " AND (r.return_number LIKE ? OR r.invoice_number LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
  sql += " ORDER BY r.created_at DESC";
  const rows = db.prepare(sql).all(...params) as any[];
  const result = rows.map(r => {
    const items = db.prepare("SELECT * FROM return_items WHERE return_id=?").all(r.id);
    return { ...r, items };
  });
  res.json(result);
});

router.get("/returns/:id", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const row = db.prepare(`
    SELECT r.*, u.name as cashier_name, c.name as customer_name
    FROM returns r
    LEFT JOIN users u ON u.id=r.user_id
    LEFT JOIN customers c ON c.id=r.customer_id
    WHERE r.id=?
  `).get(req.params.id) as any;
  if (!row) { res.status(404).json({ error: "المرتجع غير موجود" }); return; }
  row.items = db.prepare("SELECT * FROM return_items WHERE return_id=?").all(row.id);
  res.json(row);
});

router.post("/returns", (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const { invoice_number, order_id, reason, payment_method, customer_id, notes, items } = req.body;
  if (!invoice_number || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "رقم الفاتورة والمنتجات المرتجعة مطلوبة" });
    return;
  }
  const total_refund = items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0);
  const countRow = db.prepare("SELECT COUNT(*) as c FROM returns").get() as { c: number };
  const returnNum = `RET-${String(countRow.c + 1).padStart(4, "0")}-${Date.now().toString().slice(-6)}`;
  const r = db.prepare(`
    INSERT INTO returns (return_number, invoice_number, order_id, reason, total_refund, payment_method, customer_id, user_id, notes)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(returnNum, invoice_number, order_id ?? null, reason ?? null, total_refund, payment_method ?? "cash", customer_id ?? null, user.id, notes ?? null);
  const returnId = r.lastInsertRowid;
  const insertItem = db.prepare(`
    INSERT INTO return_items (return_id, product_id, product_name, quantity, unit_price, total)
    VALUES (?,?,?,?,?,?)
  `);
  for (const item of items) {
    insertItem.run(returnId, item.product_id ?? null, item.product_name, item.quantity, item.unit_price, item.unit_price * item.quantity);
    if (item.product_id) {
      db.prepare("UPDATE products SET stock = COALESCE(stock, 0) + ? WHERE id=?").run(item.quantity, item.product_id);
    }
  }
  const created = db.prepare(`
    SELECT r.*, u.name as cashier_name FROM returns r
    LEFT JOIN users u ON u.id=r.user_id WHERE r.id=?
  `).get(returnId) as any;
  created.items = db.prepare("SELECT * FROM return_items WHERE return_id=?").all(returnId);
  res.status(201).json(created);
});

router.delete("/returns/:id", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const row = db.prepare("SELECT * FROM returns WHERE id=?").get(req.params.id) as any;
  if (!row) { res.status(404).json({ error: "غير موجود" }); return; }
  const returnItems = db.prepare("SELECT * FROM return_items WHERE return_id=?").all(row.id) as any[];
  for (const item of returnItems) {
    if (item.product_id) {
      db.prepare("UPDATE products SET stock = MAX(0, COALESCE(stock, 0) - ?) WHERE id=?").run(item.quantity, item.product_id);
    }
  }
  db.prepare("DELETE FROM returns WHERE id=?").run(req.params.id);
  res.status(204).send();
});

router.get("/returns-summary", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + "-01";
  const todayStats = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(total_refund),0) as total FROM returns WHERE DATE(created_at)=?").get(today) as any;
  const monthStats = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(total_refund),0) as total FROM returns WHERE DATE(created_at)>=?").get(monthStart) as any;
  const totalCount = (db.prepare("SELECT COUNT(*) as c FROM returns").get() as any).c;
  res.json({
    todayCount: todayStats.count,
    todayTotal: todayStats.total,
    monthCount: monthStats.count,
    monthTotal: monthStats.total,
    totalCount,
  });
});

/* ── البحث عن طلب بواسطة رقم الفاتورة أو ID ── */
router.get("/orders/lookup", (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const { q } = req.query as any;
  if (!q) { res.status(400).json({ error: "مطلوب معيار البحث" }); return; }

  const qStr = String(q).trim();
  // تنظيف المدخلات من السوابق والروابط مثل "INV-" والأصفار الزائدة لتطابق الرقم المسلسل المخزن بقاعدة البيانات
  const cleanQ = qStr.replace(/^(inv-?|INV-?)/i, "").replace(/^0+/, "") || "0";
  const likePattern = `%${cleanQ}%`;

  // جلب كافة الفواتير المطابقة كقائمة
  const orderRows = db.prepare(`
    SELECT o.*, u.name as user_name, c.name as customer_name
    FROM orders o
    LEFT JOIN users u ON u.id=o.user_id
    LEFT JOIN customers c ON c.id=o.customer_id
    WHERE o.invoice_number = ?
       OR o.invoice_number = ?
       OR CAST(o.id AS TEXT) = ?
       OR COALESCE(NULLIF(LTRIM(REPLACE(REPLACE(LOWER(o.invoice_number), 'inv-', ''), 'inv', ''), '0'), ''), '0') = ?
       OR (o.invoice_number LIKE ? AND ? <> '')
    ORDER BY o.created_at DESC
    LIMIT 50
  `).all(
    qStr,
    cleanQ,
    qStr,
    cleanQ,
    likePattern,
    cleanQ
  ) as any[];

  // معالجة كل فاتورة وحساب الكميات المرتجعة والمتبقية لكل صنف
  const results = orderRows.map(orderRow => {
    const items = db.prepare("SELECT * FROM order_items WHERE order_id=?").all(orderRow.id) as any[];

    // جلب المرتجعات السابقة الخاصة بهذه الفاتورة
    const existingReturns = db.prepare(`
      SELECT id, return_number, total_refund, created_at 
      FROM returns 
      WHERE order_id=? OR invoice_number=?
    `).all(orderRow.id, orderRow.invoice_number) as any[];

    // حساب كمية المرتجعات السابقة لكل صنف بالفاتورة
    const returnedQtyRows = db.prepare(`
      SELECT product_id, SUM(quantity) as returned_qty
      FROM return_items ri
      JOIN returns r ON r.id = ri.return_id
      WHERE r.order_id = ? OR r.invoice_number = ?
      GROUP BY product_id
    `).all(orderRow.id, orderRow.invoice_number) as any[];

    const returnedQtyMap: Record<number, number> = {};
    for (const row of returnedQtyRows) {
      if (row.product_id) {
        returnedQtyMap[row.product_id] = Number(row.returned_qty || 0);
      }
    }

    // بناء قائمة الأصناف مع احتساب الكميات المتبقية للارتجاع
    const itemsWithQty = items.map(i => {
      const returnedQuantity = returnedQtyMap[i.product_id] || 0;
      const remainingQuantity = Math.max(0, i.quantity - returnedQuantity);
      return {
        id: i.id,
        productId: i.product_id,
        productName: i.product_name,
        quantity: i.quantity,
        returnedQuantity,
        remainingQuantity,
        unitPrice: i.unit_price,
        total: i.total,
        categoryId: i.category_id,
        categoryName: i.category_name,
      };
    });

    // هل تم إرجاع كامل أصناف الفاتورة؟
    const fullyReturned = itemsWithQty.length > 0 && itemsWithQty.every(item => item.remainingQuantity <= 0);

    return {
      id: orderRow.id,
      invoiceNumber: orderRow.invoice_number,
      total: orderRow.total,
      subtotal: orderRow.subtotal,
      discount: orderRow.discount,
      tax: orderRow.tax,
      paymentMethod: orderRow.payment_method,
      orderType: orderRow.order_type,
      tableNumber: orderRow.table_number,
      note: orderRow.note,
      createdAt: orderRow.created_at,
      cashierName: orderRow.user_name,
      userId: orderRow.user_id,
      customerName: orderRow.customer_name,
      alreadyReturned: existingReturns.length > 0,
      existingReturns, // مصفوفة المرتجعات السابقة التي يعرضها الفرونت إند
      fullyReturned,
      items: itemsWithQty,
    };
  });

  res.json(results);
});

/* ── ملخص صناديق الكاشيرين ── */
router.get("/cashier-boxes", (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { date } = req.query as any;
  const filterDate = date ?? new Date().toISOString().slice(0, 10);

  let cashiers = db.prepare(`
    SELECT u.id, u.name, u.role,
      COALESCE(SUM(o.total),0) as orders_total,
      COUNT(o.id) as orders_count
    FROM users u
    LEFT JOIN orders o ON o.user_id=u.id AND DATE(o.created_at)=?
    WHERE u.active=1
    GROUP BY u.id, u.name, u.role
    ORDER BY u.name
  `).all(filterDate) as any[];

  const user = getAuthUser(req);
  if (user && user.role !== "developer") {
    cashiers = cashiers.filter(c => c.role !== "developer");
  }

  const returns_ = db.prepare(`
    SELECT o.user_id,
      COALESCE(SUM(r.total_refund),0) as returns_total,
      COUNT(r.id) as returns_count
    FROM returns r
    LEFT JOIN orders o ON o.id=r.order_id
    WHERE DATE(r.created_at)=?
    GROUP BY o.user_id
  `).all(filterDate) as any[];

  const returnsMap = new Map(returns_.map(r => [r.user_id, r]));

  const mainTotal = cashiers.reduce((s, c) => s + c.orders_total, 0);
  const mainReturns = returns_.reduce((s, r) => s + r.returns_total, 0);

  res.json({
    date: filterDate,
    mainBox: { total: mainTotal, returnsTotal: mainReturns, net: mainTotal - mainReturns },
    cashiers: cashiers.map(c => {
      const ret = returnsMap.get(c.id);
      return {
        userId: c.id,
        name: c.name,
        ordersTotal: c.orders_total,
        ordersCount: c.orders_count,
        returnsTotal: ret?.returns_total ?? 0,
        returnsCount: ret?.returns_count ?? 0,
        net: c.orders_total - (ret?.returns_total ?? 0),
      };
    }),
  });
});

export default router;
