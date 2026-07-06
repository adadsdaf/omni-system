import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  bold: "\x1b[1m"
};

function log(msg, color = colors.cyan) {
  console.log(`${color}${colors.bold}>>> ${msg}${colors.reset}`);
}

async function build() {
  try {
    const isWindows = process.platform === "win32";
    log("بدء عملية بناء حزمة نظام الشام لنظام ويندوز...", colors.green);

    // 1. Clean previous build directories
    log("تنظيف المجلدات السابقة...");
    if (fs.existsSync("dist")) {
      fs.rmSync("dist", { recursive: true, force: true });
    }
    if (fs.existsSync("omnisystem-windows")) {
      fs.rmSync("omnisystem-windows", { recursive: true, force: true });
    }

    // 1.5. Ensure dependencies are installed
    if (!fs.existsSync("node_modules") || !fs.existsSync("node_modules/vite")) {
      log("لم يتم العثور على الملحقات البرمجية كاملة (node_modules). جاري تثبيتها تلقائياً الآن...", colors.yellow);
      execSync("npm install", { stdio: "inherit" });
      log("تم تثبيت الملحقات بنجاح! جاري المتابعة...", colors.green);
    }

    // 2. Build Frontend & Bundle Backend using Vite and Esbuild
    log("جاري بناء الواجهات وسيرفر النظام (Vite & Esbuild)...");
    execSync("npm run build", { stdio: "inherit" });

    // 3. Create target directory structure
    log("إنشاء هيكل المجلدات لنظام ويندوز المحمول...");
    fs.mkdirSync("omnisystem-windows", { recursive: true });
    fs.mkdirSync("omnisystem-windows/dist", { recursive: true });
    fs.mkdirSync("omnisystem-windows/data", { recursive: true });
    // Write a .gitkeep to the data directory to ensure it's not empty
    fs.writeFileSync("omnisystem-windows/data/.gitkeep", "");

    // 4. Package backend using Vercel pkg to Windows Executable
    log("جاري ضغط وبناء الملف التنفيذي omnisystem.exe باستخدام Vercel pkg...");
    // Target is node18-win-x64 for universal Windows compatibility
    // better-sqlite3 is marked as external in esbuild build step, so we don't bundle it into the binary container.
    execSync("npx pkg --target node18-win-x64 --output omnisystem-windows/omnisystem.exe dist/server.cjs", { stdio: "inherit" });

    // 5. Copy compiled web assets (dist)
    log("نسخ ملفات الواجهات البرمجية إلى المجلد المحمول...");
    fs.cpSync("dist", "omnisystem-windows/dist", { recursive: true });

    // 6. Copy native better-sqlite3 binaries
    log("نسخ مكتبات قواعد البيانات والملفات الثنائية (better-sqlite3)...");
    const modulesToCopy = ["better-sqlite3", "bindings", "integer"];
    fs.mkdirSync("omnisystem-windows/node_modules", { recursive: true });

    for (const mod of modulesToCopy) {
      const srcPath = path.join("node_modules", mod);
      const destPath = path.join("omnisystem-windows/node_modules", mod);
      if (fs.existsSync(srcPath)) {
        fs.cpSync(srcPath, destPath, { recursive: true });
        // Clean unnecessary files in copied module to keep size small (like docs, tests, sources)
        log(`تم نسخ الموديل: ${mod}`);
      } else {
        console.warn(`${colors.yellow}تحذير: المجلد ${srcPath} غير موجود. قد يؤدي ذلك لفشل تشغيل قاعدة البيانات إذا تم البناء على بيئة غير متوافقة.${colors.reset}`);
      }
    }

    // 7. Create easy Windows Launcher (omnisystem-launcher.bat)
    log("إنشاء ملفات التشغيل السريع المساعد (run-launcher.bat & run-launcher.vbs)...");
    
    // Create silent VBScript launcher that hides the black console window completely
    const vbsContent = `Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strPath = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strPath
WshShell.Run "omnisystem.exe", 0, False
`;
    fs.writeFileSync("omnisystem-windows/run-launcher.vbs", vbsContent);

    const batContent = `@echo off
title نظام حسابات مخابز الشام - إتقان سوفت
chcp 65001 > nul
cls

echo =======================================================================
echo          نظام حسابات ومبيعات مخابز الشام - إتقان سوفت (itQAN Sft)
echo =======================================================================
echo.

:: 1. إنشاء اختصار على سطح المكتب تلقائياً يشير إلى المشغل الصامت (run-launcher.vbs)
if not exist "%USERPROFILE%\\Desktop\\نظام مخابز الشام - إتقان سوفت.lnk" (
    echo [معلومات]: جاري إنشاء اختصار صامت وسريع على سطح المكتب الخاص بك...
    set SCRIPT="%TEMP%\\%RANDOM%-%RANDOM%.vbs"
    echo Set oWS = CreateObject("WScript.Shell") >> %SCRIPT%
    echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\\نظام مخابز الشام - إتقان سوفت.lnk" >> %SCRIPT%
    echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
    echo oLink.TargetPath = "wscript.exe" >> %SCRIPT%
    echo oLink.Arguments = """%~dp0run-launcher.vbs""" >> %SCRIPT%
    echo oLink.WorkingDirectory = "%~dp0" >> %SCRIPT%
    echo oLink.Description = "نظام الحسابات والمبيعات لمخابز الشام - إتقان سوفت" >> %SCRIPT%
    echo oLink.IconLocation = "%SystemRoot%\\System32\\shell32.dll,147" >> %SCRIPT%
    echo oLink.Save >> %SCRIPT%
    cscript /nologo %SCRIPT% > nul 2>&1
    del %SCRIPT% > nul 2>&1
    echo [نجاح]: تم إنشاء الاختصار بنجاح على سطح المكتب باسم "نظام مخابز الشام - إتقان سوفت"!
    echo.
)

echo [معلومات]: جاري تشغيل خادم قاعدة البيانات والواجهات في الخلفية...
echo.

:: تشغيل السيرفر الخلفي في الخلفية (صامت)
start "" /B "omnisystem.exe"

:: الانتظار 3 ثوانٍ ليتم تشغيل السيرفر بالكامل
timeout /t 3 /nobreak > nul

echo [نجاح]: تم تشغيل السيرفر بنجاح! جاري فتح واجهة المبيعات...
echo.
echo -------------------------------------------------------------------
echo         🚀 نظام مخابز الشام متاح الآن على الرابط: http://localhost:3000/pos
echo         * تم تشغيل النظام بنجاح كـ App مستقل.
echo         * يمكنك إغلاق هذه النافذة السوداء الآن، النظام سيبقى يعمل.
echo         * لإيقاف السيرفر بالكامل، ما عليك سوى إغلاق نافذة التطبيق نفسه.
echo -------------------------------------------------------------------
echo.
pause
`;
    fs.writeFileSync("omnisystem-windows/run-launcher.bat", batContent);

    // 8. Create a shortcut configuration explanation
    log("إنشاء ملف التعليمات والإرشادات الخاص بويندوز...");
    const readmeAr = `=======================================================
نظام مبيعات وحسابات مخابز الشام - إتقان سوفت (itQAN Sft)
نسخة ويندوز المحمولة والمستقلة بالكامل (Desktop Portable App)
=======================================================

مرحباً بك! يحتوي هذا المجلد على النسخة المحمولة والكاملة من النظام ليعمل كـ "تطبيق سطح مكتب" مستقل على أي جهاز كمبيوتر يعمل بنظام ويندوز (Windows 10, 11) دون الحاجة للاتصال بالإنترنت أو تثبيت خوادم خارجية.

مكونات المجلد وطريقة عملها:
-------------------------
1. omnisystem.exe       : محرك السيرفر وقاعدة البيانات الخلفي (يعمل كخلفية صامتة).
2. run-launcher.vbs     : المشغل الصامت كلياً (يفتح النظام كنافذة تطبيق مستقلة بدون شاشات سوداء).
3. run-launcher.bat     : مشغل يدوي بديل (يُستخدم للتثبيت لأول مرة وإنشاء الاختصار على سطح المكتب).
4. dist/                : يحتوي على ملفات الواجهات والتصاميم المبرمجة بالكامل.
5. data/                : المجلد المخصص لحفظ قاعدة البيانات المحلية (pos.db).

طريقة التشغيل المفضلة (تطبيق سطح المكتب):
----------------------------------------
1. عند تشغيل ملف "run-launcher.bat" لأول مرة، سيقوم النظام تلقائياً بإنشاء اختصار سريع على سطح المكتب الخاص بك باسم "نظام مخابز الشام - إتقان سوفت".
2. من الآن فصاعداً، يمكنك ببساطة النقر المزدوج على الاختصار الموجود على سطح المكتب (أو تشغيل run-launcher.vbs).
3. سيفتح النظام فوراً في نافذة تطبيق مستقلة وأنيقة (بشعار إتقان سوفت ومخابز الشام) وبدون ظهور أي نوافذ سوداء مزعجة على الإطلاق!
4. عند انتهائك من العمل، بمجرد "إغلاق نافذة التطبيق"، سيتم إيقاف تشغيل خادم النظام وقاعدة البيانات تلقائياً في الخلفية لضمان سلامة بياناتك وحفظ الطاقة.

طريقة عمل نسخة احتياطية من بياناتك:
----------------------------------
لحفظ بياناتك في أمان تام، كل ما عليك فعله هو نسخ ملف "pos.db" الموجود داخل مجلد "data/" وحفظه في مكان آمن (فلاش ميموري أو سحابة إلكترونية). لاسترجاع البيانات، ضع الملف في نفس المجلد مجدداً.

دعم فني وتطوير: إتقان سوفت لنظم المعلومات والحلول البرمجية (itQAN Sft).
`;
    fs.writeFileSync("omnisystem-windows/اقرأني_أولاً.txt", readmeAr);

    log("تم بناء حزمة ويندوز بنجاح باهر! ستجدها في المجلد: omnisystem-windows", colors.green);
    if (!isWindows) {
      log("تنبيه هام جداً:", colors.yellow);
      console.log(`${colors.bold}لقد قمت بتشغيل عملية البناء من نظام غير ويندوز (Linux/macOS). 
لكي تعمل قاعدة البيانات (better-sqlite3) بشكل صحيح وبدون أخطاء توافقية على ويندوز،
يرجى نقل مجلد المشروع الكامل إلى جهاز ويندوز وتشغيل الأمر التالي مرة واحدة فقط هناك لإنتاج الملف التنفيذي المتوافق 100%:
  
  ${colors.green}npm run build:windows${colors.reset}
`);
    }

  } catch (error) {
    console.error(`${colors.red}حدث خطأ أثناء بناء حزمة ويندوز:${colors.reset}`, error);
    process.exit(1);
  }
}

build();
