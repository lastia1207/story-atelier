"use client";

import { useState } from "react";
import {
  addOutlineFolder,
  createId,
  deleteOutlineFolder,
  deleteOutlineNode,
  renameOutlineFolder,
  setOutlineFolder,
  upsertOutlineNode,
  useStories,
  type OutlineNode,
} from "@/lib/story-store";

export function OutlinePanel({
  storyId,
  selectedNodeId,
  onSelect,
}: {
  storyId: string;
  selectedNodeId: string | null;
  onSelect: (id: string) => void;
}) {
  const story = useStories().find((s) => s.id === storyId);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!story) return null;

  const folders = story.outlineFolders;
  const nodesIn = (folderId: string | null) => story.outline.filter((n) => n.folderId === folderId);
  const ungrouped = nodesIn(null);

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const addOutline = (folderId: string | null) =>
    upsertOutlineNode(storyId, {
      id: createId(),
      title: "",
      summary: "",
      folderId,
      content: "",
    });

  const renameNode = (n: OutlineNode, title: string) =>
    upsertOutlineNode(storyId, { ...n, title });

  const renderNode = (n: OutlineNode) => {
    const editing = editingId === n.id;
    return (
      <div key={n.id} className="group flex items-center gap-0.5 rounded-md py-0.5 pl-5 pr-1">
        {editing ? (
          // Rename mode: edit the title; selection is disabled here.
          <>
            <input
              autoFocus
              value={n.title}
              onChange={(e) => renameNode(n, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") setEditingId(null);
              }}
              onBlur={() => setEditingId(null)}
              aria-label="Rename outline"
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
              onClick={() => deleteOutlineNode(storyId, n.id)}
              aria-label="Delete"
              className="shrink-0 cursor-pointer text-ink-dim"
            >
              ×
            </button>
          </>
        ) : (
          // Normal mode: click opens the writing area.
          <>
            <button
              type="button"
              onClick={() => onSelect(n.id)}
              title="Open in writing area"
              className={`min-w-0 flex-1 cursor-pointer truncate text-left text-base ${
                selectedNodeId === n.id ? "font-semibold text-lilac" : "text-ink"
              }`}
            >
              {n.title || "Untitled"}
            </button>
            <button
              type="button"
              onClick={() => setEditingId(n.id)}
              aria-label="Rename outline"
              title="Rename"
              className="hidden shrink-0 cursor-pointer text-ink-dim group-hover:inline"
            >
              ✎
            </button>
            <select
              value={n.folderId ?? ""}
              onChange={(e) => setOutlineFolder(storyId, n.id, e.target.value || null)}
              aria-label="Move to folder"
              className="hidden max-w-[7rem] shrink-0 rounded border border-mist bg-transparent text-xs text-ink-dim outline-none group-hover:inline"
            >
              <option value="">Ungrouped</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title || "(folder)"}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => deleteOutlineNode(storyId, n.id)}
              aria-label="Delete"
              className="hidden shrink-0 cursor-pointer text-ink-dim group-hover:inline"
            >
              ×
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <section className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-mist px-3 py-2">
        <h2 className="text-lg font-semibold text-lilac">◈ Outline</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addOutline(null)}
            className="cursor-pointer text-sm font-semibold text-lilac"
          >
            + Outline
          </button>
          <button
            type="button"
            onClick={() => addOutlineFolder(storyId, `Folder ${folders.length + 1}`)}
            className="cursor-pointer text-sm font-semibold text-sage"
          >
            + Folder
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto px-3 py-2">
        {folders.map((f) => {
          const kids = nodesIn(f.id);
          const open = !collapsed.has(f.id);
          const editing = editingId === f.id;
          return (
            <div key={f.id}>
              <div className="group flex items-center gap-0.5 rounded-md py-0.5">
                <button
                  type="button"
                  onClick={() => toggle(f.id)}
                  aria-label={open ? "Collapse" : "Expand"}
                  className="w-4 shrink-0 cursor-pointer text-lilac"
                >
                  {open ? "▾" : "▸"}
                </button>
                <span className="shrink-0">📁</span>
                {editing ? (
                  <>
                    <input
                      autoFocus
                      value={f.title}
                      onChange={(e) => renameOutlineFolder(storyId, f.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Escape") setEditingId(null);
                      }}
                      onBlur={() => setEditingId(null)}
                      aria-label="Rename folder"
                      className="min-w-0 flex-1 rounded bg-white px-1 text-base font-medium text-ink outline-none ring-1 ring-lilac"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      aria-label="Done renaming"
                      className="shrink-0 cursor-pointer text-ink-dim"
                    >
                      ✓
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggle(f.id)}
                    className="min-w-0 flex-1 cursor-pointer truncate text-left text-base font-medium text-ink"
                  >
                    {f.title || "Untitled folder"}
                  </button>
                )}
                {!editing && (
                  <button
                    type="button"
                    onClick={() => setEditingId(f.id)}
                    aria-label="Rename folder"
                    title="Rename"
                    className="hidden shrink-0 cursor-pointer text-ink-dim group-hover:inline"
                  >
                    ✎
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteOutlineFolder(storyId, f.id)}
                  aria-label="Delete folder"
                  title="Delete folder (items become ungrouped)"
                  className="hidden shrink-0 cursor-pointer text-ink-dim group-hover:inline"
                >
                  ×
                </button>
              </div>
              {open &&
                (kids.length === 0 ? (
                  <p className="pl-6 text-sm text-ink-dim">Empty folder.</p>
                ) : (
                  kids.map(renderNode)
                ))}
            </div>
          );
        })}

        {/* Ungrouped is shown only when there are outline items not assigned to a folder. */}
        {ungrouped.length > 0 && (
          <>
            <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink-dim">
              Ungrouped
            </div>
            {ungrouped.map(renderNode)}
          </>
        )}

        {folders.length === 0 && story.outline.length === 0 && (
          <p className="mt-1 text-sm text-ink-dim">No outline yet. Add an outline or a folder.</p>
        )}
      </div>
    </section>
  );
}