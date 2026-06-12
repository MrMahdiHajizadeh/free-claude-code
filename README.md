# free-claude-code / کلاد کد رایگان

استفاده از ابزارهای **Claude Code CLI**، افزونه **VS Code**، افزونه **JetBrains ACP** یا ربات‌های چت با پروکسی شخصی‌سازی‌شده و سازگار با آنتروپیک (Anthropic).

> **منبع اصلی:** این پروژه بر پایه مخزن اصلی [Alishahryar1/free-claude-code](https://github.com/Alishahryar1/free-claude-code) توسعه داده شده است.

---

## 🚀 قابلیت‌های جدید اضافه شده در این نسخه (Modified Version)

تغییرات، قابلیت‌ها و بهینه‌سازی‌های زیر نسبت به نسخه اصلی اضافه شده است:

1. **چرخش خودکار کلیدهای API (OpenRouter Key Rotation):** 
   امکان وارد کردن چندین کلید API برای OpenRouter به صورت جدا شده با ویرگول (`,`). پروکسی به صورت خودکار درخواست‌ها را به صورت چرخشی بین کلیدها توزیع می‌کند.
2. **تاب‌آوری خطا و بازیابی خودکار (Rate-Limit Failover):**
   در صورت مواجهه با محدودیت نرخ (Rate Limit - خطای 429)، اتمام سهمیه (خطای 402) یا خطاهای دسترسی (401/403)، سرور پروکسی به طور خودکار درخواست جاری را با استفاده از کلید بعدی موجود در لیست مجدداً ارسال می‌کند تا کارهای شما بدون وقفه ادامه یابد.
3. **صفحه اختصاصی داشبورد "Model Hub" (پنل مدیریت وب):**
   اضافه شدن یک تب جدید و کاملاً اختصاصی در منوی پنل وب (`/admin`) برای مدیریت آسان‌تر مدل‌ها. این بخش شامل لیست مدل‌های محبوب و رایگان به همراه فیلترهای جستجوی آنی و دکمه‌های مجزا جهت انتساب مستقیم به مدل پیش‌فرض یا مدل‌های لایه Opus، Sonnet و Haiku می‌باشد.
4. **ابزار ترمینال تعاملی `fcc-select`:**
   اضافه شدن یک ابزار جدید خط فرمان که به شما اجازه می‌دهد در هر زمان مدل فعال خود را به طور تعاملی مستقیماً از داخل محیط ترمینال و بدون نیاز به باز کردن مرورگر وب تغییر دهید.
5. **رفع مشکل ارتباطات لوکال (Local Proxy Bypass Fix):**
   تعدیل متغیرهای محیطی پروکسی محلی به گونه‌ای که آدرس‌های لوپ‌بک (`localhost` و `127.0.0.1`) را دور بزند (`NO_PROXY`). این کار مشکل قطع ارتباط و Timeout در کلاینت‌های متصل به پروکسی به دلیل تداخل با VPNهای سیستمی را به کلی برطرف می‌کند.

---

## 🌟 قابلیت‌های کلی و اصلی سیستم

- **پروکسی آماده برای Claude Code:** هدایت خودکار تمام فراخوانی‌های API آنتروپیک به ارائه‌دهندگان دیگر.
- **پشتیبانی از ۱۷ ارائه‌دهنده (Provider):** 
  اتصال آسان به NVIDIA NIM، OpenRouter، Google AI Studio (Gemini)، DeepSeek، Mistral، Codestral، OpenCode Zen، OpenCode Go، Wafer، Kimi، Cerebras، Groq، Fireworks AI، Z.ai، LM Studio، llama.cpp و Ollama.
- **مسیریابی بر اساس سطح مدل:** هدایت ترافیک مربوط به مدل‌های Opus، Sonnet و Haiku یا مدل‌های پیش‌فرض به ارائه‌دهندگان مختلف.
- **رابط کاربری پیشرفته وب (Admin UI):** مدیریت تمام تنظیمات، بررسی وضعیت ارائه‌دهندگان و اعمال تغییرات به صورت زنده در آدرس `/admin` (دسترسی فقط به صورت محلی).
- **پشتیبانی کامل از قابلیت‌های پیشرفته:** کارکرد بدون نقص استریمینگ (Streaming)، استفاده از ابزارها (Tool use)، بخش‌های تفکر (Thinking/Reasoning blocks) و بهینه‌سازی کدهای محلی.
- **قابلیت‌های اختیاری:** اتصال ربات‌های تلگرام یا دیسکورد جهت کدنویسی از راه دور و تبدیل صدا به متن (Voice Notes) با Whisper محلی یا NVIDIA NIM.

---

## 🚀 شروع سریع

### ۱. نصب یا به‌روزرسانی پروکسی

**سیستم‌های لینوکس و مک (macOS/Linux):**
```bash
curl -fsSL "https://github.com/Alishahryar1/free-claude-code/blob/main/scripts/install.sh?raw=1" | sh
```

**پاورشل ویندوز (Windows PowerShell):**
```powershell
irm "https://github.com/Alishahryar1/free-claude-code/blob/main/scripts/install.ps1?raw=1" | iex
```

### ۲. اجرای سرور پروکسی

برای راه‌اندازی سرور پروکسی در پس‌زمینه، دستور زیر را اجرا کنید:
```bash
fcc-server
```
پس از اجرا، سرور آدرس پنل وب ادمین را در ترمینال نمایش می‌دهد:
```text
INFO:     Admin UI: http://127.0.0.1:8082/admin (local-only)
```

### ۳. پیکربندی کلیدها و مدل‌ها

۱. آدرس پنل مدیریت وب را باز کنید: [http://127.0.0.1:8082/admin](http://127.0.0.1:8082/admin)
۲. به تب **Model Hub** یا **Providers** رفته و کلیدهای API ارائه‌دهنده‌های مورد نظر خود را وارد کنید.
۳. در بخش **Model Hub**، مدل انتخابی خود را (مانند مدل‌های رایگان یا کدنویسی قوی مثل Llama 3.3 یا Qwen3 Coder) انتخاب کرده و به بخش مورد نظر انتساب دهید.
۴. در پایین صفحه دکمه **Apply** را بزنید تا تنظیمات بلافاصله ذخیره و اعمال شوند.

### ۴. تغییر مدل از طریق ترمینال (جایگزین)

شما می‌توانید بدون باز کردن مرورگر، در ترمینال دستور زیر را اجرا کنید تا به صورت تعاملی مدل خود را تغییر دهید:
```bash
fcc-select
```

### ۵. اجرای Claude Code

برای شروع کار با Claude Code از طریق پروکسی، دستور زیر را اجرا کنید:
```bash
fcc-claude
```
پروکسی به طور خودکار تمام متغیرهای محیطی کلاینت را تنظیم کرده و Claude Code اصلی را با پروکسی بومی پیوند می‌دهد.

---

## 🛠️ اتصال به کلاینت‌های مختلف

### ۱. VS Code
در تنظیمات VS Code، عبارت `claude-code.environmentVariables` را جستجو کرده و با ویرایش `settings.json` موارد زیر را اضافه کنید:
```json
"claudeCode.environmentVariables": [
  { "name": "ANTHROPIC_BASE_URL", "value": "http://localhost:8082" },
  { "name": "ANTHROPIC_AUTH_TOKEN", "value": "freecc" },
  { "name": "CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY", "value": "1" },
  { "name": "CLAUDE_CODE_AUTO_COMPACT_WINDOW", "value": "190000" }
]
```

### ۲. JetBrains ACP
فایل پیکربندی Claude ACP را ویرایش کنید:
- **ویندوز:** `C:\Users\%USERNAME%\AppData\Roaming\JetBrains\acp-agents\installed.json`
- **لینوکس/مک:** `~/.jetbrains/acp.json`

بخش متغیرهای محیطی `env` را در زیر کلید `acp.registry.claude-acp` به‌روزرسانی کنید:
```json
"env": {
  "ANTHROPIC_BASE_URL": "http://localhost:8082",
  "ANTHROPIC_AUTH_TOKEN": "freecc",
  "CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY": "1",
  "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "190000"
}
```
پس از اعمال تغییرات، محیط توسعه (IDE) خود را مجدداً راه‌اندازی کنید.

---

## 📝 مجوز (License)
این پروژه تحت مجوز **MIT** منتشر شده است. برای کسب اطلاعات بیشتر فایل [LICENSE](LICENSE) را مطالعه فرمایید.
