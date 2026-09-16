import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col dir-rtl text-right" style={{ background: "#FAF6ED" }}>
      <div className="max-w-2xl mx-auto w-full px-5 py-10 flex-1">
        <Link to="/student" className="text-xs font-bold mb-6 inline-block" style={{ color: "#10665A" }}>
          ← العودة للمنصة
        </Link>

        <h1 className="font-black text-2xl mb-2" style={{ color: "#10665A" }}>سياسة الخصوصية</h1>
        <p className="text-sm mb-8 leading-7" style={{ color: "#8A8570" }}>
          نوضح هنا ببساطة كيف تتعامل مَدَار مع بياناتك في المرحلة الحالية من المنصة.
        </p>

        <div className="space-y-7 text-sm leading-7" style={{ color: "#5C5A4A" }}>
          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "#22291F" }}>ما البيانات التي نتعامل معها؟</h2>
            <p className="mb-2">حاليًا تقتصر البيانات على ما يلزم لتشغيل الحساب وعرض المحتوى:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>
                <strong style={{ color: "#22291F" }}>بيانات الحساب:</strong> عند تسجيل الدخول عبر Google أو البريد الإلكتروني،
                نستقبل المعلومات الأساسية التي يوفّرها نظام المصادقة (مثل البريد الإلكتروني وبعض بيانات الحساب الظاهرة).
              </li>
              <li>
                <strong style={{ color: "#22291F" }}>تقدّم التعلّم على جهازك:</strong> قد يُحفظ في متصفحك موضع آخر مشهد وصلت إليه،
                حتى يسهل عليك استكمال الدرس لاحقًا من نفس الجهاز.
              </li>
              <li>
                <strong style={{ color: "#22291F" }}>محتوى الدروس:</strong> الدروس المعروضة تُدار وتُنشر من مَدَار لعرضها للطلاب.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "#22291F" }}>أين تُحفظ البيانات؟</h2>
            <p>
              المصادقة والبيانات السحابية تعتمد على البنية الحالية للمنصة عبر <strong>Supabase</strong>.
              أما تقدّم التعلّم المحلي فيبقى على جهازك داخل المتصفح، ولا يُرفع تلقائيًا كسجل منفصل عن ذلك.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "#22291F" }}>لماذا نستخدم هذه البيانات؟</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>لتشغيل حسابك وإبقائك مسجّل الدخول عند الحاجة.</li>
              <li>لعرض الدروس والمحتوى التعليمي المناسب.</li>
              <li>لتسهيل متابعة التعلّم من حيث توقفت، عندما يكون التقدّم محفوظًا محليًا.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "#22291F" }}>الإعلانات وبيع البيانات</h2>
            <p className="mb-2">
              مَدَار مصمّمة كتجربة تعليمية نظيفة. في المرحلة الحالية:
            </p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>لا نعرض إعلانات داخل صفحات الدروس أو لوحة الطالب أو تجربة التعلّم.</li>
              <li>لا نبيع بيانات المستخدمين لأطراف ثالثة لأغراض إعلانية.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "#22291F" }}>حماية الحساب</h2>
            <p>
              نعتمد على نظام مصادقة موثوق (Supabase Auth) مع تسجيل الدخول عبر Google أو البريد،
              ونتخذ الإجراءات المناسبة لحماية الحسابات ضمن إمكانيات المنصة الحالية.
              ننصحك بعدم مشاركة بيانات الدخول مع الآخرين، واستخدام حسابك بشكل شخصي.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "#22291F" }}>ما الذي يمكنك فعله؟</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>تسجيل الخروج في أي وقت من المنصة.</li>
              <li>مسح بيانات التقدّم المحلي من إعدادات المتصفح (بيانات الموقع) إن رغبت.</li>
              <li>التواصل معنا عبر البريد الظاهر في تذييل المنصة لأي استفسار يخص حسابك أو بياناتك.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "#22291F" }}>تحديث هذه الصفحة</h2>
            <p>
              مع تطوّر مَدَار قد نحدّث هذه السياسة لتعكس أي تغيير حقيقي في طريقة عمل المنصة.
              سنحرص على الإبقاء على الصياغة واضحة وصادقة مع الواقع الفعلي.
            </p>
          </section>

          <p className="text-xs pt-2" style={{ color: "#8A8570" }}>
            آخر تحديث: 2026 · مَدَار — منصة تعليمية للمرحلة الإعدادية
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
