import { useAuth } from "@/components/auth-provider";
import { useLogout } from "@workspace/api-client-react";
import { useLocation, Link } from "wouter";
import { LogOut, LayoutDashboard, Package, Tags, Receipt, Users, UserCircle, BarChart3, Settings, Printer, FileText, UserCheck, RotateCcw, Wallet, Building, Truck, DollarSign, Utensils, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppIcon } from "@/components/AppLogo";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const [location] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("pos_token");
        window.location.href = "/login";
      }
    });
  };

  const navItems = [
    { name: "لوحة القيادة", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "developer"] },
    { name: "نقطة البيع", href: "/pos", icon: Receipt },
    { name: "المنتجات", href: "/products", icon: Package, roles: ["admin", "developer"] },
    { name: "إدارة المخزون والمستودعات", href: "/inventory", icon: Package, roles: ["admin", "developer", "accountant"] },
    { name: "التصنيفات", href: "/categories", icon: Tags, roles: ["admin", "developer"] },
    { name: "الطلبات", href: "/orders", icon: Receipt, roles: ["admin", "developer", "accountant"] },
    { name: "العملاء", href: "/customers", icon: Users, roles: ["admin", "developer", "accountant"] },
    { name: "المستخدمين", href: "/users", icon: UserCircle, roles: ["admin", "developer"] },
    { name: "التقارير", href: "/reports", icon: BarChart3, roles: ["admin", "developer", "accountant"] },
    { name: "الموارد البشرية", href: "/hr", icon: UserCheck, roles: ["admin", "developer"] },
    { name: "الحسابات والسندات", href: "/accounting", icon: Wallet, roles: ["admin", "developer", "accountant"] },
    { name: "المرتجعات", href: "/returns", icon: RotateCcw, roles: ["admin", "developer", "accountant"] },
    { name: "الفروع والمستودعات", href: "/branches", icon: Building, roles: ["admin", "developer"] },
    { name: "الموردين والمشتريات", href: "/suppliers", icon: Truck, roles: ["admin", "developer", "accountant"] },
    { name: "ورديات الصندوق", href: "/shifts", icon: DollarSign },
    { name: "طاولات المطعم", href: "/tables", icon: Utensils },
    { name: "المصروفات", href: "/expenses", icon: Wallet, roles: ["admin", "developer", "accountant"] },
    ...(user?.role === 'developer' ? [
      { name: "التراخيص والحماية", href: "/licenses", icon: KeyRound },
      { name: "تخصيص التقارير والسندات", href: "/document-print-settings", icon: FileText },
      { name: "سجل العمليات", href: "/audit", icon: FileText },
    ] : []),
    { name: "سجل الطباعة", href: "/print-log", icon: FileText, roles: ["admin", "developer"] },
    { name: "الإعدادات", href: "/settings", icon: Settings, roles: ["admin", "developer"] },
  ];

  const filteredNavItems = navItems.filter(item => {
    if ('roles' in item && item.roles) {
      return item.roles.includes(user?.role || "");
    }
    return true;
  });

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col border-l border-sidebar-border">
        <div className="h-16 flex items-center justify-center border-b border-sidebar-border px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 p-1 flex items-center justify-center shrink-0">
              <AppIcon alt="OmniSystem" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-lg font-extrabold text-sidebar-primary-foreground">إتقان سوفت</h1>
          </div>
        </div>
        
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-1 px-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.startsWith(item.href);
              
              return (
                <Link key={item.href} href={item.href}>
                  <div className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
                  )}>
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.role === 'developer' ? 'مطور النظام' : user?.role === 'admin' ? 'مدير' : user?.role === 'accountant' ? 'محاسب' : 'كاشير'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-muted/30">
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
