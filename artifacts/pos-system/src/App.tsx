import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, ProtectedRoute } from "@/components/auth-provider";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Pos from "@/pages/pos";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Categories from "@/pages/categories";
import Orders from "@/pages/orders";
import Customers from "@/pages/customers";
import Users from "@/pages/users";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import PrintLog from "@/pages/print-log";
import HR from "@/pages/hr";
import Returns from "@/pages/returns";
import Accounting from "@/pages/accounting";
import BranchesPage from "@/pages/branches";
import SuppliersPage from "@/pages/suppliers";
import ShiftsPage from "@/pages/shifts";
import TablesPage from "@/pages/tables";
import ExpensesPage from "@/pages/expenses";
import LicensesPage from "@/pages/licenses";
import AuditPage from "@/pages/audit";
import DocumentPrintSettingsPage from "@/pages/document-print-settings";
import InventoryPage from "@/pages/inventory";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/pos">
        <ProtectedRoute><Pos /></ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute requireAdmin><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/products">
        <ProtectedRoute requireAdmin><Products /></ProtectedRoute>
      </Route>
      <Route path="/categories">
        <ProtectedRoute requireAdmin><Categories /></ProtectedRoute>
      </Route>
      <Route path="/orders">
        <ProtectedRoute allowedRoles={["admin", "developer", "accountant"]}><Orders /></ProtectedRoute>
      </Route>
      <Route path="/customers">
        <ProtectedRoute allowedRoles={["admin", "developer", "accountant"]}><Customers /></ProtectedRoute>
      </Route>
      <Route path="/users">
        <ProtectedRoute requireAdmin><Users /></ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute allowedRoles={["admin", "developer", "accountant"]}><Reports /></ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute requireAdmin><Settings /></ProtectedRoute>
      </Route>
      <Route path="/print-log">
        <ProtectedRoute requireAdmin><PrintLog /></ProtectedRoute>
      </Route>
      <Route path="/hr">
        <ProtectedRoute requireAdmin><HR /></ProtectedRoute>
      </Route>
      <Route path="/accounting">
        <ProtectedRoute allowedRoles={["admin", "developer", "accountant"]}><Accounting /></ProtectedRoute>
      </Route>
      <Route path="/returns">
        <ProtectedRoute allowedRoles={["admin", "developer", "accountant"]}><Returns /></ProtectedRoute>
      </Route>
      <Route path="/branches">
        <ProtectedRoute requireAdmin><BranchesPage /></ProtectedRoute>
      </Route>
      <Route path="/suppliers">
        <ProtectedRoute allowedRoles={["admin", "developer", "accountant"]}><SuppliersPage /></ProtectedRoute>
      </Route>
      <Route path="/shifts">
        <ProtectedRoute><ShiftsPage /></ProtectedRoute>
      </Route>
      <Route path="/tables">
        <ProtectedRoute><TablesPage /></ProtectedRoute>
      </Route>
      <Route path="/expenses">
        <ProtectedRoute allowedRoles={["admin", "developer", "accountant"]}><ExpensesPage /></ProtectedRoute>
      </Route>
      <Route path="/licenses">
        <ProtectedRoute requireDeveloper><LicensesPage /></ProtectedRoute>
      </Route>
      <Route path="/audit">
        <ProtectedRoute requireDeveloper><AuditPage /></ProtectedRoute>
      </Route>
      <Route path="/document-print-settings">
        <ProtectedRoute requireDeveloper><DocumentPrintSettingsPage /></ProtectedRoute>
      </Route>
      <Route path="/inventory">
        <ProtectedRoute><InventoryPage /></ProtectedRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute><Pos /></ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={((import.meta as any).env?.BASE_URL || "").replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
