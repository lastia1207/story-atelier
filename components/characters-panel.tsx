"use client";

import { useState } from "react";
import {
  createId,
  deleteCharacter,
  upsertCharacter,
  useStories,
} from "@/lib/story-store";
import { AutoTextarea } from "@/components/auto-textarea";

/**
 * Simplified character view shown in the right-hand column. Brief per-character
 * summaries live here; the full dynamic table is available through the "Open"
 * button, which swaps the writing area into Character Editor mode.
 */
export function CharactersPanel({
  storyId,
  editorOpen,
  onToggleEditor,
}: {
  storyId: string;
  editorOpen: boolean;
  onToggleEditor: () => void;
}) {
  const story = useStories().find((s) => s.id === storyId);
  const [query, setQuery] = useState("");

  if (!story) return null;

  const q = query.trim().toLowerCase();
  const rows = story.characters.filter((c) => {
    if (!q) return true;
    return [c.name, c.role, c.summary, ...Object.values(c.data)].some((v) =>
      v.toLowerCase().includes(q),
    );
  });

  return (
    <section className="flex h-full flex-col">
      <header className="border-b border-mist px-3 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">▦ Characters</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => upsertCharacter(storyId, { id: createId(), name: "", role: "", summary: "", data: {} })}
              className="cursor-pointer text-sm font-semibold text-lilac"
            >
              + Character
            </button>
            <button
              type="button"
              onClick={onToggleEditor}
              title={editorOpen ? "Close the character editor" : "Open the full character editor"}
              className="cursor-pointer rounded-md border border-lilac px-2 py-0.5 text-xs font-semibold text-lilac hover:bg-lilac-soft"
            >
              {editorOpen ? "Close" : "Open"}
            </button>
          </div>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search characters…"
          className="mt-1.5 w-full rounded-md border border-mist bg-white px-2 py-1 text-sm outline-none"
        />
      </header>

      {/* Simplified view: name + role + a brief, multi-line, word-wrapped summary. */}
      <div className="min-h-0 flex-1 space-y-2 overflow-auto px-3 py-2">
        {rows.map((c) => (
          <div key={c.id} className="group relative rounded-lg bg-white p-2 shadow-sm">
            <div className="flex items-center gap-2">
              <input
                value={c.name}
                onChange={(e) => upsertCharacter(storyId, { ...c, name: e.target.value })}
                placeholder="Name"
                aria-label="Character name"
                className="min-w-0 flex-1 bg-transparent font-semibold text-ink outline-none"
              />
              <input
                value={c.role}
                onChange={(e) => upsertCharacter(storyId, { ...c, role: e.target.value })}
                placeholder="Role"
                aria-label="Character role"
                className="w-1/3 min-w-0 shrink-0 bg-transparent text-sm text-ink-dim outline-none"
              />
              <button
                type="button"
                onClick={() => deleteCharacter(storyId, c.id)}
                aria-label="Delete character"
                className="hidden shrink-0 cursor-pointer text-sm text-ink-dim hover:text-red-500 group-hover:inline"
              >
                ×
              </button>
            </div>
            <AutoTextarea
              value={c.summary}
              onChange={(e) => upsertCharacter(storyId, { ...c, summary: e.target.value })}
              placeholder="Brief summary…"
              aria-label="Character summary"
              className="mt-1 w-full bg-transparent text-sm text-ink-dim outline-none"
            />
          </div>
        ))}
        {rows.length === 0 && (
          <p className="mt-3 text-sm text-ink-dim">No characters match.</p>
        )}
      </div>
    </section>
  );
}