import { useGetTables, useUpdateTable, getGetTablesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Coffee, Users, MapPin, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import type { TableUpdateStatus } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Tables() {
  const queryClient = useQueryClient();
  const { data: tables, isLoading } = useGetTables();
  const updateTable = useUpdateTable();

  const handleStatusUpdate = (id: number, status: TableUpdateStatus) => {
    updateTable.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast.success("تم تحديث حالة الطاولة");
          queryClient.invalidateQueries({ queryKey: getGetTablesQueryKey() });
        }
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">إدارة الطاولات</h1>
        <p className="text-muted-foreground">نظرة عامة على حالة جميع طاولات المطعم</p>
      </div>

      <div className="flex gap-4 p-4 bg-card rounded-xl border border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-sm font-medium">متاح</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-500"></div>
          <span className="text-sm font-medium">مشغول</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-sm font-medium">محجوز</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="aspect-square rounded-2xl" />)
        ) : (
          tables?.map(table => {
            const isAvailable = table.status === 'available';
            const isOccupied = table.status === 'occupied';
            const isReserved = table.status === 'reserved';

            return (
              <Card 
                key={table.id} 
                className={`relative overflow-hidden transition-all duration-300 border-2 ${
                  isAvailable ? 'border-green-500/50 hover:border-green-500 hover:shadow-green-500/20 hover:shadow-lg' : 
                  isOccupied ? 'border-amber-500/50 hover:border-amber-500 hover:shadow-amber-500/20 hover:shadow-lg' : 
                  'border-red-500/50 hover:border-red-500 hover:shadow-red-500/20 hover:shadow-lg'
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-2 ${
                  isAvailable ? 'bg-green-500' : isOccupied ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                
                <CardContent className="p-6 flex flex-col items-center text-center mt-2">
                  <div className={`p-4 rounded-full mb-4 ${
                    isAvailable ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 
                    isOccupied ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 
                    'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {isOccupied ? <Coffee size={32} /> : isReserved ? <CheckCircle size={32} /> : <Coffee size={32} />}
                  </div>
                  
                  <h3 className="text-2xl font-black mb-1 text-foreground">طاولة {table.number}</h3>
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-4">
                    <Users size={14} />
                    <span>سعة {table.capacity} أشخاص</span>
                  </div>

                  {table.section && (
                    <Badge variant="outline" className="mb-4">
                      <MapPin size={12} className="mr-1 ml-1" />
                      {table.section}
                    </Badge>
                  )}

                  <div className="mt-auto w-full grid grid-cols-1 gap-2">
                    {isAvailable && (
                      <>
                        <button 
                          className="w-full py-2 bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-600 font-bold rounded-lg transition-colors text-sm"
                          onClick={() => handleStatusUpdate(table.id, 'occupied')}
                        >
                          شغل الطاولة
                        </button>
                        <button 
                          className="w-full py-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-600 font-bold rounded-lg transition-colors text-sm"
                          onClick={() => handleStatusUpdate(table.id, 'reserved')}
                        >
                          حجز
                        </button>
                      </>
                    )}
                    {isOccupied && (
                      <>
                        <button 
                          className="w-full py-2 bg-green-500/10 hover:bg-green-500 hover:text-white text-green-600 font-bold rounded-lg transition-colors text-sm"
                          onClick={() => handleStatusUpdate(table.id, 'available')}
                        >
                          إخلاء الطاولة
                        </button>
                      </>
                    )}
                    {isReserved && (
                      <>
                        <button 
                          className="w-full py-2 bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-600 font-bold rounded-lg transition-colors text-sm"
                          onClick={() => handleStatusUpdate(table.id, 'occupied')}
                        >
                          وصل العميل
                        </button>
                        <button 
                          className="w-full py-2 bg-green-500/10 hover:bg-green-500 hover:text-white text-green-600 font-bold rounded-lg transition-colors text-sm"
                          onClick={() => handleStatusUpdate(table.id, 'available')}
                        >
                          إلغاء الحجز
                        </button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}