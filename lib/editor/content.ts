// Chapter bodies are stored as a TipTap/ProseMirror document serialized to a
// JSON string. These helpers parse/serialize that content and migrate any
// legacy plain-text chapter bodies into a single-paragraph document.
import type { JSONContent } from "@tiptap/core";

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

export function parseContent(raw: string): JSONContent {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return EMPTY_DOC;

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as JSONContent;
      if (parsed && parsed.type === "doc") return parsed;
    } catch {
      // fall through to plain-text migration
    }
  }

  // Legacy plain-text body → single paragraph.
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: raw }] }],
  };
}

export function serializeContent(doc: JSONContent): string {
  return JSON.stringify(doc);
}

/** Readable plain text used for previews (e.g. the landing-page snippet). */
export function plainTextFromContent(raw: string): string {
  const doc = parseContent(raw);
  const parts: string[] = [];
  const walk = (node: JSONContent) => {
    if (typeof node.text === "string") parts.push(node.text);
    for (const child of node.content ?? []) walk(child);
  };
  walk(doc);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}