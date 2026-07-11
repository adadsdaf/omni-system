var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var serverLogs = [
  "Microsoft Windows [Version 10.0.19045.4355]",
  "(c) Microsoft Corporation. All rights reserved.",
  "C:\\Users\\DZ\\Downloads\\ewew> @echo off",
  "C:\\Users\\DZ\\Downloads\\ewew> title \u062A\u0634\u063A\u064A\u0644 \u0646\u0638\u0627\u0645 \u0627\u0644\u0643\u0627\u0634\u064A\u0631",
  "C:\\Users\\DZ\\Downloads\\ewew> echo =======================================================================",
  "C:\\Users\\DZ\\Downloads\\ewew> echo \u062C\u0627\u0631\u064A \u0625\u0642\u0644\u0627\u0639 \u062E\u0627\u062F\u0645 Node.js \u0627\u0644\u062E\u0644\u0641\u064A...",
  "C:\\Users\\DZ\\Downloads\\ewew> npm run dev",
  "> react-example@0.0.0 dev",
  "> tsx server.ts",
  "[Server] Express backend initialized successfully on port 3000.",
  "[Server] Vite middleware active.",
  "\u0627\u0646\u062A\u0638\u0627\u0631 5 \u062B\u0648\u0627\u0646\u064A...",
  "=======================================================================",
  "\u0627\u0644\u0646\u0638\u0627\u0645 \u064A\u0639\u0645\u0644 \u0627\u0644\u0627\u0646",
  "http://localhost:3000/pos",
  "======================================================================="
];
var serverStartTime = Date.now();
var isServerRunning = true;
var products = [
  { id: "p1", name: "\u0642\u0647\u0648\u0629 \u0625\u0633\u0628\u0631\u064A\u0633\u0648 \u0645\u0632\u062F\u0648\u062C\u0629", price: 15, category: "\u0645\u0634\u0631\u0648\u0628\u0627\u062A \u0633\u0627\u062E\u0646\u0629", stock: 120, barcode: "6281001", image: "\u2615" },
  { id: "p2", name: "\u0644\u0627\u062A\u064A\u0647 \u0643\u0631\u0627\u0645\u064A\u0644", price: 22, category: "\u0645\u0634\u0631\u0648\u0628\u0627\u062A \u0633\u0627\u062E\u0646\u0629", stock: 85, barcode: "6281002", image: "\u{1F964}" },
  { id: "p3", name: "\u0643\u0631\u0648\u0627\u0633\u0648\u0646 \u0632\u0628\u062F\u0629 \u0641\u0631\u0646\u0633\u064A", price: 12, category: "\u0645\u062E\u0628\u0648\u0632\u0627\u062A", stock: 45, barcode: "6281003", image: "\u{1F950}" },
  { id: "p4", name: "\u0633\u0627\u0646\u062F\u0648\u064A\u062A\u0634 \u062F\u062C\u0627\u062C \u0645\u0634\u0648\u064A", price: 35, category: "\u0648\u062C\u0628\u0627\u062A \u0633\u0631\u064A\u0639\u0629", stock: 30, barcode: "6281004", image: "\u{1F96A}" },
  { id: "p5", name: "\u0639\u0635\u064A\u0631 \u0628\u0631\u062A\u0642\u0627\u0644 \u0637\u0627\u0632\u062C", price: 18, category: "\u0645\u0634\u0631\u0648\u0628\u0627\u062A \u0628\u0627\u0631\u062F\u0629", stock: 60, barcode: "6281005", image: "\u{1F34A}" },
  { id: "p6", name: "\u0643\u064A\u0643 \u0634\u0648\u0643\u0648\u0644\u0627\u062A\u0629 \u0628\u0644\u062C\u064A\u0643\u064A\u0629", price: 25, category: "\u062D\u0644\u0648\u064A\u0627\u062A", stock: 20, barcode: "6281006", image: "\u{1F370}" },
  { id: "p7", name: "\u0645\u064A\u0627\u0647 \u0645\u0639\u062F\u0646\u064A\u0629 (500 \u0645\u0644)", price: 4, category: "\u0645\u0634\u0631\u0648\u0628\u0627\u062A \u0628\u0627\u0631\u062F\u0629", stock: 250, barcode: "6281007", image: "\u{1F4A7}" },
  { id: "p8", name: "\u0633\u0644\u0637\u0629 \u0633\u064A\u0632\u0631 \u0628\u0627\u0644\u062F\u062C\u0627\u062C", price: 30, category: "\u0648\u062C\u0628\u0627\u062A \u0633\u0631\u064A\u0639\u0629", stock: 25, barcode: "6281008", image: "\u{1F957}" }
];
var sales = [
  {
    id: "s1",
    receiptNumber: "REC-1001",
    items: [
      { productId: "p1", name: "\u0642\u0647\u0648\u0629 \u0625\u0633\u0628\u0631\u064A\u0633\u0648 \u0645\u0632\u062F\u0648\u062C\u0629", price: 15, quantity: 2 },
      { productId: "p3", name: "\u0643\u0631\u0648\u0627\u0633\u0648\u0646 \u0632\u0628\u062F\u0629 \u0641\u0631\u0646\u0633\u064A", price: 12, quantity: 1 }
    ],
    subtotal: 42,
    discount: 2,
    tax: 2,
    total: 42,
    paymentMethod: "cash",
    cashier: "\u0623\u062D\u0645\u062F (\u0627\u0644\u0643\u0627\u0634\u064A\u0631 \u0627\u0644\u0631\u0626\u064A\u0633\u064A)",
    timestamp: new Date(Date.now() - 36e5 * 2).toISOString()
  }
];
app.get("/api/status", (req, res) => {
  res.json({
    isRunning: isServerRunning,
    port: PORT,
    uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1e3),
    url: "http://localhost:3000",
    posUrl: "http://localhost:3000/pos",
    batchScript: {
      title: "\u062A\u0634\u063A\u064A\u0644 \u0646\u0638\u0627\u0645 \u0627\u0644\u0643\u0627\u0634\u064A\u0631",
      directory: "C:\\Users\\DZ\\Downloads\\ewew",
      commands: [
        "@echo off",
        "title \u062A\u0634\u063A\u064A\u0644 \u0646\u0638\u0627\u0645 \u0627\u0644\u0643\u0627\u0634\u064A\u0631",
        'cd /d "C:\\Users\\DZ\\Downloads\\ewew"',
        'start cmd /k "npm run dev"',
        "timeout /t 5 /nobreak >nul",
        "echo \u0627\u0644\u0646\u0638\u0627\u0645 \u064A\u0639\u0645\u0644 \u0627\u0644\u0627\u0646",
        "echo http://localhost:3000/pos"
      ]
    },
    logs: serverLogs
  });
});
app.post("/api/restart-server", (req, res) => {
  serverStartTime = Date.now();
  serverLogs.push(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] \u{1F504} \u062A\u0645\u062A \u0625\u0639\u0627\u062F\u0629 \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0637\u0644\u0628 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645.`);
  res.json({ success: true, message: "\u062A\u0645\u062A \u0625\u0639\u0627\u062F\u0629 \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0628\u0646\u062C\u0627\u062D" });
});
app.get("/api/products", (req, res) => {
  res.json(products);
});
app.post("/api/products", (req, res) => {
  const { name, price, category, stock, barcode, image } = req.body;
  if (!name || price === void 0) {
    return res.status(400).json({ error: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062A\u062C \u0648\u0627\u0644\u0633\u0639\u0631 \u0645\u0637\u0644\u0648\u0628\u0627\u0646" });
  }
  const newProduct = {
    id: `p_${Date.now()}`,
    name,
    price: Number(price),
    category: category || "\u0639\u0627\u0645",
    stock: Number(stock) || 10,
    barcode: barcode || `628${Math.floor(1e3 + Math.random() * 9e3)}`,
    image: image || "\u{1F4E6}"
  };
  products.push(newProduct);
  serverLogs.push(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] \u2795 \u0625\u0636\u0627\u0641\u0629 \u0645\u0646\u062A\u062C \u062C\u062F\u064A\u062F: ${name} (${newProduct.price} \u0631.\u0633)`);
  res.json(newProduct);
});
app.put("/api/products/:id", (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return res.status(404).json({ error: "\u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
});
app.delete("/api/products/:id", (req, res) => {
  const { id } = req.params;
  products = products.filter((p) => p.id !== id);
  res.json({ success: true });
});
app.get("/api/sales", (req, res) => {
  res.json(sales);
});
app.post("/api/sales", (req, res) => {
  const { items, subtotal, discount, tax, total, paymentMethod, cashier } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "\u0627\u0644\u0633\u0644\u0629 \u0641\u0627\u0631\u063A\u0629" });
  }
  for (const item of items) {
    const prod = products.find((p) => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  }
  const newSale = {
    id: `s_${Date.now()}`,
    receiptNumber: `REC-${1e3 + sales.length + 1}`,
    items,
    subtotal: Number(subtotal) || 0,
    discount: Number(discount) || 0,
    tax: Number(tax) || 0,
    total: Number(total) || 0,
    paymentMethod: paymentMethod || "cash",
    cashier: cashier || "\u0627\u0644\u0643\u0627\u0634\u064A\u0631",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  sales.unshift(newSale);
  serverLogs.push(`[${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] \u{1F4B3} \u0639\u0645\u0644\u064A\u0629 \u0628\u064A\u0639 \u062C\u062F\u064A\u062F\u0629: ${newSale.receiptNumber} \u0628\u0642\u064A\u0645\u0629 ${newSale.total} \u0631.\u0633 (${paymentMethod})`);
  res.json(newSale);
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[\u0646\u0638\u0627\u0645 \u0627\u0644\u0643\u0627\u0634\u064A\u0631] Server running on http://localhost:${PORT}`);
    console.log(`[\u0646\u0638\u0627\u0645 \u0627\u0644\u0643\u0627\u0634\u064A\u0631] POS interface ready at http://localhost:${PORT}/pos`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
