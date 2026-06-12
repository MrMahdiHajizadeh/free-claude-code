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
curl -fsSL "https://github.com/MrMahdiHajizadeh/free-claude-code/blob/main/scripts/install.sh?raw=1" | sh
```

**پاورشل ویندوز (Windows PowerShell):**
```powershell
irm "https://github.com/MrMahdiHajizadeh/free-claude-code/blob/main/scripts/install.ps1?raw=1" | iex
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


---

## 📝 مجوز (License)
این پروژه تحت مجوز **MIT** منتشر شده است. برای کسب اطلاعات بیشتر فایل [LICENSE](LICENSE) را مطالعه فرمایید.

---

## 🔌 ادغام‌های اختیاری (Optional Integrations)

برای هرکدام از ادغام‌های زیر، تنظیمات پروکسی مدیریت‌شده را **فقط** از طریق **پنل مدیریت وب (Admin UI)** در آدرس `/admin` تغییر دهید: فیلدها را ویرایش کرده، روی **Validate** و سپس **Apply** کلیک کنید. در فوتر پنل نشان داده می‌شود که تنظیمات در کجا ذخیره شده‌اند؛ نیازی به ویرایش دستی فایل پیکربندی نیست.

### ۱. ربات‌های دیسکورد و تلگرام (Discord & Telegram Bots)

این پوسته‌های ربات به شما امکان می‌دهند نشست‌های Claude Code را از راه دور اجرا کنید، پیشرفت کار را استریم کنید، از شاخه‌های مکالمه بر اساس پاسخ (Reply) پشتیبانی کنید و وظایف را متوقف یا پاک کنید.

**ربات دیسکورد (Discord):**
1. یک ربات در [Discord Developer Portal](https://discord.com/developers/applications) بسازید.
2. گزینه **Message Content Intent** را فعال کنید.
3. ربات را با مجوزهای خواندن، ارسال پیام و تاریخچه پیام‌ها به سرور خود دعوت کنید.
4. توکن ربات و شناسه عددی کانال (یا کانال‌های) مجاز را کپی کنید.

**ربات تلگرام (Telegram):**
1. یک ربات با [@BotFather](https://t.me/BotFather) بسازید و توکن آن را کپی کنید.
2. شناسه عددی کاربری خود را از [@userinfobot](https://t.me/userinfobot) دریافت کنید تا فقط خودتان بتوانید از ربات استفاده کنید.

**پیکربندی در پنل مدیریت وب:**
1. در حالی که `fcc-server` در حال اجراست، پنل مدیریت را باز کنید.
2. در منوی کناری، بخش **Messaging** را انتخاب کنید.
3. گزینه **Messaging Platform** را روی **discord** یا **telegram** تنظیم کنید.
4. برای دیسکورد، توکن ربات و کانال‌های مجاز را وارد کنید. برای تلگرام، توکن ربات و آیدی عددی کاربر مجاز را وارد کنید.
5. بخش **Allowed Directory** را به یک مسیر مطلق در سیستمی که پروکسی روی آن در حال اجراست (ریشه محیط کاری که ربات مجاز به استفاده است) تغییر دهید.
6. روی **Validate** و سپس **Apply** کلیک کنید. در صورت نیاز سرور پروکسی را مجدداً راه‌اندازی کنید.

دستورات مفید ربات:
- `/stop` لغو یک کار فعال؛ برای متوقف کردن یک شاخه خاص به پیام همان شاخه ریپلای کنید.
- `/clear` بازنشانی نشست‌ها؛ برای پاک کردن یک شاخه خاص به آن ریپلای کنید.
- `/stats` نمایش وضعیت نشست‌های فعال.

### ۲. یادداشت‌های صوتی (Voice Notes)

پس از نصب پکیج‌های پیش‌نیاز صوتی، یادداشت‌های صوتی در تلگرام و دیسکورد فعال می‌شوند.

**سیستم‌های مک و لینوکس (macOS/Linux):**
```bash
# استخراج متن با NVIDIA NIM (Riva gRPC)
curl -fsSL "https://github.com/MrMahdiHajizadeh/free-claude-code/blob/main/scripts/install.sh?raw=1" | sh -s -- --voice-nim

# استخراج متن با Whisper محلی (سی‌پی‌یو یا کارت گرافیک انویدیا)
curl -fsSL "https://github.com/MrMahdiHajizadeh/free-claude-code/blob/main/scripts/install.sh?raw=1" | sh -s -- --voice-local

# نصب هر دو موتور صوتی
curl -fsSL "https://github.com/MrMahdiHajizadeh/free-claude-code/blob/main/scripts/install.sh?raw=1" | sh -s -- --voice-all

# اجرای Whisper محلی با شتاب‌دهنده گرافیکی CUDA
curl -fsSL "https://github.com/MrMahdiHajizadeh/free-claude-code/blob/main/scripts/install.sh?raw=1" | sh -s -- --voice-local --torch-backend cu130
```

**پاورشل ویندوز (Windows PowerShell):**
```powershell
# استخراج متن با NVIDIA NIM (Riva gRPC)
& ([scriptblock]::Create((irm "https://github.com/MrMahdiHajizadeh/free-claude-code/blob/main/scripts/install.ps1?raw=1"))) -VoiceNim

# استخراج متن با Whisper محلی
& ([scriptblock]::Create((irm "https://github.com/MrMahdiHajizadeh/free-claude-code/blob/main/scripts/install.ps1?raw=1"))) -VoiceLocal

# نصب هر دو موتور صوتی
& ([scriptblock]::Create((irm "https://github.com/MrMahdiHajizadeh/free-claude-code/blob/main/scripts/install.ps1?raw=1"))) -VoiceAll

# اجرای Whisper محلی با شتاب‌دهنده گرافیکی CUDA
& ([scriptblock]::Create((irm "https://github.com/MrMahdiHajizadeh/free-claude-code/blob/main/scripts/install.ps1?raw=1"))) -VoiceLocal -TorchBackend cu130
```
پس از نصب، سرور `fcc-server` را مجدداً راه‌اندازی کنید.

در **Admin UI** به بخش **Messaging** رفته و تنظیمات **Voice** را باز کنید. گزینه **Voice Notes** را فعال کنید، نوع سخت‌افزار (`cpu` ،`cuda` یا `nvidia_nim`) را انتخاب کرده، مدل Whisper را تعیین کنید و در صورت نیاز توکن Hugging Face را وارد نمایید.

---

## ⚙️ معماری و نحوه کارکرد سیستم (How It Works)

بخش‌های مهم پروژه:
- فریم‌ورک FastAPI مسیرهای سازگار با آنتروپیک مانند `/v1/messages` ،`/v1/messages/count_tokens` و `/v1/models` را در دسترس قرار می‌دهد.
- بخش مسیریاب، مدل‌های کلود را به متغیرهای داخلی `MODEL_OPUS`، `MODEL_SONNET`، `MODEL_HAIKU` یا `MODEL` نقشه می‌کند.
- ارائه‌دهنده‌های NIM، OpenCode Zen و OpenCode Go از استریمینگ چت OpenAI استفاده کرده و آن را به پروتکل SSE آنتروپیک ترجمه می‌کنند.
- سرویس‌های Wafer، OpenRouter، DeepSeek، Kimi، Fireworks AI، Z.ai، LM Studio، llama.cpp و Ollama از پروتکل بومی پیام‌های آنتروپیک استفاده می‌کنند.
- پروکسی بخش‌های مربوط به تفکر (Thinking blocks)، فراخوانی ابزارها (Tool calls)، متادیتای مصرف توکن و خطاهای ارائه‌دهنده را به ساختار استاندارد مورد انتظار Claude Code تبدیل می‌کند.
- بهینه‌سازهای درخواست، بررسی‌های اولیه کلاینت Claude Code را به طور محلی پاسخ می‌دهند تا در تاخیر و سهمیه مصرف صرفه‌جویی شود.

---

## 💻 توسعه و مشارکت (Development)

### ۱. ساختار پروژه
```text
free-claude-code/
├── server.py              # نقطه ورود و راه‌اندازی ASGI
├── api/                   # مسیرهای FastAPI، لایه سرویس، مسیریابی و بهینه‌سازی‌ها
├── core/                  # توابع کمکی پروتکل آنتروپیک و ابزارهای SSE
├── providers/             # انتقال داده به ارائه‌دهنده‌ها، رجیستری و محدودیت‌های نرخ مصرف
├── messaging/             # آداپتورهای دیسکورد/تلگرام، نشست‌ها و پردازش صوت
├── cli/                   # نقاط ورود پکیج و مدیریت فرآیندهای ابزار کلاینت کلود
├── config/                # تنظیمات، کاتالوگ ارائه‌دهنده‌ها و لاگ‌ها
└── tests/                 # تست‌های واحد و قراردادی
```

### ۲. اجرای پروژه از روی سورس کد
اگر می‌خواهید مستقیماً روی سورس کد کار کنید یا آن را توسعه دهید:
```bash
git clone https://github.com/MrMahdiHajizadeh/free-claude-code.git
cd free-claude-code
uv run uvicorn server:app --host 0.0.0.0 --port 8082
```

### ۳. دستورات تست و فرمت کدها
کدها را قبل از ارسال به مخزن بررسی کنید:
```bash
uv run ruff format
uv run ruff check
uv run ty check
uv run pytest
```

### ۴. اسکریپت‌های پکیج
فایل `pyproject.toml` ابزارهای زیر را نصب می‌کند:
- `fcc-server`: راه‌اندازی پروکسی با پورت و هاست مشخص شده.
- `fcc-init`: ساخت فایل ساختار پیکربندی پیشرفته در مسیر `~/.fcc/.env`.
- `fcc-claude`: اجرای کلاینت Claude Code با کانفیگ متغیرهای محیطی پروکسی محلی.
- `free-claude-code`: نام مستعار کمکی برای اجرای `fcc-server`.

### ۵. افزودن ارائه‌دهنده‌های جدید
- با ارث‌بری از کلاس `OpenAIChatTransport` می‌توانید ارائه‌دهنده‌های سازگار با ساختار OpenAI را اضافه کنید.
- با ارث‌بری از کلاس `AnthropicMessagesTransport` می‌توانید ارائه‌دهنده‌های مبتنی بر پیام‌های آنتروپیک را توسعه دهید.
- متادیتای ارائه‌دهنده را در `config.provider_catalog` و سیم‌کشی کارخانه را در `providers.registry` ثبت کنید.

---

## 🤝 مشارکت در پروژه (Contributing)
- فایل `.env.example` صرفاً یک مرجع برای توسعه‌دهندگان جهت مشاهده متغیرهای محیطی است؛ برای تغییرات تنظیمات همیشه از **Admin UI** استفاده کنید.
- با اجرای بررسی‌های فرمت و تست بالا، کدهای خود را قبل از باز کردن Pull Request ارزیابی کنید.
- ساختار سینتکس قدیمی `except X, Y` در پایتون ۳.۱۴ نسخه نهایی مجدداً اضافه شده است؛ لطفاً در توسعه این نکته را مد نظر داشته باشید.

