import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col dir-rtl text-right" style={{ background: "#FAF6ED" }}>
      <div className="max-w-2xl mx-auto w-full px-5 py-10 flex-1">
        <Link to="/student" className="text-xs font-bold mb-6 inline-block" style={{ color: "#10665A" }}>
          ← العودة للمنصة
        </Link>

        <h1 className="font-black text-2xl mb-2" style={{ color: "#10665A" }}>الشروط والأحكام</h1>
        <p className="text-sm mb-8 leading-7" style={{ color: "#8A8570" }}>
          هذه بنود بسيطة توضّح طبيعة مَدَار وكيف تُستخدم المنصة في مرحلتها الحالية.
        </p>

        <div className="space-y-7 text-sm leading-7" style={{ color: "#5C5A4A" }}>
          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "#22291F" }}>طبيعة مَدَار</h2>
            <p>
              مَدَار منصة تعليمية تفاعلية تقدّم الدروس بأسلوب منظم ومرئي.
              هدفها مساعدة طالب المرحلة الإعدادية على <strong style={{ color: "#22291F" }}>فهم</strong> المادة،
              و<strong style={{ color: "#22291F" }}>ربط</strong> عناصرها، و<strong style={{ color: "#22291F" }}>مراجعتها</strong>،
              ثم <strong style={{ color: "#22291F" }}>التحقق من فهمه</strong> من خلال مشاهد تعليمية مترابطة.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "#22291F" }}>الحساب</h2>
            <p className="mb-2">
              يمكنك تصفّح جزء من المحتوى كزائر. بعض المشاهد أو المحتوى قد يتطلب تسجيل الدخول،
              عبر Google أو البريد الإلكتروني، حسب إعدادات المنصة.
            </p>
            <p>
              إذا أنشأت حسابًا، يُفضَّل أن تحافظ على بيانات الدخول لنفسك وألا تشاركها مع الآخرين،
              حتى يبقى حسابك آمنًا واستخدامك للمنصة سلسًا.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "#22291F" }}>استخدام المنصة</h2>
            <p className="mb-2">مَدَار مخصّصة للتعلّم والاستخدام الشخصي للطلاب وأولياء أمورهم.</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>يُرحَّب باستخدام الدروس للمذاكرة والفهم والمراجعة.</li>
              <li>يُمنع محاولة الدخول غير المصرّح به أو العبث بخدمة المنصة.</li>
              <li>يُمنع نسخ المحتوى أو إعادة نشره بطريقة تخالف حقوق مَدَار في المحتوى الذي تقدّمه.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "#22291F" }}>المحتوى</h2>
            <p>
              في المرحلة الحالية، المحتوى التعليمي المنشور على مَدَار يتم إعداده وإدارته من إدارة المنصة.
              نسعى لتقديم دروس واضحة ومنظمة تناسب المرحلة الإعدادية، ونحدّث المحتوى مع تطوّر المنصة.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "#22291F" }}>تجربة بلا إعلانات</h2>
            <p>
              مَدَار حاليًا لا تعرض إعلانات داخل تجربة الطالب، ولا تعتمد على الإعلانات كجزء من رحلة التعلّم.
              كما لا نبيع بيانات المستخدمين لأغراض إعلانية. نريد أن يبقى تركيزك على الدرس نفسه.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "#22291F" }}>توفّر الخدمة</h2>
            <p>
              نعمل على إبقاء المنصة متاحة بشكل منتظم. وقد نحتاج أحيانًا لإجراء صيانة أو تحديثات قصيرة
              لتحسين الأداء أو إضافة تحسينات. إن حدث ذلك، سيكون الهدف خدمة تجربة أفضل للطالب.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-base mb-2" style={{ color: "#22291F" }}>التواصل</h2>
            <p>
              لأي سؤال أو ملاحظة، يمكنك التواصل عبر البريد الظاهر في تذييل المنصة.
              نسعد بسماع ملاحظات الطلاب وأولياء الأمور بما يساعد على تطوير مَدَار.
            </p>
          </section>

          <p className="text-xs pt-2" style={{ color: "#8A8570" }}>
            آخر تحديث: 2026 · مَدَار — مرحلة أولى موجّهة للمرحلة الإعدادية
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
