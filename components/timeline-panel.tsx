"use client";

import { useState } from "react";
import {
  createId,
  deleteMilestone,
  setTimelineOrder,
  upsertMilestone,
  useStories,
} from "@/lib/story-store";
import { AutoTextarea } from "@/components/auto-textarea";

interface OutlineOption {
  id: string;
  title: string;
}

/** Link-outline selector: closed by default; opening reveals up to 5 options
 *  (scrollable beyond that) with a magnifier that toggles an inline search
 *  input. The input disappears again when the search is finished or dismissed. */
function OutlineLinkSelect({
  value,
  options,
  onChange,
}: {
  value: string | null;
  options: OutlineOption[];
  onChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.id === value);
  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter((o) => (o.title || "(untitled)").toLowerCase().includes(q))
    : options;

  const closeAll = () => {
    setOpen(false);
    setSearchOpen(false);
    setQuery("");
  };

  return (
    <div className="min-w-0 flex-1">
      <button
        type="button"
        aria-label="Link to outline section"
        aria-expanded={open}
        title="Link to outline section"
        onClick={() => {
          if (open) closeAll();
          else setOpen(true);
        }}
        className="w-full cursor-pointer truncate text-left text-xs text-ink-dim hover:text-ink"
      >
        {selected ? selected.title || "(untitled)" : "— link outline —"}
      </button>

      {open && (
        <div className="mt-1 rounded-md border border-mist bg-white p-1 shadow-sm">
          {/* Magnifier first — it toggles the search input on/off. */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Search outline options"
              title={searchOpen ? "Hide search" : "Search"}
              onClick={() => {
                setSearchOpen(!searchOpen);
                setQuery(""); // re-clicking the magnifier to hide also clears the query
              }}
              className="cursor-pointer text-xs leading-none"
            >
              🔍
            </button>
            {searchOpen && (
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  // Enter finishes the search; Escape dismisses it.
                  if (e.key === "Enter" || e.key === "Escape") {
                    setSearchOpen(false);
                    setQuery("");
                  }
                }}
                placeholder="Search outline…"
                aria-label="Search outline options"
                className="min-w-0 flex-1 rounded border border-mist px-1 text-xs outline-none"
              />
            )}
          </div>

          {/* Up to 5 options visible; scrollbar for the rest. */}
          <ul className="mt-1 max-h-[8.75rem] overflow-y-auto">
            <li>
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  closeAll();
                }}
                className={`block h-7 w-full cursor-pointer truncate rounded px-1.5 text-left text-xs ${
                  value === null ? "bg-sage-soft font-semibold text-sage" : "text-ink-dim hover:bg-lilac-mist"
                }`}
              >
                — link outline —
              </button>
            </li>
            {filtered.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.id);
                    closeAll();
                  }}
                  className={`block h-7 w-full cursor-pointer truncate rounded px-1.5 text-left text-xs ${
                    value === o.id
                      ? "bg-sage-soft font-semibold text-sage"
                      : "text-ink hover:bg-lilac-mist"
                  }`}
                >
                  {o.title || "(untitled)"}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-1.5 py-1 text-xs text-ink-dim">No outline items match.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function TimelinePanel({
  storyId,
  selectedNodeId,
}: {
  storyId: string;
  selectedNodeId: string | null;
}) {
  const story = useStories().find((s) => s.id === storyId);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  if (!story) return null;

  const outlineOptions: OutlineOption[] = story.outline.map((n) => ({
    id: n.id,
    title: n.title,
  }));

  const add = () =>
    upsertMilestone(storyId, {
      id: createId(),
      timestamp: "",
      title: "",
      summary: "",
      outlineNodeId: null,
    });

  /** Drop `dragId` onto the item with id `targetId` (or the end of the list). */
  const dropOn = (targetId: string | null) => {
    const drag = dragId;
    setDragId(null);
    setOverId(null);
    if (!drag || drag === targetId) return;
    const ids = story.timeline.map((m) => m.id);
    const from = ids.indexOf(drag);
    if (from === -1) return;
    ids.splice(from, 1);
    const to = targetId ? ids.indexOf(targetId) : ids.length;
    if (to === -1) return;
    ids.splice(to, 0, drag);
    setTimelineOrder(storyId, ids);
  };

  return (
    <section className="flex flex-col">
      <header className="flex items-center justify-between border-b border-mist px-3 py-2">
        <h2 className="text-lg font-semibold text-sage">● Timeline</h2>
        <button
          type="button"
          onClick={add}
          className="cursor-pointer text-sm font-semibold text-sage"
        >
          + Milestone
        </button>
      </header>

      <div className="px-3 py-2">
        {story.timeline.length === 0 ? (
          <p className="text-sm text-ink-dim">No milestones yet.</p>
        ) : (
          <ul
            className="relative space-y-2 border-l-2 border-sage-soft pl-4"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              dropOn(null); // dropping on empty space moves the item to the end
            }}
          >
            {story.timeline.map((m) => {
              const linked = m.outlineNodeId && m.outlineNodeId === selectedNodeId;
              const isOver = overId === m.id && dragId !== null && dragId !== m.id;
              return (
                <li
                  key={m.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOverId(m.id);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    dropOn(m.id);
                  }}
                  className={`relative rounded-lg ${
                    isOver ? "ring-2 ring-lilac" : ""
                  } ${dragId === m.id ? "opacity-50" : ""}`}
                >
                  <span
                    className={`absolute -left-[23px] top-1 h-4 w-4 rounded-full border-2 border-white ${
                      linked ? "bg-lilac" : "bg-sage"
                    }`}
                  />
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <div className="flex items-start gap-1">
                      {/* Drag handle — grab and move the milestone anywhere. */}
                      <span
                        draggable
                        onDragStart={(e) => {
                          setDragId(m.id);
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", m.id);
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverId(null);
                        }}
                        aria-label="Drag to reorder milestone"
                        title="Drag to reorder"
                        className="mt-0.5 shrink-0 cursor-grab select-none text-xs text-ink-dim/60 hover:text-sage active:cursor-grabbing"
                      >
                        ⠿
                      </span>
                      <div className="min-w-0 flex-1">
                        <input
                          value={m.timestamp}
                          onChange={(e) =>
                            upsertMilestone(storyId, { ...m, timestamp: e.target.value })
                          }
                          placeholder="Time (e.g. Day 1 — 08:00)"
                          aria-label="Milestone time"
                          className="w-full bg-transparent text-xs font-semibold text-sage outline-none"
                        />
                        <input
                          value={m.title}
                          onChange={(e) =>
                            upsertMilestone(storyId, { ...m, title: e.target.value })
                          }
                          placeholder="Milestone title"
                          aria-label="Milestone title"
                          className="mt-0.5 w-full bg-transparent text-base font-medium text-ink outline-none"
                        />
                        <AutoTextarea
                          value={m.summary}
                          onChange={(e) =>
                            upsertMilestone(storyId, { ...m, summary: e.target.value })
                          }
                          placeholder="Brief summary"
                          aria-label="Milestone summary"
                          className="w-full bg-transparent text-sm text-ink-dim outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteMilestone(storyId, m.id)}
                        aria-label="Delete milestone"
                        className="shrink-0 cursor-pointer text-xs text-ink-dim"
                      >
                        ×
                      </button>
                    </div>
                    <div className="mt-1">
                      <OutlineLinkSelect
                        value={m.outlineNodeId}
                        options={outlineOptions}
                        onChange={(nid) => upsertMilestone(storyId, { ...m, outlineNodeId: nid })}
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}