import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col dir-rtl text-right" style={{ background: "#F7F5FB" }}>
      <div className="max-w-2xl mx-auto w-full px-5 py-10 flex-1">
        <Link to="/student" className="text-xs font-bold mb-6 inline-block" style={{ color: "#4B2FD1" }}>
          ← العودة للمنصة
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <img src="/photo/0MSCh.png" alt="مَدَار" className="h-10 w-auto" />
          <h1 className="font-black text-2xl" style={{ color: "#4B2FD1" }}>عن مَدَار</h1>
        </div>

        <div className="space-y-6 text-sm leading-7" style={{ color: "#433F66" }}>
          <p>
            <strong style={{ color: "#171333" }}>مَدَار</strong> منصة تعليمية تفاعلية موجّهة حاليًا
            لطلاب <strong style={{ color: "#171333" }}>المرحلة الإعدادية</strong>.
            نقدّم الدروس بأسلوب منظم ومرئي يساعد الطالب على الاستيعاب خطوة بخطوة.
          </p>

          <p>
            في مرحلتها الأولى، تُدار مَدَار ويُعد محتواها من إدارة المنصة،
            مع التركيز على جودة التجربة التعليمية داخل كل درس.
          </p>

          <div className="rounded-2xl p-5 bg-white" style={{ border: "1px solid #E3E0EE" }}>
            <p className="font-bold mb-3" style={{ color: "#4B2FD1" }}>رحلة التعلّم في مَدَار</p>
            <ol className="list-decimal list-inside space-y-2">
              <li><strong style={{ color: "#171333" }}>فهم</strong> — شرح واضح للمحتوى الأساسي</li>
              <li><strong style={{ color: "#171333" }}>ربط</strong> — خرائط ذهنية وخطوط زمنية تربط الأفكار</li>
              <li><strong style={{ color: "#171333" }}>مراجعة</strong> — نقاط تذكّر سريعة ومركّزة</li>
              <li><strong style={{ color: "#171333" }}>اختبار</strong> — أسئلة للتحقق من الفهم</li>
            </ol>
          </div>

          <div className="rounded-2xl p-5" style={{ background: "#EFEAFD", border: "1px solid #C9C2E6" }}>
            <p className="font-bold mb-1" style={{ color: "#2E1C86" }}>تجربة تعليمية نظيفة</p>
            <p style={{ color: "#433F66" }}>
              مَدَار حاليًا بلا إعلانات داخل تجربة الطالب. نريد أن يبقى الانتباه مع الدرس، لا مع مشتتات جانبية.
            </p>
          </div>

          <p>
            يمكنك البدء كزائر في المحتوى المتاح للجميع.
            بعض المشاهد قد تتطلب تسجيل الدخول (Google أو البريد) حسب إعداد كل درس.
          </p>

          <p style={{ color: "#6E6B85" }}>
            للمزيد حول البيانات والاستخدام، راجع{" "}
            <Link to="/student/privacy" className="font-bold underline" style={{ color: "#4B2FD1" }}>
              سياسة الخصوصية
            </Link>
            {" "}و{" "}
            <Link to="/student/terms" className="font-bold underline" style={{ color: "#4B2FD1" }}>
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
