import { useGetKitchenOrders, useUpdateOrderStatus, getGetKitchenOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Clock, Check, Utensils, AlertTriangle } from "lucide-react";

export default function Kitchen() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useGetKitchenOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusUpdate = (id: number, status: any) => {
    updateStatus.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast.success("تم التحديث");
          queryClient.invalidateQueries({ queryKey: getGetKitchenOrdersQueryKey() });
        }
      }
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">شاشة المطبخ (KDS)</h1>
        <p className="text-muted-foreground">الطلبات النشطة التي تحتاج إلى تحضير</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
        {isLoading ? (
          [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)
        ) : orders?.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground">
            <Utensils size={64} className="mb-4 opacity-20" />
            <h2 className="text-2xl font-bold mb-2">لا توجد طلبات حالياً</h2>
            <p>المطبخ خالي، يمكنك أخذ قسط من الراحة!</p>
          </div>
        ) : (
          orders?.map(order => {
            const timeElapsed = new Date().getTime() - new Date(order.createdAt).getTime();
            const isLate = timeElapsed > 15 * 60 * 1000; // 15 mins

            return (
              <Card key={order.id} className={`flex flex-col border-2 overflow-hidden ${
                isLate && order.status === 'pending' ? 'border-destructive shadow-destructive/20' : 
                order.status === 'preparing' ? 'border-amber-500 shadow-amber-500/20' : 
                'border-border/50'
              }`}>
                <div className={`p-3 flex justify-between items-center text-white ${
                  isLate && order.status === 'pending' ? 'bg-destructive' : 
                  order.status === 'preparing' ? 'bg-amber-500' : 
                  'bg-secondary-foreground'
                }`}>
                  <div className="font-bold text-xl px-2">#{order.orderNumber}</div>
                  <div className="flex items-center gap-2 font-medium bg-black/20 px-3 py-1 rounded-full text-sm">
                    {isLate ? <AlertTriangle size={14} /> : <Clock size={14} />}
                    <span dir="ltr">
                      {formatDistanceToNow(new Date(order.createdAt), { locale: ar, addSuffix: false })}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 border-b flex justify-between items-center">
                  <Badge variant="outline" className="bg-background font-bold text-sm">
                    {order.type === 'dine_in' ? `طاولة ${order.tableName}` : order.type === 'takeaway' ? 'تيك أواي' : 'توصيل'}
                  </Badge>
                  <span className="text-sm font-medium">{order.items.length} أصناف</span>
                </div>

                <CardContent className="p-0 flex-1 overflow-y-auto min-h-[150px]">
                  <ul className="divide-y divide-border/50">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="p-3 flex gap-3 text-lg">
                        <span className="font-black text-primary">{item.quantity}x</span>
                        <div>
                          <span className="font-bold">{item.productNameAr || item.productName}</span>
                          {item.notes && (
                            <p className="text-sm text-destructive mt-1 font-medium bg-destructive/10 p-1.5 rounded inline-block">
                              ملاحظة: {item.notes}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <div className="p-3 bg-muted/20 border-t mt-auto">
                  {order.status === 'pending' && (
                    <Button 
                      className="w-full h-14 text-lg font-bold rounded-xl"
                      onClick={() => handleStatusUpdate(order.id, 'preparing')}
                    >
                      بدء التحضير
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button 
                      className="w-full h-14 text-lg font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white"
                      onClick={() => handleStatusUpdate(order.id, 'ready')}
                    >
                      <Check className="ml-2" />
                      جاهز للتسليم
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}