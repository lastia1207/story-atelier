"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import {
  renameChapterItem,
  updateChapterContent,
  updateOutlineContent,
  updateStory,
  upsertOutlineNode,
  useHydrated,
  useStories,
} from "@/lib/story-store";
import { ChaptersPanel } from "@/components/chapters-panel";
import { OutlinePanel } from "@/components/outline-panel";
import { TimelinePanel } from "@/components/timeline-panel";
import { CharactersPanel } from "@/components/characters-panel";
import { CharacterEditor } from "@/components/character-editor";
import { MapView } from "@/components/map-view";
import { RichEditor } from "@/components/rich-editor";

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-md px-3 py-1 text-sm font-semibold transition ${
        active ? "bg-lilac text-white" : "text-ink-dim hover:bg-lilac-soft"
      }`}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Resizable side columns — the writer drags the thin dividers between the
// panels to shrink/grow the writing area. Widths persist in localStorage.
// ---------------------------------------------------------------------------

const LAYOUT_KEY = "story-atelier:layout:v1";
const LEFT_MIN = 200;
const LEFT_MAX = 560;
const RIGHT_MIN = 260;
const RIGHT_MAX = 760;
const DEFAULT_LAYOUT = { left: 330, right: 420 };

const clampLeft = (px: number) => Math.min(LEFT_MAX, Math.max(LEFT_MIN, px));
const clampRight = (px: number) => Math.min(RIGHT_MAX, Math.max(RIGHT_MIN, px));

function readLayout(): { left: number; right: number } {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  try {
    const raw = window.localStorage.getItem(LAYOUT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { left?: unknown; right?: unknown };
      const left = Number(parsed.left);
      const right = Number(parsed.right);
      return {
        left: clampLeft(Number.isFinite(left) ? left : DEFAULT_LAYOUT.left),
        right: clampRight(Number.isFinite(right) ? right : DEFAULT_LAYOUT.right),
      };
    }
  } catch {
    // fall through to defaults
  }
  return DEFAULT_LAYOUT;
}

function writeLayout(layout: { left: number; right: number }): void {
  try {
    window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  } catch {
    // Storage unavailable — non-critical, ignore.
  }
}

/** A thin vertical divider: drag it left/right to resize the adjacent panels. */
function ColumnDivider({
  label,
  onMove,
  onEnd,
}: {
  label: string;
  onMove: (deltaPx: number) => void;
  onEnd: () => void;
}) {
  const lastX = useRef(0);
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      title="Drag to resize"
      onPointerDown={(e) => {
        e.preventDefault(); // avoid starting a text selection while dragging
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        lastX.current = e.clientX;
      }}
      onPointerMove={(e) => {
        if (e.buttons !== 1) return;
        onMove(e.clientX - lastX.current);
        lastX.current = e.clientX;
      }}
      onPointerUp={onEnd}
      onPointerCancel={onEnd}
      className="group relative z-10 w-2 shrink-0 cursor-col-resize touch-none bg-transparent transition-colors hover:bg-lilac-soft active:bg-lilac-soft"
    >
      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-mist transition-colors group-hover:bg-lilac group-active:bg-lilac" />
    </div>
  );
}

export function Workspace({ id }: { id: string }) {
  const stories = useStories();
  const hydrated = useHydrated();
  const story = stories.find((s) => s.id === id);
  const [view, setView] = useState<"write" | "map">("write");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [activeOutlineId, setActiveOutlineId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<"chapters" | "outline">("chapters");
  const [charEditor, setCharEditor] = useState(false);
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [layoutLoaded, setLayoutLoaded] = useState(false);

  if (!hydrated) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14">
        <p className="text-lg text-ink-dim">Loading…</p>
      </main>
    );
  }

  // Load the persisted widths once on the client, before first paint of the
  // workspace, so the columns don't visibly jump from defaults.
  if (!layoutLoaded) {
    setLayout(readLayout());
    setLayoutLoaded(true);
  }

  if (!story) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14 text-center">
        <h1 className="text-2xl font-bold text-ink">Story not found</h1>
        <p className="mt-2 text-base text-ink-dim">This story may have been deleted.</p>
        <Link
          href="/"
          className="mt-6 inline-block text-base font-semibold text-lilac hover:text-lilac-deep"
        >
          ← Back to all stories
        </Link>
      </main>
    );
  }

  const activeOutline = activeOutlineId
    ? story.outline.find((n) => n.id === activeOutlineId) ?? null
    : null;
  const activeChapter = activeOutline
    ? null
    : story.chapters.find((c) => c.id === activeChapterId) ?? story.chapters[0] ?? null;
  const chapterNumber = activeChapter
    ? story.chapters.findIndex((c) => c.id === activeChapter.id) + 1
    : 1;

  // Selecting a chapter shows the manuscript; selecting an outline node shows
  // its editor. Both leave Character Editor mode so the writing area matches.
  const selectChapter = (cid: string) => {
    setActiveChapterId(cid);
    setActiveOutlineId(null);
    setCharEditor(false);
  };
  const selectOutline = (nid: string) => {
    setSelectedNodeId(nid);
    setActiveOutlineId(nid);
    setCharEditor(false);
  };

  return (
    <main className="flex h-screen flex-col overflow-hidden">
      <header className="flex items-center gap-4 border-b border-mist bg-lilac-mist/60 px-4 py-2">
        <Link href="/" className="shrink-0 text-sm font-semibold text-lilac hover:text-lilac-deep">
          ← Stories
        </Link>
        <input
          value={story.title}
          onChange={(e) => updateStory(id, { title: e.target.value })}
          placeholder="Untitled story"
          aria-label="Story title"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-lg font-bold text-ink outline-none placeholder:text-ink-dim/40"
        />
        <nav className="flex gap-1">
          <TabButton active={view === "write"} onClick={() => setView("write")}>
            ✏️ Write
          </TabButton>
          <TabButton active={view === "map"} onClick={() => setView("map")}>
            ⬡ Map
          </TabButton>
        </nav>
      </header>

      {view === "write" ? (
        <div className="flex min-h-0 flex-1">
          <aside
            style={{ width: layout.left }}
            className="flex min-h-0 shrink-0 flex-col overflow-hidden border-r border-mist bg-lilac-mist/40"
          >
            <div className="flex border-b border-mist">
              {(
                [
                  ["chapters", "📚 Chapters"],
                  ["outline", "◈ Outline"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLeftTab(key)}
                  className={`flex-1 cursor-pointer px-2 py-1.5 text-sm font-semibold ${
                    leftTab === key ? "bg-white text-lilac" : "text-ink-dim hover:bg-white/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              {leftTab === "chapters" ? (
                <ChaptersPanel
                  storyId={id}
                  activeChapterId={activeChapterId}
                  onSelectChapter={selectChapter}
                />
              ) : (
                <OutlinePanel
                  storyId={id}
                  selectedNodeId={selectedNodeId}
                  onSelect={selectOutline}
                />
              )}
            </div>
          </aside>

          <ColumnDivider
            label="Resize chapters/outline column"
            onMove={(dx) => setLayout((l) => ({ ...l, left: clampLeft(l.left + dx) }))}
            onEnd={() => writeLayout(layout)}
          />

          <section className="flex min-h-0 min-w-0 flex-1 flex-col">
            {charEditor ? (
              <div className="flex min-h-0 flex-1 flex-col px-6 py-4">
                <CharacterEditor storyId={id} onClose={() => setCharEditor(false)} />
              </div>
            ) : (
              <div className="min-h-0 flex-1 overflow-auto px-6 py-8">
                {activeOutline ? (
                  <>
                    <h1 className="flex items-baseline gap-2 text-2xl font-bold text-sage">
                      <span className="shrink-0">Outline —</span>
                      <input
                        value={activeOutline.title}
                        onChange={(e) =>
                          upsertOutlineNode(id, { ...activeOutline, title: e.target.value })
                        }
                        aria-label="Outline title"
                        placeholder="Untitled"
                        spellCheck={false}
                        className="min-w-0 flex-1 bg-transparent text-2xl font-bold text-sage outline-none placeholder:text-sage/40"
                      />
                    </h1>
                    <RichEditor
                      key={activeOutline.id}
                      initialContent={activeOutline.content}
                      onUpdate={(v) => updateOutlineContent(id, activeOutline.id, v)}
                    />
                  </>
                ) : activeChapter ? (
                  <>
                    <h1 className="flex items-baseline gap-2 text-2xl font-bold text-lilac">
                      <span className="shrink-0">Chapter {chapterNumber} —</span>
                      <input
                        value={activeChapter.title}
                        onChange={(e) => renameChapterItem(id, activeChapter.id, e.target.value)}
                        aria-label="Chapter title"
                        placeholder="Untitled"
                        spellCheck={false}
                        className="font-story min-w-0 flex-1 bg-transparent text-2xl font-bold text-lilac outline-none placeholder:text-lilac/40"
                      />
                    </h1>
                    <RichEditor
                      key={activeChapter.id}
                      initialContent={activeChapter.content}
                      onUpdate={(v) => updateChapterContent(id, activeChapter.id, v)}
                    />
                  </>
                ) : (
                  <h1 className="text-2xl font-bold text-lilac">No chapter yet</h1>
                )}
              </div>
            )}
          </section>

          <ColumnDivider
            label="Resize timeline/characters column"
            onMove={(dx) => setLayout((l) => ({ ...l, right: clampRight(l.right - dx) }))}
            onEnd={() => writeLayout(layout)}
          />

          <aside
            style={{ width: layout.right }}
            className="flex min-h-0 shrink-0 flex-col overflow-hidden border-l border-mist"
          >
            <div className="min-h-0 flex-1 overflow-auto border-b border-mist">
              <TimelinePanel storyId={id} selectedNodeId={selectedNodeId} />
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <CharactersPanel
                storyId={id}
                editorOpen={charEditor}
                onToggleEditor={() => setCharEditor((v) => !v)}
              />
            </div>
          </aside>
        </div>
      ) : (
        <div className="min-h-0 flex-1">
          <MapView storyId={id} />
        </div>
      )}
    </main>
  );
}