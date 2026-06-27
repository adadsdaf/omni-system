import { 
  useGetDashboardSummary, 
  useGetSalesChart, 
  useGetTopProducts, 
  useGetRecentOrders 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { DollarSign, ShoppingBag, Users, Coffee, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: salesChart, isLoading: loadingSales } = useGetSalesChart({ period: "weekly" });
  const { data: topProducts, isLoading: loadingProducts } = useGetTopProducts({ limit: 5 });
  const { data: recentOrders, isLoading: loadingOrders } = useGetRecentOrders({ limit: 6 });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">لوحة التحكم</h1>
        <p className="text-muted-foreground">نظرة عامة على أداء المطعم اليوم</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="مبيعات اليوم" 
          value={summary ? `${summary.todaySales.toFixed(2)} د.ك` : ""} 
          icon={<DollarSign size={22} />} 
          loading={loadingSummary} 
          trend="+12.5%"
          trendUp={true}
        />
        <StatCard 
          title="طلبات اليوم" 
          value={summary?.todayOrders.toString() || ""} 
          icon={<ShoppingBag size={22} />} 
          loading={loadingSummary}
          trend="+5.2%"
          trendUp={true}
        />
        <StatCard 
          title="العملاء" 
          value={summary?.totalCustomers.toString() || ""} 
          icon={<Users size={22} />} 
          loading={loadingSummary}
          trend="-2.1%"
          trendUp={false}
        />
        <StatCard 
          title="الطاولات المشغولة" 
          value={summary ? `${summary.occupiedTables}/${summary.totalTables}` : ""} 
          icon={<Coffee size={22} />} 
          loading={loadingSummary}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <CardTitle className="text-lg font-bold">المبيعات الأسبوعية</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSales ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesChart} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">أفضل المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingProducts ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 13 }}
                      width={100}
                    />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--muted))'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="totalRevenue" radius={[0, 4, 4, 0]} barSize={24}>
                      {topProducts?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.6)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">أحدث الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingOrders ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders?.map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {order.orderNumber}
                    </div>
                    <div>
                      <div className="font-medium">{order.type === 'dine_in' ? `طاولة ${order.tableName}` : order.type === 'takeaway' ? 'تيك أواي' : 'توصيل'}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock size={12} />
                        {format(new Date(order.createdAt), "hh:mm a", { locale: ar })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-bold text-lg">{order.total.toFixed(2)} د.ك</div>
                      <div className="text-xs text-muted-foreground">{order.items.length} عناصر</div>
                    </div>
                    <Badge variant={
                      order.status === 'paid' ? 'default' : 
                      order.status === 'pending' ? 'secondary' : 
                      order.status === 'cancelled' ? 'destructive' : 'outline'
                    } className="min-w-20 justify-center">
                      {order.status === 'paid' ? 'مدفوع' : 
                       order.status === 'pending' ? 'قيد الانتظار' : 
                       order.status === 'preparing' ? 'جاري التحضير' : 
                       order.status === 'ready' ? 'جاهز' : 
                       order.status === 'cancelled' ? 'ملغي' : order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon, 
  loading,
  trend,
  trendUp
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  loading: boolean;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <Card className="border-border/50 shadow-sm overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center text-sm font-medium ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trendUp ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
              {trend}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
