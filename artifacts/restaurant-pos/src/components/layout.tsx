import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./theme-toggle";
import {
  LayoutDashboard,
  MonitorSmartphone,
  ClipboardList,
  ChefHat,
  UtensilsCrossed,
  Users,
  Package,
  UserCircle,
  BarChart3,
  Coffee,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/pos", label: "نقطة البيع", icon: MonitorSmartphone },
  { href: "/orders", label: "الطلبات", icon: ClipboardList },
  { href: "/kitchen", label: "شاشة المطبخ", icon: ChefHat },
  { href: "/tables", label: "إدارة الطاولات", icon: Coffee },
  { href: "/menu", label: "قائمة الطعام", icon: UtensilsCrossed },
  { href: "/customers", label: "العملاء", icon: Users },
  { href: "/inventory", label: "المخزون", icon: Package },
  { href: "/employees", label: "الموظفون", icon: UserCircle },
  { href: "/reports", label: "التقارير", icon: BarChart3 },
];

type LicenseInfo = {
  companyName: string;
  licenseType: string;
  expireDate: string | null;
  daysLeft: number | null;
} | null;

const LICENSE_TYPE_LABELS: Record<string, string> = {
  trial: "تجريبي",
  monthly: "شهري",
  semi_annual: "نصف سنوي",
  annual: "سنوي",
  lifetime: "دائم",
  multi_branch: "متعدد الفروع",
  cloud: "سحابي",
  local: "محلي",
};

export function Layout({
  children,
  licenseInfo,
}: {
  children: React.ReactNode;
  licenseInfo?: LicenseInfo;
}) {
  const [location] = useLocation();
  const isPosRoute = location === "/pos";

  if (isPosRoute) {
    return (
      <main className="w-full h-[100dvh] flex flex-col bg-background overflow-hidden">
        {children}
      </main>
    );
  }

  const isExpiringSoon = licenseInfo?.daysLeft !== null && licenseInfo?.daysLeft !== undefined && licenseInfo.daysLeft <= 14;

  return (
    <div className="flex w-full min-h-[100dvh] bg-muted/40">
      <aside className="w-64 flex-col hidden md:flex border-l bg-card fixed right-0 top-0 bottom-0 z-10 shadow-sm">
        <div className="h-16 flex items-center justify-between px-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <ChefHat size={24} />
            </div>
            <span className="font-bold text-lg text-foreground truncate max-w-[110px]">
              {licenseInfo?.companyName ?? "مطعمي"}
            </span>
          </div>
          <ThemeToggle />
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-background/20 rounded-l-full" />
                )}
                <item.icon
                  size={20}
                  className={cn(
                    "transition-transform duration-200",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* License Badge */}
        {licenseInfo && (
          <div className="mx-3 mb-4 p-3 rounded-xl border border-border/60 bg-muted/30">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={14} className={isExpiringSoon ? "text-yellow-500" : "text-green-500"} />
              <span className="text-xs font-semibold text-foreground">
                {LICENSE_TYPE_LABELS[licenseInfo.licenseType] ?? licenseInfo.licenseType}
              </span>
            </div>
            {licenseInfo.daysLeft !== null ? (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar size={11} />
                {isExpiringSoon ? (
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                    ينتهي خلال {licenseInfo.daysLeft} يوم!
                  </span>
                ) : (
                  <span>متبقي {licenseInfo.daysLeft} يوم</span>
                )}
              </div>
            ) : (
              <p className="text-xs text-green-600 dark:text-green-400">ترخيص دائم ✓</p>
            )}
          </div>
        )}
      </aside>

      <main className="flex-1 md:mr-64 flex flex-col min-h-[100dvh] bg-background">
        {/* Mobile Header */}
        <div className="md:hidden h-16 border-b bg-card flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <ChefHat className="text-primary" size={24} />
            <span className="font-bold">{licenseInfo?.companyName ?? "مطعمي"}</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Expiry Warning Banner */}
        {isExpiringSoon && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-6 py-2 flex items-center gap-2 text-yellow-800 dark:text-yellow-300 text-sm">
            <Calendar size={14} />
            <span>
              تنبيه: سينتهي ترخيصك خلال <strong>{licenseInfo?.daysLeft}</strong> يوم — يرجى التجديد
            </span>
          </div>
        )}

        <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</div>
      </main>
    </div>
  );
}
