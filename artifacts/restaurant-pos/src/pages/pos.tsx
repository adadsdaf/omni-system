import { useState, useRef } from "react";
import { useGetCategories, useGetProducts, useCreateOrder } from "@workspace/api-client-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Wallet,
  ArrowRightLeft,
  ChefHat,
  Printer,
  LogIn,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { Link } from "wouter";
import type {
  Product,
  OrderItemInput,
  OrderInputType,
  OrderPaymentMethod,
} from "@workspace/api-client-react";

const RESTAURANT_NAME = "مطعمي";
const RESTAURANT_PHONE = "0501234567 - 0507654321";
const CASHIER_NAME = "الكاشير";

type CartItem = Product & { cartId: string; quantity: number; notes?: string };

type CompletedOrder = {
  orderNumber: string;
  type: OrderInputType;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: Date;
};

function WelcomeScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      }}
    >
      <div className="text-center" dir="rtl">
        <div className="mb-10">
          <div
            className="w-36 h-36 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl border-4 border-amber-400"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            <UtensilsCrossed size={64} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">{RESTAURANT_NAME}</h1>
          <p className="text-amber-300 text-lg">نظام نقطة المبيعات</p>
          <div className="mt-3 text-white/40 text-sm">
            هذا النظام مرخص لمطعم {RESTAURANT_NAME}
          </div>
        </div>

        <div className="space-y-4 w-72 mx-auto">
          <button
            onClick={onEnter}
            className="w-full py-4 rounded-xl text-lg font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center justify-center gap-3"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            <LogIn size={22} />
            الدخول إلى نقطة المبيعات
          </button>
          <div className="text-white/30 text-sm pt-4 border-t border-white/10">
            <User size={14} className="inline ml-1" />
            {CASHIER_NAME}
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 text-center text-white/20 text-xs">
          نظام إدارة المطاعم المتكامل
        </div>
      </div>
    </div>
  );
}

function ReceiptPrint({
  order,
  onClose,
}: {
  order: CompletedOrder;
  onClose: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank", "width=400,height=700");
    if (!printWindow) return;
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <title>فاتورة</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Arial', 'Tahoma', sans-serif; font-size: 13px; width: 300px; margin: auto; padding: 10px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .large { font-size: 18px; }
            .xlarge { font-size: 22px; }
            .small { font-size: 11px; }
            .line { border-top: 1px dashed #000; margin: 8px 0; }
            .double-line { border-top: 2px solid #000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 4px 2px; font-size: 12px; }
            th { border-bottom: 1px solid #000; border-top: 1px solid #000; font-weight: bold; }
            .total-row td { font-weight: bold; font-size: 15px; border-top: 2px solid #000; padding-top: 6px; }
            .footer-note { font-size: 11px; text-align: center; margin-top: 6px; }
            @media print { body { width: 100%; } }
          </style>
        </head>
        <body>
          ${content.innerHTML}
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const typeLabel =
    order.type === "dine_in"
      ? "محلي"
      : order.type === "takeaway"
      ? "تيك أواي"
      : "توصيل";

  const dateStr = order.createdAt.toLocaleDateString("ar-SA");
  const timeStr = order.createdAt.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        <div className="bg-amber-500 px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Printer size={20} />
            طباعة الفاتورة
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div
            ref={printRef}
            dir="rtl"
            style={{ fontFamily: "Arial, Tahoma, sans-serif", fontSize: "13px", color: "#000" }}
          >
            <div style={{ textAlign: "center", marginBottom: "6px" }}>
              <div style={{ fontSize: "22px", fontWeight: "bold" }}>{RESTAURANT_NAME}</div>
              <div style={{ fontSize: "14px", margin: "4px 0" }}>شعار المطعم</div>
              <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }}></div>
              <div style={{ fontSize: "18px", fontWeight: "bold", textDecoration: "underline" }}>
                فاتورة خاصة بالزبون
              </div>
              <div style={{ fontSize: "15px", margin: "4px 0" }}>{order.orderNumber}</div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", margin: "6px 0", fontSize: "13px" }}>
              <span style={{ fontWeight: "bold" }}>الوقت: {timeStr}</span>
              <span style={{ fontWeight: "bold" }}>{typeLabel}</span>
            </div>

            <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px" }}>
              <span>{dateStr}</span>
              <span>الكاشير: {CASHIER_NAME}</span>
            </div>

            <div style={{ borderTop: "1px dashed #000", margin: "6px 0" }}></div>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: "1px solid #000", borderTop: "1px solid #000", padding: "4px 2px", fontWeight: "bold", textAlign: "right" }}>الصنف</th>
                  <th style={{ borderBottom: "1px solid #000", borderTop: "1px solid #000", padding: "4px 2px", fontWeight: "bold", textAlign: "center" }}>الكمية</th>
                  <th style={{ borderBottom: "1px solid #000", borderTop: "1px solid #000", padding: "4px 2px", fontWeight: "bold", textAlign: "left" }}>السعر</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.cartId}>
                    <td style={{ padding: "3px 2px", textAlign: "right" }}>{item.nameAr || item.name}</td>
                    <td style={{ padding: "3px 2px", textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ padding: "3px 2px", textAlign: "left" }}>{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} style={{ borderTop: "2px solid #000", paddingTop: "4px" }}></td>
                </tr>
                {order.discount > 0 && (
                  <tr>
                    <td colSpan={2} style={{ padding: "3px 2px", fontWeight: "bold", textAlign: "right" }}>الخصم:</td>
                    <td style={{ padding: "3px 2px", textAlign: "left" }}>-{order.discount.toFixed(2)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={2} style={{ padding: "4px 2px", fontWeight: "bold", fontSize: "15px", textAlign: "right" }}>الإجمالـي:</td>
                  <td style={{ padding: "4px 2px", fontWeight: "bold", fontSize: "15px", textAlign: "left" }}>{order.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }}></div>

            <div style={{ textAlign: "center", margin: "6px 0" }}>
              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>اسم الكاشير: {CASHIER_NAME}</div>
            </div>

            <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }}></div>

            <div style={{ textAlign: "center", fontSize: "11px", margin: "4px 0" }}>
              <div style={{ marginBottom: "4px" }}>ملاحظات الطلب</div>
              <div>الطلب لايمكن استرجاعه او الغاءه</div>
            </div>

            <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }}></div>

            <div style={{ textAlign: "center", fontSize: "11px" }}>
              <div>أرقام التواصل</div>
              <div style={{ fontWeight: "bold", marginTop: "2px" }}>{RESTAURANT_PHONE}</div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            <Printer size={18} />
            طباعة
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Pos() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [orderType, setOrderType] = useState<OrderInputType>("dine_in");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [lastOrder, setLastOrder] = useState<CompletedOrder | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const { data: categories, isLoading: loadingCategories } = useGetCategories();
  const { data: products, isLoading: loadingProducts } = useGetProducts({
    categoryId: activeCategory ?? undefined,
    available: true,
  });

  const createOrder = useCreateOrder();

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        { ...product, cartId: Math.random().toString(36).substring(7), quantity: 1 },
      ];
    });
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartId !== cartId) return item;
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        })
        .filter((item) => !(item.cartId === cartId && item.quantity + delta <= 0))
    );
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax - discount;

  const handleCheckout = (paymentMethod: OrderPaymentMethod) => {
    if (cart.length === 0) return;
    const items: OrderItemInput[] = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      notes: item.notes,
    }));

    createOrder.mutate(
      { data: { type: orderType, items, discount } },
      {
        onSuccess: (data) => {
          const completed: CompletedOrder = {
            orderNumber: data.orderNumber,
            type: orderType,
            items: [...cart],
            subtotal,
            tax,
            discount,
            total: Number(data.total),
            createdAt: new Date(),
          };
          setLastOrder(completed);
          setShowReceipt(true);
          setCart([]);
          setDiscount(0);
          toast.success(`✅ تم إنشاء الطلب ${data.orderNumber}`);
        },
        onError: () => {
          toast.error("حدث خطأ أثناء إنشاء الطلب");
        },
      }
    );
  };

  if (showWelcome) {
    return <WelcomeScreen onEnter={() => setShowWelcome(false)} />;
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-background" dir="rtl">
      {showReceipt && lastOrder && (
        <ReceiptPrint order={lastOrder} onClose={() => setShowReceipt(false)} />
      )}

      {/* === Category Sidebar (far right in RTL) === */}
      <div className="w-36 flex-shrink-0 flex flex-col border-l bg-card shadow-lg z-10">
        <div className="p-3 border-b bg-amber-500 text-white text-center font-bold text-sm">
          الأقسام
        </div>
        <div className="flex-1 overflow-y-auto">
          <button
            onClick={() => setActiveCategory(null)}
            className={`w-full py-4 px-2 text-sm font-bold text-center border-b transition-all ${
              activeCategory === null
                ? "bg-amber-500 text-white"
                : "hover:bg-amber-50 dark:hover:bg-amber-900/20 text-foreground"
            }`}
          >
            الكل
          </button>
          {loadingCategories
            ? [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-3 border-b">
                  <Skeleton className="h-8 w-full rounded" />
                </div>
              ))
            : categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full py-4 px-2 text-sm font-bold text-center border-b transition-all leading-tight ${
                    activeCategory === cat.id
                      ? "bg-amber-500 text-white"
                      : "hover:bg-amber-50 dark:hover:bg-amber-900/20 text-foreground"
                  }`}
                >
                  {cat.nameAr || cat.name}
                </button>
              ))}
        </div>
      </div>

      {/* === Product Grid (center) === */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="h-14 border-b flex items-center px-4 bg-card gap-3 shrink-0">
          <span className="font-bold text-foreground">
            {activeCategory
              ? categories?.find((c) => c.id === activeCategory)?.nameAr || "المنتجات"
              : "جميع المنتجات"}
          </span>
          <span className="text-muted-foreground text-sm">
            ({products?.length ?? 0} صنف)
          </span>
          <div className="mr-auto">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {loadingProducts ? (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {products?.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="relative flex flex-col items-center justify-between p-2 rounded-lg border-2 border-amber-400/60 hover:border-amber-500 active:scale-95 transition-all text-center overflow-hidden group"
                  style={{
                    background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
                    minHeight: "80px",
                  }}
                >
                  <div className="text-white font-bold text-sm leading-tight">
                    {product.price.toFixed(2)}
                  </div>
                  <div className="text-white/70 text-xs">({product.id})</div>
                  <div className="text-white font-bold text-xs leading-tight line-clamp-2 w-full">
                    {product.nameAr || product.name}
                  </div>
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/15 transition-colors rounded-lg" />
                </button>
              ))}
              {products?.length === 0 && (
                <div className="col-span-full py-16 text-center text-muted-foreground flex flex-col items-center">
                  <ChefHat size={40} className="mb-3 opacity-30" />
                  <p>لا توجد منتجات</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* === Order / Cart Panel (left in RTL = visually left) === */}
      <div
        className="w-72 flex-shrink-0 flex flex-col border-r bg-card shadow-xl z-10"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-3 border-b bg-muted/20">
          <div className="flex items-center justify-between mb-2">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              ← لوحة التحكم
            </Link>
            <span className="font-bold text-sm">طلب جديد</span>
          </div>
          <div className="flex rounded-lg overflow-hidden border border-border text-xs font-bold">
            {(["dine_in", "takeaway", "delivery"] as OrderInputType[]).map((t) => (
              <button
                key={t}
                onClick={() => setOrderType(t)}
                className={`flex-1 py-2 transition-colors ${
                  orderType === t
                    ? "bg-amber-500 text-white"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {t === "dine_in" ? "داخلي" : t === "takeaway" ? "تيك أواي" : "توصيل"}
              </button>
            ))}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-10">
              <ChefHat size={36} className="mb-3 opacity-30" />
              <p className="text-sm">قم بإضافة منتجات للطلب</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {/* Header row */}
              <div className="grid grid-cols-12 gap-1 px-2 py-1 text-xs font-bold text-muted-foreground border-b">
                <span className="col-span-5">الصنف</span>
                <span className="col-span-3 text-center">الكمية</span>
                <span className="col-span-3 text-left">السعر</span>
                <span className="col-span-1"></span>
              </div>
              {cart.map((item) => (
                <div key={item.cartId} className="grid grid-cols-12 gap-1 items-center px-2 py-2 rounded-lg hover:bg-muted/30 border border-transparent hover:border-border/50 transition-all">
                  <div className="col-span-5 text-xs font-medium leading-tight">
                    {item.nameAr || item.name}
                  </div>
                  <div className="col-span-3 flex items-center justify-center gap-0.5">
                    <button
                      onClick={() => updateQuantity(item.cartId, 1)}
                      className="w-5 h-5 rounded bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-colors text-xs"
                    >
                      <Plus size={10} />
                    </button>
                    <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartId, -1)}
                      className="w-5 h-5 rounded bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors text-xs"
                    >
                      <Minus size={10} />
                    </button>
                  </div>
                  <div className="col-span-3 text-left text-xs font-bold text-amber-600">
                    {(item.price * item.quantity).toFixed(2)}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => removeFromCart(item.cartId)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals & Payment */}
        <div className="border-t bg-muted/10 p-3 space-y-3">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>{subtotal.toFixed(2)}</span>
              <span>المجموع الفرعي</span>
            </div>
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>{tax.toFixed(2)}</span>
              <span>الضريبة (15%)</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-red-500 text-xs">
                <span>-{discount.toFixed(2)}</span>
                <span>خصم</span>
              </div>
            )}
            <Separator className="my-1" />
            <div className="flex justify-between font-bold text-base">
              <span className="text-amber-600 font-black">{total.toFixed(2)} ر.س</span>
              <span>الإجمالي</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleCheckout("cash")}
              disabled={cart.length === 0 || createOrder.isPending}
              className="py-3 rounded-lg font-bold text-white flex items-center justify-center gap-1.5 text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
            >
              <Banknote size={16} />
              نقد
            </button>
            <button
              onClick={() => handleCheckout("card")}
              disabled={cart.length === 0 || createOrder.isPending}
              className="py-3 rounded-lg font-bold border-2 border-amber-400 text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1.5 text-sm transition-all hover:bg-amber-50 dark:hover:bg-amber-900/20 active:scale-95 disabled:opacity-40"
            >
              <CreditCard size={16} />
              بطاقة
            </button>
            <button
              onClick={() => handleCheckout("wallet")}
              disabled={cart.length === 0 || createOrder.isPending}
              className="py-3 rounded-lg font-bold border border-border text-muted-foreground flex items-center justify-center gap-1.5 text-xs transition-all hover:bg-muted active:scale-95 disabled:opacity-40"
            >
              <Wallet size={14} />
              محفظة
            </button>
            <button
              onClick={() => handleCheckout("transfer")}
              disabled={cart.length === 0 || createOrder.isPending}
              className="py-3 rounded-lg font-bold border border-border text-muted-foreground flex items-center justify-center gap-1.5 text-xs transition-all hover:bg-muted active:scale-95 disabled:opacity-40"
            >
              <ArrowRightLeft size={14} />
              تحويل
            </button>
          </div>

          {lastOrder && (
            <button
              onClick={() => setShowReceipt(true)}
              className="w-full py-2 rounded-lg border border-amber-400/50 text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            >
              <Printer size={14} />
              إعادة طباعة الفاتورة
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
