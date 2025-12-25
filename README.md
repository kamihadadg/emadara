# پورتال شرکت - نظرسنجی ناشناس

یک برنامه کامل نظرسنجی ناشناس ساخته شده با Next.js و NestJS و MSSQL.

## ویژگی‌ها

- ✅ نظرسنجی ناشناس (بدون نیاز به ورود کاربر)
- ✅ انواع مختلف سوال: متن، رادیو، چک‌باکس، انتخاب
- ✅ نمایش نتایج به صورت نمودار و آمار
- ✅ طراحی responsive و کاربرپسند
- ✅ پشتیبانی از زبان فارسی (RTL)
- ✅ API کامل RESTful

## تکنولوژی‌ها

### Backend
- **NestJS** - فریمورک Node.js
- **TypeORM** - ORM برای دیتابیس
- **MSSQL** - دیتابیس
- **TypeScript** - زبان برنامه‌نویسی

### Frontend
- **Next.js** - فریمورک React
- **TypeScript** - زبان برنامه‌نویسی
- **Tailwind CSS** - فریمورک CSS

## پیش‌نیازها

- Node.js (نسخه 18 یا بالاتر)
- MSSQL Server
- npm یا yarn

## نصب و راه‌اندازی

### 1. کلون کردن پروژه

```bash
git clone <repository-url>
cd emadara
```

### 2. راه‌اندازی Backend

```bash
cd backend
npm install
```

### 3. تنظیمات دیتابیس

MSSQL Server خود را راه‌اندازی کنید و سپس فایل `.env` را در پوشه backend ایجاد کنید:

```env
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=your_password
DB_NAME=company_portal
PORT=3001
```

### 4. اجرای Backend

```bash
# اجرای migration و ایجاد جداول
npm run start:dev

# در ترمینال دیگری، ایجاد داده‌های نمونه
npm run seed
```

### 5. راه‌اندازی Frontend

```bash
cd ../frontend
npm install
npm run dev
```

### 6. دسترسی به برنامه

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## API Endpoints

### نظرسنجی‌ها

- `GET /surveys/active` - دریافت لیست نظرسنجی‌های فعال
- `GET /surveys/:id` - دریافت یک نظرسنجی خاص
- `POST /surveys/:id/submit` - ارسال پاسخ به نظرسنجی
- `GET /surveys/:id/results` - دریافت نتایج نظرسنجی

## ساختار پروژه

```
emadara/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── survey/         # ماژول نظرسنجی
│   │   │   ├── entities/   # موجودیت‌های دیتابیس
│   │   │   ├── dto/        # Data Transfer Objects
│   │   │   └── survey.service.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
├── frontend/                # Next.js App
│   ├── src/
│   │   ├── app/            # App Router
│   │   ├── components/     # کامپوننت‌ها
│   │   └── types/          # تایپ‌های TypeScript
│   └── package.json
└── README.md
```

## استفاده از برنامه

1. **مشاهده نظرسنجی‌ها**: در صفحه اصلی لیست نظرسنجی‌های فعال نمایش داده می‌شود
2. **شرکت در نظرسنجی**: روی دکمه "شرکت در نظرسنجی" کلیک کنید
3. **ارسال پاسخ**: فرم را پر کرده و ارسال کنید
4. **مشاهده نتایج**: از طریق دکمه "مشاهده نتایج" می‌توانید نتایج را ببینید

## توسعه

### اضافه کردن سوال جدید

برای اضافه کردن انواع سوالات جدید:

1. Enum `QuestionType` را در `question.entity.ts` بروزرسانی کنید
2. منطق رندر را در `SurveyForm.tsx` اضافه کنید
3. منطق نمایش نتایج را در `SurveyResults.tsx` بروزرسانی کنید

### تنظیمات CORS

اگر frontend روی پورت متفاوتی اجرا می‌شود، تنظیمات CORS را در `main.ts` بروزرسانی کنید.

## لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.
