import { useState } from "react";
import { getMachineId, setLicenseKey } from "@/lib/machine-id";
import { ShieldCheck, KeyRound, Copy, CheckCircle, AlertCircle, Loader2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";

type Props = {
  onActivated: () => void;
};

export default function LicenseActivation({ onActivated }: Props) {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const machineId = getMachineId();

  const copyMachineId = () => {
    navigator.clipboard.writeText(machineId).then(() => toast.success("تم نسخ معرّف الجهاز"));
  };

  const handleActivate = async () => {
    const cleaned = key.trim().toUpperCase();
    if (cleaned.length < 10) {
      setErrorMsg("يرجى إدخال مفتاح الترخيص كاملاً");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: cleaned, machineId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        const msgs: Record<string, string> = {
          license_not_found: "مفتاح الترخيص غير صحيح",
          license_suspended: "الترخيص موقوف — تواصل مع المطوّر",
          license_expired: "انتهت صلاحية الترخيص — يرجى التجديد",
          machine_mismatch: "هذا الترخيص مرتبط بجهاز آخر",
          license_pending: "الترخيص لم يُفعَّل بعد من المطوّر",
        };
        setErrorMsg(msgs[data.error] ?? data.message ?? "خطأ في التفعيل");
        setStatus("error");
        return;
      }
      setLicenseKey(cleaned);
      setStatus("success");
      setTimeout(() => onActivated(), 1800);
    } catch {
      setErrorMsg("تعذّر الاتصال بالخادم — تحقق من الشبكة");
      setStatus("error");
    }
  };

  const errorLabels: Record<string, string> = {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}
      dir="rtl"
    >
      <div className="w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl border-4 border-amber-400"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            <UtensilsCrossed size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">نظام إدارة المطعم</h1>
          <p className="text-amber-300 mt-1">تفعيل الترخيص</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <ShieldCheck size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">تفعيل النظام</h2>
              <p className="text-white/50 text-xs">أدخل مفتاح الترخيص الخاص بك</p>
            </div>
          </div>

          {/* Machine ID */}
          <div className="mb-5">
            <label className="text-white/60 text-xs mb-1 block">معرّف جهازك (Machine ID)</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-black/30 border border-white/20 rounded-xl px-4 py-2.5 font-mono text-amber-300 text-sm tracking-widest select-all">
                {machineId}
              </div>
              <button
                onClick={copyMachineId}
                className="px-3 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white/70 hover:text-white transition-colors"
                title="نسخ"
              >
                <Copy size={16} />
              </button>
            </div>
            <p className="text-white/40 text-xs mt-1">أرسل هذا الرمز للمطوّر للحصول على مفتاح الترخيص</p>
          </div>

          {/* License Key Input */}
          <div className="mb-5">
            <label className="text-white/60 text-xs mb-1 block">مفتاح الترخيص</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <KeyRound size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value.toUpperCase());
                    setErrorMsg("");
                    setStatus("idle");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleActivate()}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  maxLength={19}
                  className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-3 pr-9 font-mono text-white placeholder-white/30 text-sm tracking-widest focus:outline-none focus:border-amber-400/60 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-xl text-red-300 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-green-500/20 border border-green-400/30 rounded-xl text-green-300 text-sm">
              <CheckCircle size={16} className="shrink-0" />
              تم التفعيل بنجاح! جاري تشغيل النظام...
            </div>
          )}

          {/* Activate Button */}
          <button
            onClick={handleActivate}
            disabled={status === "loading" || status === "success"}
            className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
          >
            {status === "loading" ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                جاري التحقق...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle size={20} />
                تم التفعيل ✓
              </>
            ) : (
              <>
                <ShieldCheck size={20} />
                تفعيل الترخيص
              </>
            )}
          </button>

          <p className="text-center text-white/30 text-xs mt-4">
            للحصول على ترخيص، تواصل مع المطوّر
          </p>
        </div>

        <div className="text-center text-white/20 text-xs mt-6">
          نظام إدارة المطاعم المتكامل — جميع الحقوق محفوظة
        </div>
      </div>
    </div>
  );
}
