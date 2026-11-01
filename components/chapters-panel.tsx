"use client";

import { useState } from "react";
import {
  addChapterItem,
  deleteChapterItem,
  renameChapterItem,
  useStories,
} from "@/lib/story-store";

export function ChaptersPanel({
  storyId,
  activeChapterId,
  onSelectChapter,
}: {
  storyId: string;
  activeChapterId: string | null;
  onSelectChapter: (id: string) => void;
}) {
  const story = useStories().find((s) => s.id === storyId);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!story) return null;

  const chapters = story.chapters;
  const chapterNumber = (id: string) => chapters.findIndex((c) => c.id === id) + 1;

  const addChapter = () => {
    const updated = addChapterItem(storyId, `Chapter ${chapters.length + 1}`);
    if (updated) {
      const last = updated.chapters[updated.chapters.length - 1];
      if (last) onSelectChapter(last.id);
    }
  };

  const q = query.trim().toLowerCase();
  const results = q ? chapters.filter((c) => c.title.toLowerCase().includes(q)) : [];

  return (
    <section className="flex h-full flex-col">
      <header className="border-b border-mist px-3 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-lilac">📚 Chapters</h2>
          <button
            type="button"
            onClick={addChapter}
            className="cursor-pointer text-sm font-semibold text-lilac"
          >
            + Chapter
          </button>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find chapter…"
          className="mt-1.5 w-full rounded-md border border-mist bg-white px-2 py-1 text-sm outline-none"
        />
      </header>

      <div className="min-h-0 flex-1 overflow-auto px-3 py-2">
        {q ? (
          results.length === 0 ? (
            <p className="text-sm text-ink-dim">No chapters match.</p>
          ) : (
            results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectChapter(c.id)}
                className={`block w-full cursor-pointer rounded-md px-2 py-1 text-left text-base ${
                  activeChapterId === c.id
                    ? "bg-lilac-soft font-semibold text-lilac"
                    : "text-ink"
                }`}
              >
                Chapter {chapterNumber(c.id)}: {c.title || "Untitled"}
              </button>
            ))
          )
        ) : chapters.length === 0 ? (
          <p className="text-sm text-ink-dim">No chapters yet. Add one to start writing.</p>
        ) : (
          chapters.map((c) => {
            const editing = editingId === c.id;
            return (
              <div
                key={c.id}
                className={`group flex items-center gap-0.5 rounded-md py-0.5 pr-1 ${
                  activeChapterId === c.id ? "bg-lilac-soft" : ""
                }`}
              >
                {editing ? (
                  // Rename mode: edit the name; selection is disabled here.
                  <>
                    <span className="shrink-0 text-sm text-ink-dim">
                      Chapter {chapterNumber(c.id)}:
                    </span>
                    <input
                      autoFocus
                      value={c.title}
                      onChange={(e) => renameChapterItem(storyId, c.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Escape") setEditingId(null);
                      }}
                      onBlur={() => setEditingId(null)}
                      aria-label="Rename chapter"
                      className="min-w-0 flex-1 rounded bg-white px-1 text-base text-ink outline-none ring-1 ring-lilac"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      aria-label="Done renaming"
                      title="Done renaming"
                      className="shrink-0 cursor-pointer text-ink-dim"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteChapterItem(storyId, c.id)}
                      aria-label="Delete"
                      className="hidden shrink-0 cursor-pointer text-ink-dim group-hover:inline"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  // Normal mode: click selects/opens the chapter.
                  <>
                    <button
                      type="button"
                      onClick={() => onSelectChapter(c.id)}
                      className="min-w-0 flex-1 cursor-pointer truncate text-left text-base"
                      title="Open chapter"
                    >
                      <span
                        className={`text-sm ${
                          activeChapterId === c.id ? "text-lilac" : "text-ink-dim"
                        }`}
                      >
                        Chapter {chapterNumber(c.id)}:
                      </span>{" "}
                      <span
                        className={
                          activeChapterId === c.id ? "font-semibold text-lilac" : "text-ink"
                        }
                      >
                        {c.title || "Untitled"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(c.id)}
                      aria-label="Rename chapter"
                      title="Rename"
                      className="hidden shrink-0 cursor-pointer text-ink-dim group-hover:inline"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteChapterItem(storyId, c.id)}
                      aria-label="Delete"
                      className="hidden shrink-0 cursor-pointer text-ink-dim group-hover:inline"
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}