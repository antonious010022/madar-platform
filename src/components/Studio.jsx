import { useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { ImageUploadField } from "./Viewer";
import { uid } from "../lib/constants";
import { listCurriculumNodes } from "../lib/db";
import { Hotword } from "../lib/hotwordExtension";

// ---------------------------------------------------------------------------
// Rich Text Editor — Tiptap-based, RTL-first.
// Persists exactly as before: `onChange(html)` still hands back a plain HTML
// string, so scene.text / contentHtml / autosave / Supabase / Viewer are all
// unaffected — this component just produces richer HTML than before.
// ---------------------------------------------------------------------------

// Tiptap's execCommand-era "fontSize" doesn't exist as a real command, so we
// extend the existing `textStyle` mark with a `fontSize` attribute rendered
// as inline CSS. This keeps the output as plain <span style="font-size:..">,
// which any browser (including the student Viewer) renders natively.
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (el) => el.style.fontSize || null,
        renderHTML: (attrs) => (attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {}),
      },
    };
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).run(),
    };
  },
});

// Curated Arabic-first font list. The full 60-name wishlist would mean
// downloading 60+ separate font families (huge payload for very little
// day-to-day benefit) — this subset covers the popular/legible ones and is
// fully wired up in index.css so every one of them actually renders,
// instead of silently falling back to the system font.
const FONT_FAMILIES = [
  { label: "Tajawal (افتراضي)", value: "Tajawal" },
  { label: "Cairo", value: "Cairo" },
  { label: "Noto Sans Arabic", value: "Noto Sans Arabic" },
  { label: "IBM Plex Sans Arabic", value: "IBM Plex Sans Arabic" },
  { label: "Amiri", value: "Amiri" },
  { label: "Changa", value: "Changa" },
  { label: "El Messiri", value: "El Messiri" },
  { label: "Readex Pro", value: "Readex Pro" },
  { label: "Rubik", value: "Rubik" },
  { label: "Alexandria", value: "Alexandria" },
  { label: "Markazi Text", value: "'Markazi Text', serif" },
  { label: "Noto Naskh Arabic", value: "Noto Naskh Arabic" },
  { label: "Scheherazade New", value: "Scheherazade New" },
  { label: "Reem Kufi", value: "Reem Kufi" },
  { label: "Lalezar", value: "Lalezar" },
  { label: "Mirza", value: "Mirza" },
  { label: "Lateef", value: "Lateef" },
  { label: "Harmattan", value: "Harmattan" },
  { label: "Vazirmatn", value: "Vazirmatn" },
  { label: "Baloo Bhaijaan 2", value: "Baloo Bhaijaan 2" },
  { label: "Aref Ruqaa", value: "Aref Ruqaa" },
  { label: "Katibeh", value: "Katibeh" },
  { label: "Jomhuria", value: "Jomhuria" },
  { label: "Kufam", value: "Kufam" },
  { label: "Lemonada", value: "Lemonada" },
  { label: "Mada", value: "Mada" },
  { label: "Alkalami", value: "Alkalami" },
  { label: "Gulzar", value: "Gulzar" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36];

export function RichTextEditor({ value, onChange, uploadFn, onHotwordDetected }) {
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);
  const importTxtRef = useRef(null);
  const importDocxRef = useRef(null);

  const onHotwordDetectedRef = useRef(onHotwordDetected);
  useEffect(() => {
    onHotwordDetectedRef.current = onHotwordDetected;
  }, [onHotwordDetected]);

  // Stable forever (empty deps) so the editor is never force-recreated —
  // but it always calls whatever the LATEST onHotwordDetected is, via the
  // ref above, avoiding a stale-closure bug.
  const hotwordExtension = useMemo(
    () =>
      Hotword.configure({
        onCreate: (hw) => {
          if (onHotwordDetectedRef.current) onHotwordDetectedRef.current(hw);
        },
      }),
    []
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Underline,
      TextStyle,
      FontSize,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", class: "ts-link" },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({ inline: false }),
      hotwordExtension,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        dir: "rtl",
        class: "p-4 ts-scrollbar ts-selectable ts-richtext ts-editor-surface focus:outline-none min-h-[200px]",
        style: "color: #22291F; line-height: 1.8;",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) editor.commands.setContent(value || "", false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  const btnStyle = (isActive) => ({
    background: isActive ? "#10665A" : "#FFFFFF",
    color: isActive ? "#FAF6ED" : "#22291F",
    border: `1px solid ${isActive ? "#10665A" : "#DED4BD"}`,
  });

  const insertImage = async (file) => {
    if (!file || !uploadFn) return;
    setUploading(true);
    try {
      const url = await uploadFn(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      // eslint-disable-next-line no-alert
      alert("تعذر رفع الصورة، حاول مرة أخرى.");
    } finally {
      setUploading(false);
    }
  };

  const insertTable = () => {
    // eslint-disable-next-line no-alert
    const rows = parseInt(prompt("عدد الصفوف:", "3") || "0", 10);
    // eslint-disable-next-line no-alert
    const cols = parseInt(prompt("عدد الأعمدة:", "3") || "0", 10);
    if (rows > 0 && cols > 0) {
      editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    }
  };

  const setLink = () => {
    const previous = editor.getAttributes("link").href || "";
    // eslint-disable-next-line no-alert
    const url = prompt("رابط الصفحة (اتركه فارغًا لإزالة الرابط):", previous);
    if (url === null) return; // cancelled
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
  };

  const importTxt = (file) => {
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      const html = text
        .split(/\r?\n/)
        .map((line) => `<p>${line.replace(/&/g, "&amp;").replace(/</g, "&lt;") || "<br>"}</p>`)
        .join("");
      editor.commands.setContent(html, true);
      onChange(editor.getHTML());
      setImporting(false);
    };
    reader.onerror = () => {
      // eslint-disable-next-line no-alert
      alert("تعذر قراءة الملف.");
      setImporting(false);
    };
    reader.readAsText(file, "utf-8");
  };

  const importDocx = async (file) => {
    if (!file) return;
    setImporting(true);
    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      editor.commands.setContent(result.value || "<p></p>", true);
      onChange(editor.getHTML());
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      // eslint-disable-next-line no-alert
      alert("تعذر استيراد ملف Word. تأكد أن الملف بصيغة .docx سليمة.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="border rounded-2xl overflow-hidden bg-white" style={{ borderColor: "#DED4BD" }}>
      <div className="flex flex-col gap-1.5 p-2 bg-[#FAF6ED] border-b" style={{ borderColor: "#DED4BD" }}>
        {/* Row 1: font family, size, color, highlight */}
        <div className="flex flex-wrap items-center gap-1">
          <select
            className="text-xs rounded px-2 py-1 border bg-white"
            style={{ borderColor: "#DED4BD", maxWidth: 150 }}
            onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
            defaultValue=""
          >
            <option value="" disabled>الخط</option>
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
            ))}
          </select>

          <select
            className="text-xs rounded px-2 py-1 border bg-white"
            style={{ borderColor: "#DED4BD", maxWidth: 70 }}
            onChange={(e) => editor.chain().focus().setFontSize(e.target.value + "px").run()}
            defaultValue=""
          >
            <option value="" disabled>الحجم</option>
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <span className="text-xs" style={{ color: "#5C5A4A" }}>لون الخط</span>
          <input
            type="color"
            defaultValue="#22291F"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className="w-7 h-7 rounded cursor-pointer border-0"
            title="لون النص"
          />

          <span className="text-xs" style={{ color: "#5C5A4A" }}>تمييز</span>
          <input
            type="color"
            defaultValue="#F6E9D3"
            onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
            className="w-7 h-7 rounded cursor-pointer border-0"
            title="لون خلفية التمييز"
          />

          <button
            type="button"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="px-2.5 py-1 rounded text-xs bg-white border border-[#DED4BD]"
            title="مسح كل التنسيق عن النص المحدد"
          >
            🧹 مسح التنسيق
          </button>
        </div>

        {/* Row 2: bold/italic/underline/strike + headings */}
        <div className="flex flex-wrap items-center gap-1">
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className="px-2.5 py-1 rounded font-bold text-xs" style={btnStyle(editor.isActive("bold"))} title="عريض (Ctrl+B)">B</button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className="px-2.5 py-1 rounded italic text-xs" style={btnStyle(editor.isActive("italic"))} title="مائل (Ctrl+I)">I</button>
          <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className="px-2.5 py-1 rounded underline text-xs" style={btnStyle(editor.isActive("underline"))} title="تسطير (Ctrl+U)">U</button>
          <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className="px-2.5 py-1 rounded line-through text-xs" style={btnStyle(editor.isActive("strike"))} title="يتوسطه خط">S</button>

          <span className="w-px h-5 mx-0.5" style={{ background: "#DED4BD" }} />

          <select
            className="text-xs rounded px-2 py-1 border bg-white"
            style={{ borderColor: "#DED4BD" }}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "p") editor.chain().focus().setParagraph().run();
              else editor.chain().focus().toggleHeading({ level: Number(v) }).run();
            }}
            value={
              editor.isActive("heading", { level: 1 }) ? "1" :
              editor.isActive("heading", { level: 2 }) ? "2" :
              editor.isActive("heading", { level: 3 }) ? "3" :
              editor.isActive("heading", { level: 4 }) ? "4" : "p"
            }
          >
            <option value="p">نص عادي</option>
            <option value="1">عنوان 1</option>
            <option value="2">عنوان 2</option>
            <option value="3">عنوان 3</option>
            <option value="4">عنوان 4</option>
          </select>
        </div>

        {/* Row 3: alignment, lists, indent */}
        <div className="flex flex-wrap items-center gap-1">
          <button type="button" onClick={() => editor.chain().focus().setTextAlign("right").run()} className="px-2.5 py-1 rounded text-xs" style={btnStyle(editor.isActive({ textAlign: "right" }))} title="محاذاة يمين">يمين</button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign("center").run()} className="px-2.5 py-1 rounded text-xs" style={btnStyle(editor.isActive({ textAlign: "center" }))} title="محاذاة وسط">وسط</button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign("left").run()} className="px-2.5 py-1 rounded text-xs" style={btnStyle(editor.isActive({ textAlign: "left" }))} title="محاذاة يسار">يسار</button>
          <button type="button" onClick={() => editor.chain().focus().setTextAlign("justify").run()} className="px-2.5 py-1 rounded text-xs" style={btnStyle(editor.isActive({ textAlign: "justify" }))} title="ضبط">ضبط</button>

          <span className="w-px h-5 mx-0.5" style={{ background: "#DED4BD" }} />

          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className="px-2.5 py-1 rounded text-xs" style={btnStyle(editor.isActive("bulletList"))}>• قائمة</button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="px-2.5 py-1 rounded text-xs" style={btnStyle(editor.isActive("orderedList"))}>1. قائمة</button>
          <button type="button" onClick={() => editor.chain().focus().sinkListItem("listItem").run()} className="px-2.5 py-1 rounded text-xs bg-white border border-[#DED4BD]" title="زيادة المسافة البادئة">⇤ زحاف</button>
          <button type="button" onClick={() => editor.chain().focus().liftListItem("listItem").run()} className="px-2.5 py-1 rounded text-xs bg-white border border-[#DED4BD]" title="إنقاص المسافة البادئة">⇥ إلغاء زحاف</button>
        </div>

        {/* Row 4: link, table, image, import, undo/redo */}
        <div className="flex flex-wrap items-center gap-1">
          <button type="button" onClick={setLink} className="px-2.5 py-1 rounded text-xs" style={btnStyle(editor.isActive("link"))} title="إدراج/تعديل رابط">🔗 رابط</button>
          <button type="button" onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()} className="px-2 py-1 rounded text-xs bg-white border border-[#DED4BD]" title="حذف الرابط">إزالة الرابط</button>

          <span className="w-px h-5 mx-0.5" style={{ background: "#DED4BD" }} />

          <button type="button" onClick={insertTable} className="px-2.5 py-1 rounded text-xs bg-white border border-[#DED4BD]">📊 جدول</button>
          <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="px-2 py-1 rounded text-xs bg-white border border-[#DED4BD]">+عمود</button>
          <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className="px-2 py-1 rounded text-xs bg-white border border-[#DED4BD]" style={{ color: "#C53030" }}>-عمود</button>
          <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="px-2 py-1 rounded text-xs bg-white border border-[#DED4BD]">+صف</button>
          <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className="px-2 py-1 rounded text-xs bg-white border border-[#DED4BD]" style={{ color: "#C53030" }}>-صف</button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeaderRow().run()} className="px-2 py-1 rounded text-xs bg-white border border-[#DED4BD]">صف عناوين</button>
          <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="px-2 py-1 rounded text-xs bg-white border border-[#DED4BD]" style={{ color: "#C53030" }}>حذف الجدول</button>

          <span className="w-px h-5 mx-0.5" style={{ background: "#DED4BD" }} />

          <button type="button" onClick={() => fileRef.current?.click()} className="px-2.5 py-1 rounded text-xs bg-white border border-[#DED4BD]">
            {uploading ? "⏳ جاري الرفع..." : "🖼️ صورة"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { insertImage(e.target.files?.[0]); e.target.value = ""; }} />

          <button type="button" onClick={() => importTxtRef.current?.click()} className="px-2.5 py-1 rounded text-xs bg-white border border-[#DED4BD]">
            {importing ? "⏳ جاري الاستيراد..." : "📄 استيراد TXT"}
          </button>
          <input ref={importTxtRef} type="file" accept=".txt,text/plain" className="hidden" onChange={(e) => { importTxt(e.target.files?.[0]); e.target.value = ""; }} />

          <button type="button" onClick={() => importDocxRef.current?.click()} className="px-2.5 py-1 rounded text-xs bg-white border border-[#DED4BD]">
            {importing ? "⏳ جاري الاستيراد..." : "📝 استيراد Word"}
          </button>
          <input ref={importDocxRef} type="file" accept=".docx" className="hidden" onChange={(e) => { importDocx(e.target.files?.[0]); e.target.value = ""; }} />

          <span className="w-px h-5 mx-0.5" style={{ background: "#DED4BD" }} />

          <button type="button" onClick={() => editor.chain().focus().undo().run()} className="px-2.5 py-1 rounded text-xs bg-white border border-[#DED4BD]" title="تراجع (Ctrl+Z)">↩ تراجع</button>
          <button type="button" onClick={() => editor.chain().focus().redo().run()} className="px-2.5 py-1 rounded text-xs bg-white border border-[#DED4BD]" title="إعادة (Ctrl+Y)">↪ إعادة</button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hotwords panel — كلمتان تنشئان كلمة تفاعلية الآن:
// 1) تلقائيًا أثناء الكتابة: *الحملة الفرنسية* (يديرها Hotword extension).
// 2) يدويًا: تحديد نص موجود من المعاينة بالأسفل والضغط على الزر هنا.
// الاثنان يكتبان في نفس مصفوفة scene.hotwords، بدون تكرار لنفس النص.
// ---------------------------------------------------------------------------
export function StudioHotwords({ hotwords, onAdd, onRemove, onUpdate, uploadFn }) {
  const [selectedText, setSelectedText] = useState("");
  const [note, setNote] = useState("");
  const [image, setImage] = useState("");
  const [linkSceneId] = useState("");
  const [editingId, setEditingId] = useState(null);

  const handleCaptureSelection = () => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      const text = sel.toString().trim();
      if (text) {
        setEditingId(null);
        setSelectedText(text);
        setNote("");
        setImage("");
      }
    }
  };

  const startEditing = (hw) => {
    setSelectedText("");
    setEditingId(hw.id);
    setNote(hw.note || "");
    setImage(hw.image || "");
  };

  return (
    <div className="mb-6 p-4 rounded-2xl bg-white border" style={{ borderColor: "#DED4BD" }}>
      <h3 className="font-bold text-base mb-2" style={{ color: "#10665A" }}>✨ الكلمات التفاعلية (Hotwords)</h3>
      <p className="text-xs mb-3" style={{ color: "#5C5A4A" }}>
        اكتب <b>*الكلمة*</b> داخل محتوى الشرح فتتحول تلقائيًا لكلمة تفاعلية، أو حدد أي نص من المعاينة بالأسفل واضغط الزر هنا لإضافته يدويًا:
      </p>

      <div className="flex gap-2 mb-3">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={handleCaptureSelection} className="px-3 py-1.5 rounded-xl text-xs font-bold text-white" style={{ background: "#10665A" }}>
          استخدام النص المحدد حالياً من المتصفح
        </button>
      </div>

      {selectedText && (
        <div className="ts-fade p-3 rounded-xl mb-3" style={{ background: "#F6E9D3", border: "1px solid #B9791F" }}>
          <p className="font-bold text-sm mb-2" style={{ color: "#8A5A15" }}>النص المحدد: «{selectedText}»</p>
          <input className="ts-input text-sm mb-2" placeholder="الشرح أو التعريف الإضافي..." value={note} onChange={(e) => setNote(e.target.value)} />
          <ImageUploadField value={image} onChange={setImage} label="صورة توضيحية (اختياري)" uploadFn={uploadFn} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (!selectedText.trim()) return;
                onAdd({ id: uid("hw"), text: selectedText.trim(), note: note.trim(), image, linkSceneId });
                setSelectedText("");
                setNote("");
                setImage("");
              }}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white"
              style={{ background: "#10665A" }}
            >
              حفظ وتفعيل الكلمة
            </button>
            <button type="button" onClick={() => setSelectedText("")} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: "#8A8570" }}>إلغاء</button>
          </div>
        </div>
      )}

      {editingId && (
        <div className="ts-fade p-3 rounded-xl mb-3" style={{ background: "#E4F0EC", border: "1px solid #10665A" }}>
          <p className="font-bold text-sm mb-2" style={{ color: "#0E5348" }}>
            تعديل شرح: «{hotwords.find((h) => h.id === editingId)?.text}»
          </p>
          <input className="ts-input text-sm mb-2" placeholder="الشرح أو التعريف الإضافي..." value={note} onChange={(e) => setNote(e.target.value)} />
          <ImageUploadField value={image} onChange={setImage} label="صورة توضيحية (اختياري)" uploadFn={uploadFn} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (onUpdate) onUpdate(editingId, { note: note.trim(), image });
                setEditingId(null);
                setNote("");
                setImage("");
              }}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-white"
              style={{ background: "#10665A" }}
            >
              حفظ التعديل
            </button>
            <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: "#8A8570" }}>إلغاء</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {hotwords.map((hw) => (
          <span key={hw.id} className="text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 border" style={{ background: "#FAF6ED", borderColor: "#DED4BD", color: "#8A5A15" }}>
            <button type="button" onClick={() => startEditing(hw)} className="font-bold" title="تعديل الشرح/الصورة">{hw.text}</button>
            {!hw.note && !hw.image && <span title="أضف شرح أو صورة لهذه الكلمة" style={{ color: "#B9791F" }}>⚠️</span>}
            <button type="button" onClick={() => onRemove(hw.id)} style={{ color: "#C53030", fontWeight: "bold" }}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

export function MindMapStudioBuilder({ mindmap, scenes, onChange }) {
  const updateNodeRecursive = (node, id, updater) => {
    if (node.id === id) return updater(node);
    if (node.children) return { ...node, children: node.children.map((c) => updateNodeRecursive(c, id, updater)) };
    return node;
  };

  const deleteNodeRecursive = (node, id) => {
    if (!node.children) return node;
    return { ...node, children: node.children.filter((c) => c.id !== id).map((c) => deleteNodeRecursive(c, id)) };
  };

  const handleUpdate = (id, updater) => onChange(updateNodeRecursive(mindmap, id, updater));

  const handleAddChild = (parentId) => {
    const newChild = { id: uid("mm"), label: "عنصر فرعي جديد", description: "", children: [] };
    handleUpdate(parentId, (node) => ({ ...node, children: [...(node.children || []), newChild] }));
  };

  const handleDelete = (id) => {
    if (id === mindmap.id) {
      // eslint-disable-next-line no-alert
      alert("لا يمكن حذف العقدة الرئيسية (Root).");
      return;
    }
    onChange(deleteNodeRecursive(mindmap, id));
  };

  return (
    <div className="mb-6 p-4 rounded-2xl bg-white border" style={{ borderColor: "#DED4BD" }}>
      <h3 className="font-bold text-base mb-3" style={{ color: "#10665A" }}>🧠 مصمم الخريطة الذهنية (Mind Map Builder)</h3>
      <MindMapNodeEditor node={mindmap} scenes={scenes} onAddChild={handleAddChild} onUpdate={handleUpdate} onDelete={handleDelete} />
    </div>
  );
}

function MindMapNodeEditor({ node, scenes, onAddChild, onUpdate, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(node.label);
  const [desc, setDesc] = useState(node.description || "");
  const [sceneId, setSceneId] = useState(node.sceneId || "");

  return (
    <div className="my-2 p-3 rounded-xl border bg-[#FAF6ED]" style={{ borderColor: "#DED4BD" }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "#EAE6F1", color: "#4C3F63" }}>
            {isExpanded ? "▼" : "◀"}
          </button>
          {!isEditing ? (
            <span className="font-bold text-sm" style={{ color: "#22291F" }}>{node.label}</span>
          ) : (
            <div className="flex flex-col gap-2 w-full sm:w-80">
              <input className="ts-input text-xs" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="عنوان العقدة" />
              <input className="ts-input text-xs" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="وصف تفصيلي" />
              <select className="ts-input text-xs" value={sceneId} onChange={(e) => setSceneId(e.target.value)}>
                <option value="">-- ربط بمشهد (اختياري) --</option>
                {scenes.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
              <button
                type="button"
                onClick={() => {
                  onUpdate(node.id, (n) => ({ ...n, label, description: desc, sceneId }));
                  setIsEditing(false);
                }}
                className="px-3 py-1 rounded text-xs text-white font-bold"
                style={{ background: "#10665A" }}
              >
                حفظ التعديل
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {!isEditing && (
            <button type="button" onClick={() => setIsEditing(true)} className="text-xs px-2.5 py-1 rounded bg-white border" style={{ color: "#10665A", borderColor: "#DED4BD" }}>تعديل</button>
          )}
          <button type="button" onClick={() => onAddChild(node.id)} className="text-xs px-2.5 py-1 rounded text-white font-bold" style={{ background: "#10665A" }}>+ فرع</button>
          <button type="button" onClick={() => onDelete(node.id)} className="text-xs px-2 py-1 rounded" style={{ color: "#C53030" }}>حذف</button>
        </div>
      </div>

      {isExpanded && node.children && node.children.length > 0 && (
        <div className="mr-4 mt-2 pr-3 border-r-2" style={{ borderColor: "#DED4BD" }}>
          {node.children.map((child) => (
            <MindMapNodeEditor key={child.id} node={child} scenes={scenes} onAddChild={onAddChild} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TimelineStudioEditor({ items, onAdd, onEdit, onDelete, uploadFn }) {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const handleSave = () => {
    if (!date.trim() || !title.trim()) return;
    if (editingId) {
      onEdit(editingId, { date, title, description, location, image });
      setEditingId(null);
    } else {
      onAdd({ id: uid("t"), date, title, description, location, image });
    }
    setDate(""); setTitle(""); setDescription(""); setLocation(""); setImage("");
  };

  return (
    <div className="mb-6 p-4 rounded-2xl bg-white border" style={{ borderColor: "#DED4BD" }}>
      <h3 className="font-bold text-base mb-3" style={{ color: "#10665A" }}>🕒 إدارة الخط الزمني والأحداث</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        <input className="ts-input text-sm" placeholder="التاريخ (مثال: يوليو 1798)" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="ts-input text-sm" placeholder="عنوان الحدث" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <textarea className="ts-input text-sm mb-2" placeholder="وصف الحدث..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      <input className="ts-input text-sm mb-2" placeholder="الموقع الجغرافي (مثال: الإسكندرية)" value={location} onChange={(e) => setLocation(e.target.value)} />
      <ImageUploadField value={image} onChange={setImage} label="صورة الحدث (اختياري)" uploadFn={uploadFn} />
      <button type="button" onClick={handleSave} className="px-4 py-2 rounded-xl text-xs font-bold text-white mb-4 mt-2" style={{ background: "#10665A" }}>
        {editingId ? "تحديث الحدث" : "+ إضافة حدث للخط الزمني"}
      </button>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-3 rounded-xl border bg-[#FAF6ED]" style={{ borderColor: "#DED4BD" }}>
            <div>
              <span className="font-bold text-xs px-2 py-1 rounded ml-2" style={{ background: "#10665A", color: "#FAF6ED" }}>{item.date}</span>
              <span className="font-bold text-sm" style={{ color: "#22291F" }}>{item.title}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingId(item.id);
                  setDate(item.date);
                  setTitle(item.title);
                  setDescription(item.description);
                  setLocation(item.location);
                  setImage(item.image);
                }}
                className="text-xs px-2.5 py-1 rounded bg-white border"
                style={{ color: "#10665A", borderColor: "#DED4BD" }}
              >
                تعديل
              </button>
              <button type="button" onClick={() => onDelete(item.id)} className="text-xs px-2.5 py-1 rounded" style={{ color: "#C53030" }}>حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuestionStudioEditor({ questions, onAdd, onUpdate, onDelete }) {
  const [type, setType] = useState("mcq");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [modelAnswer, setModelAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setPrompt("");
    setExplanation("");
    setModelAnswer("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
    setType("mcq");
    setEditingId(null);
  };

  const startEdit = (q) => {
    setEditingId(q.id);
    setType(q.type || "mcq");
    setPrompt(q.prompt || "");
    setExplanation(q.explanation || "");
    setModelAnswer(q.modelAnswer || "");
    if (q.type === "mcq") {
      const opts = [...(q.options || [])];
      while (opts.length < 4) opts.push("");
      setOptions(opts.slice(0, 4));
      setCorrectIndex(typeof q.correctIndex === "number" ? q.correctIndex : 0);
    } else {
      setOptions(["", "", "", ""]);
      setCorrectIndex(0);
    }
  };

  const handleSave = () => {
    if (!prompt.trim()) return;
    const payload =
      type === "mcq"
        ? { type, prompt: prompt.trim(), options: options.filter((o) => o.trim()), correctIndex, explanation }
        : { type, prompt: prompt.trim(), modelAnswer };
    if (editingId) {
      if (typeof onUpdate === "function") {
        onUpdate(editingId, payload);
      } else {
        // fallback: delete+add would change id — prefer onUpdate
        onAdd({ id: editingId, ...payload });
      }
    } else {
      onAdd({ id: uid("q"), ...payload });
    }
    resetForm();
  };

  return (
    <div className="mb-6 p-4 rounded-2xl bg-white border" style={{ borderColor: "#DED4BD" }}>
      <h3 className="font-bold text-base mb-3" style={{ color: "#10665A" }}>❓ بنك الأسئلة والتقييمات</h3>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <select className="ts-input text-sm" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="mcq">اختيار من متعدد (MCQ)</option>
          <option value="short_answer">إجابة قصيرة / مقالي</option>
          <option value="why">بما تفسر (Why)</option>
          <option value="consequences">ما النتائج المترتبة على (Consequences)</option>
        </select>
      </div>

      <input className="ts-input text-sm mb-2" placeholder="نص السؤال..." value={prompt} onChange={(e) => setPrompt(e.target.value)} />

      {type === "mcq" ? (
        <div className="flex flex-col gap-2 mb-3">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="radio" name="correct" checked={correctIndex === i} onChange={() => setCorrectIndex(i)} />
              <input
                className="ts-input text-sm"
                placeholder={`الاختيار ${i + 1}`}
                value={opt}
                onChange={(e) => {
                  const newOpts = [...options];
                  newOpts[i] = e.target.value;
                  setOptions(newOpts);
                }}
              />
            </div>
          ))}
          <input className="ts-input text-sm" placeholder="شرح الإجابة الصحيحة (اختياري)" value={explanation} onChange={(e) => setExplanation(e.target.value)} />
        </div>
      ) : (
        <textarea className="ts-input text-sm mb-3" placeholder="الإجابة النموذجية..." value={modelAnswer} onChange={(e) => setModelAnswer(e.target.value)} rows={2} />
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <button type="button" onClick={handleSave} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "#10665A" }}>
          {editingId ? "💾 حفظ التعديلات" : "+ إضافة السؤال للمشهد"}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} className="px-3 py-2 rounded-xl text-xs font-bold" style={{ color: "#8A8570" }}>
            إلغاء التعديل
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {questions.map((q) => (
          <div key={q.id} className="flex justify-between items-center gap-2 p-3 rounded-xl border bg-[#FAF6ED]" style={{ borderColor: editingId === q.id ? "#10665A" : "#DED4BD" }}>
            <span className="font-bold text-sm flex-1" style={{ color: "#22291F" }}>{q.prompt}</span>
            <div className="flex gap-1 shrink-0">
              <button type="button" onClick={() => startEdit(q)} className="text-xs px-2 py-1 rounded font-bold" style={{ color: "#10665A" }}>✏️ تعديل</button>
              <button type="button" onClick={() => onDelete(q.id)} className="text-xs px-2 py-1 rounded" style={{ color: "#C53030" }}>🗑 حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CreateLessonModal({ onCreate, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [nodes, setNodes] = useState(null); // null = still loading
  const [loadError, setLoadError] = useState("");
  const [stageId, setStageId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [termId, setTermId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  useEffect(() => {
    let cancelled = false;
    listCurriculumNodes()
      .then((rows) => {
        if (cancelled) return;
        const active = (rows || []).filter((n) => n.isActive !== false);
        setNodes(active);
        const firstStage = active.find((n) => n.kind === "stage" && !n.parentId);
        if (firstStage) setStageId(firstStage.id);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e?.message || "تعذر تحميل بيانات المنهج.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const byKindAndParent = (kind, parentId) =>
    (nodes || [])
      .filter((n) => n.kind === kind && (n.parentId || "") === (parentId || ""))
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const stageOptions = byKindAndParent("stage", null);
  const gradeOptions = stageId ? byKindAndParent("grade", stageId) : [];
  const termOptions = gradeId ? byKindAndParent("term", gradeId) : [];
  const subjectOptions = termId ? byKindAndParent("subject", termId) : [];

  // إذا تغيّرت المرحلة/الصف/الترم، امسح الاختيارات التابعة التي لم تعد صالحة
  useEffect(() => {
    if (gradeId && !gradeOptions.some((g) => g.id === gradeId)) {
      setGradeId(gradeOptions[0]?.id || "");
    } else if (!gradeId && gradeOptions.length) {
      setGradeId(gradeOptions[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageId, nodes]);

  useEffect(() => {
    if (termId && !termOptions.some((t) => t.id === termId)) {
      setTermId(termOptions[0]?.id || "");
    } else if (!termId && termOptions.length) {
      setTermId(termOptions[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradeId, nodes]);

  useEffect(() => {
    if (subjectId && !subjectOptions.some((s) => s.id === subjectId)) {
      setSubjectId(subjectOptions[0]?.id || "");
    } else if (!subjectId && subjectOptions.length) {
      setSubjectId(subjectOptions[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termId, nodes]);

  const nameOf = (id) => (nodes || []).find((n) => n.id === id)?.name || "";
  const curriculumEmpty = nodes && stageOptions.length === 0;
  const canSubmit = title.trim() && stageId && gradeId && termId && subjectId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(34,41,31,0.5)" }}>
      <div className="ts-fade w-full rounded-3xl p-6 shadow-2xl bg-white border max-w-md" style={{ borderColor: "#DED4BD" }}>
        <h2 className="font-black text-xl mb-4" style={{ color: "#10665A" }}>إنشاء درس جديد</h2>

        {loadError && (
          <p className="text-xs mb-3" style={{ color: "#C53030" }}>{loadError}</p>
        )}

        {curriculumEmpty ? (
          <p className="text-sm mb-5 leading-6" style={{ color: "#5C5A4A" }}>
            لا يوجد منهج مُعرَّف بعد (مراحل · صفوف · ترمات · مواد). أضِف عناصر المنهج أولًا من
            «إعدادات المنصة ← المنهج» ثم عُد هنا لإنشاء الدرس.
          </p>
        ) : (
          <>
            <label className="block mb-3">
              <span className="block text-xs mb-1" style={{ color: "#5C5A4A" }}>عنوان الدرس</span>
              <input className="ts-input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <select
                className="ts-input text-xs"
                value={stageId}
                onChange={(e) => setStageId(e.target.value)}
              >
                {stageOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select
                className="ts-input text-xs"
                value={gradeId}
                onChange={(e) => setGradeId(e.target.value)}
                disabled={!gradeOptions.length}
              >
                {gradeOptions.length ? (
                  gradeOptions.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)
                ) : (
                  <option value="">لا يوجد صفوف لهذه المرحلة</option>
                )}
              </select>
              <select
                className="ts-input text-xs"
                value={termId}
                onChange={(e) => setTermId(e.target.value)}
                disabled={!termOptions.length}
              >
                {termOptions.length ? (
                  termOptions.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)
                ) : (
                  <option value="">لا يوجد ترمات لهذا الصف</option>
                )}
              </select>
              <select
                className="ts-input text-xs"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                disabled={!subjectOptions.length}
              >
                {subjectOptions.length ? (
                  subjectOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)
                ) : (
                  <option value="">لا يوجد مواد لهذا الترم</option>
                )}
              </select>
            </div>

            <label className="block mb-5">
              <span className="block text-xs mb-1" style={{ color: "#5C5A4A" }}>وصف مختصر</span>
              <textarea rows={2} className="ts-input" value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
          </>
        )}

        <div className="flex gap-2">
          <button
            disabled={!canSubmit}
            onClick={() =>
              onCreate({
                title: title.trim(),
                subject: nameOf(subjectId),
                stage: nameOf(stageId),
                grade: nameOf(gradeId),
                term: nameOf(termId),
                description: description.trim(),
              })
            }
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex-1"
            style={{ background: canSubmit ? "#10665A" : "#DED4BD" }}
          >
            إنشاء والبدء في الاستوديو
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs" style={{ color: "#8A8570" }}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}