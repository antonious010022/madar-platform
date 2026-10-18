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
import { MindMapGraph } from "./MindMap";
import { uid } from "../lib/constants";
import { listCurriculumNodes } from "../lib/db";
import { Hotword } from "../lib/hotwordExtension";
import { Extension } from "@tiptap/core";

/* ===== حماية المحرّر من ثيم المنصة (الطالب) =====
   أي عنصر عليه الكلاس ts-force-light يفضل فاتح دايمًا، حتى لو المنصة في الدارك (ثيم الطالب أو ثيم المعلم).
   الفكرة: نعيد تعريف متغيّرات duoTheme الفاتحة على العنصر نفسه، فكل اللي جواه بيرجع للألوان الفاتحة. */
const STUDIO_LIGHT_CSS = `
html:not([data-teacher-theme="dark"]) .ts-force-light {
  color-scheme: light;
  --lp-bg: #FFFFFF; --lp-surface: #FFFFFF; --lp-surface-soft: #FFFFFF; --lp-text: #263B35; --lp-muted: #697A73;
  --lp-teal: #147A6A; --lp-teal-deep: #0E5348; --lp-line: #DED4BD; --lp-soft-accent: rgba(20, 122, 106, 0.08);
  --lp-card-shadow: 0 18px 50px -28px rgba(14, 83, 72, 0.25);
  --duo-green: #147A6A;  --duo-green-d: #0E5348;  --duo-green-s: #E0F1EC;  --duo-green-ink: #0E5348;
  --duo-blue: #3F7FA3;   --duo-blue-d: #37698A;   --duo-blue-s: #E6EEF3;   --duo-blue-ink: #2F5870;
  --duo-purple: #7A5CA3; --duo-purple-d: #5A4175; --duo-purple-s: #EFE8F4; --duo-purple-ink: #5A4175;
  --duo-orange: #B8832A; --duo-orange-d: #86600F; --duo-orange-s: #F8EFD8; --duo-orange-ink: #86600F;
  --duo-yellow: #B8832A; --duo-yellow-d: #9C742B; --duo-yellow-s: #F8EFD8; --duo-yellow-ink: #7A5A1E;
  --duo-pink: #A8607A;   --duo-pink-d: #8A4560;   --duo-pink-s: #F5E6EC;   --duo-pink-ink: #8A4560;
  --duo-red: #C2562F;    --duo-red-d: #A3402F;    --duo-red-s: #FBE7DE;
  --duo-ink: #263B35; --duo-ink-soft: #3F4E49; --duo-muted: #697A73;
  --duo-line: #DED4BD; --duo-line-d: #C7BA9C; --duo-snow: #FFFFFF;
  --duo-font-display: "Segoe UI", "Cairo", "Noto Sans Arabic", system-ui, sans-serif;
  --duo-font-body: "Segoe UI", "Cairo", "Noto Sans Arabic", system-ui, sans-serif;
  --duo-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --md-bg: #FFFFFF; --md-surface: #FFFFFF; --md-surface-2: #FFFFFF; --md-surface-3: #FFFFFF;
  --md-teal: #147A6A; --md-teal-deep: #0E5348; --md-teal-dark: #0A3F36;
  --md-teal-mid: #3E9A8A; --md-teal-light: #A9D6CB; --md-teal-soft: #E0F1EC;
  --md-gold: #9C742B; --md-gold-deep: #7A5A1E; --md-gold-light: #E3C08B; --md-gold-soft: #F8EFD8;
  --md-text: #263B35; --md-text-soft: #3F4E49; --md-muted: #697A73; --md-muted-light: #9DB0A9;
  --md-border: #DED4BD; --md-border-strong: #C7BA9C;
  --md-shadow-sm: 0 6px 18px -10px rgba(14, 83, 72, 0.22); --md-shadow-md: 0 14px 34px -16px rgba(14, 83, 72, 0.25); --md-shadow-lg: 0 18px 50px -28px rgba(14, 83, 72, 0.25);
  --md-radius: 1.15rem; --md-radius-lg: 1.6rem;
  --md-font: var(--duo-font-body);
  --md-sienna: #B8832A; --md-blue: #3F7FA3; --md-violet: #7A5CA3; --md-coral: #C2562F; --md-pink: #A8607A; --md-success: #147A6A;
  --md-rainbow: linear-gradient(90deg, #147A6A 0 20%, #3F7FA3 20% 40%, #7A5CA3 40% 60%, #B8832A 60% 80%, #A8607A 80% 100%);
  --acc: #147A6A; --acc-deep: #0E5348; --acc-ink: #0E5348; --acc-soft: #E0F1EC; --acc-light: #A9D6CB; --acc-glow: #147A6A40;
  color: var(--duo-ink);
}
html:not([data-teacher-theme="dark"]) .ts-force-light .ts-input { background: var(--duo-snow); color: var(--duo-ink); border-color: var(--duo-line); }
`;
if (typeof document !== "undefined" && !document.getElementById("ts-studio-light-lock")) {
  const el = document.createElement("style");
  el.id = "ts-studio-light-lock";
  el.textContent = STUDIO_LIGHT_CSS;
  document.head.appendChild(el);
}

// ---------------------------------------------------------------------------
// Rich Text Editor — Tiptap-based, RTL-first.
// Persists exactly as before: `onChange(html)` still hands back a plain HTML
// string, so scene.text / contentHtml / autosave / Supabase / Viewer are all
// unaffected — this component just produces richer HTML than before.
// ---------------------------------------------------------------------------

// Tiptap has no built-in "fontSize" command in this setup, so we add ONE
// standalone extension that attaches a `fontSize` attribute to the existing
// `textStyle` mark (the same mark that already carries fontFamily / color).
// It does NOT extend or duplicate TextStyle. Output stays plain
// <span style="font-size:..">, which the student Viewer renders natively.
// Defined at module scope so the extension instance is stable across renders.
const FontSize = Extension.create({
  name: "madarFontSize",

  addOptions() {
    return { types: ["textStyle"] };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => el.style.fontSize || null,
            renderHTML: (attrs) =>
              attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
          },
        },
      },
    ];
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
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

// Normalises a font-family string so the stored value (quotes stripped by
// FontFamily.parseHTML) can be matched against FONT_FAMILIES option values.
const normFont = (v) =>
  String(v || "").replace(/['"]/g, "").replace(/\s*,\s*/g, ", ").trim().toLowerCase();

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

  // One-shot insertion point for async image upload only (the upload finishes
  // after the user may have clicked elsewhere). Captured on the image button
  // click, consumed once, then cleared. Nothing else stores a selection.
  const imagePosRef = useRef(null);

  const onHotwordDetectedRef = useRef(onHotwordDetected);

  useEffect(() => {
    onHotwordDetectedRef.current = onHotwordDetected;
  }, [onHotwordDetected]);

  const hotwordExtension = useMemo(
    () =>
      Hotword.configure({
        onCreate: (hw) => {
          if (onHotwordDetectedRef.current) {
            onHotwordDetectedRef.current(hw);
          }
        },
      }),
    []
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),

      Underline,

      // The ONE TextStyle mark: fontFamily / fontSize / color all live on it.
      TextStyle,
      FontSize,

      FontFamily,
      Color,

      Highlight.configure({
        multicolor: true,
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          class: "ts-link",
        },
      }),

      Table.configure({
        resizable: true,
      }),

      TableRow,
      TableHeader,
      TableCell,

      Image.configure({
        inline: false,
      }),

      hotwordExtension,
    ],

    content: value || "",

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    editorProps: {
      attributes: {
        dir: "rtl",
        class:
          "p-4 ts-scrollbar ts-selectable ts-richtext ts-editor-surface focus:outline-none min-h-[200px]",
        style: "color: #171333; line-height: 1.8;",
      },
    },
  });

  // Sync an EXTERNAL value change into the editor. Never while the user is
  // typing in it (that would reset content and throw the cursor away), and
  // never for the "" vs "<p></p>" empty-document mismatch.
  useEffect(() => {
    if (!editor) return;
    if (editor.isFocused) return;

    const next = value || "";
    if (next === editor.getHTML()) return;
    if (next === "" && editor.isEmpty) return;

    editor.commands.setContent(next, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  /*
   * ---------------------------------------------------------------
   * Selection handling
   * ---------------------------------------------------------------
   *
   * ProseMirror keeps `editor.state.selection` even when the editor loses DOM
   * focus, and every Tiptap command acts on that live state. So we do NOT
   * keep a second saved copy of the selection and we never force-restore one.
   *
   * - Buttons: preventDefault on mousedown so the editor never loses focus.
   * - <select>/<input type=color> must take focus to open their popup; their
   *   handlers run `chain().focus()` which re-focuses the editor at the
   *   CURRENT state selection (so clicking elsewhere afterwards works normally).
   */
  const keepEditorFocus = (e) => e.preventDefault();

  const btnStyle = (isActive) => ({
    background: isActive ? "#4B2FD1" : "#FFFFFF",
    color: isActive ? "#F7F5FB" : "#171333",
    border: `1px solid ${isActive ? "#4B2FD1" : "#E3E0EE"}`,
  });

  /*
   * ---------------------------------------------------------------
   * Image
   * ---------------------------------------------------------------
   */

  const insertImage = async (file) => {
    if (!file || !uploadFn) return;

    setUploading(true);

    try {
      const url = await uploadFn(file);

      const pos = imagePosRef.current;
      imagePosRef.current = null;

      const chain = editor.chain().focus();
      if (pos !== null) chain.setTextSelection(pos);
      chain.setImage({ src: url }).run();
    } catch {
      // eslint-disable-next-line no-alert
      alert("تعذر رفع الصورة، حاول مرة أخرى.");
    } finally {
      setUploading(false);
    }
  };

  /*
   * ---------------------------------------------------------------
   * Table
   * ---------------------------------------------------------------
   */

  const insertTable = () => {
    const rows = parseInt(
      // eslint-disable-next-line no-alert
      prompt("عدد الصفوف:", "3") || "0",
      10
    );

    const cols = parseInt(
      // eslint-disable-next-line no-alert
      prompt("عدد الأعمدة:", "3") || "0",
      10
    );

    if (rows > 0 && cols > 0) {
      editor
        .chain()
        .focus()
        .insertTable({
          rows,
          cols,
          withHeaderRow: true,
        })
        .run();
    }
  };

  /*
   * ---------------------------------------------------------------
   * Link
   * ---------------------------------------------------------------
   */

  const setLink = () => {
    const previous = editor.getAttributes("link").href || "";

    // eslint-disable-next-line no-alert
    const url = prompt(
      "رابط الصفحة (اتركه فارغًا لإزالة الرابط):",
      previous
    );

    if (url === null) return;

    if (url === "") {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .run();

      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: url,
        target: "_blank",
      })
      .run();
  };

  /*
   * ---------------------------------------------------------------
   * TXT Import
   * ---------------------------------------------------------------
   */

  const escapeHtml = (text) =>
    String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const importTxt = (file) => {
    if (!file) return;

    setImporting(true);

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");

        /*
         * لا نعمل trim().
         * لا نحذف المسافات.
         * لا نعدل علامات الترقيم.
         *
         * كل سطر يتحول إلى paragraph.
         */
        const html = text
          .split(/\r\n|\n|\r/)
          .map((line) => {
            if (line === "") {
              return "<p><br></p>";
            }

            return `<p>${escapeHtml(line)}</p>`;
          })
          .join("");

        editor.commands.setContent(
          html || "<p></p>",
          true
        );

        /*
         * onUpdate قد لا يكون كافيًا في كل إصدارات Tiptap
         * بعد setContent، لذلك نرسل الناتج صراحة.
         */
        onChange(editor.getHTML());
      } catch (error) {
        console.error(error);

        // eslint-disable-next-line no-alert
        alert("تعذر استيراد ملف TXT.");
      } finally {
        setImporting(false);
      }
    };

    reader.onerror = () => {
      // eslint-disable-next-line no-alert
      alert("تعذر قراءة الملف.");

      setImporting(false);
    };

    reader.readAsText(file, "utf-8");
  };

  /*
   * ---------------------------------------------------------------
   * DOCX Import
   * ---------------------------------------------------------------
   */

  const importDocx = async (file) => {
    if (!file) return;

    setImporting(true);

    try {
      const mammoth = await import("mammoth");

      const arrayBuffer = await file.arrayBuffer();

      const result = await mammoth.convertToHtml(
        {
          arrayBuffer,
        },
        {
          /*
           * نخلي Mammoth يحتفظ بالـ paragraph structure
           * بدل تحويل كل شيء إلى plain text.
           */
          includeDefaultStyleMap: true,
        }
      );

      const html = result?.value || "<p></p>";

      editor.commands.setContent(
        html,
        true
      );

      onChange(editor.getHTML());
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("DOCX import error:", error);

      // eslint-disable-next-line no-alert
      alert(
        "تعذر استيراد ملف Word. تأكد أن الملف بصيغة .docx سليمة."
      );
    } finally {
      setImporting(false);
    }
  };

  /*
   * ---------------------------------------------------------------
   * Toolbar
   * ---------------------------------------------------------------
   */

  return (
    <div
      className="border rounded-2xl overflow-hidden bg-white ts-force-light"
      style={{
        borderColor: "#E3E0EE",
      }}
    >
      <div
        className="flex flex-col gap-1.5 p-2 bg-[#F7F5FB] border-b"
        style={{
          borderColor: "#E3E0EE",
        }}
      >
        {/* =========================================================
            ROW 1
        ========================================================== */}

        <div className="flex flex-wrap items-center gap-1">

          {/* FONT FAMILY */}

          <select
            className="text-xs rounded px-2 py-1 border bg-white"
            style={{
              borderColor: "#E3E0EE",
              maxWidth: 150,
            }}
            value={
              FONT_FAMILIES.find(
                (f) =>
                  normFont(f.value) ===
                  normFont(editor.getAttributes("textStyle").fontFamily)
              )?.value ?? ""
            }
            onChange={(e) => {
              const font = e.target.value;

              if (!font) return;

              editor
                .chain()
                .focus()
                .setFontFamily(font)
                .run();
            }}
          >
            <option value="" disabled>
              الخط
            </option>

            {FONT_FAMILIES.map((f) => (
              <option
                key={f.value}
                value={f.value}
                style={{
                  fontFamily: f.value,
                }}
              >
                {f.label}
              </option>
            ))}
          </select>

          {/* FONT SIZE */}

          <select
            className="text-xs rounded px-2 py-1 border bg-white"
            style={{
              borderColor: "#E3E0EE",
              maxWidth: 70,
            }}
            value={(() => {
              const px = parseInt(editor.getAttributes("textStyle").fontSize, 10);
              return FONT_SIZES.includes(px) ? String(px) : "";
            })()}
            onChange={(e) => {
              const size = e.target.value;

              if (!size) return;

              editor
                .chain()
                .focus()
                .setFontSize(`${size}px`)
                .run();
            }}
          >
            <option value="" disabled>
              الحجم
            </option>

            {FONT_SIZES.map((s) => (
              <option key={s} value={String(s)}>
                {s}
              </option>
            ))}
          </select>

          {/* COLOR */}

          <span
            className="text-xs"
            style={{
              color: "#433F66",
            }}
          >
            لون الخط
          </span>

          <input
            type="color"
            defaultValue="#171333"
            // No .focus() here: the picker fires onChange continuously while
            // dragging and re-focusing the editor would fight the native popup.
            // The command still targets the live editor.state.selection.
            onChange={(e) => {
              editor
                .chain()
                .setColor(e.target.value)
                .run();
            }}
            className="w-7 h-7 rounded cursor-pointer border-0"
            title="لون النص"
          />

          {/* HIGHLIGHT */}

          <span
            className="text-xs"
            style={{
              color: "#433F66",
            }}
          >
            تمييز
          </span>

          <input
            type="color"
            defaultValue="#F7E6C4"
            onChange={(e) => {
              editor
                .chain()
                .toggleHighlight({
                  color: e.target.value,
                })
                .run();
            }}
            className="w-7 h-7 rounded cursor-pointer border-0"
            title="لون خلفية التمييز"
          />

          {/* CLEAR FORMAT */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              editor
                .chain()
                .focus()
                .unsetAllMarks()
                .clearNodes()
                .run();
            }}
            className="px-2.5 py-1 rounded text-xs bg-white border border-[#E3E0EE]"
            title="مسح كل التنسيق عن النص المحدد"
          >
            🧹 مسح التنسيق
          </button>
        </div>

        {/* =========================================================
            ROW 2
        ========================================================== */}

        <div className="flex flex-wrap items-center gap-1">

          {/* BOLD */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              editor
                .chain()
                .focus()
                .toggleBold()
                .run();
            }}
            className="px-2.5 py-1 rounded font-bold text-xs"
            style={btnStyle(editor.isActive("bold"))}
            title="عريض (Ctrl+B)"
          >
            B
          </button>

          {/* ITALIC */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              editor
                .chain()
                .focus()
                .toggleItalic()
                .run();
            }}
            className="px-2.5 py-1 rounded italic text-xs"
            style={btnStyle(editor.isActive("italic"))}
            title="مائل (Ctrl+I)"
          >
            I
          </button>

          {/* UNDERLINE */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              editor
                .chain()
                .focus()
                .toggleUnderline()
                .run();
            }}
            className="px-2.5 py-1 rounded underline text-xs"
            style={btnStyle(editor.isActive("underline"))}
            title="تسطير (Ctrl+U)"
          >
            U
          </button>

          {/* STRIKE */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              editor
                .chain()
                .focus()
                .toggleStrike()
                .run();
            }}
            className="px-2.5 py-1 rounded line-through text-xs"
            style={btnStyle(editor.isActive("strike"))}
            title="يتوسطه خط"
          >
            S
          </button>

          <span
            className="w-px h-5 mx-0.5"
            style={{
              background: "#E3E0EE",
            }}
          />

          {/* HEADING */}

          <select
            className="text-xs rounded px-2 py-1 border bg-white"
            style={{
              borderColor: "#E3E0EE",
            }}
            value={
              editor.isActive("heading", {
                level: 1,
              })
                ? "1"
                : editor.isActive("heading", {
                    level: 2,
                  })
                ? "2"
                : editor.isActive("heading", {
                    level: 3,
                  })
                ? "3"
                : editor.isActive("heading", {
                    level: 4,
                  })
                ? "4"
                : "p"
            }
            onChange={(e) => {
              const v = e.target.value;

              if (v === "p") {
                editor
                  .chain()
                  .focus()
                  .setParagraph()
                  .run();
              } else {
                editor
                  .chain()
                  .focus()
                  .setHeading({
                    level: Number(v),
                  })
                  .run();
              }
            }}
          >
            <option value="p">
              نص عادي
            </option>

            <option value="1">
              عنوان 1
            </option>

            <option value="2">
              عنوان 2
            </option>

            <option value="3">
              عنوان 3
            </option>

            <option value="4">
              عنوان 4
            </option>
          </select>
        </div>

        {/* =========================================================
            ROW 3
        ========================================================== */}

        <div className="flex flex-wrap items-center gap-1">

          {/* ALIGN RIGHT */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              editor
                .chain()
                .focus()
                .setTextAlign("right")
                .run();
            }}
            className="px-2.5 py-1 rounded text-xs"
            style={btnStyle(
              editor.isActive({
                textAlign: "right",
              })
            )}
            title="محاذاة يمين"
          >
            يمين
          </button>

          {/* ALIGN CENTER */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              editor
                .chain()
                .focus()
                .setTextAlign("center")
                .run();
            }}
            className="px-2.5 py-1 rounded text-xs"
            style={btnStyle(
              editor.isActive({
                textAlign: "center",
              })
            )}
            title="محاذاة وسط"
          >
            وسط
          </button>

          {/* ALIGN LEFT */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              editor
                .chain()
                .focus()
                .setTextAlign("left")
                .run();
            }}
            className="px-2.5 py-1 rounded text-xs"
            style={btnStyle(
              editor.isActive({
                textAlign: "left",
              })
            )}
            title="محاذاة يسار"
          >
            يسار
          </button>

          {/* JUSTIFY */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              editor
                .chain()
                .focus()
                .setTextAlign("justify")
                .run();
            }}
            className="px-2.5 py-1 rounded text-xs"
            style={btnStyle(
              editor.isActive({
                textAlign: "justify",
              })
            )}
            title="ضبط"
          >
            ضبط
          </button>

          <span
            className="w-px h-5 mx-0.5"
            style={{
              background: "#E3E0EE",
            }}
          />

          {/* BULLET */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              editor
                .chain()
                .focus()
                .toggleBulletList()
                .run();
            }}
            className="px-2.5 py-1 rounded text-xs"
            style={btnStyle(
              editor.isActive("bulletList")
            )}
          >
            • قائمة
          </button>

          {/* ORDERED */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              editor
                .chain()
                .focus()
                .toggleOrderedList()
                .run();
            }}
            className="px-2.5 py-1 rounded text-xs"
            style={btnStyle(
              editor.isActive("orderedList")
            )}
          >
            1. قائمة
          </button>

          {/* SINK */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              editor
                .chain()
                .focus()
                .sinkListItem("listItem")
                .run();
            }}
            className="px-2.5 py-1 rounded text-xs bg-white border border-[#E3E0EE]"
            title="زيادة المسافة البادئة"
          >
            ⇤ زحاف
          </button>

          {/* LIFT */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              editor
                .chain()
                .focus()
                .liftListItem("listItem")
                .run();
            }}
            className="px-2.5 py-1 rounded text-xs bg-white border border-[#E3E0EE]"
            title="إنقاص المسافة البادئة"
          >
            ⇥ إلغاء زحاف
          </button>
        </div>

        {/* =========================================================
            ROW 4
        ========================================================== */}

        <div className="flex flex-wrap items-center gap-1">

          {/* LINK */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={setLink}
            className="px-2.5 py-1 rounded text-xs"
            style={btnStyle(
              editor.isActive("link")
            )}
            title="إدراج/تعديل رابط"
          >
            🔗 رابط
          </button>

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .unsetLink()
                .run();
            }}
            className="px-2 py-1 rounded text-xs bg-white border border-[#E3E0EE]"
            title="حذف الرابط"
          >
            إزالة الرابط
          </button>

          <span
            className="w-px h-5 mx-0.5"
            style={{
              background: "#E3E0EE",
            }}
          />

          {/* TABLE */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={insertTable}
            className="px-2.5 py-1 rounded text-xs bg-white border border-[#E3E0EE]"
          >
            📊 جدول
          </button>

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() =>
              editor
                  .chain()
                  .focus()
                  .addColumnAfter()
                  .run()
            }
            className="px-2 py-1 rounded text-xs bg-white border border-[#E3E0EE]"
          >
            +عمود
          </button>

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() =>
              editor
                  .chain()
                  .focus()
                  .deleteColumn()
                  .run()
            }
            className="px-2 py-1 rounded text-xs bg-white border border-[#E3E0EE]"
            style={{
              color: "#D6334B",
            }}
          >
            -عمود
          </button>

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() =>
              editor
                  .chain()
                  .focus()
                  .addRowAfter()
                  .run()
            }
            className="px-2 py-1 rounded text-xs bg-white border border-[#E3E0EE]"
          >
            +صف
          </button>

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() =>
              editor
                  .chain()
                  .focus()
                  .deleteRow()
                  .run()
            }
            className="px-2 py-1 rounded text-xs bg-white border border-[#E3E0EE]"
            style={{
              color: "#D6334B",
            }}
          >
            -صف
          </button>

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() =>
              editor
                  .chain()
                  .focus()
                  .toggleHeaderRow()
                  .run()
            }
            className="px-2 py-1 rounded text-xs bg-white border border-[#E3E0EE]"
          >
            صف عناوين
          </button>

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() =>
              editor
                  .chain()
                  .focus()
                  .deleteTable()
                  .run()
            }
            className="px-2 py-1 rounded text-xs bg-white border border-[#E3E0EE]"
            style={{
              color: "#D6334B",
            }}
          >
            حذف الجدول
          </button>

          <span
            className="w-px h-5 mx-0.5"
            style={{
              background: "#E3E0EE",
            }}
          />

          {/* IMAGE */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              imagePosRef.current = editor.state.selection.to;
              fileRef.current?.click();
            }}
            className="px-2.5 py-1 rounded text-xs bg-white border border-[#E3E0EE]"
          >
            {uploading
              ? "⏳ جاري الرفع..."
              : "🖼️ صورة"}
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              insertImage(
                e.target.files?.[0]
              );

              e.target.value = "";
            }}
          />

          {/* TXT */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              importTxtRef.current?.click();
            }}
            className="px-2.5 py-1 rounded text-xs bg-white border border-[#E3E0EE]"
          >
            {importing
              ? "⏳ جاري الاستيراد..."
              : "📄 استيراد TXT"}
          </button>

          <input
            ref={importTxtRef}
            type="file"
            accept=".txt,text/plain"
            className="hidden"
            onChange={(e) => {
              importTxt(
                e.target.files?.[0]
              );

              e.target.value = "";
            }}
          />

          {/* DOCX */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              importDocxRef.current?.click();
            }}
            className="px-2.5 py-1 rounded text-xs bg-white border border-[#E3E0EE]"
          >
            {importing
              ? "⏳ جاري الاستيراد..."
              : "📝 استيراد Word"}
          </button>

          <input
            ref={importDocxRef}
            type="file"
            accept=".docx"
            className="hidden"
            onChange={(e) => {
              importDocx(
                e.target.files?.[0]
              );

              e.target.value = "";
            }}
          />

          <span
            className="w-px h-5 mx-0.5"
            style={{
              background: "#E3E0EE",
            }}
          />

          {/* UNDO */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              editor
                .chain()
                .focus()
                .undo()
                .run();
            }}
            className="px-2.5 py-1 rounded text-xs bg-white border border-[#E3E0EE]"
            title="تراجع (Ctrl+Z)"
          >
            ↩ تراجع
          </button>

          {/* REDO */}

          <button
            type="button"
            onMouseDown={keepEditorFocus}
            onClick={() => {
              editor
                .chain()
                .focus()
                .redo()
                .run();
            }}
            className="px-2.5 py-1 rounded text-xs bg-white border border-[#E3E0EE]"
            title="إعادة (Ctrl+Y)"
          >
            ↪ إعادة
          </button>
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
    <div className="mb-6 p-4 rounded-2xl bg-white border ts-force-light" style={{ borderColor: "#E3E0EE" }}>
      <h3 className="font-bold text-base mb-2" style={{ color: "#4B2FD1" }}>✨ الكلمات التفاعلية (Hotwords)</h3>
      <p className="text-xs mb-3" style={{ color: "#433F66" }}>
        اكتب <b>*الكلمة*</b> داخل محتوى الشرح فتتحول تلقائيًا لكلمة تفاعلية، أو حدد أي نص من المعاينة بالأسفل واضغط الزر هنا لإضافته يدويًا:
      </p>

      <div className="flex gap-2 mb-3">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={handleCaptureSelection} className="px-3 py-1.5 rounded-xl text-xs font-bold text-white" style={{ background: "#4B2FD1" }}>
          استخدام النص المحدد حالياً من المتصفح
        </button>
      </div>

      {selectedText && (
        <div className="ts-fade p-3 rounded-xl mb-3" style={{ background: "#F7E6C4", border: "1px solid #C9972E" }}>
          <p className="font-bold text-sm mb-2" style={{ color: "#946518" }}>النص المحدد: «{selectedText}»</p>
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
              style={{ background: "#4B2FD1" }}
            >
              حفظ وتفعيل الكلمة
            </button>
            <button type="button" onClick={() => setSelectedText("")} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: "#6E6B85" }}>إلغاء</button>
          </div>
        </div>
      )}

      {editingId && (
        <div className="ts-fade p-3 rounded-xl mb-3" style={{ background: "#EFEAFD", border: "1px solid #4B2FD1" }}>
          <p className="font-bold text-sm mb-2" style={{ color: "#2E1C86" }}>
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
              style={{ background: "#4B2FD1" }}
            >
              حفظ التعديل
            </button>
            <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: "#6E6B85" }}>إلغاء</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {hotwords.map((hw) => (
          <span key={hw.id} className="text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 border" style={{ background: "#F7F5FB", borderColor: "#E3E0EE", color: "#946518" }}>
            <button type="button" onClick={() => startEditing(hw)} className="font-bold" title="تعديل الشرح/الصورة">{hw.text}</button>
            {!hw.note && !hw.image && <span title="أضف شرح أو صورة لهذه الكلمة" style={{ color: "#C9972E" }}>⚠️</span>}
            <button type="button" onClick={() => onRemove(hw.id)} style={{ color: "#D6334B", fontWeight: "bold" }}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mind Map Studio Builder — محرر مرئي.
// بيعرض نفس خريطة الطالب بالظبط (MindMapGraph) ومعاها لوحة لتعديل العقدة المحدّدة.
// الـ API ثابت: <MindMapStudioBuilder mindmap scenes onChange />  (+ resetKey / rootPlaceholder اختياريين)
// ---------------------------------------------------------------------------
const mmFind = (node, id) => {
  if (node.id === id) return node;
  for (const c of node.children || []) { const r = mmFind(c, id); if (r) return r; }
  return null;
};
const mmPath = (node, id, trail = []) => {
  const t = [...trail, node];
  if (node.id === id) return t;
  for (const c of node.children || []) { const r = mmPath(c, id, t); if (r) return r; }
  return null;
};
const mmParent = (node, id) => {
  for (const c of node.children || []) {
    if (c.id === id) return node;
    const r = mmParent(c, id);
    if (r) return r;
  }
  return null;
};
const mmUpdate = (node, id, fn) =>
  node.id === id ? fn(node) : { ...node, children: (node.children || []).map((c) => mmUpdate(c, id, fn)) };
const mmRemove = (node, id) => ({ ...node, children: (node.children || []).filter((c) => c.id !== id).map((c) => mmRemove(c, id)) });
const mmCount = (node) => 1 + (node.children || []).reduce((s, c) => s + mmCount(c), 0);
const mmEmpty = (node, isRoot = true) => (!isRoot && !node.label.trim() ? 1 : 0) + (node.children || []).reduce((s, c) => s + mmEmpty(c, false), 0);

/** يضمن id فريد وحقول سليمة لكل عقدة (لخرائط قديمة أو مولّدة بدون ids) — بدون ما نغيّر المحفوظ إلا عند أول تعديل */
function mmNormalize(node, path = "0", seen = new Set()) {
  const base = node && typeof node === "object" ? node : {};
  let id = base.id ? String(base.id) : `mm_${path}`;
  if (seen.has(id)) id = `${id}_${path}`;
  seen.add(id);
  return {
    ...base,
    id,
    label: typeof base.label === "string" ? base.label : "",
    description: typeof base.description === "string" ? base.description : "",
    children: (Array.isArray(base.children) ? base.children : []).filter(Boolean).map((c, i) => mmNormalize(c, `${path}_${i}`, seen)),
  };
}

/** نص بمسافات/شرطات => شجرة عقد.  "عنوان | وصف" لإضافة وصف. */
function mmParseOutline(text) {
  const root = { children: [] };
  const stack = [{ indent: -1, node: root }];
  String(text || "").split(/\r?\n/).forEach((raw) => {
    const line = raw.replace(/\t/g, "  ");
    if (!line.trim()) return;
    const m = line.match(/^(\s*)(?:[-–—•*]\s*)?(.*)$/);
    const indent = m[1].length;
    const [label, ...rest] = m[2].trim().split(/\s*\|\s*/);
    if (!label) return;
    const node = { id: uid("mm"), label: label.trim(), description: rest.join(" | ").trim(), children: [] };
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
    stack[stack.length - 1].node.children.push(node);
    stack.push({ indent, node });
  });
  return root.children;
}

function MmBtn({ onClick, disabled, kind = "ghost", title, children }) {
  const kinds = {
    primary: { background: "#4B2FD1", color: "#FFFFFF", borderColor: "#4B2FD1" },
    ghost: { background: "#FFFFFF", color: "#4B2FD1", borderColor: "#E3E0EE" },
    danger: { background: "#FFFFFF", color: "#D6334B", borderColor: "#F3C9D0" },
  };
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="text-xs px-3 py-1.5 rounded-lg font-bold border"
      style={{ ...kinds[kind], opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      {children}
    </button>
  );
}

export function MindMapStudioBuilder({ mindmap, scenes = [], onChange, resetKey, rootPlaceholder }) {
  // جذر ثابت لو المشهد لسه مفيهوش خريطة (قبل كده كان بيتولّد id جديد مع كل render)
  const fallbackRef = useRef(null);
  if (!mindmap && !fallbackRef.current) fallbackRef.current = { id: uid("mm"), label: "", description: "", children: [] };
  const map = useMemo(() => mmNormalize(mindmap || fallbackRef.current), [mindmap]);

  const [selectedId, setSelectedId] = useState(map.id);
  const [reveal, setReveal] = useState(null);
  const [bulk, setBulk] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const labelRef = useRef(null);
  const revealN = useRef(0);

  const selected = mmFind(map, selectedId) || map;
  const isRoot = selected.id === map.id;
  const path = mmPath(map, selected.id) || [map];
  const parent = isRoot ? null : mmParent(map, selected.id);
  const siblings = parent ? parent.children : [];
  const sIdx = siblings.findIndex((c) => c.id === selected.id);
  const total = mmCount(map);
  const emptyCount = mmEmpty(map);

  const show = (id) => { revealN.current += 1; setReveal({ id, n: revealN.current }); };
  const select = (id, focusLabel = false) => {
    setSelectedId(id);
    show(id);
    if (focusLabel) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (labelRef.current) { labelRef.current.focus(); if (labelRef.current.select) labelRef.current.select(); }
      }));
    }
  };
  const commit = (next) => onChange(next);
  const patchSelected = (patch) => commit(mmUpdate(map, selected.id, (n) => ({ ...n, ...patch })));
  const newNode = () => ({ id: uid("mm"), label: "عنصر جديد", description: "", children: [] });

  const addChild = () => {
    const n = newNode();
    commit(mmUpdate(map, selected.id, (x) => ({ ...x, children: [...(x.children || []), n] })));
    select(n.id, true);
  };
  const addSibling = () => {
    if (!parent) return addChild();
    const n = newNode();
    commit(mmUpdate(map, parent.id, (p) => {
      const kids = [...p.children];
      kids.splice(sIdx + 1, 0, n);
      return { ...p, children: kids };
    }));
    select(n.id, true);
    return undefined;
  };
  const move = (dir) => {
    const to = sIdx + dir;
    if (!parent || to < 0 || to >= siblings.length) return;
    commit(mmUpdate(map, parent.id, (p) => {
      const kids = [...p.children];
      [kids[sIdx], kids[to]] = [kids[to], kids[sIdx]];
      return { ...p, children: kids };
    }));
    show(selected.id);
  };
  const remove = () => {
    if (isRoot || !parent) return;
    const sub = mmCount(selected) - 1;
    // eslint-disable-next-line no-alert
    if (sub > 0 && !window.confirm(`سيتم حذف «${selected.label || "بدون عنوان"}» مع ${sub} من فروعه. متأكد؟`)) return;
    commit(mmRemove(map, selected.id));
    select(parent.id);
  };
  const clearAll = () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm("مسح كل الفروع والإبقاء على العقدة الرئيسية فقط؟")) return;
    commit({ ...map, children: [] });
    select(map.id);
  };
  const addBulk = () => {
    const nodes = mmParseOutline(bulk);
    if (!nodes.length) return;
    commit(mmUpdate(map, selected.id, (x) => ({ ...x, children: [...(x.children || []), ...nodes] })));
    setBulk("");
    show(nodes[0].id);
  };

  return (
    <div className="mb-6 p-4 rounded-2xl bg-white border ts-force-light" style={{ borderColor: "#E3E0EE" }}>
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <h3 className="font-bold text-base" style={{ color: "#4B2FD1" }}>🧠 مصمم الخريطة الذهنية</h3>
        <div className="flex items-center gap-1.5">
          {emptyCount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#FDE8EC", color: "#D6334B" }} title="العقد بدون عنوان لا تظهر للطالب">
              ⚠️ {emptyCount} بدون عنوان
            </span>
          )}
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#EFEAFD", color: "#2E1C86" }}>{total} عقدة</span>
        </div>
      </div>
      <p className="text-xs mb-3" style={{ color: "#6E6B85" }}>
        دي نفس الخريطة اللي هتظهر للطالب. اضغط على أي عقدة لتحديدها، وعدّل عنوانها أو أضف فروعها من اللوحة اللي تحت.
      </p>

      <MindMapGraph
        node={map}
        editing
        resetKey={resetKey ?? map.id}
        selectedNodeId={selected.id}
        onSelectNode={(n) => setSelectedId(n.id)}
        reveal={reveal}
        height="clamp(300px, 48vh, 480px)"
      />

      <div className="mt-3 p-3 rounded-xl border" style={{ background: "#F7F5FB", borderColor: "#E3E0EE" }}>
        <div className="flex flex-wrap items-center gap-1 text-[11px] mb-2" style={{ color: "#6E6B85" }}>
          <span className="font-bold" style={{ color: "#171333" }}>المحدّد:</span>
          {path.map((n, i) => (
            <span key={n.id} className="flex items-center gap-1">
              {i > 0 && <span>‹</span>}
              <button
                type="button"
                onClick={() => select(n.id)}
                style={{ color: i === path.length - 1 ? "#4B2FD1" : "#6E6B85", fontWeight: i === path.length - 1 ? 800 : 500 }}
              >
                {n.label || (i === 0 ? "الجذر" : "(بدون عنوان)")}
              </button>
            </span>
          ))}
        </div>

        <label className="block mb-2">
          <span className="block text-[11px] font-bold mb-1" style={{ color: "#433F66" }}>{isRoot ? "عنوان الخريطة (العقدة الرئيسية)" : "عنوان العقدة"}</span>
          <input
            ref={labelRef}
            className="ts-input text-sm w-full"
            value={selected.label}
            placeholder={isRoot ? rootPlaceholder || "مثال: عنوان الدرس" : "اكتب العنوان — Enter لإضافة فرع بجواره"}
            onChange={(e) => patchSelected({ label: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); addSibling(); }
            }}
          />
          {!isRoot && !selected.label.trim() && (
            <span className="block text-[11px] mt-1" style={{ color: "#D6334B" }}>العقدة بدون عنوان لن تظهر للطالب.</span>
          )}
        </label>

        <label className="block mb-2">
          <span className="block text-[11px] font-bold mb-1" style={{ color: "#433F66" }}>وصف تفصيلي (اختياري)</span>
          <textarea
            className="ts-input text-xs w-full"
            rows={2}
            value={selected.description}
            placeholder="يظهر كتلميح عند الطالب"
            onChange={(e) => patchSelected({ description: e.target.value })}
          />
        </label>

        {scenes.length > 0 && (
          <label className="block mb-3">
            <span className="block text-[11px] font-bold mb-1" style={{ color: "#433F66" }}>ربط بمشهد (اختياري)</span>
            <select className="ts-input text-xs w-full" value={selected.sceneId || ""} onChange={(e) => patchSelected({ sceneId: e.target.value })}>
              <option value="">-- بدون ربط --</option>
              {scenes.map((s) => <option key={s.id} value={s.id}>{s.title || "مشهد بدون عنوان"}</option>)}
            </select>
          </label>
        )}

        <div className="flex flex-wrap gap-1.5">
          <MmBtn kind="primary" onClick={addChild}>+ فرع داخل هذه العقدة</MmBtn>
          <MmBtn onClick={addSibling} disabled={isRoot} title="يضيف عقدة في نفس المستوى بعد المحدّدة">+ فرع بجواره</MmBtn>
          <MmBtn onClick={() => move(-1)} disabled={isRoot || sIdx <= 0} title="تحريك لأعلى">↑</MmBtn>
          <MmBtn onClick={() => move(1)} disabled={isRoot || sIdx < 0 || sIdx >= siblings.length - 1} title="تحريك لأسفل">↓</MmBtn>
          <MmBtn kind="danger" onClick={remove} disabled={isRoot}>🗑 حذف</MmBtn>
        </div>

        <div className="mt-3 pt-2 border-t" style={{ borderColor: "#E3E0EE" }}>
          <button type="button" className="text-xs font-bold" style={{ color: "#4B2FD1" }} onClick={() => setBulkOpen((v) => !v)}>
            {bulkOpen ? "▼" : "◀"} إضافة سريعة لعدة فروع دفعة واحدة
          </button>
          {bulkOpen && (
            <div className="mt-2">
              <p className="text-[11px] mb-1" style={{ color: "#6E6B85" }}>
                اكتب كل عنصر في سطر. المسافة في أول السطر تجعله فرعًا للسطر اللي فوقه. «عنوان | وصف» لإضافة وصف. هتتضاف داخل «{selected.label || "العقدة المحدّدة"}».
              </p>
              <textarea
                className="ts-input text-xs w-full"
                rows={5}
                value={bulk}
                onChange={(e) => setBulk(e.target.value)}
                placeholder={"أسباب الحرب\n  أسباب اقتصادية\n  أسباب سياسية\nنتائج الحرب | وصف قصير"}
              />
              <div className="flex gap-2 mt-2">
                <MmBtn kind="primary" onClick={addBulk} disabled={!bulk.trim()}>إضافة الفروع</MmBtn>
                <MmBtn kind="danger" onClick={clearAll} disabled={map.children.length === 0}>مسح كل الفروع</MmBtn>
              </div>
            </div>
          )}
        </div>
      </div>
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
    <div className="mb-6 p-4 rounded-2xl bg-white border ts-force-light" style={{ borderColor: "#E3E0EE" }}>
      <h3 className="font-bold text-base mb-3" style={{ color: "#4B2FD1" }}>🕒 إدارة الخط الزمني والأحداث</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        <input className="ts-input text-sm" placeholder="التاريخ (مثال: يوليو 1798)" value={date} onChange={(e) => setDate(e.target.value)} />
        <input className="ts-input text-sm" placeholder="عنوان الحدث" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <textarea className="ts-input text-sm mb-2" placeholder="وصف الحدث..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
      <input className="ts-input text-sm mb-2" placeholder="الموقع الجغرافي (مثال: الإسكندرية)" value={location} onChange={(e) => setLocation(e.target.value)} />
      <ImageUploadField value={image} onChange={setImage} label="صورة الحدث (اختياري)" uploadFn={uploadFn} />
      <button type="button" onClick={handleSave} className="px-4 py-2 rounded-xl text-xs font-bold text-white mb-4 mt-2" style={{ background: "#4B2FD1" }}>
        {editingId ? "تحديث الحدث" : "+ إضافة حدث للخط الزمني"}
      </button>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center p-3 rounded-xl border bg-[#F7F5FB]" style={{ borderColor: "#E3E0EE" }}>
            <div>
              <span className="font-bold text-xs px-2 py-1 rounded ml-2" style={{ background: "#4B2FD1", color: "#F7F5FB" }}>{item.date}</span>
              <span className="font-bold text-sm" style={{ color: "#171333" }}>{item.title}</span>
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
                style={{ color: "#4B2FD1", borderColor: "#E3E0EE" }}
              >
                تعديل
              </button>
              <button type="button" onClick={() => onDelete(item.id)} className="text-xs px-2.5 py-1 rounded" style={{ color: "#D6334B" }}>حذف</button>
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
    <div className="mb-6 p-4 rounded-2xl bg-white border ts-force-light" style={{ borderColor: "#E3E0EE" }}>
      <h3 className="font-bold text-base mb-3" style={{ color: "#4B2FD1" }}>❓ بنك الأسئلة والتقييمات</h3>

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
        <button type="button" onClick={handleSave} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "#4B2FD1" }}>
          {editingId ? "💾 حفظ التعديلات" : "+ إضافة السؤال للمشهد"}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} className="px-3 py-2 rounded-xl text-xs font-bold" style={{ color: "#6E6B85" }}>
            إلغاء التعديل
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {questions.map((q) => (
          <div key={q.id} className="flex justify-between items-center gap-2 p-3 rounded-xl border bg-[#F7F5FB]" style={{ borderColor: editingId === q.id ? "#4B2FD1" : "#E3E0EE" }}>
            <span className="font-bold text-sm flex-1" style={{ color: "#171333" }}>{q.prompt}</span>
            <div className="flex gap-1 shrink-0">
              <button type="button" onClick={() => startEdit(q)} className="text-xs px-2 py-1 rounded font-bold" style={{ color: "#4B2FD1" }}>✏️ تعديل</button>
              <button type="button" onClick={() => onDelete(q.id)} className="text-xs px-2 py-1 rounded" style={{ color: "#D6334B" }}>🗑 حذف</button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: "rgba(23, 19, 51,0.5)" }}>
      <div className="ts-fade w-full rounded-3xl p-6 shadow-2xl bg-white border max-w-md my-auto ts-force-light" style={{ borderColor: "#E3E0EE", maxHeight: "90vh", overflowY: "auto" }}>
        <h2 className="font-black text-xl mb-4" style={{ color: "#4B2FD1" }}>إنشاء درس جديد</h2>

        {loadError && (
          <p className="text-xs mb-3" style={{ color: "#D6334B" }}>{loadError}</p>
        )}

        {curriculumEmpty ? (
          <p className="text-sm mb-5 leading-6" style={{ color: "#433F66" }}>
            لا يوجد منهج مُعرَّف بعد (مراحل · صفوف · ترمات · مواد). أضِف عناصر المنهج أولًا من
            «إعدادات المنصة ← المنهج» ثم عُد هنا لإنشاء الدرس.
          </p>
        ) : (
          <>
            <label className="block mb-3">
              <span className="block text-xs mb-1" style={{ color: "#433F66" }}>عنوان الدرس</span>
              <input className="ts-input" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
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
              <span className="block text-xs mb-1" style={{ color: "#433F66" }}>وصف مختصر</span>
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
            style={{ background: canSubmit ? "#4B2FD1" : "#E3E0EE" }}
          >
            إنشاء والبدء في الاستوديو
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs" style={{ color: "#6E6B85" }}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}