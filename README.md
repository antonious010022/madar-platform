# استوديو المعلم — Teacher Studio MVP

Vite + React + Tailwind, مربوط بـ Supabase (Postgres + Auth + Storage) بدلاً من LocalStorage/Demo Data.
نفس الـUI والتصميم والألوان والخطوط المعتمدة سابقًا — لم يتغيّر أي شيء بصريًا.

## 1) التثبيت

```bash
npm install
```

## 2) إعداد Supabase

1. أنشئ مشروعًا جديدًا على [supabase.com](https://supabase.com).
2. من **SQL Editor**، افتح ملف `supabase/schema.sql` في هذا المستودع، انسخ محتواه بالكامل، والصقه، ثم اضغط **Run**.
   هذا ينشئ:
   - جدولي `lessons` و `scenes`
   - سياسات **Row Level Security** (الطالب يرى فقط `Published`، المعلم يرى/يعدّل دروسه هو فقط — الحماية من الباك اند وليست إخفاء أزرار)
   - Storage bucket باسم `lesson-images` (قراءة عامة، كتابة للمعلمين المسجّلين فقط)
3. من **Authentication → Providers**، تأكد أن **Email** مفعّل.
4. من **Project Settings → API**، انسخ:
   - `Project URL`
   - `anon public` key
5. انسخ `.env.example` إلى `.env` واملأ القيمتين:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
```

## 3) إنشاء حساب معلم

أسهل طريقة: شغّل المشروع محليًا وافتح `/teacher`، ثم استخدم زر "إنشاء حساب جديد" في شاشة الدخول.
(بديل: Dashboard → Authentication → Users → Add user).

## 4) التشغيل محليًا

```bash
npm run dev
```

- `/teacher` — مكتبة الدروس واستوديو المعلم (يتطلب تسجيل الدخول)
- `/student` — منصة الطالب (بدون تسجيل دخول، تعرض المنشور فقط)

عند دخول مكتبة فارغة، هناك زر **"استيراد درس تجريبي (للتطوير فقط)"** يستورد درسًا تجريبيًا واحدًا مليئًا
بكل العناصر (Hotwords / Mind Map / Timeline / Questions) حتى تختبر النظام دون كتابة كل شيء يدويًا.
هذه البيانات لا تُحمَّل أبدًا تلقائيًا، وهي غير موجودة في أي مسار إنتاجي.

## 5) البناء للنشر

```bash
npm run build
```

الناتج في `dist/`. انشره على **Vercel** أو **Netlify** مباشرة (المشروع Vite عادي، لم يتحول إلى Next.js):

- **Vercel**: `vercel.json` موجود بالفعل بإعادة توجيه كل المسارات إلى `index.html` (ضروري لعمل React Router على مسارات مثل `/teacher/lesson/xyz`).
- **Netlify**: `public/_redirects` موجود بنفس الغرض.

لا تنسَ إضافة `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` كمتغيرات بيئة في إعدادات النشر (Environment Variables) — نفس القيم من ملف `.env` المحلي.

## البنية المعمارية

```
Teacher Studio  →  Supabase (Postgres + Auth + Storage)  →  Student Platform
```

- **مصدر الحقيقة**: Supabase بالكامل. الـ LocalStorage يُستخدم فقط لحفظ "آخر درس / آخر مشهد" شاهدهما الطالب (بدون حسابات طلاب).
- **Viewer واحد فقط** (`src/components/Viewer.jsx` → `StudentView`) يُستخدم في: المعاينة الحية داخل الاستوديو، وضع التصوير، ومنصة الطالب — بنفس البيانات، والفرق فقط في الصلاحيات (`isTeacherView`) وإظهار ملاحظات المُقدّم.
- **الحفظ التلقائي (Autosave)**: كل تعديل في الاستوديو (عنوان، نص، Hotwords، Mind Map، Timeline، أسئلة) يُحفظ في Supabase بعد Debounce قدره 800ms، مع مؤشر: "جاري الحفظ..." / "تم الحفظ ✓" / "تعذر الحفظ — إعادة المحاولة".
- **الصور**: تُرفع إلى Supabase Storage (bucket: `lesson-images`) وتُخزَّن كروابط عامة — لا Base64 دائم.
- **حماية البيانات**: كل الحماية (من يقرأ، من يكتب) مفروضة عبر Row Level Security في Postgres، وليست فقط إخفاء أزرار في الواجهة.
- **استقلالية الدروس**: نسخ درس (Duplicate) يعيد توليد Id جديد لكل Lesson / Scene / Hotword / Timeline Event / Question / Mind Map Node، فلا يتأثر الأصل بأي تعديل على النسخة.

## هيكل الملفات المهمة

```
src/
  lib/
    supabaseClient.js   — عميل Supabase الوحيد في التطبيق
    db.js                — كل عمليات القراءة/الكتابة (Auth, Lessons, Scenes, Storage)
    demo-data.js          — بيانات تجريبية للتطوير فقط (غير محمّلة تلقائيًا أبدًا)
    constants.js, hooks.js
  components/
    Viewer.jsx            — Pill, ImageUploadField, HotwordRenderer, MindMap Viewer, StudentView, QuestionItem
    Studio.jsx             — RichTextEditor, StudioHotwords, MindMap Builder, Timeline/Question Editors, CreateLessonModal
  pages/
    TeacherLogin.jsx, LessonLibrary.jsx, TeacherStudio.jsx
    StudentPlatform.jsx, StudentLessonPage.jsx
  App.jsx                 — التوجيه (/teacher, /teacher/lesson/:id, /student, /student/lesson/:id)
supabase/
  schema.sql              — نفّذه مرة واحدة في SQL Editor
```

## خارج نطاق هذا الـMVP (كما طُلب)

بدون Payments، بدون حسابات طلاب، بدون AI، بدون مدارس متعددة، بدون Microservices.
