import { useGetOrders, useUpdateOrderStatus, getGetOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Clock, CheckCircle2, Truck, Coffee, ShoppingBag, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Orders() {
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useGetOrders({ 
    type: filterType,
    status: filterStatus 
  });
  
  const updateStatus = useUpdateOrderStatus();

  const handleUpdateStatus = (id: number, newStatus: any) => {
    updateStatus.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success("تم تحديث حالة الطلب");
          queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() });
        }
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">إدارة الطلبات</h1>
          <p className="text-muted-foreground">متابعة وإدارة جميع الطلبات</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <div className="p-4 border-b bg-muted/20 flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <Button 
              variant={filterStatus === null ? "default" : "secondary"}
              onClick={() => setFilterStatus(null)}
              className="rounded-xl font-bold"
            >
              الكل
            </Button>
            <Button 
              variant={filterStatus === 'pending' ? "default" : "secondary"}
              onClick={() => setFilterStatus('pending')}
              className="rounded-xl font-bold"
            >
              قيد الانتظار
            </Button>
            <Button 
              variant={filterStatus === 'preparing' ? "default" : "secondary"}
              onClick={() => setFilterStatus('preparing')}
              className="rounded-xl font-bold"
            >
              جاري التحضير
            </Button>
            <Button 
              variant={filterStatus === 'ready' ? "default" : "secondary"}
              onClick={() => setFilterStatus('ready')}
              className="rounded-xl font-bold"
            >
              جاهز
            </Button>
          </div>
          
          <div className="h-8 w-px bg-border hidden sm:block"></div>
          
          <div className="flex gap-2">
            <Button 
              variant={filterType === null ? "outline" : "ghost"}
              onClick={() => setFilterType(null)}
              className="rounded-xl border-dashed"
            >
              كل الأنواع
            </Button>
            <Button 
              variant={filterType === 'dine_in' ? "outline" : "ghost"}
              onClick={() => setFilterType('dine_in')}
              className="rounded-xl border-dashed"
            >
              <Coffee className="ml-2 h-4 w-4" />
              داخلي
            </Button>
            <Button 
              variant={filterType === 'takeaway' ? "outline" : "ghost"}
              onClick={() => setFilterType('takeaway')}
              className="rounded-xl border-dashed"
            >
              <ShoppingBag className="ml-2 h-4 w-4" />
              تيك أواي
            </Button>
            <Button 
              variant={filterType === 'delivery' ? "outline" : "ghost"}
              onClick={() => setFilterType('delivery')}
              className="rounded-xl border-dashed"
            >
              <Truck className="ml-2 h-4 w-4" />
              توصيل
            </Button>
          </div>
        </div>

        <div className="p-0">
          <div className="grid grid-cols-1 divide-y">
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="p-6 flex items-center justify-between">
                  <div className="space-y-3"><Skeleton className="h-6 w-32" /><Skeleton className="h-4 w-48" /></div>
                  <Skeleton className="h-10 w-24 rounded-full" />
                </div>
              ))
            ) : orders?.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="text-lg">لا توجد طلبات تطابق هذا الفلتر</p>
              </div>
            ) : (
              orders?.map(order => (
                <div key={order.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-muted/10 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                      {order.orderNumber}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{order.total.toFixed(2)} د.ك</h3>
                        <Badge variant="outline" className="font-medium bg-background">
                          {order.type === 'dine_in' ? 'داخلي' : order.type === 'takeaway' ? 'تيك أواي' : 'توصيل'}
                        </Badge>
                        {order.tableName && (
                          <Badge variant="secondary" className="font-medium">طاولة {order.tableName}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {format(new Date(order.createdAt), "hh:mm a", { locale: ar })}
                        </span>
                        <span>{order.items.length} عناصر</span>
                      </div>
                      <div className="text-sm mt-2 text-foreground/80">
                        {order.items.map(i => `${i.quantity}x ${i.productNameAr}`).join(" • ")}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-3 sm:w-48 shrink-0">
                    <StatusBadge status={order.status} />
                    
                    <div className="flex gap-2 w-full sm:w-auto mt-2">
                      {order.status === 'pending' && (
                        <Button className="w-full sm:w-auto rounded-xl" onClick={() => handleUpdateStatus(order.id, 'preparing')}>
                          بدء التحضير
                        </Button>
                      )}
                      {order.status === 'preparing' && (
                        <Button className="w-full sm:w-auto rounded-xl bg-amber-500 hover:bg-amber-600 text-white" onClick={() => handleUpdateStatus(order.id, 'ready')}>
                          جاهز
                        </Button>
                      )}
                      {order.status === 'ready' && (
                        <Button className="w-full sm:w-auto rounded-xl bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateStatus(order.id, 'paid')}>
                          <CheckCircle2 className="ml-2 h-4 w-4" /> تم التسليم
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'paid') return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 px-3 py-1 text-sm font-bold w-full justify-center sm:w-auto">مكتمل / مدفوع</Badge>;
  if (status === 'pending') return <Badge variant="secondary" className="px-3 py-1 text-sm font-bold w-full justify-center sm:w-auto">قيد الانتظار</Badge>;
  if (status === 'preparing') return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 px-3 py-1 text-sm font-bold w-full justify-center sm:w-auto">جاري التحضير</Badge>;
  if (status === 'ready') return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 px-3 py-1 text-sm font-bold w-full justify-center sm:w-auto">جاهز للتسليم</Badge>;
  if (status === 'cancelled') return <Badge variant="destructive" className="px-3 py-1 text-sm font-bold w-full justify-center sm:w-auto">ملغي</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}