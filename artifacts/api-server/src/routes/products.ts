import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable } from "@workspace/db";
import { eq, and, ilike } from "drizzle-orm";

const router = Router();

function withCategory(product: Record<string, unknown>, categoryName: string) {
  return {
    ...product,
    price: Number(product.price),
    costPrice: product.costPrice ? Number(product.costPrice) : null,
    categoryName,
  };
}

router.get("/products", async (req, res) => {
  try {
    const { categoryId, search, available } = req.query;
    const conditions = [];
    const parsedCategoryId = categoryId ? Number(categoryId) : NaN;
    if (categoryId && !Number.isNaN(parsedCategoryId)) conditions.push(eq(productsTable.categoryId, parsedCategoryId));
    if (available !== undefined && available !== "") conditions.push(eq(productsTable.isAvailable, available === "true"));

    const rows = await db
      .select({ product: productsTable, categoryName: categoriesTable.nameAr })
      .from(productsTable)
      .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    let result = rows.map((r) => withCategory(r.product as Record<string, unknown>, r.categoryName ?? ""));
    if (search) {
      const s = String(search).toLowerCase();
      result = result.filter((p) => String(p.name).toLowerCase().includes(s) || String(p.nameAr).toLowerCase().includes(s));
    }
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const { name, nameAr, description, price, costPrice, categoryId, barcode, image, preparationTime, calories } = req.body;
    const [product] = await db.insert(productsTable).values({ name, nameAr, description, price: String(price), costPrice: costPrice ? String(costPrice) : null, categoryId: Number(categoryId), barcode, image, preparationTime, calories }).returning();
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, Number(categoryId)));
    res.status(201).json(withCategory(product as Record<string, unknown>, cat?.nameAr ?? ""));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.select({ product: productsTable, categoryName: categoriesTable.nameAr })
      .from(productsTable).leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
      .where(eq(productsTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(withCategory(row.product as Record<string, unknown>, row.categoryName ?? ""));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, nameAr, description, price, costPrice, categoryId, barcode, image, isAvailable, preparationTime, calories } = req.body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (nameAr !== undefined) updates.nameAr = nameAr;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = String(price);
    if (costPrice !== undefined) updates.costPrice = costPrice ? String(costPrice) : null;
    if (categoryId !== undefined) updates.categoryId = Number(categoryId);
    if (barcode !== undefined) updates.barcode = barcode;
    if (image !== undefined) updates.image = image;
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;
    if (preparationTime !== undefined) updates.preparationTime = preparationTime;
    if (calories !== undefined) updates.calories = calories;
    const [product] = await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();
    if (!product) return res.status(404).json({ error: "Not found" });
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, product.categoryId));
    res.json(withCategory(product as Record<string, unknown>, cat?.nameAr ?? ""));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
