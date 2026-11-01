"use client";

import { useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
import { FontSize, Indent } from "@/lib/editor/extensions";
import { parseContent, serializeContent } from "@/lib/editor/content";

const BTN = "cursor-pointer rounded px-2 py-1 text-sm text-ink hover:bg-lilac-soft";
const ACTIVE = "bg-lilac-soft font-semibold";

const FONT_SIZES = ["14px", "16px", "18px", "20px", "22px", "24px", "28px", "32px"];
const ALIGNMENTS = ["left", "center", "right", "justify"] as const;
const SYMBOLS = ["—", "–", "…", "“", "”", "’", "§", "¶", "©", "™", "★", "·", "≈", "±"];

export function RichEditor({
  initialContent,
  onUpdate,
}: {
  initialContent: string;
  onUpdate: (serialized: string) => void;
}) {
  const [symbolsOpen, setSymbolsOpen] = useState(false);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
        Underline,
        TextStyle,
        FontSize,
        Indent,
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Placeholder.configure({ placeholder: "Begin this chapter…" }),
      ],
      content: parseContent(initialContent),
      onUpdate: ({ editor }) => onUpdate(serializeContent(editor.getJSON())),
      editorProps: {
        attributes: {
          // Fixed font: Times New Roman. Fixed line spacing: 1.5.
          // Disable browser spell/grammar squiggles on the manuscript.
          class: "font-story mt-4 min-h-[60vh] text-[24px] leading-[1.6] text-ink outline-none",
          spellcheck: "false",
        },
      },
    },
    [],
  );

  if (!editor) return <p className="text-lg text-ink-dim">Loading editor…</p>;

  const stop = (e: React.MouseEvent) => e.preventDefault();

  const markButton = (mark: string, label: string, cmd: () => void) => (
    <button
      type="button"
      onMouseDown={stop}
      onClick={cmd}
      className={`${BTN} ${editor.isActive(mark) ? ACTIVE : ""}`}
    >
      {label}
    </button>
  );

  const indent = (dir: 1 | -1) => {
    const { $from } = editor.state.selection;
    let margin: string | null = null;
    for (let d = $from.depth; d >= 0; d--) {
      const node = $from.node(d);
      if (node.type.name === "paragraph" || node.type.name === "heading") {
        margin = (node.attrs.marginLeft as string | undefined) ?? null;
        break;
      }
    }
    const current = margin ? parseFloat(margin) || 0 : 0;
    const next = Math.max(0, current + dir * 1.25);
    const value = next === 0 ? null : `${next}em`;
    editor
      .chain()
      .focus()
      .updateAttributes("paragraph", { marginLeft: value })
      .updateAttributes("heading", { marginLeft: value })
      .run();
  };

  const textStyle = editor.getAttributes("textStyle");

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-1 border-b border-mist px-2 py-1.5">
        <select
          value={(textStyle.fontSize as string) ?? "24px"}
          onChange={(e) =>
            editor.chain().focus().setMark("textStyle", { fontSize: e.target.value }).run()
          }
          className="cursor-pointer rounded border border-mist bg-white px-1 py-1 text-sm text-ink"
          aria-label="Font size"
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {markButton("bold", "B", () => editor.chain().focus().toggleBold().run())}
        {markButton("italic", "I", () => editor.chain().focus().toggleItalic().run())}
        {markButton("underline", "U", () => editor.chain().focus().toggleUnderline().run())}
        {markButton("strike", "S", () => editor.chain().focus().toggleStrike().run())}

        <span className="mx-1 h-5 w-px bg-mist" />

        <div className="flex items-center gap-0.5 rounded border border-mist bg-white p-0.5">
          {ALIGNMENTS.map((v) => (
            <button
              key={v}
              type="button"
              onMouseDown={stop}
              onClick={() => editor.chain().focus().setTextAlign(v).run()}
              className={`cursor-pointer rounded px-2 py-1 text-sm capitalize ${
                editor.isActive({ textAlign: v }) ? ACTIVE : "text-ink hover:bg-lilac-soft"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <span className="mx-1 h-5 w-px bg-mist" />

        <button type="button" onMouseDown={stop} onClick={() => indent(-1)} className={BTN} title="Outdent">
          ⇤
        </button>
        <button type="button" onMouseDown={stop} onClick={() => indent(1)} className={BTN} title="Indent">
          ⇥
        </button>

        <button
          type="button"
          onMouseDown={stop}
          onClick={() => setSymbolsOpen((o) => !o)}
          className={`${BTN} ${symbolsOpen ? ACTIVE : ""}`}
          title="Insert symbol"
        >
          Ω
        </button>

      </div>

      {symbolsOpen && (
        <div className="flex flex-wrap items-center gap-1 border-b border-mist bg-lilac-mist/40 px-2 py-1">
          {SYMBOLS.map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={stop}
              onClick={() => {
                editor.chain().focus().insertContent(s).run();
                setSymbolsOpen(false);
              }}
              className="min-w-7 cursor-pointer rounded border border-mist bg-white px-1.5 py-1 text-base text-ink hover:bg-lilac-soft"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}