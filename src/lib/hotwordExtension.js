import { Mark, mergeAttributes } from "@tiptap/core";
import { uid } from "./constants";

// ---------------------------------------------------------------------------
// Hotword mark — replaces the fragile "regex over raw HTML" approach.
// While typing `*كلمة*`, the input rule below strips the asterisks and wraps
// the text in a real ProseMirror mark carrying a stable `data-hwid`. Any
// other formatting on that text (bold, color, a specific font...) is kept,
// because this is a *mark* layered on top of the existing marks, not a
// text replacement.
//
// The same `data-hwid` is what Viewer.jsx's HotwordRenderer looks for when
// wiring up hover/tap — so the editor and the student view share one single
// source of truth (the id), instead of Viewer re-matching text with regex.
// ---------------------------------------------------------------------------
export const Hotword = Mark.create({
  name: "hotword",

  addOptions() {
    return {
      // Called once per NEW hotword created via the *word* shortcut, so the
      // page can register it in scene.hotwords ({ id, text, note, image }).
      onCreate: () => {},
    };
  },

  addAttributes() {
    return {
      hwid: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-hwid"),
        renderHTML: (attrs) => (attrs.hwid ? { "data-hwid": attrs.hwid } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span.ts-hotword-target" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { class: "ts-hotword-target" }), 0];
  },

  addInputRules() {
    return [
      {
        find: /(?:^|\s)\*([^*]+)\*$/,
        handler: ({ state, range, match, chain }) => {
          const captured = match[1];
          if (!captured || !captured.trim()) return;

          const fullMatch = match[0];
          const leadingSpace = fullMatch.length - fullMatch.trimStart().length;
          const start = range.from + leadingSpace;
          const end = range.to;
          const hwid = uid("hw");

          chain()
            .deleteRange({ from: start, to: end })
            .insertContent({
              type: "text",
              text: captured,
              marks: [{ type: "hotword", attrs: { hwid } }],
            })
            .run();

          this.options.onCreate({ id: hwid, text: captured.trim() });
        },
      },
    ];
  },
});