// ---------------------------------------------------------------------------
// Demo/seed data — FOR LOCAL DEVELOPMENT ONLY.
// This is never loaded in production and never inserted automatically.
// It exists only so a teacher can run `npm run dev` locally, sign in, and
// use the "استيراد بيانات تجريبية" (import demo data) button in an empty
// library to see a fully-populated example lesson without typing one by
// hand. It is plain JS objects — nothing here touches Supabase until the
// teacher explicitly imports it.
// ---------------------------------------------------------------------------
import { uid } from "./constants";

export function makeDemoLesson() {
  return {
    title: "الحملة الفرنسية على مصر (1798 - 1801)",
    subject: "التاريخ",
    stage: "الثانوية",
    grade: "الثالث",
    term: "الترم الأول",
    description:
      "دراسة شاملة للحملة الفرنسية، أسبابها، أحداثها الكبرى، ونتائجها على المجتمع المصري.",
    scenes: [
      {
        title: "١. أسباب الحملة الفرنسية",
        text:
          "<p>لم تكن الحملة الفرنسية على مصر وليدة اللحظة، بل جاءت تتويجاً للتنافس الاستعماري بين إنجلترا وفرنسا في العصر الحديث. فكرت فرنسا في ضرب مصالح إنجلترا في الشرق، وتأمين طريق تجارتها إلى الهند.</p>",
        presenter_notes:
          "ركز هنا على التنافس الاستعماري بين إنجلترا وفرنسا وأهمية موقع مصر الجغرافي.",
        hotwords: [
          {
            id: uid("hw"),
            text: "التنافس الاستعماري",
            note: "صراع سياسي واقتصادي بين الدول الكبرى للسيطرة على الأسواق وطرق التجارة.",
            image: "",
          },
          {
            id: uid("hw"),
            text: "طريق تجارتها إلى الهند",
            note: "الطريق الحيوي الذي كانت تسيطر عليه إنجلترا وتهدد مصالح فرنسا.",
            image: "",
          },
        ],
        mindmap: {
          id: uid("mm"),
          label: "الحملة الفرنسية",
          description: "مظلة الحملة الاستعمارية",
          children: [
            {
              id: uid("mm"),
              label: "الأسباب",
              description: "دوافع مجيء الحملة",
              children: [
                { id: uid("mm"), label: "سياسية وعسكرية", description: "تعويض خسائر مستعمرات فرنسا وضرب إنجلترا", children: [] },
                { id: uid("mm"), label: "اقتصادية", description: "تأمين التجارة الفرنسية وطريق الهند", children: [] },
              ],
            },
            {
              id: uid("mm"),
              label: "الأحداث",
              description: "مسار الحملة والمقاومة",
              children: [
                { id: uid("mm"), label: "الإسكندرية", description: "مقاومة محمد كُرَيِّم", children: [] },
                { id: uid("mm"), label: "إمبابة والقاهرة", description: "معركة الأهرامات وإمبابة", children: [] },
              ],
            },
          ],
        },
        timeline: [
          {
            id: uid("t"),
            date: "مايو 1798",
            title: "إبحار الحملة",
            description: "تحرك الأسطول الفرنسي سرا من ميناء طولون بقيادة نابليون بونابرت.",
            location: "ميناء طولون، فرنسا",
            image: "",
          },
          {
            id: uid("t"),
            date: "يوليو 1798",
            title: "الوصول للإسكندرية",
            description: "سقوط الإسكندرية ومقاومة حاكمها محمد كريم.",
            location: "الإسكندرية",
            image: "",
          },
        ],
        questions: [
          {
            id: uid("q"),
            type: "mcq",
            prompt: "ما هو السبب الرئيسي غير المعلن لإرسال الحملة الفرنسية إلى مصر؟",
            options: [
              "مساعدة المماليك في حكم مصر",
              "قطع طريق التجارة بين إنجلترا ومستعمرات الهند",
              "نشر المبادئ الديمقراطية في الشرق",
            ],
            correctIndex: 1,
            explanation: "كان الهدف الأساسي لفرنسا ضرب الاقتصاد الإنجليزي وتأمين طريق الهند.",
          },
          {
            id: uid("q"),
            type: "short_answer",
            prompt: "وضح باختصار كيف استغل نابليون الحالة السياسية لمصر قبل الحملة؟",
            modelAnswer:
              "وجد مصر تحت حكم ثنائي مملوكي متنازع أدى إلى ضعفه وإرهاق اقتصاد البلاد.",
          },
        ],
        quickRecallShow: true,
        quickRecall: [
          "التنافس الاستعماري بين إنجلترا وفرنسا",
          "موقع مصر الجغرافي الاستراتيجي",
          "ضعف الحكم المملوكي",
        ],
      },
    ],
  };
}
