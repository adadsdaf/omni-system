import { useState } from "react";
import { useGetEmployees } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Search, Plus, Users, Shield, ChefHat, MonitorSmartphone, Car, Mail, Phone, Calendar } from "lucide-react";

export default function Employees() {
  const [search, setSearch] = useState("");
  const { data: employees, isLoading } = useGetEmployees({ search: search || undefined });

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin':
      case 'manager': return <Shield size={16} className="ml-1" />;
      case 'chef': return <ChefHat size={16} className="ml-1" />;
      case 'cashier': return <MonitorSmartphone size={16} className="ml-1" />;
      case 'driver': return <Car size={16} className="ml-1" />;
      default: return <Users size={16} className="ml-1" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin': return <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-none">{getRoleIcon(role)} مدير نظام</Badge>;
      case 'manager': return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-none">{getRoleIcon(role)} مدير مطعم</Badge>;
      case 'cashier': return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none">{getRoleIcon(role)} كاشير</Badge>;
      case 'chef': return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none">{getRoleIcon(role)} طاهٍ</Badge>;
      case 'driver': return <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-none">{getRoleIcon(role)} سائق</Badge>;
      case 'waiter': return <Badge className="bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 border-none">{getRoleIcon(role)} نادل</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">الموظفون</h1>
          <p className="text-muted-foreground">إدارة الموظفين، الصلاحيات، ومعلومات الاتصال</p>
        </div>
        <Button className="shrink-0"><Plus className="ml-2 h-4 w-4" /> إضافة موظف</Button>
      </div>

      <div className="mb-6 relative w-full max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input 
          placeholder="البحث بالاسم..." 
          className="pl-4 pr-10 bg-card border-border/50 h-12 shadow-sm rounded-xl"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)
        ) : employees?.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground flex flex-col items-center">
            <Users size={48} className="mb-4 opacity-20" />
            <p className="text-lg">لا يوجد موظفين يطابقون بحثك</p>
          </div>
        ) : (
          employees?.map(employee => (
            <Card key={employee.id} className="border-border/50 shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-primary/30 transition-all">
              <div className="h-2 bg-gradient-to-r from-primary to-primary/50" />
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border-2 border-background shadow-sm">
                      {employee.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-xl mb-1">{employee.name}</h3>
                      {getRoleBadge(employee.role)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6 text-sm flex-1">
                  {employee.phone && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground/70 shrink-0">
                        <Phone size={16} />
                      </div>
                      <span dir="ltr">{employee.phone}</span>
                    </div>
                  )}
                  {employee.email && (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground/70 shrink-0">
                        <Mail size={16} />
                      </div>
                      <span>{employee.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground/70 shrink-0">
                      <Calendar size={16} />
                    </div>
                    <span>تاريخ الانضمام: {format(new Date(employee.joinDate), "dd MMMM yyyy", { locale: ar })}</span>
                  </div>
                </div>

                <div className="pt-4 border-t mt-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${employee.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-sm font-medium">{employee.isActive ? 'نشط' : 'غير نشط'}</span>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    إدارة
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}