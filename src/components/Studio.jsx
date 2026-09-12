import { useEffect, useRef, useState } from "react";
import { ImageUploadField } from "./Viewer";
import { STAGES, GRADES, TERMS, uid } from "../lib/constants";

// ---------------------------------------------------------------------------
// Rich Text Editor — same contentEditable approach as the approved
// prototype (cursor-safe: only re-syncs the DOM when the value changes from
// OUTSIDE, e.g. switching scenes). Image insertion now uploads to Supabase
// Storage first and inserts the resulting URL, instead of a permanent
// base64 blob.
// ---------------------------------------------------------------------------
export function RichTextEditor({ value, onChange, uploadFn }) {
  const editorRef = useRef(null);
  const lastValueRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== lastValueRef.current) {
      editorRef.current.innerHTML = value || "";
      lastValueRef.current = value;
    }
  }, [value]);

  const focusEditor = () => {
    if (editorRef.current) editorRef.current.focus();
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastValueRef.current = html;
      onChange(html);
    }
  };

  const format = (command, valueArg = null) => {
    focusEditor();
    document.execCommand(command, false, valueArg);
    handleInput();
  };

  const insertImageFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFn(file);
      focusEditor();
      document.execCommand("insertImage", false, url);
      handleInput();
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert("تعذر رفع الصورة، حاول مرة أخرى.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border rounded-2xl overflow-hidden bg-white" style={{ borderColor: "#DED4BD" }}>
      <div className="flex flex-wrap gap-1 p-2 bg-[#FAF6ED] border-b" style={{ borderColor: "#DED4BD" }}>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => format("bold")} className="px-2.5 py-1 rounded font-bold text-xs bg-white border border-[#DED4BD]">Bold</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => format("italic")} className="px-2.5 py-1 rounded italic text-xs bg-white border border-[#DED4BD]">Italic</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => format("underline")} className="px-2.5 py-1 rounded underline text-xs bg-white border border-[#DED4BD]">Underline</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => format("insertUnorderedList")} className="px-2.5 py-1 rounded text-xs bg-white border border-[#DED4BD]">Bullet List</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => format("insertOrderedList")} className="px-2.5 py-1 rounded text-xs bg-white border border-[#DED4BD]">Numbered List</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => format("formatBlock", "<h3>")} className="px-2.5 py-1 rounded font-bold text-xs bg-white border border-[#DED4BD]">Heading</button>
        <label className="px-2.5 py-1 rounded text-xs bg-white border border-[#DED4BD] cursor-pointer" onMouseDown={(e) => e.preventDefault()}>
          {uploading ? "⏳ جاري الرفع..." : "🖼️ صورة من الجهاز"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              insertImageFile(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        className="p-4 ts-scrollbar ts-selectable ts-richtext"
        style={{ minHeight: 180, outline: "none", color: "#22291F" }}
      />
    </div>
  );
}

export function StudioHotwords({ hotwords, onAdd, onRemove, uploadFn }) {
  const [selectedText, setSelectedText] = useState("");
  const [note, setNote] = useState("");
  const [image, setImage] = useState("");
  const [linkSceneId] = useState("");

  const handleCaptureSelection = () => {
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      const text = sel.toString().trim();
      if (text) {
        setSelectedText(text);
        setNote("");
        setImage("");
      }
    }
  };

  return (
    <div className="mb-6 p-4 rounded-2xl bg-white border" style={{ borderColor: "#DED4BD" }}>
      <h3 className="font-bold text-base mb-2" style={{ color: "#10665A" }}>✨ الكلمات التفاعلية (Hotwords)</h3>
      <p className="text-xs mb-3" style={{ color: "#5C5A4A" }}>حدد أي نص من معاينة الدرس بالأسفل أو من محتوى الشرح، ثم اضغط هنا لإضافته ككلمة تفاعلية:</p>

      <div className="flex gap-2 mb-3">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={handleCaptureSelection} className="px-3 py-1.5 rounded-xl text-xs font-bold text-white" style={{ background: "#10665A" }}>
          استخدام النص المحدد حالياً من المتصفح
        </button>
      </div>

      {selectedText && (
        <div className="ts-fade p-3 rounded-xl mb-3" style={{ background: "#F6E9D3", border: "1px solid #B9791F" }}>
          <p className="font-bold text-sm mb-2" style={{ color: "#8A5A15" }}>النصر المختصر: «{selectedText}»</p>
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

      <div className="flex flex-wrap gap-2">
        {hotwords.map((hw) => (
          <span key={hw.id} className="text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 border" style={{ background: "#FAF6ED", borderColor: "#DED4BD", color: "#8A5A15" }}>
            <b>{hw.text}</b>
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

export function QuestionStudioEditor({ questions, onAdd, onDelete }) {
  const [type, setType] = useState("mcq");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [modelAnswer, setModelAnswer] = useState("");

  const handleAdd = () => {
    if (!prompt.trim()) return;
    if (type === "mcq") {
      onAdd({ id: uid("q"), type, prompt, options: options.filter((o) => o.trim()), correctIndex, explanation });
    } else {
      onAdd({ id: uid("q"), type, prompt, modelAnswer });
    }
    setPrompt(""); setExplanation(""); setModelAnswer("");
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

      <button type="button" onClick={handleAdd} className="px-4 py-2 rounded-xl text-xs font-bold text-white mb-4" style={{ background: "#10665A" }}>
        + إضافة السؤال للمشهد
      </button>

      <div className="flex flex-col gap-2">
        {questions.map((q) => (
          <div key={q.id} className="flex justify-between items-center p-3 rounded-xl border bg-[#FAF6ED]" style={{ borderColor: "#DED4BD" }}>
            <span className="font-bold text-sm" style={{ color: "#22291F" }}>{q.prompt}</span>
            <button type="button" onClick={() => onDelete(q.id)} className="text-xs px-2 py-1 rounded" style={{ color: "#C53030" }}>حذف</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CreateLessonModal({ onCreate, onClose }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [stage, setStage] = useState(STAGES[0]);
  const [grade, setGrade] = useState(GRADES[0]);
  const [term, setTerm] = useState(TERMS[0]);
  const [description, setDescription] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(34,41,31,0.5)" }}>
      <div className="ts-fade w-full rounded-3xl p-6 shadow-2xl bg-white border max-w-md" style={{ borderColor: "#DED4BD" }}>
        <h2 className="font-black text-xl mb-4" style={{ color: "#10665A" }}>إنشاء درس جديد</h2>
        <label className="block mb-3"><span className="block text-xs mb-1" style={{ color: "#5C5A4A" }}>عنوان الدرس</span><input className="ts-input" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="block mb-3"><span className="block text-xs mb-1" style={{ color: "#5C5A4A" }}>المادة</span><input className="ts-input" placeholder="مثال: التاريخ" value={subject} onChange={(e) => setSubject(e.target.value)} /></label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <select className="ts-input text-xs" value={stage} onChange={(e) => setStage(e.target.value)}>{STAGES.map((s) => <option key={s}>{s}</option>)}</select>
          <select className="ts-input text-xs" value={grade} onChange={(e) => setGrade(e.target.value)}>{GRADES.map((s) => <option key={s}>{s}</option>)}</select>
          <select className="ts-input text-xs" value={term} onChange={(e) => setTerm(e.target.value)}>{TERMS.map((s) => <option key={s}>{s}</option>)}</select>
        </div>
        <label className="block mb-5"><span className="block text-xs mb-1" style={{ color: "#5C5A4A" }}>وصف مختصر</span><textarea rows={2} className="ts-input" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <div className="flex gap-2">
          <button
            disabled={!title.trim()}
            onClick={() => onCreate({ title: title.trim(), subject: subject.trim() || "عام", stage, grade, term, description: description.trim() })}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex-1"
            style={{ background: title.trim() ? "#10665A" : "#DED4BD" }}
          >
            إنشاء والبدء في الاستوديو
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-xs" style={{ color: "#8A8570" }}>إلغاء</button>
        </div>
      </div>
    </div>
  );
}
