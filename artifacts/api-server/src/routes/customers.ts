import { Router } from "express";
import { db } from "@workspace/db";
import { customersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function fmt(c: Record<string, unknown>) {
  return { ...c, totalSpent: Number(c.totalSpent ?? 0) };
}

router.get("/customers", async (req, res) => {
  try {
    const { search } = req.query;
    let rows = await db.select().from(customersTable).orderBy(customersTable.createdAt);
    if (search) {
      const s = String(search).toLowerCase();
      rows = rows.filter((c) => c.name.toLowerCase().includes(s) || (c.phone ?? "").includes(s));
    }
    res.json(rows.map((c) => fmt(c as Record<string, unknown>)));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/customers", async (req, res) => {
  try {
    const { name, phone, email, address, notes } = req.body;
    const [customer] = await db.insert(customersTable).values({ name, phone, email, address, notes }).returning();
    res.status(201).json(fmt(customer as Record<string, unknown>));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/customers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, id));
    if (!customer) return res.status(404).json({ error: "Not found" });
    res.json(fmt(customer as Record<string, unknown>));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/customers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, phone, email, address, notes } = req.body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (email !== undefined) updates.email = email;
    if (address !== undefined) updates.address = address;
    if (notes !== undefined) updates.notes = notes;
    const [customer] = await db.update(customersTable).set(updates).where(eq(customersTable.id, id)).returning();
    if (!customer) return res.status(404).json({ error: "Not found" });
    res.json(fmt(customer as Record<string, unknown>));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/customers/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(customersTable).where(eq(customersTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
