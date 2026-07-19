import { useState, useRef, useEffect } from "react";
import { AdminLayout } from "@/components/admin-layout";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Eye, Search, FileText, Printer, Sliders, Palette, RefreshCw, Upload, Sparkles, User, FileSpreadsheet, Building, Users, ShieldCheck, Save } from "lucide-react";
import { AppLogo } from "@/components/AppLogo";

// Helper for authenticating API requests
function fetchAuth(url: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("pos_token") ?? "";
  return fetch(url, { ...opts, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers ?? {}) } });
}
async function apiGet(url: string) { const r = await fetchAuth(url); if (!r.ok) throw new Error(await r.text()); return r.json(); }
async function apiPost(url: string, body: any) { const r = await fetchAuth(url, { method: "POST", body: JSON.stringify(body) }); if (!r.ok) throw new Error(await r.text()); return r.json(); }
async function apiPut(url: string, body: any) { const r = await fetchAuth(url, { method: "PUT", body: JSON.stringify(body) }); if (!r.ok) throw new Error(await r.text()); return r.json(); }
async function apiDel(url: string) { const r = await fetchAuth(url, { method: "DELETE" }); if (!r.ok && r.status !== 204) throw new Error(await r.text()); }

function fmt(n?: number) { return Number(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function Accounting() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("statements");

  /* ─── Queries ─── */
  const { data: employees = [] } = useQuery({ queryKey: ["hr-employees-list"], queryFn: () => apiGet("/api/hr/employees") });
  const { data: customers = [] } = useQuery({ queryKey: ["customers-list"], queryFn: () => apiGet("/api/customers") });
  const { data: vouchers = [], refetch: refetchVouchers } = useQuery({ queryKey: ["vouchers-list"], queryFn: () => apiGet("/api/accounting/vouchers") });

  /* ─── Account Statement State ─── */
  const [statementPartyType, setStatementPartyType] = useState<"employee" | "customer">("employee");
  const [selectedPartyId, setSelectedPartyId] = useState<string>("");
  const [stmtStartDate, setStmtStartDate] = useState<string>("");
  const [stmtEndDate, setStmtEndDate] = useState<string>("");

  const { data: statementData, isFetching: loadingStatement, refetch: refetchStatement } = useQuery({
    queryKey: ["party-statement", statementPartyType, selectedPartyId, stmtStartDate, stmtEndDate],
    queryFn: () => apiGet(`/api/accounting/statement/${statementPartyType}/${selectedPartyId}?start_date=${stmtStartDate}&end_date=${stmtEndDate}`),
    enabled: !!selectedPartyId,
  });

  /* ─── Manual Entry State ─── */
  const [showManualDlg, setShowManualDlg] = useState(false);
  const [manualForm, setManualForm] = useState({
    description: "",
    debit: "0",
    credit: "0",
    entry_date: new Date().toISOString().slice(0, 10),
    notes: ""
  });

  const addManualMutation = useMutation({
    mutationFn: (data: any) => apiPost("/api/accounting/manual-entries", {
      party_type: statementPartyType,
      party_id: Number(selectedPartyId),
      ...data,
      debit: Number(data.debit || 0),
      credit: Number(data.credit || 0),
    }),
    onSuccess: () => {
      toast({ title: "تم تسجيل القيد بنجاح" });
      setShowManualDlg(false);
      setManualForm({ description: "", debit: "0", credit: "0", entry_date: new Date().toISOString().slice(0, 10), notes: "" });
      refetchStatement();
    },
    onError: (e: any) => toast({ variant: "destructive", title: "فشل إضافة القيد", description: e.message }),
  });

  const deleteManualMutation = useMutation({
    mutationFn: (id: number) => apiDel(`/api/accounting/manual-entries/${id}`),
    onSuccess: () => {
      toast({ title: "تم حذف القيد اليدوي" });
      refetchStatement();
    },
    onError: (e: any) => toast({ variant: "destructive", title: "فشل حذف القيد", description: e.message }),
  });

  /* ─── Vouchers Management State ─── */
  const [voucherSearch, setVoucherSearch] = useState("");
  const [showNewVoucherDlg, setShowNewVoucherDlg] = useState(false);
  const [viewVoucher, setViewVoucher] = useState<any>(null);

  // Default Customizable Options for Vouchers (as requested)
  const [voucherConfig, setVoucherConfig] = useState({
    header_title: "مخابز الشام للخبز العربي",
    header_subtitle: "Maamil Al Sham",
    logo_url: "/omnisystem-logo.png",
    accent_color: "#ef4444", // RED from image
    bottom_text: "جودة الخبز ... سر ثقة عملائنا",
    currency: "دينار"
  });

  const [designForm, setDesignForm] = useState({
    companyName: "",
    companySubtitle: "",
    logoUrl: "",
    customerHeaderText: "",
    customerFooterText: "",
    employeeHeaderText: "",
    employeeFooterText: "",
    voucherReceiptTitle: "",
    voucherPaymentTitle: "",
    voucherFooterText: "",
    reportHeaderText: "",
    reportFooterText: "",
    accentColor: "",
  });

  // Load the centralized design settings
  const { data: printSettings, refetch: refetchPrintSettings } = useQuery({
    queryKey: ["document-print-settings"],
    queryFn: () => apiGet("/api/document-print-settings")
  });

  // Sync print settings to states
  useEffect(() => {
    if (printSettings) {
      setVoucherConfig({
        header_title: printSettings.companyName || "مخابز الشام للخبز العربي",
        header_subtitle: printSettings.companySubtitle || "Maamil Al Sham",
        logo_url: printSettings.logoUrl || "/omnisystem-logo.png",
        accent_color: printSettings.accentColor || "#ef4444",
        bottom_text: printSettings.voucherFooterText || "جودة الخبز ... سر ثقة عملائنا",
        currency: "دينار"
      });
      setDesignForm({
        companyName: printSettings.companyName || "",
        companySubtitle: printSettings.companySubtitle || "",
        logoUrl: printSettings.logoUrl || "",
        customerHeaderText: printSettings.customerHeaderText || "",
        customerFooterText: printSettings.customerFooterText || "",
        employeeHeaderText: printSettings.employeeHeaderText || "",
        employeeFooterText: printSettings.employeeFooterText || "",
        voucherReceiptTitle: printSettings.voucherReceiptTitle || "",
        voucherPaymentTitle: printSettings.voucherPaymentTitle || "",
        voucherFooterText: printSettings.voucherFooterText || "",
        reportHeaderText: printSettings.reportHeaderText || "",
        reportFooterText: printSettings.reportFooterText || "",
        accentColor: printSettings.accentColor || "",
      });
    }
  }, [printSettings]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: any) => apiPut("/api/document-print-settings", data),
    onSuccess: () => {
      toast({ title: "تم حفظ إعدادات التصميم وتطبيقها على كامل وظائف النظام بنجاح" });
      refetchPrintSettings();
    },
    onError: (e: any) => toast({ variant: "destructive", title: "فشل حفظ إعدادات التصميم", description: e.message })
  });

  const [voucherForm, setVoucherForm] = useState({
    type: "receipt", // receipt or payment
    party_type: "employee" as "employee" | "customer",
    party_id: "",
    amount: "",
    received_from: "",
    payment_against: "",
    payment_method: "cash",
    amount_text: "",
    notes: ""
  });

  const createVoucherMutation = useMutation({
    mutationFn: (data: any) => apiPost("/api/accounting/vouchers", {
      ...data,
      amount: Number(data.amount || 0),
      currency: voucherConfig.currency,
      header_title: voucherConfig.header_title,
      header_subtitle: voucherConfig.header_subtitle,
      logo_url: voucherConfig.logo_url,
      accent_color: voucherConfig.accent_color,
      bottom_text: voucherConfig.bottom_text
    }),
    onSuccess: (data) => {
      toast({ title: "تم إنشاء السند بنجاح" });
      setShowNewVoucherDlg(false);
      refetchVouchers();
      if (selectedPartyId && String(data.party_id) === selectedPartyId && data.party_type === statementPartyType) {
        refetchStatement();
      }
      // Open the voucher view immediately
      setViewVoucher(data);
    },
    onError: (e: any) => toast({ variant: "destructive", title: "فشل إنشاء السند", description: e.message }),
  });

  const deleteVoucherMutation = useMutation({
    mutationFn: (id: number) => apiDel(`/api/accounting/vouchers/${id}`),
    onSuccess: () => {
      toast({ title: "تم حذف السند" });
      refetchVouchers();
      if (selectedPartyId) refetchStatement();
    },
    onError: (e: any) => toast({ variant: "destructive", title: "فشل حذف السند" }),
  });

  const handleVoucherPartyChange = (pt: "employee" | "customer", pid: string) => {
    let name = "";
    if (pt === "employee") {
      name = employees.find((e: any) => String(e.id) === pid)?.name || "";
    } else {
      name = customers.find((c: any) => String(c.id) === pid)?.name || "";
    }
    setVoucherForm(v => ({
      ...v,
      party_type: pt,
      party_id: pid,
      received_from: name
    }));
  };

  const handlePrint = (areaId: string) => {
    const printContent = document.getElementById(areaId);
    if (!printContent) return;
    
    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>طباعة</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body {
              font-family: 'Cairo', sans-serif;
              direction: rtl;
              padding: 20px;
              background-color: white;
            }
            .dashed-line {
              border-bottom: 2px dashed #ccc;
              height: 1px;
              width: 100%;
              margin-top: 15px;
            }
            @media print {
              body { padding: 0; margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="max-w-4xl mx-auto">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    win.document.close();
  };

  const filteredVouchers = vouchers.filter((v: any) => {
    if (!voucherSearch.trim()) return true;
    const s = voucherSearch.toLowerCase();
    return (
      v.voucher_number.toLowerCase().includes(s) ||
      v.party_name.toLowerCase().includes(s) ||
      (v.received_from && v.received_from.toLowerCase().includes(s)) ||
      (v.payment_against && v.payment_against.toLowerCase().includes(s))
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">نظام الحسابات والمالية</h1>
            <p className="text-sm text-muted-foreground mt-1">كشوف الحسابات التفصيلية وسندات القبض والصرف الفورية ومتابعة الأرصدة</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowNewVoucherDlg(true)} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
              <Plus className="w-4 h-4" />سند جديد
            </Button>
          </div>
        </div>

        {/* Tab Selection */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <TabsList className="grid w-full max-w-xl grid-cols-3 bg-muted/60">
            <TabsTrigger value="statements" className="text-sm font-semibold gap-2">
              <FileSpreadsheet className="w-4 h-4" /> كشوف الحسابات
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="text-sm font-semibold gap-2">
              <FileText className="w-4 h-4" /> السندات والدفعات
            </TabsTrigger>
            <TabsTrigger value="design" className="text-sm font-semibold gap-2">
              <Palette className="w-4 h-4" /> تصميم ومظهر السندات والكشوفات
            </TabsTrigger>
          </TabsList>

          {/* ──────────────────────────────────────────────────────── */}
          {/* TAB 1: ACCOUNT STATEMENTS (كشوف الحسابات) */}
          {/* ──────────────────────────────────────────────────────── */}
          <TabsContent value="statements" className="space-y-6 mt-4">
            {/* Filter Card */}
            <Card className="border border-border shadow-sm">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  {/* Party Type Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600">نوع الكشف</label>
                    <Select
                      value={statementPartyType}
                      onValueChange={(val: "employee" | "customer") => {
                        setStatementPartyType(val);
                        setSelectedPartyId("");
                      }}
                    >
                      <SelectTrigger className="h-10 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">كشف حساب موظف</SelectItem>
                        <SelectItem value="customer">كشف حساب عميل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Party Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600">
                      {statementPartyType === "employee" ? "اختر الموظف" : "اختر العميل"}
                    </label>
                    <Select value={selectedPartyId} onValueChange={setSelectedPartyId}>
                      <SelectTrigger className="h-10 bg-white">
                        <SelectValue placeholder={statementPartyType === "employee" ? "اختر موظفاً..." : "اختر عميلاً..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {statementPartyType === "employee"
                          ? employees.map((e: any) => (
                              <SelectItem key={e.id} value={String(e.id)}>{e.name} ({e.employee_number})</SelectItem>
                            ))
                          : customers.map((c: any) => (
                              <SelectItem key={c.id} value={String(c.id)}>{c.name} {c.phone ? `(${c.phone})` : ""}</SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date range inputs */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600">من تاريخ</label>
                    <Input type="date" value={stmtStartDate} onChange={e => setStmtStartDate(e.target.value)} className="h-10 bg-white" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600">إلى تاريخ</label>
                    <Input type="date" value={stmtEndDate} onChange={e => setStmtEndDate(e.target.value)} className="h-10 bg-white" />
                  </div>
                </div>

                {selectedPartyId && (
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed">
                    <div className="flex gap-2">
                      <Button onClick={() => setShowManualDlg(true)} variant="outline" className="gap-1.5 h-9 text-xs">
                        <Plus className="w-3.5 h-3.5" />إضافة قيد يدوي / تعديل رصيد
                      </Button>
                      <Button onClick={() => handlePrint("statement-print-area")} variant="secondary" className="gap-1.5 h-9 text-xs bg-slate-100 hover:bg-slate-200">
                        <Printer className="w-3.5 h-3.5" /> طباعة كشف الحساب (A4)
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">تحديث فوري للرصيد والبيانات</span>
                      <Button onClick={() => refetchStatement()} variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-900">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Statement Output (Exact matching of Image 2) */}
            {selectedPartyId ? (
              loadingStatement ? (
                <div className="text-center py-12 text-muted-foreground">جاري تحميل كشف الحساب وتجميع القيود والعمليات...</div>
              ) : statementData ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Ledger display (Interactive & Print-ready) */}
                  <div className="lg:col-span-3 space-y-4">
                    <div id="statement-print-area" className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm print-ready-statement relative overflow-hidden" dir="rtl">
                      {/* Dynamic Accent Wave on top */}
                      <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${voucherConfig.accent_color}, ${voucherConfig.accent_color}dd, ${voucherConfig.accent_color}99)` }} />
                      
                      {/* Image Header with Logo */}
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1 pt-2">
                          <h2 className="text-2xl font-black leading-tight" style={{ color: voucherConfig.accent_color }}>{voucherConfig.header_title}</h2>
                          <p className="text-base font-bold text-gray-700 tracking-wider">{voucherConfig.header_subtitle}</p>
                        </div>
                        {/* Perfect Chef Logo */}
                        <div className="w-24 h-24 rounded-full border-4 overflow-hidden flex items-center justify-center bg-white shadow" style={{ borderColor: voucherConfig.accent_color }}>
                          <AppLogo src={voucherConfig.logo_url} alt="Chef Logo" className="w-20 h-20 object-contain" fallback={<img src='https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=120' className="w-20 h-20 object-contain" />} />
                        </div>
                      </div>

                      {/* Header Subtitle Banner */}
                      <div className="w-full text-center py-2 rounded-lg text-white font-black text-lg mb-6 shadow-sm flex items-center justify-center gap-2" style={{ backgroundColor: voucherConfig.accent_color }}>
                        <span>
                          {statementPartyType === "employee" 
                            ? (printSettings?.employeeHeaderText || "كشف حساب ومسير رواتب موظف") 
                            : (printSettings?.customerHeaderText || "كشف حساب عميل معتمد")}
                        </span>
                        <div className="w-4 h-1.5 bg-yellow-400 rounded-full" />
                      </div>

                      {/* Info Boxes */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Left Box */}
                        <div className="border border-amber-300 bg-amber-50/30 rounded-xl p-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-amber-900 w-24">اسم {statementPartyType === "employee" ? "الموظف" : "العميل"}:</span>
                            <span className="text-gray-800 font-extrabold">{statementData.party?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-amber-900 w-24">رقم {statementPartyType === "employee" ? "الموظف" : "الهاتف"}:</span>
                            <span className="text-gray-800 font-mono font-bold">
                              {statementPartyType === "employee" ? statementData.party?.employee_number : (statementData.party?.phone || "—")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-amber-900 w-24">القسم / العنوان:</span>
                            <span className="text-gray-800 font-bold">
                              {statementPartyType === "employee" ? (statementData.party?.department_name || "—") : (statementData.party?.address || "—")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-amber-900 w-24">تاريخ الكشف:</span>
                            <span className="text-gray-800 font-mono font-bold">{new Date().toLocaleDateString("ar-SA")}</span>
                          </div>
                        </div>

                        {/* Right Box */}
                        <div className="border border-gray-300 bg-gray-50/50 rounded-xl p-4 space-y-2 flex flex-col justify-center">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-gray-600 w-24">الشهر:</span>
                            <span className="text-gray-800 font-bold">{new Date().toLocaleString("ar-SA", { month: "long" })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-gray-600 w-24">سنة:</span>
                            <span className="text-gray-800 font-mono font-bold">{new Date().getFullYear()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-bold text-gray-600 w-24">رقم الكشف:</span>
                            <span className="text-gray-800 font-mono font-bold">STMT-{String(statementData.party?.id).padStart(4, "0")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Main Ledger Table */}
                      <div className="border border-gray-300 rounded-xl overflow-hidden mb-6">
                        <table className="w-full text-right border-collapse text-sm">
                          <thead>
                            <tr className="text-white font-extrabold text-xs" style={{ backgroundColor: voucherConfig.accent_color }}>
                              <th className="p-2 border-l w-10 text-center" style={{ borderColor: `${voucherConfig.accent_color}dd` }}>م</th>
                              <th className="p-2 border-l w-24 text-center" style={{ borderColor: `${voucherConfig.accent_color}dd` }}>التاريخ</th>
                              <th className="p-2 border-l" style={{ borderColor: `${voucherConfig.accent_color}dd` }}>البيان</th>
                              <th className="p-2 border-l w-28 text-center" style={{ borderColor: `${voucherConfig.accent_color}dd`, backgroundColor: `${voucherConfig.accent_color}cc` }}>مدين (خصم/سحب)</th>
                              <th className="p-2 border-l w-28 text-center" style={{ borderColor: `${voucherConfig.accent_color}dd` }}>دائن (إضافة/دفع)</th>
                              <th className="p-2 w-32 text-center" style={{ backgroundColor: `${voucherConfig.accent_color}cc` }}>الرصيد</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {/* Previous Balance Row */}
                            <tr className="bg-amber-50/20 font-bold text-gray-700">
                              <td className="p-2 text-center border-l border-gray-200 font-mono">—</td>
                              <td className="p-2 text-center border-l border-gray-200 font-mono">
                                {stmtStartDate ? stmtStartDate : "—"}
                              </td>
                              <td className="p-2 border-l border-gray-200 font-bold">الرصيد الافتتاحي / السابق في المدة</td>
                              <td className="p-2 text-center border-l border-gray-200 font-mono">—</td>
                              <td className="p-2 text-center border-l border-gray-200 font-mono">—</td>
                              <td className="p-2 text-center font-mono text-amber-800 bg-amber-50/10 font-black">
                                {fmt(statementData.previousBalance)}
                              </td>
                            </tr>

                            {/* Live Transactions */}
                            {statementData.transactions?.map((t: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-50/60 text-xs text-gray-800">
                                <td className="p-2 text-center border-l border-gray-200 font-mono font-bold bg-amber-100/40">{index + 1}</td>
                                <td className="p-2 text-center border-l border-gray-200 font-mono whitespace-nowrap">{t.date}</td>
                                <td className="p-2 border-l border-gray-200 font-bold text-gray-900">
                                  <div className="flex justify-between items-center">
                                    <span>{t.description}</span>
                                    {t.source === "manual" && (
                                      <button
                                        onClick={() => confirm("حذف هذا القيد اليدوي؟") && deleteManualMutation.mutate(t.source_id)}
                                        className="no-print text-destructive hover:text-red-800 opacity-60 hover:opacity-100 p-0.5"
                                        title="حذف القيد اليدوي"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                  {t.notes && <div className="text-[10px] text-muted-foreground font-medium mt-0.5">{t.notes}</div>}
                                </td>
                                <td className="p-2 text-center border-l border-gray-200 font-mono font-semibold text-red-600 bg-red-50/20">
                                  {t.debit > 0 ? fmt(t.debit) : "—"}
                                </td>
                                <td className="p-2 text-center border-l border-gray-200 font-mono font-semibold text-emerald-600">
                                  {t.credit > 0 ? fmt(t.credit) : "—"}
                                </td>
                                <td className="p-2 text-center font-mono font-bold bg-amber-50/10 text-gray-900">
                                  {fmt(t.running_balance)}
                                </td>
                              </tr>
                            ))}

                            {statementData.transactions?.length === 0 && (
                              <tr>
                                <td colSpan={6} className="p-8 text-center text-muted-foreground italic bg-gray-50/20">
                                  لا توجد حركات مسجلة للطرف المحدد خلال الفترة المحددة.
                                </td>
                              </tr>
                            )}
                          </tbody>
                          {/* Total row */}
                          <tfoot>
                            <tr className="text-white font-extrabold text-xs" style={{ backgroundColor: voucherConfig.accent_color }}>
                              <td colSpan={3} className="p-2.5 text-right border-l" style={{ borderColor: `${voucherConfig.accent_color}dd` }}>الإجمــــالـي</td>
                              <td className="p-2.5 text-center border-l font-mono" style={{ borderColor: `${voucherConfig.accent_color}dd`, backgroundColor: `${voucherConfig.accent_color}cc` }}>
                                {fmt(statementData.totalDebit)}
                              </td>
                              <td className="p-2.5 text-center border-l font-mono" style={{ borderColor: `${voucherConfig.accent_color}dd` }}>
                                {fmt(statementData.totalCredit)}
                              </td>
                              <td className="p-2.5 text-center font-mono" style={{ backgroundColor: `${voucherConfig.accent_color}cc` }}>
                                {fmt(statementData.currentBalance)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Lower Balance Cards */}
                      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                        <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/30">
                          <div className="text-xs text-gray-500 font-bold mb-1">الرصيد السابق</div>
                          <div className="text-sm font-black font-mono text-gray-800">{fmt(statementData.previousBalance)}</div>
                        </div>
                        <div className="border rounded-xl p-3" style={{ borderColor: `${voucherConfig.accent_color}44`, backgroundColor: `${voucherConfig.accent_color}0a` }}>
                          <div className="text-xs font-bold mb-1" style={{ color: voucherConfig.accent_color }}>إجمالي الحركة (الصافي)</div>
                          <div className="text-sm font-black font-mono" style={{ color: voucherConfig.accent_color }}>{fmt(statementData.netChange)}</div>
                        </div>
                        <div className="border border-amber-300 rounded-xl p-3 bg-amber-50/50">
                          <div className="text-xs text-amber-800 font-bold mb-1">الرصيد الحالي المستحق</div>
                          <div className="text-base font-black font-mono text-amber-900">{fmt(statementData.currentBalance)}</div>
                        </div>
                      </div>

                      {/* Notes Box with dotted lines */}
                      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/30 text-xs">
                        <span className="font-extrabold text-gray-700">ملاحظات الكشف:</span>
                        <div className="mt-2 space-y-2">
                          <div className="dashed-line"></div>
                          <div className="dashed-line"></div>
                        </div>
                      </div>

                      {/* Bottom Slogan Wave Banner */}
                      <div className="mt-8 pt-4 border-t flex justify-between items-center text-xs font-bold" style={{ borderTopColor: `${voucherConfig.accent_color}22`, color: voucherConfig.accent_color }}>
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>
                            {statementPartyType === "employee" 
                              ? (printSettings?.employeeFooterText || voucherConfig.bottom_text) 
                              : (printSettings?.customerFooterText || voucherConfig.bottom_text)}
                          </span>
                        </div>
                        <span className="text-gray-400 font-mono">أنشئ بواسطة نظام الحسابات المعتمد</span>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar Balance Widget */}
                  <div className="space-y-4">
                    <Card className="bg-slate-900 text-white border-0 shadow-lg">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <User className="w-4 h-4 text-amber-400" /> ملخص حساب الطرف
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-2">
                        <div>
                          <div className="text-xs text-slate-400 font-bold">الرصيد المستحق الحالي</div>
                          <div className="text-3xl font-black font-mono tracking-tight text-amber-400 mt-1">
                            {fmt(statementData.currentBalance)} <span className="text-xs font-bold">{voucherConfig.currency}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-bold">إجمالي السحوبات والخصم:</span>
                            <span className="font-bold font-mono text-red-400">-{fmt(statementData.totalDebit)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-bold">إجمالي المستحقات والإيداع:</span>
                            <span className="font-bold font-mono text-emerald-400">+{fmt(statementData.totalCredit)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400 font-bold">حالة الحساب:</span>
                            <Badge className={statementData.currentBalance >= 0 ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}>
                              {statementData.currentBalance >= 0 ? "دائن (له مستحقات)" : "مدين (عليه مستحقات)"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Voucher Print Card */}
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm font-bold">سندات سريعة</CardTitle></CardHeader>
                      <CardContent className="space-y-2 pt-2">
                        <Button
                          onClick={() => {
                            setVoucherForm({
                              type: "payment",
                              party_type: statementPartyType,
                              party_id: selectedPartyId,
                              amount: "",
                              received_from: statementData.party?.name || "",
                              payment_against: "دفعة مسحوبة من الرصيد",
                              payment_method: "cash",
                              amount_text: "",
                              notes: ""
                            });
                            setShowNewVoucherDlg(true);
                          }}
                          className="w-full text-xs justify-start h-9 bg-red-600 hover:bg-red-700"
                        >
                          <Plus className="w-3.5 h-3.5 ml-1.5" /> إنشاء سند صرف (دفع له)
                        </Button>
                        <Button
                          onClick={() => {
                            setVoucherForm({
                              type: "receipt",
                              party_type: statementPartyType,
                              party_id: selectedPartyId,
                              amount: "",
                              received_from: statementData.party?.name || "",
                              payment_against: "دفعة سداد للحساب",
                              payment_method: "cash",
                              amount_text: "",
                              notes: ""
                            });
                            setShowNewVoucherDlg(true);
                          }}
                          className="w-full text-xs justify-start h-9 bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Plus className="w-3.5 h-3.5 ml-1.5" /> إنشاء سند قبض (استلام منه)
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : null
            ) : (
              <div className="text-center py-16 border border-dashed rounded-2xl bg-white/50 space-y-3">
                <FileSpreadsheet className="w-12 h-12 text-muted-foreground/60 mx-auto" />
                <h3 className="font-bold text-gray-700">لم يتم اختيار جهة بعد</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">اختر موظفاً أو عميلاً من القائمة في الأعلى لتوليد كشف حسابه التفصيلي ومراجعة ميزان المدين والدائن الخاص به.</p>
              </div>
            )}
          </TabsContent>

          {/* ──────────────────────────────────────────────────────── */}
          {/* TAB 2: VOUCHERS LIST & DESIGNER (السندات والدفعات والتحكم بها) */}
          {/* ──────────────────────────────────────────────────────── */}
          <TabsContent value="vouchers" className="space-y-6 mt-4">
            <Card className="border border-border shadow-sm">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-2 w-full md:max-w-md">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                      value={voucherSearch}
                      onChange={e => setVoucherSearch(e.target.value)}
                      placeholder="ابحث برقم السند، اسم الطرف، المقابل أو المحتويات..."
                      className="h-10 bg-white"
                    />
                  </div>
                  <Button onClick={() => setShowNewVoucherDlg(true)} className="gap-2 bg-red-600 hover:bg-red-700 text-white w-full md:w-auto h-10">
                    <Plus className="w-4 h-4" />إنشاء سند صرف أو قبض جديد
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Vouchers Table */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-slate-600 font-bold">
                    <th className="p-3 text-right">رقم السند</th>
                    <th className="p-3 text-right">نوع السند</th>
                    <th className="p-3 text-right">الطرف</th>
                    <th className="p-3 text-right">مستلم من / مدفوع لـ</th>
                    <th className="p-3 text-right">المبلغ</th>
                    <th className="p-3 text-right">مقابل / لأجل</th>
                    <th className="p-3 text-right">التاريخ</th>
                    <th className="p-3 w-32"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredVouchers.map((v: any) => (
                    <tr key={v.id} className="hover:bg-muted/30 text-slate-800">
                      <td className="p-3 font-mono font-black text-gray-900">#{v.voucher_number}</td>
                      <td className="p-3">
                        <Badge className={v.type === "receipt" ? "bg-emerald-500/10 text-emerald-700 border-0" : "bg-red-500/10 text-red-700 border-0"}>
                          {v.type === "receipt" ? "سند قبض" : "سند صرف"}
                        </Badge>
                      </td>
                      <td className="p-3 font-semibold">
                        {v.party_type === "employee" ? "موظف" : "عميل"}
                      </td>
                      <td className="p-3 font-extrabold">{v.party_name}</td>
                      <td className="p-3 font-mono font-bold text-gray-950">
                        {fmt(v.amount)} <span className="text-xs font-bold text-muted-foreground">{v.currency}</span>
                      </td>
                      <td className="p-3 text-slate-600 font-medium truncate max-w-[200px]">{v.payment_against || "—"}</td>
                      <td className="p-3 font-mono text-xs">{v.created_at?.slice(0, 10)}</td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => setViewVoucher(v)} className="gap-1 text-xs">
                            <Eye className="w-3.5 h-3.5" /> عرض السند
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => confirm("حذف هذا السند نهائياً؟") && deleteVoucherMutation.mutate(v.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredVouchers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground italic">
                        لا توجد سندات مسجلة مطابقة لمعايير البحث.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* ──────────────────────────────────────────────────────── */}
          {/* TAB 3: DESIGN CONFIGURATION (إدارة تصميم كشف الحساب والسندات) */}
          {/* ──────────────────────────────────────────────────────── */}
          <TabsContent value="design" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Config Forms */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border border-border shadow-sm">
                  <CardHeader className="bg-slate-50 border-b pb-4">
                    <CardTitle className="text-lg font-extrabold flex items-center gap-2 text-slate-800">
                      <Building className="w-5 h-5 text-red-600" /> الهوية والشعار الأساسي
                    </CardTitle>
                    <CardDescription>البيانات التي تظهر في رأس كشف الحساب والسندات المالية</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">اسم المنشأة الرئيسي (عربي)</label>
                        <Input
                          value={designForm.companyName}
                          onChange={e => setDesignForm(f => ({ ...f, companyName: e.target.value }))}
                          placeholder="مثال: مخابز الشام للخبز العربي"
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">الاسم الفرعي / الإنجليزي</label>
                        <Input
                          value={designForm.companySubtitle}
                          onChange={e => setDesignForm(f => ({ ...f, companySubtitle: e.target.value }))}
                          placeholder="مثال: Maamil Al Sham"
                          className="bg-white"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 block">شعار كشف الحساب والسندات (تحميل صورة)</label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-dashed rounded-xl bg-slate-50/50">
                        {designForm.logoUrl ? (
                          <div className="border rounded-lg p-2 bg-white flex items-center justify-center w-24 h-16 shrink-0 shadow-sm">
                            <img src={designForm.logoUrl} alt="الشعار الحالي" className="max-w-full max-h-full object-contain" />
                          </div>
                        ) : (
                          <div className="border-2 border-dashed rounded-lg flex items-center justify-center w-24 h-16 shrink-0 bg-white text-slate-400 text-xs font-semibold">
                            لا يوجد شعار
                          </div>
                        )}
                        <div className="space-y-1 flex-1">
                          <div className="flex gap-2">
                            <input
                              type="file"
                              accept="image/*"
                              id="accounting-logo-upload"
                              className="hidden"
                              onChange={e => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 5 * 1024 * 1024) {
                                  toast({ variant: "destructive", title: "حجم الصورة كبير جداً", description: "الحد الأقصى 5MB" });
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = ev => {
                                  const img = new Image();
                                  img.onload = () => {
                                    const canvas = document.createElement("canvas");
                                    const MAX = 400;
                                    let w = img.width, h = img.height;
                                    if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
                                    if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
                                    canvas.width = w; canvas.height = h;
                                    const ctx = canvas.getContext("2d")!;
                                    ctx.fillStyle = "#fff";
                                    ctx.fillRect(0, 0, w, h);
                                    ctx.drawImage(img, 0, 0, w, h);
                                    const compressed = canvas.toDataURL("image/jpeg", 0.75);
                                    setDesignForm(f => ({ ...f, logoUrl: compressed }));
                                    toast({ title: "تم رفع الشعار المؤقت لمعاينة كشف الحساب", description: `${Math.round(compressed.length / 1024)}KB` });
                                  };
                                  img.src = ev.target?.result as string;
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => document.getElementById("accounting-logo-upload")?.click()}
                              className="gap-2 text-xs"
                            >
                              <Upload className="w-3.5 h-3.5" /> تحميل الشعار من الملفات
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              onClick={() => setDesignForm(f => ({ ...f, logoUrl: "/omnisystem-logo.png" }))}
                              className="text-xs"
                            >
                              الشعار الافتراضي
                            </Button>
                          </div>
                          <p className="text-[11px] text-muted-foreground">صيغ مدعومة: JPG, PNG. يتم ضغط الصورة تلقائياً للحفاظ على الأداء.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border shadow-sm">
                  <CardHeader className="bg-slate-50 border-b pb-4">
                    <CardTitle className="text-lg font-extrabold flex items-center gap-2 text-slate-800">
                      <Palette className="w-5 h-5 text-red-600" /> طابع وألوان الهوية
                    </CardTitle>
                    <CardDescription>التحكم في الألوان المطبقة على الجداول، الإطارات، والخلفيات</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-700">اللون المميز للمستندات (Accent Color)</label>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={designForm.accentColor || "#ef4444"}
                            onChange={e => setDesignForm(f => ({ ...f, accentColor: e.target.value }))}
                            className="w-12 h-10 border rounded cursor-pointer animate-none bg-transparent"
                          />
                          <Input
                            value={designForm.accentColor}
                            onChange={e => setDesignForm(f => ({ ...f, accentColor: e.target.value }))}
                            className="w-32 bg-white font-mono"
                            placeholder="#ef4444"
                          />
                        </div>

                        {/* Palette picker */}
                        <div className="flex gap-2 items-center border-r pr-4">
                          <span className="text-xs font-medium text-slate-500">لوحات مقترحة:</span>
                          {[
                            { name: "أحمر الشام", color: "#ef4444" },
                            { name: "أزرق كلاسيك", color: "#1e3a8a" },
                            { name: "أخضر زمردي", color: "#15803d" },
                            { name: "ذهبي ملكي", color: "#b45309" },
                            { name: "فحمي هادئ", color: "#374151" }
                          ].map(pal => (
                            <button
                              key={pal.color}
                              type="button"
                              onClick={() => setDesignForm(f => ({ ...f, accentColor: pal.color }))}
                              className="w-6 h-6 rounded-full border border-gray-300 shadow-sm transition hover:scale-110 active:scale-95"
                              style={{ backgroundColor: pal.color }}
                              title={pal.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-border shadow-sm">
                  <CardHeader className="bg-slate-50 border-b pb-4">
                    <CardTitle className="text-lg font-extrabold flex items-center gap-2 text-slate-800">
                      <Sliders className="w-5 h-5 text-red-600" /> عناوين وتذييلات المستندات والتقارير
                    </CardTitle>
                    <CardDescription>تخصيص النصوص التفصيلية لكل نوع من أنواع الكشوفات والسندات</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-4">
                    {/* Statements section */}
                    <div className="space-y-4">
                      <h4 className="font-extrabold text-sm text-slate-800 border-r-4 border-red-600 pr-2 pb-0.5">تصاميم كشوفات الحسابات</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700">ترويسة كشف العميل</label>
                          <Input
                            value={designForm.customerHeaderText}
                            onChange={e => setDesignForm(f => ({ ...f, customerHeaderText: e.target.value }))}
                            placeholder="كشف حساب عميل معتمد"
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700">تذييل كشف العميل</label>
                          <Input
                            value={designForm.customerFooterText}
                            onChange={e => setDesignForm(f => ({ ...f, customerFooterText: e.target.value }))}
                            placeholder="جودة الخبز ... سر ثقة عملائنا"
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700">ترويسة كشف الموظف</label>
                          <Input
                            value={designForm.employeeHeaderText}
                            onChange={e => setDesignForm(f => ({ ...f, employeeHeaderText: e.target.value }))}
                            placeholder="كشف حساب ومسير رواتب موظف"
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700">تذييل كشف الموظف</label>
                          <Input
                            value={designForm.employeeFooterText}
                            onChange={e => setDesignForm(f => ({ ...f, employeeFooterText: e.target.value }))}
                            placeholder="جودة الخبز ... سر ثقة عملائنا"
                            className="bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Vouchers section */}
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-extrabold text-sm text-slate-800 border-r-4 border-emerald-600 pr-2 pb-0.5">تصاميم سندات الصرف والقبض</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700">عنوان سند القبض (Receipt)</label>
                          <Input
                            value={designForm.voucherReceiptTitle}
                            onChange={e => setDesignForm(f => ({ ...f, voucherReceiptTitle: e.target.value }))}
                            placeholder="سند قبض مالي معتمد"
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-700">عنوان سند الصرف (Payment)</label>
                          <Input
                            value={designForm.voucherPaymentTitle}
                            onChange={e => setDesignForm(f => ({ ...f, voucherPaymentTitle: e.target.value }))}
                            placeholder="سند صرف مالي معتمد"
                            className="bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">النص السفلي الافتراضي للسندات المالية</label>
                        <Input
                          value={designForm.voucherFooterText}
                          onChange={e => setDesignForm(f => ({ ...f, voucherFooterText: e.target.value }))}
                          placeholder="تعتبر هذه الوثيقة لاغية ومسحوبة بدون صحة التوقيع والأختام الرسمية المعتمدة"
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </CardContent>
                  
                  <div className="bg-slate-50 p-4 border-t flex justify-end gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => refetchPrintSettings()}
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> تراجع
                    </Button>
                    <Button
                      onClick={() => updateSettingsMutation.mutate(designForm)}
                      className="gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold"
                      disabled={updateSettingsMutation.isPending}
                    >
                      <Save className="w-4 h-4" /> حفظ التصميم وتطبيقه على النظام
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Right Column: Live Interactive Mockup */}
              <div className="space-y-6">
                <Card className="border border-border shadow-sm sticky top-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> معاينة تفاعلية فورية للنموذج
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      شاهد كيف سيظهر تصميم السندات وكشوف الحسابات المطبوعة والملفات بعد تعديل الألوان والنصوص:
                    </p>
                    
                    {/* Mockup paper */}
                    <div className="border rounded-xl p-4 bg-white shadow-inner relative overflow-hidden" dir="rtl" style={{ borderColor: designForm.accentColor || "#ef4444" }}>
                      <div className="absolute top-0 right-0 left-0 h-1" style={{ backgroundColor: designForm.accentColor || "#ef4444" }} />
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-sm font-extrabold" style={{ color: designForm.accentColor || "#ef4444" }}>
                            {designForm.companyName || "اسم المنشأة الافتراضي"}
                          </div>
                          <div className="text-[10px] text-gray-500 font-bold">{designForm.companySubtitle || "Subtitle Here"}</div>
                        </div>
                        <div className="w-10 h-10 rounded-full border flex items-center justify-center bg-slate-50" style={{ borderColor: designForm.accentColor || "#ef4444" }}>
                          <AppLogo src={designForm.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                        </div>
                      </div>

                      <div className="w-full text-center py-1 text-white font-extrabold text-xs rounded mb-3" style={{ backgroundColor: designForm.accentColor || "#ef4444" }}>
                        {designForm.customerHeaderText || "عنوان الكشف التجريبي"}
                      </div>

                      {/* Mockup details */}
                      <div className="space-y-1.5 text-[10px] mb-3 pb-3 border-b border-dashed">
                        <div className="flex justify-between"><span className="text-gray-500">اسم المستفيد:</span><span className="font-bold">عميل تجريبي معتمد</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">رقم الحساب:</span><span className="font-mono font-bold">#1004</span></div>
                      </div>

                      {/* Mockup Table */}
                      <div className="border rounded text-[9px] overflow-hidden mb-3">
                        <div className="grid grid-cols-3 text-white font-bold p-1" style={{ backgroundColor: designForm.accentColor || "#ef4444" }}>
                          <div>البيان</div>
                          <div className="text-center">المدفوع</div>
                          <div className="text-center">الرصيد</div>
                        </div>
                        <div className="grid grid-cols-3 p-1 border-b">
                          <div>سداد حساب</div>
                          <div className="text-center text-emerald-600 font-bold font-mono">150.00</div>
                          <div className="text-center font-mono font-bold">50.00</div>
                        </div>
                      </div>

                      {/* Mockup Footer */}
                      <div className="flex justify-between items-center text-[9px] font-bold" style={{ color: designForm.accentColor || "#ef4444" }}>
                        <span>{designForm.customerFooterText || "عبارة التذييل الافتراضية"}</span>
                        <span className="text-gray-400 font-normal">أنشئ بواسطة نظام الحسابات</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ──────────────────────────────────────────────────────── */}
      {/* DIALOG: NEW MANUAL ENTRY (قيد يدوي / رصيد افتتاحي) */}
      {/* ──────────────────────────────────────────────────────── */}
      <Dialog open={showManualDlg} onOpenChange={setShowManualDlg}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-slate-900"><Plus className="w-5 h-5 text-red-600" />إضافة قيد يدوي / تسوية رصيد</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-gray-700">البيان / الوصف القصير *</label>
              <Input
                value={manualForm.description}
                onChange={e => setManualForm(f => ({ ...f, description: e.target.value }))}
                placeholder="مثال: رصيد افتتاحي للعميل، خصم سلفة..."
                className="mt-1 bg-white"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700">مدين (سحب / خصم / مبيعات)</label>
                <Input
                  type="number"
                  value={manualForm.debit}
                  onChange={e => setManualForm(f => ({ ...f, debit: e.target.value }))}
                  placeholder="0"
                  className="mt-1 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">دائن (إيداع / إضافة / سداد)</label>
                <Input
                  type="number"
                  value={manualForm.credit}
                  onChange={e => setManualForm(f => ({ ...f, credit: e.target.value }))}
                  placeholder="0"
                  className="mt-1 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700">التاريخ</label>
                <Input
                  type="date"
                  value={manualForm.entry_date}
                  onChange={e => setManualForm(f => ({ ...f, entry_date: e.target.value }))}
                  className="mt-1 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">ملاحظات إضافية</label>
                <Input
                  value={manualForm.notes}
                  onChange={e => setManualForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="اختيارية"
                  className="mt-1 bg-white"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 gap-2">
            <Button variant="outline" onClick={() => setShowManualDlg(false)}>إلغاء</Button>
            <Button
              onClick={() => addManualMutation.mutate(manualForm)}
              disabled={!manualForm.description || addManualMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              حفظ القيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────── */}
      {/* DIALOG: NEW VOUCHER CREATION WITH CONTROLS (إنشاء سند جديد) */}
      {/* ──────────────────────────────────────────────────────── */}
      <Dialog open={showNewVoucherDlg} onOpenChange={setShowNewVoucherDlg}>
        <DialogContent className="max-w-5xl h-[90vh] overflow-hidden flex flex-col p-0" dir="rtl">
          <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Plus className="w-5 h-5 text-red-600" /> إنشاء سند قبض أو صرف جديد ومعايرته
            </DialogTitle>
            <Button variant="ghost" onClick={() => setShowNewVoucherDlg(false)} className="text-gray-500 font-bold hover:text-gray-900">إغلاق</Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-100/40">
            {/* Left: Input Form (5 cols) */}
            <div className="lg:col-span-5 bg-white border rounded-xl p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-600" /> بيانات ومعطيات السند
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">نوع السند</label>
                  <Select value={voucherForm.type} onValueChange={(val: any) => setVoucherForm(v => ({ ...v, type: val }))}>
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receipt">سند قبض (استلام)</SelectItem>
                      <SelectItem value="payment">سند صرف (دفع)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">فئة الطرف</label>
                  <Select
                    value={voucherForm.party_type}
                    onValueChange={(val: any) => {
                      setVoucherForm(v => ({ ...v, party_type: val, party_id: "", received_from: "" }));
                    }}
                  >
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">الموظفين</SelectItem>
                      <SelectItem value="customer">العملاء</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">الاسم الفعلي للطرف المستهدف *</label>
                <Select
                  value={voucherForm.party_id}
                  onValueChange={(val) => handleVoucherPartyChange(voucherForm.party_type, val)}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="اختر شخصاً..." />
                  </SelectTrigger>
                  <SelectContent>
                    {voucherForm.party_type === "employee"
                      ? employees.map((e: any) => <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>)
                      : customers.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)
                    }
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">المبلغ بالأرقام *</label>
                  <Input
                    type="number"
                    value={voucherForm.amount}
                    onChange={e => setVoucherForm(v => ({ ...v, amount: e.target.value }))}
                    placeholder="0.00"
                    className="bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">العملة</label>
                  <Input
                    value={voucherConfig.currency}
                    onChange={e => setVoucherConfig(v => ({ ...v, currency: e.target.value }))}
                    placeholder="دينار"
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">استلمنا من السيد / مدفوع للسيد</label>
                <Input
                  value={voucherForm.received_from}
                  onChange={e => setVoucherForm(v => ({ ...v, received_from: e.target.value }))}
                  placeholder="الاسم كامل"
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">مبلغ وقدره كتابةً</label>
                <Input
                  value={voucherForm.amount_text}
                  onChange={e => setVoucherForm(v => ({ ...v, amount_text: e.target.value }))}
                  placeholder="مثال: ألف وخمسمائة دينار فقط لا غير"
                  className="bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">وذلك مقابل</label>
                  <Input
                    value={voucherForm.payment_against}
                    onChange={e => setVoucherForm(v => ({ ...v, payment_against: e.target.value }))}
                    placeholder="سبب الصرف أو القبض"
                    className="bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">طريقة الدفع</label>
                  <Select value={voucherForm.payment_method} onValueChange={val => setVoucherForm(v => ({ ...v, payment_method: val }))}>
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">نقداً</SelectItem>
                      <SelectItem value="card">شبكة</SelectItem>
                      <SelectItem value="bank">تحويل بنكي</SelectItem>
                      <SelectItem value="cheque">شيك</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">ملاحظات السند (للمراجعة الداخلية)</label>
                <Input
                  value={voucherForm.notes}
                  onChange={e => setVoucherForm(v => ({ ...v, notes: e.target.value }))}
                  placeholder="اختيارية"
                  className="bg-white"
                />
              </div>
            </div>

            {/* Middle: Customizer controls (3 cols) */}
            <div className="lg:col-span-3 bg-white border rounded-xl p-5 space-y-4 shadow-sm">
              <h3 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-500" /> مظهر وتفاصيل السند
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">عنوان الهيدر الرئيسي</label>
                <Input
                  value={voucherConfig.header_title}
                  onChange={e => setVoucherConfig(v => ({ ...v, header_title: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">عنوان فرعي / إنجليزي</label>
                <Input
                  value={voucherConfig.header_subtitle}
                  onChange={e => setVoucherConfig(v => ({ ...v, header_subtitle: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 block">شعار السند (تحميل صورة)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    id="voucher-logo-upload"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        toast({ variant: "destructive", title: "حجم الصورة كبير جداً", description: "الحد الأقصى 5MB" });
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = ev => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement("canvas");
                          const MAX = 400;
                          let w = img.width, h = img.height;
                          if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
                          if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
                          canvas.width = w; canvas.height = h;
                          const ctx = canvas.getContext("2d")!;
                          ctx.fillStyle = "#fff";
                          ctx.fillRect(0, 0, w, h);
                          ctx.drawImage(img, 0, 0, w, h);
                          const compressed = canvas.toDataURL("image/jpeg", 0.75);
                          setVoucherConfig(v => ({ ...v, logo_url: compressed }));
                          toast({ title: "تم تحديث شعار السند بنجاح" });
                        };
                        img.src = ev.target?.result as string;
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => document.getElementById("voucher-logo-upload")?.click()}
                    className="gap-2 text-xs flex-1"
                  >
                    <Upload className="w-3.5 h-3.5" /> تحميل الشعار من الملفات
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setVoucherConfig(v => ({ ...v, logo_url: "/omnisystem-logo.png" }))}
                    className="text-xs"
                  >
                    الافتراضي
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700">اللون المميز (Accent)</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVoucherConfig(v => ({ ...v, accent_color: "#ef4444" }))}
                    className="w-6 h-6 rounded-full bg-red-500 border border-black/10"
                    title="أحمر الشام"
                  />
                  <button
                    onClick={() => setVoucherConfig(v => ({ ...v, accent_color: "#1d4ed8" }))}
                    className="w-6 h-6 rounded-full bg-blue-700 border border-black/10"
                    title="أزرق"
                  />
                  <button
                    onClick={() => setVoucherConfig(v => ({ ...v, accent_color: "#15803d" }))}
                    className="w-6 h-6 rounded-full bg-green-700 border border-black/10"
                    title="أخضر"
                  />
                  <button
                    onClick={() => setVoucherConfig(v => ({ ...v, accent_color: "#ca8a04" }))}
                    className="w-6 h-6 rounded-full bg-yellow-600 border border-black/10"
                    title="ذهبي"
                  />
                </div>
                <Input
                  value={voucherConfig.accent_color}
                  onChange={e => setVoucherConfig(v => ({ ...v, accent_color: e.target.value }))}
                  placeholder="#ef4444"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">شعار ذيل السند</label>
                <Input
                  value={voucherConfig.bottom_text}
                  onChange={e => setVoucherConfig(v => ({ ...v, bottom_text: e.target.value }))}
                />
              </div>
            </div>

            {/* Right: Real-time Live Preview matching Image 1 (4 cols) */}
            <div className="lg:col-span-4 bg-white border rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-500" /> معاينة السند الفورية
                </h3>
                
                {/* Image 1 Replica Card container */}
                <div className="border border-gray-300 rounded-xl p-4 bg-white relative overflow-hidden" dir="rtl" style={{ borderColor: voucherConfig.accent_color + "40" }}>
                  {/* Top Arc Header with Logo */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-black" style={{ color: voucherConfig.accent_color }}>{voucherConfig.header_title}</div>
                      <div className="text-[9px] font-bold text-gray-500 leading-none">{voucherConfig.header_subtitle}</div>
                      
                      {/* Title: "سند" with decorative wheat/accent */}
                      <div className="pt-2 text-center flex flex-col items-center">
                        <span className="text-lg font-black tracking-widest leading-none" style={{ color: voucherConfig.accent_color }}>
                          {voucherForm.type === "receipt" ? "سند قـبـض" : "سند صـرف"}
                        </span>
                        <div className="w-12 h-1 mt-1 rounded-full" style={{ backgroundColor: voucherConfig.accent_color }} />
                      </div>
                    </div>
                    
                    {/* Rounded Logo */}
                    <div className="w-14 h-14 rounded-full border-2 overflow-hidden flex items-center justify-center shadow-sm" style={{ borderColor: voucherConfig.accent_color }}>
                      <AppLogo src={voucherConfig.logo_url} className="w-12 h-12 object-contain" fallback={<img src='https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100' className="w-12 h-12 object-contain" />} />
                    </div>
                  </div>

                  {/* Voucher Number & Date */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                    <div className="border rounded px-2 py-1 flex justify-between bg-slate-50/50" style={{ borderColor: voucherConfig.accent_color }}>
                      <span className="font-bold">رقم السند:</span>
                      <span className="font-bold">#</span>
                    </div>
                    <div className="border-b border-dashed py-1 text-left">
                      <span className="text-gray-500 font-bold ml-1">التاريخ:</span>
                      <span className="font-bold font-mono">{new Date().toLocaleDateString("ar-SA")}</span>
                    </div>
                  </div>

                  {/* Main Voucher Body Block */}
                  <div className="border rounded-xl p-3 bg-white space-y-2" style={{ borderColor: voucherConfig.accent_color + "50" }}>
                    {/* Amount & Currency */}
                    <div className="flex rounded overflow-hidden text-xs max-w-[150px] border shadow-sm" style={{ borderColor: voucherConfig.accent_color }}>
                      <div className="text-white font-extrabold px-2.5 py-1 flex items-center justify-center" style={{ backgroundColor: voucherConfig.accent_color }}>
                        المبلغ
                      </div>
                      <div className="bg-amber-50/30 text-gray-900 font-bold px-3 py-1 font-mono flex-1 flex items-center justify-center">
                        {voucherForm.amount || "0.00"} {voucherConfig.currency}
                      </div>
                    </div>

                    {/* Dotted lines for fields */}
                    <div className="space-y-1.5 text-[10px]">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gray-500 shrink-0">استلمنا من السيد /</span>
                        <span className="font-extrabold text-gray-900 border-b border-dashed border-gray-300 flex-1 py-0.5 truncate min-h-[16px]">
                          {voucherForm.received_from || "—"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gray-500 shrink-0">مبلغ وقدره /</span>
                        <span className="font-semibold text-gray-900 border-b border-dashed border-gray-300 flex-1 py-0.5 truncate min-h-[16px]">
                          {voucherForm.amount_text || "—"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gray-500 shrink-0">وذلك مقابل /</span>
                        <span className="font-semibold text-gray-900 border-b border-dashed border-gray-300 flex-1 py-0.5 truncate min-h-[16px]">
                          {voucherForm.payment_against || "—"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gray-500 shrink-0">طريقة الدفع /</span>
                        <span className="font-bold text-gray-900 border-b border-dashed border-gray-300 flex-1 py-0.5 min-h-[16px]">
                          {voucherForm.payment_method === "cash" ? "نقداً" : voucherForm.payment_method === "card" ? "شبكة" : voucherForm.payment_method === "bank" ? "تحويل" : "شيك"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Signatures & Notes row */}
                  <div className="grid grid-cols-4 gap-1.5 mt-3 text-[8px] text-center">
                    <div className="border border-gray-200 bg-gray-50/30 rounded p-1.5 flex flex-col justify-between min-h-[40px]">
                      <span className="font-bold text-gray-500">ملاحظات</span>
                      <span className="text-gray-400">................</span>
                    </div>
                    <div className="border border-gray-200 bg-gray-50/30 rounded p-1.5 flex flex-col justify-between min-h-[40px]">
                      <span className="font-bold text-gray-500">المحاسب</span>
                      <span className="text-gray-400">التوقيع</span>
                    </div>
                    <div className="border border-gray-200 bg-gray-50/30 rounded p-1.5 flex flex-col justify-between min-h-[40px]">
                      <span className="font-bold text-gray-500">المستلم</span>
                      <span className="text-gray-400">التوقيع</span>
                    </div>
                    <div className="border border-amber-200 bg-amber-50/30 rounded p-1.5 flex flex-col justify-between min-h-[40px]">
                      <span className="font-bold text-amber-800">المبلغ كتابةً</span>
                      <span className="text-amber-900 leading-tight font-semibold truncate">{voucherForm.amount_text || "—"}</span>
                    </div>
                  </div>

                  {/* Wave footer */}
                  <div className="mt-3 pt-1 border-t flex justify-between items-center text-[8px] font-bold" style={{ color: voucherConfig.accent_color }}>
                    <span>{voucherConfig.bottom_text}</span>
                    <span className="text-gray-400">صنع بثقة</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed mt-4 space-y-2">
                <Button
                  onClick={() => createVoucherMutation.mutate(voucherForm)}
                  disabled={!voucherForm.party_id || !voucherForm.amount || createVoucherMutation.isPending}
                  className="w-full text-white font-extrabold h-11 shadow"
                  style={{ backgroundColor: voucherConfig.accent_color }}
                >
                  حفظ وتوليد السند وطباعته
                </Button>
                <Button variant="outline" onClick={() => setShowNewVoucherDlg(false)} className="w-full h-10">إلغاء</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ──────────────────────────────────────────────────────── */}
      {/* DIALOG: VIEW & PRINT SINGLE VOUCHER (عرض وطباعة السند المختار) */}
      {/* ──────────────────────────────────────────────────────── */}
      <Dialog open={!!viewVoucher} onOpenChange={(v) => { if (!v) setViewVoucher(null); }}>
        <DialogContent className="max-w-2xl p-6" dir="rtl">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex justify-between items-center text-gray-900">
              <span className="font-black text-lg">
                معاينة السند التفصيلي — {viewVoucher?.type === "receipt" ? "سند قبض" : "سند صرف"} #{viewVoucher?.voucher_number}
              </span>
              <Button onClick={() => handlePrint("voucher-print-area")} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs">
                <Printer className="w-4 h-4" /> طباعة السند (A4)
              </Button>
            </DialogTitle>
          </DialogHeader>

          {/* High Fidelity A4 scalable representation of the Voucher */}
          <div className="py-6 flex justify-center">
            <div id="voucher-print-area" className="w-full border-2 rounded-2xl p-8 bg-white shadow-sm relative overflow-hidden" style={{ borderColor: viewVoucher?.accent_color }}>
              {/* Top Wave Bar */}
              <div className="absolute top-0 right-0 left-0 h-2" style={{ backgroundColor: viewVoucher?.accent_color }} />
              
              {/* Header block */}
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-black" style={{ color: viewVoucher?.accent_color }}>{viewVoucher?.header_title}</h2>
                  <p className="text-sm font-bold text-gray-500 leading-none">{viewVoucher?.header_subtitle}</p>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black tracking-widest" style={{ color: viewVoucher?.accent_color }}>
                    {viewVoucher?.type === "receipt" ? "سند قـبـض" : "سند صـرف"}
                  </span>
                  <div className="w-20 h-1 mt-1 rounded-full" style={{ backgroundColor: viewVoucher?.accent_color }} />
                </div>

                <div className="w-20 h-20 rounded-full border-2 overflow-hidden flex items-center justify-center bg-white shadow-sm" style={{ borderColor: viewVoucher?.accent_color }}>
                  <AppLogo src={viewVoucher?.logo_url} className="w-16 h-16 object-contain" fallback={<img src='https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100' className="w-16 h-16 object-contain" />} />
                </div>
              </div>

              {/* Number and Date box */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border rounded-lg px-4 py-2 flex justify-between bg-slate-50" style={{ borderColor: viewVoucher?.accent_color }}>
                  <span className="font-bold text-gray-600">رقم السند :</span>
                  <span className="font-black font-mono text-gray-900">{viewVoucher?.voucher_number}</span>
                </div>
                <div className="border-b border-dashed border-gray-300 py-2 flex items-center justify-end">
                  <span className="text-gray-500 font-bold ml-2">التاريخ :</span>
                  <span className="font-black font-mono text-gray-900">{viewVoucher?.created_at?.slice(0, 10)}</span>
                </div>
              </div>

              {/* Main amount & details section */}
              <div className="border rounded-2xl p-6 bg-white space-y-4 mb-6" style={{ borderColor: viewVoucher?.accent_color + "50" }}>
                {/* Amount block */}
                <div className="flex rounded-lg overflow-hidden border-2 max-w-[200px]" style={{ borderColor: viewVoucher?.accent_color }}>
                  <div className="text-white font-black px-4 py-1.5 text-sm flex items-center justify-center" style={{ backgroundColor: viewVoucher?.accent_color }}>
                    المبلغ
                  </div>
                  <div className="bg-amber-50/20 text-gray-900 font-extrabold px-4 py-1.5 font-mono text-sm flex-1 flex items-center justify-center">
                    {fmt(viewVoucher?.amount)} {viewVoucher?.currency}
                  </div>
                </div>

                {/* Dotted lines details exactly like Image 1 */}
                <div className="space-y-3.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-600 shrink-0">استلمنا من السيد /</span>
                    <span className="font-extrabold text-gray-900 border-b border-dashed border-gray-400 flex-1 py-0.5 truncate">
                      {viewVoucher?.received_from || "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-600 shrink-0">مبلغ وقدره /</span>
                    <span className="font-semibold text-gray-900 border-b border-dashed border-gray-400 flex-1 py-0.5 truncate">
                      {viewVoucher?.amount_text || "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-600 shrink-0">وذلك مقابل /</span>
                    <span className="font-semibold text-gray-900 border-b border-dashed border-gray-400 flex-1 py-0.5 truncate">
                      {viewVoucher?.payment_against || "—"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-600 shrink-0">طريقة الدفع /</span>
                    <span className="font-bold text-gray-900 border-b border-dashed border-gray-400 flex-1 py-0.5">
                      {viewVoucher?.payment_method === "cash" ? "نقداً" : viewVoucher?.payment_method === "card" ? "شبكة" : viewVoucher?.payment_method === "bank" ? "تحويل بنكي" : "شيك مقبول الدفع"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lower footer grid block */}
              <div className="grid grid-cols-4 gap-4 text-xs text-center">
                <div className="border border-gray-200 bg-gray-50/50 rounded-xl p-3 flex flex-col justify-between min-h-[60px]">
                  <span className="font-bold text-gray-600">ملاحظات</span>
                  <span className="text-gray-400 truncate">{viewVoucher?.notes || "................"}</span>
                </div>
                <div className="border border-gray-200 bg-gray-50/50 rounded-xl p-3 flex flex-col justify-between min-h-[60px]">
                  <span className="font-bold text-gray-600">المحاسب</span>
                  <span className="text-gray-400 font-mono text-[10px]">التوقيع : .............</span>
                </div>
                <div className="border border-gray-200 bg-gray-50/50 rounded-xl p-3 flex flex-col justify-between min-h-[60px]">
                  <span className="font-bold text-gray-600">المستلم</span>
                  <span className="text-gray-400 font-mono text-[10px]">التوقيع : .............</span>
                </div>
                <div className="border border-amber-200 bg-amber-50/30 rounded-xl p-3 flex flex-col justify-between min-h-[60px]">
                  <span className="font-bold text-amber-800">المبلغ كتابةً</span>
                  <span className="text-amber-900 leading-tight font-extrabold text-[11px]">{viewVoucher?.amount_text || "—"}</span>
                </div>
              </div>

              {/* Slogan Banner footer wave line */}
              <div className="mt-8 pt-4 border-t border-red-100 flex justify-between items-center text-xs font-bold" style={{ color: viewVoucher?.accent_color }}>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{viewVoucher?.bottom_text}</span>
                </div>
                <span className="text-gray-400 font-mono">الرقم المالي المعتمد</span>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setViewVoucher(null)}>إغلاق المعاينة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
