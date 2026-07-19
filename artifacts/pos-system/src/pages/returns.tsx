import { useState } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Eye, Search, RotateCcw, DollarSign, Package, Calendar, AlertTriangle, Users } from "lucide-react";

function fetchAuth(url: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("pos_token") ?? "";
  return fetch(url, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers ?? {}) } });
}
async function apiGet(url: string) { const r = await fetchAuth(url); if (!r.ok) throw new Error(await r.text()); return r.json(); }
async function apiPost(url: string, body: any) { const r = await fetchAuth(url, { method: "POST", body: JSON.stringify(body) }); if (!r.ok) throw new Error(await r.text()); return r.json(); }
async function apiDel(url: string) { const r = await fetchAuth(url, { method: "DELETE" }); if (!r.ok && r.status !== 204) throw new Error(await r.text()); }

function fmt(n?: number) { return Number(n ?? 0).toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

/* ─── نافذة مرتجع جديد (مع بحث بالفاتورة) ─── */
function NewReturnDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const { toast } = useToast();
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<number, { selected: boolean; qty: number; returnToStock: boolean }>>({});
  const [reason, setReason] = useState("خطأ في الطلب");
  const [customReason, setCustomReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  const searchOrders = async () => {
    if (!invoiceSearch.trim()) return;
    setSearching(true);
    try {
      const data = await apiGet(`/api/orders/lookup?q=${encodeURIComponent(invoiceSearch.trim())}`);
      setSearchResults(data);
      if (data.length === 0) {
        toast({ variant: "destructive", title: "لا توجد نتائج", description: "لم يتم العثور على أي فاتورة تطابق بحثك." });
      } else if (data.length === 1) {
        // إذا كانت هناك نتيجة واحدة فقط، اخترها تلقائياً لتسريع العمل
        selectOrder(data[0]);
      }
    } catch (e: any) {
      setSearchResults([]);
      toast({ variant: "destructive", title: "فشل البحث", description: e.message });
    } finally {
      setSearching(false);
    }
  };

  const selectOrder = (order: any) => {
    setSelectedOrder(order);
    setPaymentMethod(order.paymentMethod || "cash");
    
    // تحديد جميع العناصر بالكمية الكاملة المتبقية افتراضياً
    const sel: Record<number, { selected: boolean; qty: number; returnToStock: boolean }> = {};
    (order.items ?? []).forEach((item: any, idx: number) => {
      sel[idx] = { 
        selected: item.remainingQuantity > 0, 
        qty: item.remainingQuantity, 
        returnToStock: true 
      };
    });
    setSelectedItems(sel);
  };

  const toggleItem = (idx: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [idx]: { ...prev[idx], selected: !prev[idx]?.selected },
    }));
  };

  const setQty = (idx: number, qty: number) => {
    const maxQty = selectedOrder?.items?.[idx]?.remainingQuantity ?? 1;
    setSelectedItems(prev => ({
      ...prev,
      [idx]: { ...prev[idx], qty: Math.max(1, Math.min(qty, maxQty)) },
    }));
  };

  const toggleReturnToStock = (idx: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [idx]: { ...prev[idx], returnToStock: !prev[idx]?.returnToStock },
    }));
  };

  // إرجاع الفاتورة بالكامل
  const handleReturnAll = () => {
    if (!selectedOrder) return;
    const sel: Record<number, { selected: boolean; qty: number; returnToStock: boolean }> = {};
    (selectedOrder.items ?? []).forEach((item: any, idx: number) => {
      if (item.remainingQuantity > 0) {
        sel[idx] = { selected: true, qty: item.remainingQuantity, returnToStock: true };
      }
    });
    setSelectedItems(sel);
    toast({ title: "تم تحديد الفاتورة بالكامل", description: "تم تحديد جميع الكميات المتبقية للإرجاع." });
  };

  const selectedTotal = selectedOrder?.items
    ? selectedOrder.items.reduce((sum: number, item: any, idx: number) => {
        const sel = selectedItems[idx];
        if (!sel?.selected) return sum;
        return sum + item.unitPrice * (sel.qty ?? item.remainingQuantity);
      }, 0)
    : 0;

  const createMut = useMutation({
    mutationFn: () => {
      const items = (selectedOrder?.items ?? [])
        .map((item: any, idx: number) => {
          const sel = selectedItems[idx];
          if (!sel?.selected) return null;
          return { 
            product_id: item.productId, 
            product_name: item.productName, 
            quantity: sel.qty, 
            unit_price: item.unitPrice,
            return_to_stock: sel.returnToStock
          };
        })
        .filter(Boolean);

      const finalReason = reason === "سبب آخر" ? customReason : reason;

      return apiPost("/api/returns", {
        invoice_number: selectedOrder.invoiceNumber,
        order_id: selectedOrder.id,
        reason: finalReason,
        payment_method: paymentMethod,
        notes,
        items,
      });
    },
    onSuccess: () => {
      toast({ title: "تم اعتماد المرتجع بنجاح", description: "تم تحديث المخزن وصندوق المبيعات وسجل التدقيق تلقائياً." });
      onSuccess();
      onClose();
      setSelectedOrder(null);
      setSearchResults([]);
      setInvoiceSearch("");
      setSelectedItems({});
      setReason("خطأ في الطلب");
      setCustomReason("");
      setNotes("");
    },
    onError: (e: any) => toast({ variant: "destructive", title: "فشل في اعتماد المرتجع", description: e.message }),
  });

  const canSubmit = selectedOrder && 
                    Object.values(selectedItems).some((s: any) => s.selected) && 
                    (reason !== "سبب آخر" || customReason.trim().length > 0) &&
                    !createMut.isPending;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-3xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-primary" />
            إدارة وإنشاء المرتجعات (المحاسب / المدير)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* ── حالة البحث واختيار الفاتورة ── */}
          {!selectedOrder ? (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border">
                <h3 className="font-semibold text-sm text-foreground">البحث عن الفاتورة الأصلية لعمل مرتجع</h3>
                <p className="text-xs text-muted-foreground">
                  يمكنك البحث بواسطة: رقم الفاتورة (مثال: INV-0005)، أو باركود صنف، أو تاريخ البيع (YYYY-MM-DD)، أو اسم الكاشير.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={invoiceSearch}
                    onChange={e => setInvoiceSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && searchOrders()}
                    placeholder="ابحث برقم الفاتورة، الباركود، التاريخ، أو اسم الكاشير..."
                    className="flex-1"
                  />
                  <Button onClick={searchOrders} disabled={searching || !invoiceSearch.trim()} className="gap-1">
                    <Search className="w-4 h-4" />{searching ? "جاري البحث..." : "بحث"}
                  </Button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="border border-border rounded-xl overflow-hidden bg-card">
                  <div className="p-3 bg-muted/50 border-b border-border font-bold text-xs text-muted-foreground">
                    نتائج البحث ({searchResults.length} فاتورة مطابقة):
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/20 text-xs sticky top-0">
                        <tr className="border-b border-border">
                          <th className="text-right p-3">رقم الفاتورة</th>
                          <th className="text-right p-3">الكاشير</th>
                          <th className="text-right p-3">التاريخ والوقت</th>
                          <th className="text-right p-3">طريقة الدفع</th>
                          <th className="text-left p-3">الإجمالي</th>
                          <th className="p-3 w-32"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {searchResults.map((order: any) => (
                          <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-3 font-mono font-bold text-primary">{order.invoiceNumber}</td>
                            <td className="p-3">{order.cashierName}</td>
                            <td className="p-3 text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleString("ar-SA")}
                            </td>
                            <td className="p-3 text-xs">
                              <Badge variant="outline">{order.paymentMethod === "cash" ? "نقداً" : order.paymentMethod === "card" ? "شبكة" : "أخرى"}</Badge>
                            </td>
                            <td className="p-3 font-mono font-bold text-left">{fmt(order.total)}</td>
                            <td className="p-3 text-center">
                              {order.fullyReturned ? (
                                <Badge variant="destructive" className="text-xs">مرتجعة بالكامل</Badge>
                              ) : (
                                <Button size="sm" variant="secondary" onClick={() => selectOrder(order)} className="w-full text-xs py-1 h-8">
                                  {order.alreadyReturned ? "تعديل / مرتجع جزئي" : "اختيار الفاتورة"}
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── حالة الفاتورة المحددة وتفاصيل المرتجع ── */
            <div className="space-y-4">
              <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="p-4 bg-muted/40 border-b border-border flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-primary flex items-center gap-2">
                      بيانات الفاتورة الأصلية: {selectedOrder.invoiceNumber}
                    </h3>
                    <div className="text-xs text-muted-foreground mt-1 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                      <div><strong className="text-foreground">الكاشير:</strong> {selectedOrder.cashierName}</div>
                      <div><strong className="text-foreground">الفرع:</strong> الفرع الرئيسي</div>
                      <div><strong className="text-foreground">وقت البيع:</strong> {new Date(selectedOrder.createdAt).toLocaleString("ar-SA")}</div>
                      <div><strong className="text-foreground">طريقة الدفع:</strong> {selectedOrder.paymentMethod === "cash" ? "نقداً" : "شبكة"}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)} className="text-xs">
                    تغيير الفاتورة / بحث جديد
                  </Button>
                </div>

                {selectedOrder.alreadyReturned && (
                  <div className="p-3 bg-yellow-50 border-b border-yellow-100 text-xs text-yellow-800 flex flex-col gap-1">
                    <span className="font-bold flex items-center gap-1">⚠️ تنبيه: تم عمل مرتجع سابق على هذه الفاتورة:</span>
                    <div className="pl-4">
                      {selectedOrder.existingReturns?.map((ret: any) => (
                        <div key={ret.id}>
                          • سند رقم: <span className="font-mono font-bold">{ret.return_number}</span> بقيمة <span className="font-bold">{fmt(ret.total_refund)} ريال</span> في تاريخ {new Date(ret.created_at).toLocaleDateString("ar-SA")}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-muted-foreground">تحديد المنتجات والكميات المرتجعة:</h4>
                    <Button type="button" variant="outline" size="sm" onClick={handleReturnAll} className="text-xs py-1 h-7">
                      إرجاع الفاتورة بالكامل
                    </Button>
                  </div>
                  
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground">
                        <th className="text-right py-2 pr-1 w-8"></th>
                        <th className="text-right py-2">الصنف</th>
                        <th className="text-center py-2 w-20">الكمية الأصلية</th>
                        <th className="text-center py-2 w-24">مسترجع سابقاً</th>
                        <th className="text-center py-2 w-24">الكمية المرتجعة</th>
                        <th className="text-center py-2 w-28">إعادة للمخزن؟</th>
                        <th className="text-left py-2 w-24">سعر الوحدة</th>
                        <th className="text-left py-2 w-24">إجمالي المرتجع</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {(selectedOrder.items ?? []).map((item: any, idx: number) => {
                        const sel = selectedItems[idx];
                        const isAvailable = item.remainingQuantity > 0;
                        
                        return (
                          <tr key={idx} className={`hover:bg-muted/10 transition-colors ${sel?.selected ? "" : "opacity-50"}`}>
                            <td className="py-2 pr-1">
                              <Checkbox 
                                checked={sel?.selected ?? false} 
                                disabled={!isAvailable}
                                onCheckedChange={() => toggleItem(idx)} 
                              />
                            </td>
                            <td className="py-2">
                              <div className="font-medium text-foreground">{item.productName}</div>
                            </td>
                            <td className="py-2 text-center font-mono">{item.quantity}</td>
                            <td className="py-2 text-center font-mono text-amber-600">
                              {item.returnedQuantity > 0 ? item.returnedQuantity : "—"}
                            </td>
                            <td className="py-2 text-center">
                              <Input
                                type="number"
                                value={sel?.qty ?? item.remainingQuantity}
                                min={1}
                                max={item.remainingQuantity}
                                disabled={!sel?.selected || !isAvailable}
                                onChange={e => setQty(idx, Number(e.target.value))}
                                className="w-16 h-8 text-center text-sm mx-auto"
                              />
                            </td>
                            <td className="py-2 text-center">
                              <Checkbox
                                checked={sel?.returnToStock ?? true}
                                disabled={!sel?.selected}
                                onCheckedChange={() => toggleReturnToStock(idx)}
                              />
                              <span className="text-xs text-muted-foreground mr-1">نعم</span>
                            </td>
                            <td className="py-2 text-left font-mono text-xs">{fmt(item.unitPrice)}</td>
                            <td className="py-2 text-left font-mono font-bold text-xs text-destructive">
                              {fmt(item.unitPrice * (sel?.qty ?? item.remainingQuantity))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-border font-bold">
                    <span className="text-foreground">إجمالي المبلغ المراد استرداده:</span>
                    <span className="text-destructive text-xl font-black">{fmt(selectedTotal)} ريال</span>
                  </div>
                </div>
              </div>

              {/* ── خيارات تفاصيل المرتجع والاعتماد ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">سبب المرتجع *</label>
                    <Select value={reason} onValueChange={setReason}>
                      <SelectTrigger className="w-full bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="خطأ في الطلب">خطأ في الطلب</SelectItem>
                        <SelectItem value="المنتج تالف">المنتج تالف</SelectItem>
                        <SelectItem value="العميل ألغى الطلب">العميل ألغى الطلب</SelectItem>
                        <SelectItem value="تم احتساب المنتج مرتين">تم احتساب المنتج مرتين</SelectItem>
                        <SelectItem value="سبب آخر">سبب آخر (أدخل نص مخصص)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {reason === "سبب آخر" && (
                    <div>
                      <label className="text-xs font-bold text-foreground mb-1 block">يرجى كتابة سبب الإرجاع بالتفصيل *</label>
                      <Input
                        value={customReason}
                        onChange={e => setCustomReason(e.target.value)}
                        placeholder="اكتب السبب المخصص هنا..."
                        required
                        className="bg-background"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">طريقة استرداد المبلغ</label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="w-full bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">نقداً (من الصندوق)</SelectItem>
                        <SelectItem value="card">شبكة (بطاقة بنكية)</SelectItem>
                        <SelectItem value="credit">رصيد للعميل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">ملاحظات المحاسب / المدير</label>
                    <Input
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="ملاحظات إضافية اختيارية..."
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 border-t pt-3 border-border">
          <Button variant="outline" onClick={onClose}>إلغاء وإغلاق</Button>
          {selectedOrder && (
            <Button 
              onClick={() => createMut.mutate()} 
              disabled={!canSubmit || createMut.isPending} 
              className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <RotateCcw className="w-4 h-4" />
              {createMut.isPending ? "جاري الحفظ..." : "اعتماد المرتجع وإصدار السند"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── نافذة تفاصيل المرتجع ─── */
function ViewReturnDialog({ ret, onClose }: { ret: any; onClose: () => void }) {
  if (!ret) return null;
  const pmLabel: Record<string, string> = { cash: "نقداً", card: "شبكة", credit: "رصيد للعميل" };
  return (
    <Dialog open={!!ret} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader><DialogTitle>تفاصيل المرتجع — {ret.return_number}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-muted-foreground">رقم الفاتورة: </span><span className="font-medium">{ret.invoice_number}</span></div>
            <div><span className="text-muted-foreground">التاريخ: </span><span className="font-medium">{new Date(ret.created_at).toLocaleDateString("ar-SA")}</span></div>
            <div><span className="text-muted-foreground">السبب: </span><span className="font-medium">{ret.reason ?? "—"}</span></div>
            <div><span className="text-muted-foreground">طريقة الاسترداد: </span><span className="font-medium">{pmLabel[ret.payment_method] ?? ret.payment_method}</span></div>
            <div><span className="text-muted-foreground">الكاشير: </span><span className="font-medium">{ret.cashier_name}</span></div>
            {ret.notes && <div className="col-span-2"><span className="text-muted-foreground">ملاحظات: </span><span className="font-medium">{ret.notes}</span></div>}
          </div>
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-right p-2 font-semibold">المنتج</th>
                  <th className="text-right p-2 font-semibold">الكمية</th>
                  <th className="text-right p-2 font-semibold">السعر</th>
                  <th className="text-right p-2 font-semibold">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(ret.items ?? []).map((it: any) => (
                  <tr key={it.id}>
                    <td className="p-2">{it.product_name}</td>
                    <td className="p-2">{it.quantity}</td>
                    <td className="p-2 font-mono">{fmt(it.unit_price)}</td>
                    <td className="p-2 font-mono text-destructive font-semibold">{fmt(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center pt-2 font-bold text-lg">
            <span>إجمالي المبلغ المسترد:</span>
            <span className="text-destructive">{fmt(ret.total_refund)}</span>
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>إغلاق</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── صناديق الكاشيرين ─── */
function CashierBoxes() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const { data, isLoading } = useQuery({
    queryKey: ["cashier-boxes", date],
    queryFn: () => apiGet(`/api/cashier-boxes?date=${date}`),
  });

  const box = (data as any)?.mainBox;
  const cashiers = (data as any)?.cashiers ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">تاريخ الصندوق:</label>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-44" />
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
      ) : (
        <>
          {/* الصندوق الرئيسي */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-2 border-primary/30 col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />الصندوق الرئيسي — {date}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs text-muted-foreground">إجمالي المبيعات</div>
                    <div className="text-xl font-bold text-primary">{fmt(box?.total)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">إجمالي المرتجعات</div>
                    <div className="text-xl font-bold text-destructive">-{fmt(box?.returnsTotal)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">الصافي</div>
                    <div className="text-2xl font-black text-green-600">{fmt(box?.net)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* صناديق الكاشيرين */}
          <div>
            <h3 className="text-sm font-bold text-muted-foreground mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />صناديق الكاشيرين
            </h3>
            <div className="bg-card rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-right p-3 font-semibold">الكاشير</th>
                    <th className="text-right p-3 font-semibold">المبيعات</th>
                    <th className="text-right p-3 font-semibold">عدد الفواتير</th>
                    <th className="text-right p-3 font-semibold">المرتجعات</th>
                    <th className="text-right p-3 font-semibold">الصافي</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cashiers.map((c: any) => (
                    <tr key={c.userId} className="hover:bg-muted/30">
                      <td className="p-3 font-medium">{c.name}</td>
                      <td className="p-3 font-mono text-primary">{fmt(c.ordersTotal)}</td>
                      <td className="p-3 text-center">{c.ordersCount}</td>
                      <td className="p-3 font-mono text-destructive">-{fmt(c.returnsTotal)}</td>
                      <td className="p-3 font-mono font-bold text-green-700">{fmt(c.net)}</td>
                    </tr>
                  ))}
                  {cashiers.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">لا توجد بيانات لهذا اليوم</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Returns() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [viewRet, setViewRet] = useState<any>(null);

  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  if (search) params.set("search", search);

  const { data: returns_ = [], isLoading } = useQuery({ queryKey: ["returns", startDate, endDate, search], queryFn: () => apiGet(`/api/returns?${params}`) });
  const { data: summary } = useQuery({ queryKey: ["returns-summary"], queryFn: () => apiGet("/api/returns-summary") });

  const delMut = useMutation({
    mutationFn: (id: number) => apiDel(`/api/returns/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["returns"] }); qc.invalidateQueries({ queryKey: ["returns-summary"] }); toast({ title: "تم الحذف" }); },
    onError: () => toast({ variant: "destructive", title: "فشل في الحذف" }),
  });

  const pmLabel: Record<string, string> = { cash: "نقداً", card: "شبكة", credit: "رصيد" };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">نظام المرتجعات</h1>
          <Button onClick={() => setShowNew(true)} className="gap-2"><Plus className="w-4 h-4" />مرتجع جديد</Button>
        </div>

        <Tabs defaultValue="returns">
          <TabsList>
            <TabsTrigger value="returns">المرتجعات</TabsTrigger>
            <TabsTrigger value="boxes">الصناديق</TabsTrigger>
          </TabsList>

          <TabsContent value="returns" className="space-y-4 mt-4">
            {/* إحصائيات */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" />مرتجعات اليوم</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(summary as any)?.todayCount ?? 0}</div>
                  <div className="text-sm text-destructive font-mono">{fmt((summary as any)?.todayTotal)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" />مرتجعات الشهر</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(summary as any)?.monthCount ?? 0}</div>
                  <div className="text-sm text-destructive font-mono">{fmt((summary as any)?.monthTotal)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Package className="w-4 h-4" />إجمالي المرتجعات</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{(summary as any)?.totalCount ?? 0}</div></CardContent>
              </Card>
            </div>

            {/* فلاتر */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث برقم الفاتورة..." className="w-48" />
              </div>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-36" />
              <span className="text-muted-foreground">—</span>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-36" />
              {(startDate || endDate || search) && (
                <Button variant="ghost" size="sm" onClick={() => { setStartDate(""); setEndDate(""); setSearch(""); }}>مسح</Button>
              )}
            </div>

            {/* جدول المرتجعات */}
            {isLoading ? (
              <div className="text-center py-16 text-muted-foreground">جاري التحميل...</div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-right p-3 font-semibold">رقم المرتجع</th>
                      <th className="text-right p-3 font-semibold">رقم الفاتورة</th>
                      <th className="text-right p-3 font-semibold">التاريخ</th>
                      <th className="text-right p-3 font-semibold">السبب</th>
                      <th className="text-right p-3 font-semibold">الاسترداد</th>
                      <th className="text-right p-3 font-semibold">المبلغ</th>
                      <th className="text-right p-3 font-semibold">الكاشير</th>
                      <th className="p-3 w-24"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(returns_ as any[]).map((r: any) => (
                      <tr key={r.id} className="hover:bg-muted/30">
                        <td className="p-3 font-mono text-xs text-primary">{r.return_number}</td>
                        <td className="p-3 font-mono text-xs">{r.invoice_number}</td>
                        <td className="p-3 text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar-SA")}</td>
                        <td className="p-3">{r.reason ?? "—"}</td>
                        <td className="p-3"><Badge variant="outline">{pmLabel[r.payment_method] ?? r.payment_method}</Badge></td>
                        <td className="p-3 font-mono font-bold text-destructive">{fmt(r.total_refund)}</td>
                        <td className="p-3 text-muted-foreground">{r.cashier_name}</td>
                        <td className="p-3">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="icon" onClick={() => setViewRet(r)}><Eye className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => confirm(`حذف المرتجع ${r.return_number}؟`) && delMut.mutate(r.id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(returns_ as any[]).length === 0 && (
                      <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">لا توجد مرتجعات</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="boxes" className="mt-4">
            <CashierBoxes />
          </TabsContent>
        </Tabs>

        <NewReturnDialog
          open={showNew}
          onClose={() => setShowNew(false)}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ["returns"] }); qc.invalidateQueries({ queryKey: ["returns-summary"] }); }}
        />
        <ViewReturnDialog ret={viewRet} onClose={() => setViewRet(null)} />
      </div>
    </AdminLayout>
  );
}
