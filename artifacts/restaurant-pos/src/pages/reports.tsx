import { useState } from "react";
import { useGetSalesReport, useGetProductsReport } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { format, subDays } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import { Calendar, DollarSign, ShoppingBag, Receipt, Percent } from "lucide-react";

export default function Reports() {
  const [dateRange, setDateRange] = useState<'today'|'week'|'month'>('week');

  const from = dateRange === 'today' ? new Date().toISOString() : 
               dateRange === 'week' ? subDays(new Date(), 7).toISOString() : 
               subDays(new Date(), 30).toISOString();
               
  const to = new Date().toISOString();

  const { data: salesReport, isLoading: loadingSales } = useGetSalesReport({ from, to });
  const { data: productsReport, isLoading: loadingProducts } = useGetProductsReport({ from, to });

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">التقارير</h1>
          <p className="text-muted-foreground">تحليل المبيعات والأداء</p>
        </div>
        
        <div className="flex bg-muted p-1 rounded-xl">
          <Button 
            variant={dateRange === 'today' ? 'default' : 'ghost'} 
            size="sm" 
            className="rounded-lg"
            onClick={() => setDateRange('today')}
          >
            اليوم
          </Button>
          <Button 
            variant={dateRange === 'week' ? 'default' : 'ghost'} 
            size="sm" 
            className="rounded-lg"
            onClick={() => setDateRange('week')}
          >
            آخر 7 أيام
          </Button>
          <Button 
            variant={dateRange === 'month' ? 'default' : 'ghost'} 
            size="sm" 
            className="rounded-lg"
            onClick={() => setDateRange('month')}
          >
            آخر 30 يوم
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ReportSummaryCard 
          title="إجمالي الإيرادات" 
          value={salesReport ? `${salesReport.totalRevenue.toFixed(2)} د.ك` : ""} 
          icon={<DollarSign size={20} />} 
          loading={loadingSales} 
        />
        <ReportSummaryCard 
          title="إجمالي الطلبات" 
          value={salesReport?.totalOrders.toString() || ""} 
          icon={<ShoppingBag size={20} />} 
          loading={loadingSales} 
        />
        <ReportSummaryCard 
          title="متوسط قيمة الطلب" 
          value={salesReport ? `${salesReport.averageOrderValue.toFixed(2)} د.ك` : ""} 
          icon={<Receipt size={20} />} 
          loading={loadingSales} 
        />
        <ReportSummaryCard 
          title="إجمالي الخصومات" 
          value={salesReport ? `${salesReport.totalDiscount.toFixed(2)} د.ك` : ""} 
          icon={<Percent size={20} />} 
          loading={loadingSales} 
          valueClassName="text-amber-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Payment Methods Chart */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">المبيعات حسب طريقة الدفع</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSales ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full flex items-center justify-center">
                {salesReport?.byPaymentMethod && salesReport.byPaymentMethod.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesReport.byPaymentMethod}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="total"
                        nameKey="method"
                        stroke="none"
                      >
                        {salesReport.byPaymentMethod.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(2)} د.ك`, 'المبيعات']}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        formatter={(value) => {
                          const labels: Record<string, string> = { 'cash': 'نقد', 'card': 'بطاقة', 'transfer': 'تحويل', 'wallet': 'محفظة' };
                          return <span className="text-foreground font-medium mr-2">{labels[value] || value}</span>;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">لا توجد بيانات للفترة المحددة</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Types Chart */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">المبيعات حسب نوع الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSales ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full flex items-center justify-center">
                {salesReport?.byOrderType && salesReport.byOrderType.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesReport.byOrderType}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="total"
                        nameKey="type"
                        stroke="none"
                      >
                        {salesReport.byOrderType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(2)} د.ك`, 'المبيعات']}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        formatter={(value) => {
                          const labels: Record<string, string> = { 'dine_in': 'داخلي', 'takeaway': 'تيك أواي', 'delivery': 'توصيل' };
                          return <span className="text-foreground font-medium mr-2">{labels[value] || value}</span>;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">لا توجد بيانات للفترة المحددة</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">أداء المنتجات (الأفضل مبيعاً)</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-y">
              <tr>
                <th className="font-semibold p-4 text-right w-12">#</th>
                <th className="font-semibold p-4 text-right">المنتج</th>
                <th className="font-semibold p-4 text-right">التصنيف</th>
                <th className="font-semibold p-4 text-right">الكمية المباعة</th>
                <th className="font-semibold p-4 text-right">متوسط السعر</th>
                <th className="font-semibold p-4 text-right">الإيرادات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loadingProducts ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td className="p-4"><Skeleton className="h-4 w-4" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-20" /></td>
                  </tr>
                ))
              ) : productsReport?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">لا توجد بيانات مبيعات</td>
                </tr>
              ) : (
                productsReport?.slice(0, 10).map((product, index) => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-muted-foreground font-medium">{index + 1}</td>
                    <td className="p-4 font-bold">{product.nameAr || product.name}</td>
                    <td className="p-4 text-muted-foreground">{product.categoryName}</td>
                    <td className="p-4 font-medium text-lg">{product.totalSold}</td>
                    <td className="p-4 text-muted-foreground">{product.averagePrice.toFixed(2)} د.ك</td>
                    <td className="p-4 font-bold text-primary">{product.totalRevenue.toFixed(2)} د.ك</td>
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

function ReportSummaryCard({ 
  title, 
  value, 
  icon, 
  loading,
  valueClassName = ""
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  loading: boolean;
  valueClassName?: string;
}) {
  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {icon}
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <h3 className={`text-3xl font-bold tracking-tight ${valueClassName}`}>{value}</h3>
        )}
      </CardContent>
    </Card>
  );
}