import { useState } from "react";
import { useGetInventoryItems, useGetInventorySummary } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Package, AlertTriangle, ArrowDownRight, PackageX, Boxes } from "lucide-react";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const { data: summary, isLoading: loadingSummary } = useGetInventorySummary();
  const { data: items, isLoading: loadingItems } = useGetInventoryItems({ 
    search: search || undefined,
    lowStock: showLowStockOnly ? true : undefined
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">المخزون</h1>
          <p className="text-muted-foreground">إدارة مخزون المواد الخام والمنتجات</p>
        </div>
        <Button className="shrink-0"><Plus className="ml-2 h-4 w-4" /> إضافة صنف جديد</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary"><Boxes size={20} /></div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">إجمالي الأصناف</p>
            {loadingSummary ? <Skeleton className="h-8 w-20" /> : <h3 className="text-3xl font-bold">{summary?.totalItems || 0}</h3>}
          </CardContent>
        </Card>
        
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><AlertTriangle size={20} /></div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">أصناف منخفضة</p>
            {loadingSummary ? <Skeleton className="h-8 w-20" /> : <h3 className="text-3xl font-bold text-amber-500">{summary?.lowStockItems || 0}</h3>}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><PackageX size={20} /></div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">نفدت الكمية</p>
            {loadingSummary ? <Skeleton className="h-8 w-20" /> : <h3 className="text-3xl font-bold text-red-500">{summary?.outOfStockItems || 0}</h3>}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-white/20 rounded-lg"><Package size={20} /></div>
            </div>
            <p className="text-sm font-medium text-primary-foreground/80 mb-1">القيمة الإجمالية</p>
            {loadingSummary ? <Skeleton className="h-8 w-24 bg-white/30" /> : <h3 className="text-3xl font-bold">{(summary?.totalValue || 0).toFixed(2)} د.ك</h3>}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input 
              placeholder="البحث في المخزون..." 
              className="pl-4 pr-10 bg-background border-border/50 h-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button 
            variant={showLowStockOnly ? "destructive" : "outline"} 
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className="w-full sm:w-auto"
          >
            <AlertTriangle className="ml-2 h-4 w-4" />
            {showLowStockOnly ? "عرض الكل" : "إظهار النواقص فقط"}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b">
              <tr>
                <th className="font-semibold p-4 text-right">الصنف</th>
                <th className="font-semibold p-4 text-right">المورد</th>
                <th className="font-semibold p-4 text-right">المخزون الحالي</th>
                <th className="font-semibold p-4 text-right">الحد الأدنى</th>
                <th className="font-semibold p-4 text-right">التكلفة (الوحدة)</th>
                <th className="font-semibold p-4 text-right">القيمة</th>
                <th className="font-semibold p-4 text-right">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loadingItems ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td className="p-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                  </tr>
                ))
              ) : items?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    <Package size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg">لا توجد أصناف في المخزون</p>
                  </td>
                </tr>
              ) : (
                items?.map(item => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-base">{item.nameAr || item.name}</span>
                    </td>
                    <td className="p-4 text-muted-foreground">{item.supplier || '-'}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-lg ${item.currentStock === 0 ? 'text-red-500' : item.isLowStock ? 'text-amber-500' : ''}`}>
                          {item.currentStock}
                        </span>
                        <span className="text-muted-foreground">{item.unit}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{item.minStock} {item.unit}</td>
                    <td className="p-4 font-medium">{item.costPerUnit.toFixed(2)} د.ك</td>
                    <td className="p-4 font-bold text-primary">{item.totalValue.toFixed(2)} د.ك</td>
                    <td className="p-4">
                      {item.currentStock === 0 ? (
                        <Badge variant="destructive" className="font-bold">نفدت الكمية</Badge>
                      ) : item.isLowStock ? (
                        <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none font-bold">منخفض</Badge>
                      ) : (
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none font-bold">جيد</Badge>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}