import React, { useState, useEffect } from 'react';
import { Terminal, CheckCircle2, Sparkles, UtensilsCrossed } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [step, setStep] = useState(0);
  const [countdown, setCountdown] = useState(5);

  const steps = [
    { text: "تشغيل سيرفر الكاشير الخلفي (Port 3000)...", detail: "cd /d \"C:\\Users\\DZ\\Downloads\\ewew\" && npm run dev" },
    { text: "فحص وتنظيف المنفذ والتحقق من الجاهزية...", detail: "Checking socket binding & port 3000 availability" },
    { text: "تهيئة قاعدة البيانات ونظام المطاعم...", detail: "Loading restaurant tables, kitchen display & inventory" },
    { text: "انتظار اكتمال التحميل...", detail: "timeout /t 5 /nobreak >nul" },
    { text: "النظام يعمل الآن بنجاح على http://localhost:3000/", detail: "UniSoft Omni System Pro Ready" }
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, 900);

    const countInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev > 1) return prev - 1;
        return 0;
      });
    }, 1000);

    const finishTimeout = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(countInterval);
      clearTimeout(finishTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-white text-slate-800 z-50 flex items-center justify-center p-4 select-none font-sans" dir="rtl">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50/50 via-white to-blue-50/40 pointer-events-none"></div>

      <div className="relative bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-8 shadow-2xl flex flex-col items-center text-center space-y-6">
        {/* Windows title bar preview */}
        <div className="absolute top-0 inset-x-0 bg-slate-100 px-4 py-2.5 rounded-t-3xl border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            <span className="mr-2 font-mono text-slate-700 font-medium">omni_system_pro.exe</span>
          </div>
          <span className="text-emerald-600 font-mono text-[11px] font-bold">http://localhost:3000/</span>
        </div>

        {/* Official Logo Display */}
        <div className="mt-6 relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
          <div className="relative w-28 h-28 rounded-2xl bg-slate-900 border-2 border-slate-200 flex items-center justify-center shadow-xl overflow-hidden p-2">
            <img 
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80" 
              alt="Omni System Pro Logo" 
              className="w-full h-full object-cover rounded-xl opacity-90"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end justify-center pb-1">
              <span className="text-[10px] font-bold text-emerald-400 font-mono">UniSoft</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <span>Omni System Pro</span>
          </h1>
          <p className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1.5">
            <UtensilsCrossed size={16} />
            <span>نظام إدارة المطاعم ونقاط البيع من إتقان سوفت (UniSoft)</span>
          </p>
          <p className="text-xs text-slate-500">إطلاق السيرفر الخلفي تلقائياً وبدء النظام على المنفذ 3000</p>
        </div>

        {/* Startup progress box */}
        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-right space-y-3 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between text-slate-600 border-b border-slate-200 pb-2">
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <Terminal size={14} />
              <span>جاري إعداد خادم السيرفر...</span>
            </span>
            <span className="text-amber-600 font-bold">00:0{6 - countdown}</span>
          </div>

          <div className="space-y-2">
            {steps.map((s, idx) => (
              <div 
                key={idx} 
                className={`flex items-start gap-2 transition-all duration-300 ${
                  idx <= step ? 'text-slate-800 opacity-100 font-medium' : 'text-slate-400 opacity-40'
                }`}
              >
                <span className="mt-0.5">
                  {idx < step ? (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  ) : idx === step ? (
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin inline-block"></span>
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block"></span>
                  )}
                </span>
                <div className="flex-1">
                  <div>{s.text}</div>
                  <div className="text-[10px] text-slate-400">{s.detail}</div>
                </div>
              </div>
            ))}
          </div>

          {step >= 4 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-emerald-800 text-center animate-in fade-in duration-300">
              <div className="font-bold text-[10px] text-emerald-600">=======================================================================</div>
              <div className="text-emerald-700 font-extrabold text-xs">النظام يعمل الان</div>
              <div className="text-emerald-900 underline font-mono text-xs font-bold">http://localhost:3000/</div>
              <div className="font-bold text-[10px] text-emerald-600">=======================================================================</div>
            </div>
          )}
        </div>

        {/* Enter POS button */}
        <button
          onClick={onComplete}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 space-x-reverse cursor-pointer text-sm"
        >
          <Sparkles size={16} />
          <span>الدخول إلى النظام فوراً ({countdown}ث)</span>
        </button>
      </div>
    </div>
  );
}

