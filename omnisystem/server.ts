import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store for the POS system
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  barcode: string;
  image: string;
}

interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Sale {
  id: string;
  receiptNumber: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'credit';
  cashier: string;
  timestamp: string;
}

let serverLogs: string[] = [
  "Microsoft Windows [Version 10.0.19045.4355]",
  "(c) Microsoft Corporation. All rights reserved.",
  'C:\\Users\\DZ\\Downloads\\ewew> @echo off',
  'C:\\Users\\DZ\\Downloads\\ewew> title تشغيل نظام الكاشير',
  'C:\\Users\\DZ\\Downloads\\ewew> echo =======================================================================',
  'C:\\Users\\DZ\\Downloads\\ewew> echo جاري إقلاع خادم Node.js الخلفي...',
  'C:\\Users\\DZ\\Downloads\\ewew> npm run dev',
  '> react-example@0.0.0 dev',
  '> tsx server.ts',
  '[Server] Express backend initialized successfully on port 3000.',
  '[Server] Vite middleware active.',
  'انتظار 5 ثواني...',
  '=======================================================================',
  'النظام يعمل الان',
  'http://localhost:3000/pos',
  '======================================================================='
];

let serverStartTime = Date.now();
let isServerRunning = true;

let products: Product[] = [
  { id: "p1", name: "قهوة إسبريسو مزدوجة", price: 15, category: "مشروبات ساخنة", stock: 120, barcode: "6281001", image: "☕" },
  { id: "p2", name: "لاتيه كراميل", price: 22, category: "مشروبات ساخنة", stock: 85, barcode: "6281002", image: "🥤" },
  { id: "p3", name: "كرواسون زبدة فرنسي", price: 12, category: "مخبوزات", stock: 45, barcode: "6281003", image: "🥐" },
  { id: "p4", name: "ساندويتش دجاج مشوي", price: 35, category: "وجبات سريعة", stock: 30, barcode: "6281004", image: "🥪" },
  { id: "p5", name: "عصير برتقال طازج", price: 18, category: "مشروبات باردة", stock: 60, barcode: "6281005", image: "🍊" },
  { id: "p6", name: "كيك شوكولاتة بلجيكية", price: 25, category: "حلويات", stock: 20, barcode: "6281006", image: "🍰" },
  { id: "p7", name: "مياه معدنية (500 مل)", price: 4, category: "مشروبات باردة", stock: 250, barcode: "6281007", image: "💧" },
  { id: "p8", name: "سلطة سيزر بالدجاج", price: 30, category: "وجبات سريعة", stock: 25, barcode: "6281008", image: "🥗" }
];

let sales: Sale[] = [
  {
    id: "s1",
    receiptNumber: "REC-1001",
    items: [
      { productId: "p1", name: "قهوة إسبريسو مزدوجة", price: 15, quantity: 2 },
      { productId: "p3", name: "كرواسون زبدة فرنسي", price: 12, quantity: 1 }
    ],
    subtotal: 42,
    discount: 2,
    tax: 2,
    total: 42,
    paymentMethod: "cash",
    cashier: "أحمد (الكاشير الرئيسي)",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// API Routes
app.get("/api/status", (req, res) => {
  res.json({
    isRunning: isServerRunning,
    port: PORT,
    uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
    url: "http://localhost:3000",
    posUrl: "http://localhost:3000/pos",
    batchScript: {
      title: "تشغيل نظام الكاشير",
      directory: "C:\\Users\\DZ\\Downloads\\ewew",
      commands: [
        "@echo off",
        "title تشغيل نظام الكاشير",
        'cd /d "C:\\Users\\DZ\\Downloads\\ewew"',
        'start cmd /k "npm run dev"',
        "timeout /t 5 /nobreak >nul",
        "echo النظام يعمل الان",
        "echo http://localhost:3000/pos"
      ]
    },
    logs: serverLogs
  });
});

app.post("/api/restart-server", (req, res) => {
  serverStartTime = Date.now();
  serverLogs.push(`[${new Date().toLocaleTimeString()}] 🔄 تمت إعادة تشغيل السيرفر بناءً على طلب المستخدم.`);
  res.json({ success: true, message: "تمت إعادة تشغيل السيرفر بنجاح" });
});

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/products", (req, res) => {
  const { name, price, category, stock, barcode, image } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: "اسم المنتج والسعر مطلوبان" });
  }
  const newProduct: Product = {
    id: `p_${Date.now()}`,
    name,
    price: Number(price),
    category: category || "عام",
    stock: Number(stock) || 10,
    barcode: barcode || `628${Math.floor(1000 + Math.random() * 9000)}`,
    image: image || "📦"
  };
  products.push(newProduct);
  serverLogs.push(`[${new Date().toLocaleTimeString()}] ➕ إضافة منتج جديد: ${name} (${newProduct.price} ر.س)`);
  res.json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).json({ error: "المنتج غير موجود" });
  
  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
});

app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  products = products.filter(p => p.id !== id);
  res.json({ success: true });
});

app.get("/api/sales", (req, res) => {
  res.json(sales);
});

app.post("/api/sales", (req, res) => {
  const { items, subtotal, discount, tax, total, paymentMethod, cashier } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "السلة فارغة" });
  }

  // Update stock
  for (const item of items) {
    const prod = products.find(p => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  }

  const newSale: Sale = {
    id: `s_${Date.now()}`,
    receiptNumber: `REC-${1000 + sales.length + 1}`,
    items,
    subtotal: Number(subtotal) || 0,
    discount: Number(discount) || 0,
    tax: Number(tax) || 0,
    total: Number(total) || 0,
    paymentMethod: paymentMethod || "cash",
    cashier: cashier || "الكاشير",
    timestamp: new Date().toISOString()
  };

  sales.unshift(newSale);
  serverLogs.push(`[${new Date().toLocaleTimeString()}] 💳 عملية بيع جديدة: ${newSale.receiptNumber} بقيمة ${newSale.total} ر.س (${paymentMethod})`);
  res.json(newSale);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[نظام الكاشير] Server running on http://localhost:${PORT}`);
    console.log(`[نظام الكاشير] POS interface ready at http://localhost:${PORT}/pos`);
  });
}

startServer();
