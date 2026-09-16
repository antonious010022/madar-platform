import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col dir-rtl text-right" style={{ background: "#FAF6ED" }}>
      <div className="max-w-2xl mx-auto w-full px-5 py-10 flex-1">
        <Link to="/student" className="text-xs font-bold mb-6 inline-block" style={{ color: "#10665A" }}>
          ← العودة للمنصة
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <img src="/photo/IevsR.png" alt="مَدَار" className="h-10 w-auto" />
          <h1 className="font-black text-2xl" style={{ color: "#10665A" }}>عن مَدَار</h1>
        </div>

        <div className="space-y-6 text-sm leading-7" style={{ color: "#5C5A4A" }}>
          <p>
            <strong style={{ color: "#22291F" }}>مَدَار</strong> منصة تعليمية تفاعلية موجّهة حاليًا
            لطلاب <strong style={{ color: "#22291F" }}>المرحلة الإعدادية</strong>.
            نقدّم الدروس بأسلوب منظم ومرئي يساعد الطالب على الاستيعاب خطوة بخطوة.
          </p>

          <p>
            في مرحلتها الأولى، تُدار مَدَار ويُعد محتواها من إدارة المنصة،
            مع التركيز على جودة التجربة التعليمية داخل كل درس.
          </p>

          <div className="rounded-2xl p-5 bg-white" style={{ border: "1px solid #DED4BD" }}>
            <p className="font-bold mb-3" style={{ color: "#10665A" }}>رحلة التعلّم في مَدَار</p>
            <ol className="list-decimal list-inside space-y-2">
              <li><strong style={{ color: "#22291F" }}>فهم</strong> — شرح واضح للمحتوى الأساسي</li>
              <li><strong style={{ color: "#22291F" }}>ربط</strong> — خرائط ذهنية وخطوط زمنية تربط الأفكار</li>
              <li><strong style={{ color: "#22291F" }}>مراجعة</strong> — نقاط تذكّر سريعة ومركّزة</li>
              <li><strong style={{ color: "#22291F" }}>اختبار</strong> — أسئلة للتحقق من الفهم</li>
            </ol>
          </div>

          <div className="rounded-2xl p-5" style={{ background: "#E4F0EC", border: "1px solid #C5D8D2" }}>
            <p className="font-bold mb-1" style={{ color: "#0E5348" }}>تجربة تعليمية نظيفة</p>
            <p style={{ color: "#30453F" }}>
              مَدَار حاليًا بلا إعلانات داخل تجربة الطالب. نريد أن يبقى الانتباه مع الدرس، لا مع مشتتات جانبية.
            </p>
          </div>

          <p>
            يمكنك البدء كزائر في المحتوى المتاح للجميع.
            بعض المشاهد قد تتطلب تسجيل الدخول (Google أو البريد) حسب إعداد كل درس.
          </p>

          <p style={{ color: "#8A8570" }}>
            للمزيد حول البيانات والاستخدام، راجع{" "}
            <Link to="/student/privacy" className="font-bold underline" style={{ color: "#10665A" }}>
              سياسة الخصوصية
            </Link>
            {" "}و{" "}
            <Link to="/student/terms" className="font-bold underline" style={{ color: "#10665A" }}>
              الشروط والأحكام
            </Link>
            .
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
