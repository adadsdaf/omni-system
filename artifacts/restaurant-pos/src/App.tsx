import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import { useState, useEffect } from "react";
import { getMachineId, getLicenseKey, setLicenseKey as saveKey } from "@/lib/machine-id";

// Pages
import Dashboard from "@/pages/dashboard";
import Pos from "@/pages/pos";
import Orders from "@/pages/orders";
import Kitchen from "@/pages/kitchen";
import Tables from "@/pages/tables";
import Menu from "@/pages/menu";
import Customers from "@/pages/customers";
import Inventory from "@/pages/inventory";
import Employees from "@/pages/employees";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";
import LicenseActivation from "@/pages/license-activation";
import LicenseDashboard from "@/pages/license-dashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 },
  },
});

type LicenseStatus = "checking" | "valid" | "invalid";

type LicenseInfo = {
  companyName: string;
  licenseType: string;
  expireDate: string | null;
  daysLeft: number | null;
};

function useLicense() {
  const [status, setStatus] = useState<LicenseStatus>("checking");
  const [info, setInfo] = useState<LicenseInfo | null>(null);

  const verify = async () => {
    const key = getLicenseKey();
    const machineId = getMachineId();
    if (!key) { setStatus("invalid"); return; }
    try {
      const res = await fetch("/api/license/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: key, machineId }),
      });
      const data = await res.json();
      if (data.valid) {
        setInfo(data.license);
        setStatus("valid");
      } else {
        setStatus("invalid");
      }
    } catch {
      setStatus("invalid");
    }
  };

  useEffect(() => { verify(); }, []);

  return { status, info, recheck: verify };
}

function AppWithLicense() {
  const { status, info, recheck } = useLicense();

  // Dev dashboard — always accessible regardless of license
  if (window.location.pathname.includes("/dev-licenses")) {
    return <LicenseDashboard />;
  }

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)" }}>
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-300">جاري التحقق من الترخيص...</p>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <LicenseActivation
        onActivated={() => recheck()}
      />
    );
  }

  return (
    <Layout licenseInfo={info}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/pos" component={Pos} />
        <Route path="/orders" component={Orders} />
        <Route path="/kitchen" component={Kitchen} />
        <Route path="/tables" component={Tables} />
        <Route path="/menu" component={Menu} />
        <Route path="/customers" component={Customers} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/employees" component={Employees} />
        <Route path="/reports" component={Reports} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="restaurant-pos-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppWithLicense />
          </WouterRouter>
          <Toaster position="top-center" dir="rtl" />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
