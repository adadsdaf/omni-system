import { useState, useEffect } from "react";
import {
  ShieldCheck, Plus, RefreshCw, Ban, CheckCircle, Trash2, RotateCcw,
  Copy, KeyRound, Building2, Users, Monitor, Calendar, Activity,
  ChevronDown, ChevronUp, LogOut, AlertCircle, Loader2
} from "lucide-react";
import { toast } from "sonner";

const DEV_KEY = "DEV-ADMIN-2024";

const LICENSE_TYPES: Record<string, string> = {
  trial: "تجريبي (30 يوم)",
  monthly: "شهري",
  semi_annual: "نصف سنوي",
  annual: "سنوي",
  lifetime: "دائم",
  multi_branch: "متعدد الفروع",
  cloud: "سحابي",
  local: "محلي",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: "نشط", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  expired: { label: "منتهي", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  suspended: { label: "موقوف", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
};

type License = {
  id: number;
  licenseKey: string;
  companyName: string;
  customerId: string | null;
  licenseType: string;
  status: string;
  startDate: string;
  expireDate: string | null;
  machineId: string | null;
  branchLimit: number;
  userLimit: number;
  posLimit: number;
  notes: string | null;
  createdDate: string;
  activationCount: number;
  activations: Array<{ machineId: string; ipAddress: string | null; activationDate: string; lastSeen: string }>;
};

function apiHeaders() {
  return { "Content-Type": "application/json", "x-dev-key": DEV_KEY };
}

async function apiFetch(url: string, opts?: RequestInit) {
  const res = await fetch(url, { ...opts, headers: { ...apiHeaders(), ...(opts?.headers ?? {}) } });
  return res.json();
}

/* ── Login Gate ── */
function LoginGate({ onLogin }: { onLogin: () => void }) {
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);

  const attempt = () => {
    if (pass === DEV_KEY) { onLogin(); }
    else { setErr(true); setTimeout(() => setErr(false), 2000); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={32} className="text-amber-400" />
          </div>
          <h1 className="text-xl font-black text-white">لوحة المطوّر</h1>
          <p className="text-slate-400 text-sm mt-1">إدارة تراخيص النظام</p>
        </div>
        <div className="space-y-3">
          <input
            type="password"
            placeholder="مفتاح المطوّر"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && attempt()}
            className={`w-full bg-slate-800 border ${err ? "border-red-500" : "border-slate-600"} rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-mono`}
          />
          {err && <p className="text-red-400 text-xs text-center">كلمة المرور غير صحيحة</p>}
          <button
            onClick={attempt}
            className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}
          >
            دخول
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Create License Modal ── */
function CreateLicenseModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    companyName: "", licenseType: "trial", customerId: "",
    branchLimit: 1, userLimit: 5, posLimit: 1, notes: "",
  });
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.companyName) return toast.error("اسم الشركة مطلوب");
    setLoading(true);
    try {
      const data = await apiFetch("/api/licenses", { method: "POST", body: JSON.stringify(form) });
      if (data.id) {
        toast.success(`تم إنشاء الترخيص: ${data.licenseKey}`);
        onCreated();
        onClose();
      } else toast.error(data.error ?? "خطأ في الإنشاء");
    } catch { toast.error("خطأ في الاتصال"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg flex items-center gap-2"><Plus size={18} className="text-amber-400" />إنشاء ترخيص جديد</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-slate-400 text-xs mb-1 block">اسم الشركة / العميل *</label>
              <input value={form.companyName} onChange={(e) => setForm(f => ({ ...f, companyName: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="مطعم الريف" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">نوع الترخيص</label>
              <select value={form.licenseType} onChange={(e) => setForm(f => ({ ...f, licenseType: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors">
                {Object.entries(LICENSE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">رقم العميل (اختياري)</label>
              <input value={form.customerId} onChange={(e) => setForm(f => ({ ...f, customerId: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="CUST-001" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">حد الفروع</label>
              <input type="number" min={1} value={form.branchLimit} onChange={(e) => setForm(f => ({ ...f, branchLimit: +e.target.value }))}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">حد المستخدمين</label>
              <input type="number" min={1} value={form.userLimit} onChange={(e) => setForm(f => ({ ...f, userLimit: +e.target.value }))}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors" />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">حد الكاشيرات</label>
              <input type="number" min={1} value={form.posLimit} onChange={(e) => setForm(f => ({ ...f, posLimit: +e.target.value }))}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors" />
            </div>
            <div className="col-span-2">
              <label className="text-slate-400 text-xs mb-1 block">ملاحظات</label>
              <textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400 transition-colors resize-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={submit} disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              إنشاء الترخيص
            </button>
            <button onClick={onClose} className="px-5 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors">إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── License Card ── */
function LicenseCard({ lic, onRefresh }: { lic: License; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [renewMonths, setRenewMonths] = useState(1);

  const copy = (text: string, label: string) => navigator.clipboard.writeText(text).then(() => toast.success(`تم نسخ ${label}`));

  const patch = async (body: Record<string, unknown>, msg: string) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/licenses/${lic.id}`, { method: "PATCH", body: JSON.stringify(body) });
      if (data.id) { toast.success(msg); onRefresh(); }
      else toast.error(data.error ?? "خطأ");
    } catch { toast.error("خطأ في الاتصال"); }
    finally { setLoading(false); }
  };

  const deleteLic = async () => {
    if (!confirm(`هل أنت متأكد من حذف ترخيص ${lic.companyName}؟`)) return;
    setLoading(true);
    try {
      await apiFetch(`/api/licenses/${lic.id}`, { method: "DELETE" });
      toast.success("تم الحذف");
      onRefresh();
    } catch { toast.error("خطأ في الحذف"); }
    finally { setLoading(false); }
  };

  const st = STATUS_LABELS[lic.status] ?? { label: lic.status, color: "bg-slate-800 text-slate-300" };
  const isExpired = lic.expireDate && new Date(lic.expireDate) < new Date();
  const daysLeft = lic.expireDate ? Math.ceil((new Date(lic.expireDate).getTime() - Date.now()) / 86400000) : null;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-bold truncate">{lic.companyName}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">{LICENSE_TYPES[lic.licenseType] ?? lic.licenseType}</span>
            </div>
            {lic.customerId && <p className="text-slate-400 text-xs mt-0.5">رقم العميل: {lic.customerId}</p>}
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-white shrink-0 transition-colors">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* License Key */}
        <div className="mt-3 flex items-center gap-2 bg-black/30 rounded-lg px-3 py-2">
          <KeyRound size={14} className="text-amber-400 shrink-0" />
          <span className="font-mono text-amber-300 text-sm tracking-widest flex-1">{lic.licenseKey}</span>
          <button onClick={() => copy(lic.licenseKey, "المفتاح")} className="text-slate-400 hover:text-white transition-colors"><Copy size={14} /></button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <Stat icon={<Building2 size={13} />} label="فروع" value={lic.branchLimit} />
          <Stat icon={<Users size={13} />} label="مستخدم" value={lic.userLimit} />
          <Stat icon={<Monitor size={13} />} label="كاشير" value={lic.posLimit} />
          <Stat icon={<Activity size={13} />} label="تفعيل" value={lic.activationCount} />
        </div>

        {/* Expiry */}
        {lic.expireDate && (
          <div className={`mt-2 flex items-center gap-1.5 text-xs ${isExpired ? "text-red-400" : daysLeft && daysLeft <= 14 ? "text-yellow-400" : "text-slate-400"}`}>
            <Calendar size={12} />
            {isExpired ? `انتهى منذ ${Math.abs(daysLeft!)} يوم` : `ينتهي في: ${new Date(lic.expireDate).toLocaleDateString("ar-SA")} (${daysLeft} يوم متبقي)`}
          </div>
        )}
        {!lic.expireDate && <p className="mt-2 text-xs text-green-400 flex items-center gap-1"><CheckCircle size={12} />ترخيص دائم</p>}

        {/* Machine ID */}
        {lic.machineId && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <Monitor size={12} />
            <span className="font-mono">{lic.machineId}</span>
            <button onClick={() => copy(lic.machineId!, "معرّف الجهاز")} className="hover:text-white transition-colors"><Copy size={11} /></button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-slate-700/50 px-4 py-3 flex flex-wrap gap-2">
        {lic.status !== "active" && (
          <ActionBtn onClick={() => patch({ status: "active" }, "تم التفعيل")} icon={<CheckCircle size={13} />} label="تفعيل" color="green" loading={loading} />
        )}
        {lic.status === "active" && (
          <ActionBtn onClick={() => patch({ status: "suspended" }, "تم الإيقاف")} icon={<Ban size={13} />} label="إيقاف" color="red" loading={loading} />
        )}
        {lic.machineId && (
          <ActionBtn onClick={() => patch({ machineId: null }, "تم نقل الترخيص")} icon={<RotateCcw size={13} />} label="نقل لجهاز آخر" color="yellow" loading={loading} />
        )}
        <div className="flex items-center gap-1">
          <select value={renewMonths} onChange={(e) => setRenewMonths(+e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-slate-200 text-xs focus:outline-none">
            {[1,2,3,6,12,24].map(m => <option key={m} value={m}>{m === 12 ? "سنة" : m === 24 ? "سنتان" : `${m} شهر`}</option>)}
          </select>
          <ActionBtn onClick={() => patch({ renewMonths }, "تم التجديد")} icon={<RefreshCw size={13} />} label="تجديد" color="blue" loading={loading} />
        </div>
        <button onClick={deleteLic} disabled={loading}
          className="mr-auto px-2.5 py-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900/50 transition-colors text-xs flex items-center gap-1 disabled:opacity-40">
          <Trash2 size={13} />حذف
        </button>
      </div>

      {/* Expanded: activations + notes */}
      {expanded && (
        <div className="border-t border-slate-700/50 px-4 py-3 bg-black/20">
          {lic.notes && <p className="text-slate-400 text-xs mb-3">📝 {lic.notes}</p>}
          <p className="text-slate-400 text-xs font-medium mb-2">سجل التفعيلات ({lic.activations.length})</p>
          {lic.activations.length === 0 ? (
            <p className="text-slate-600 text-xs">لا توجد تفعيلات بعد</p>
          ) : (
            <div className="space-y-2">
              {lic.activations.map((act, i) => (
                <div key={i} className="bg-slate-800 rounded-lg p-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-mono">{act.machineId}</span>
                    <span className="text-slate-500">{act.ipAddress}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 mt-1">
                    <span>تفعيل: {new Date(act.activationDate).toLocaleDateString("ar-SA")}</span>
                    <span>آخر اتصال: {new Date(act.lastSeen).toLocaleDateString("ar-SA")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-slate-800 rounded-lg p-2 text-center">
      <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">{icon}<span className="text-xs">{label}</span></div>
      <span className="text-white font-bold text-sm">{value}</span>
    </div>
  );
}

function ActionBtn({ onClick, icon, label, color, loading }: {
  onClick: () => void; icon: React.ReactNode; label: string;
  color: "green" | "red" | "yellow" | "blue"; loading: boolean;
}) {
  const colors = {
    green: "bg-green-900/30 text-green-400 hover:bg-green-900/50 border-green-900/50",
    red: "bg-red-900/30 text-red-400 hover:bg-red-900/50 border-red-900/50",
    yellow: "bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/50 border-yellow-900/50",
    blue: "bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 border-blue-900/50",
  };
  return (
    <button onClick={onClick} disabled={loading}
      className={`px-2.5 py-1.5 rounded-lg border transition-colors text-xs flex items-center gap-1 disabled:opacity-40 ${colors[color]}`}>
      {icon}{label}
    </button>
  );
}

/* ── Main Dashboard ── */
export default function LicenseDashboard() {
  const [authed, setAuthed] = useState(false);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "expired" | "suspended">("all");

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/licenses");
      setLicenses(Array.isArray(data) ? data : []);
    } catch { toast.error("فشل تحميل التراخيص"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (authed) load(); }, [authed]);

  if (!authed) return <LoginGate onLogin={() => setAuthed(true)} />;

  const filtered = filter === "all" ? licenses : licenses.filter(l => l.status === filter);
  const counts = {
    all: licenses.length,
    active: licenses.filter(l => l.status === "active").length,
    pending: licenses.filter(l => l.status === "pending").length,
    expired: licenses.filter(l => l.status === "expired").length,
    suspended: licenses.filter(l => l.status === "suspended").length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      {showCreate && <CreateLicenseModal onClose={() => setShowCreate(false)} onCreated={load} />}

      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <ShieldCheck size={20} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-black">لوحة إدارة التراخيص</h1>
              <p className="text-slate-400 text-xs">خاص بالمطوّر فقط</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} disabled={loading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white text-sm hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
              <Plus size={16} />إنشاء ترخيص
            </button>
            <button onClick={() => setAuthed(false)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {(["all", "active", "pending", "expired", "suspended"] as const).map(k => (
            <button key={k} onClick={() => setFilter(k)}
              className={`rounded-xl p-4 border transition-all text-center ${filter === k ? "border-amber-500/50 bg-amber-500/10" : "border-slate-700 bg-slate-800/50 hover:bg-slate-800"}`}>
              <div className="text-2xl font-black text-white">{counts[k]}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {k === "all" ? "الكل" : STATUS_LABELS[k]?.label ?? k}
              </div>
            </button>
          ))}
        </div>

        {/* List */}
        {loading && licenses.length === 0 ? (
          <div className="text-center py-20 text-slate-500 flex flex-col items-center gap-3">
            <Loader2 size={32} className="animate-spin" />
            <span>جاري التحميل...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-600 flex flex-col items-center gap-3">
            <AlertCircle size={40} />
            <span>{filter === "all" ? "لا توجد تراخيص بعد" : "لا توجد تراخيص بهذه الحالة"}</span>
            {filter === "all" && (
              <button onClick={() => setShowCreate(true)}
                className="mt-2 px-5 py-2.5 rounded-xl font-bold text-white text-sm hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                إنشاء أول ترخيص
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map(lic => (
              <LicenseCard key={lic.id} lic={lic} onRefresh={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
