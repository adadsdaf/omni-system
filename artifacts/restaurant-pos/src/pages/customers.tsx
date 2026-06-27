import { useState } from "react";
import { useGetCustomers } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Search, Plus, UserCircle2, Phone, Mail, MapPin, Award, ArrowUpRight } from "lucide-react";

export default function Customers() {
  const [search, setSearch] = useState("");
  const { data: customers, isLoading } = useGetCustomers({ search: search || undefined });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">العملاء</h1>
          <p className="text-muted-foreground">إدارة بيانات العملاء وبرنامج الولاء</p>
        </div>
        <Button className="shrink-0"><Plus className="ml-2 h-4 w-4" /> عميل جديد</Button>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input 
              placeholder="البحث بالاسم أو رقم الهاتف..." 
              className="pl-4 pr-10 bg-background border-border/50 h-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b">
              <tr>
                <th className="font-semibold p-4 text-right">العميل</th>
                <th className="font-semibold p-4 text-right">معلومات الاتصال</th>
                <th className="font-semibold p-4 text-right">إجمالي الطلبات</th>
                <th className="font-semibold p-4 text-right">إجمالي الإنفاق</th>
                <th className="font-semibold p-4 text-right">نقاط الولاء</th>
                <th className="font-semibold p-4 text-right">تاريخ الانضمام</th>
                <th className="font-semibold p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td className="p-4"><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-32" /></div></td>
                    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="p-4"></td>
                  </tr>
                ))
              ) : customers?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    <UserCircle2 size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg">لا يوجد عملاء يطابقون بحثك</p>
                  </td>
                </tr>
              ) : (
                customers?.map(customer => (
                  <tr key={customer.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {customer.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-base">{customer.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground space-y-1">
                      {customer.phone && <div className="flex items-center gap-1.5"><Phone size={14} /> <span dir="ltr">{customer.phone}</span></div>}
                      {customer.email && <div className="flex items-center gap-1.5"><Mail size={14} /> {customer.email}</div>}
                    </td>
                    <td className="p-4 font-medium">{customer.totalOrders} طلب</td>
                    <td className="p-4 font-bold text-primary">{customer.totalSpent.toFixed(2)} د.ك</td>
                    <td className="p-4">
                      <Badge variant="secondary" className="font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-none">
                        <Award size={14} className="mr-1 ml-1" />
                        {customer.loyaltyPoints} نقطة
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {format(new Date(customer.createdAt), "dd MMMM yyyy", { locale: ar })}
                    </td>
                    <td className="p-4 text-left">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        التفاصيل <ArrowUpRight className="mr-1 h-4 w-4" />
                      </Button>
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