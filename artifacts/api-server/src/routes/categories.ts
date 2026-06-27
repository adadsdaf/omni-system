import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, productsTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router = Router();

router.get("/categories", async (req, res) => {
  try {
    const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder);
    const withCounts = await Promise.all(
      cats.map(async (cat) => {
        const [result] = await db.select({ cnt: count() }).from(productsTable).where(eq(productsTable.categoryId, cat.id));
        return { ...cat, productCount: Number(result?.cnt ?? 0) };
      })
    );
    res.json(withCounts);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/categories", async (req, res) => {
  try {
    const { name, nameAr, description, icon, color, sortOrder } = req.body;
    const [cat] = await db.insert(categoriesTable).values({ name, nameAr, description, icon, color, sortOrder: sortOrder ?? 0 }).returning();
    res.status(201).json({ ...cat, productCount: 0 });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/categories/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
    if (!cat) return res.status(404).json({ error: "Not found" });
    const [result] = await db.select({ cnt: count() }).from(productsTable).where(eq(productsTable.categoryId, id));
    res.json({ ...cat, productCount: Number(result?.cnt ?? 0) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/categories/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, nameAr, description, icon, color, sortOrder, isActive } = req.body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (nameAr !== undefined) updates.nameAr = nameAr;
    if (description !== undefined) updates.description = description;
    if (icon !== undefined) updates.icon = icon;
    if (color !== undefined) updates.color = color;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;
    if (isActive !== undefined) updates.isActive = isActive;
    const [cat] = await db.update(categoriesTable).set(updates).where(eq(categoriesTable.id, id)).returning();
    if (!cat) return res.status(404).json({ error: "Not found" });
    const [result] = await db.select({ cnt: count() }).from(productsTable).where(eq(productsTable.categoryId, id));
    res.json({ ...cat, productCount: Number(result?.cnt ?? 0) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/categories/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
