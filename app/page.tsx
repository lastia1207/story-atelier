"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  createStory,
  emptyTrash,
  formatUpdatedAt,
  moveStoryToTrash,
  permanentlyDeleteStory,
  restoreStory,
  useHydrated,
  useStories,
  type Story,
} from "@/lib/story-store";
import { plainTextFromContent } from "@/lib/editor/content";
import { QuoteCarousel } from "@/components/quote-carousel";

function snippet(s: Story): string {
  if (s.synopsis.trim()) return s.synopsis.trim();
  const text =
    plainTextFromContent(s.content) ||
    s.chapters.map((c) => plainTextFromContent(c.content)).join(" ").trim();
  return text ? `${text.slice(0, 140)}…` : "No summary yet. Click to start writing.";
}

function ViewTab({
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
      className={`cursor-pointer border-b-2 px-1 pb-2 text-sm font-semibold transition ${
        active
          ? "border-lilac text-lilac"
          : "border-transparent text-ink-dim hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export default function Home() {
  const router = useRouter();
  const stories = useStories();
  const hydrated = useHydrated();
  const [view, setView] = useState<"stories" | "trash">("stories");

  const active = stories.filter((s) => s.deletedAt === null);
  const trashed = stories.filter((s) => s.deletedAt !== null);

  const handleNewStory = () => {
    const story = createStory();
    router.push(`/workspace/${story.id}`);
  };

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-lilac">
            Story Atelier
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Your stories, one calm room.
          </h1>
          <QuoteCarousel />
        </div>
        <button
          type="button"
          onClick={handleNewStory}
          className="cursor-pointer rounded-full bg-lilac px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-lilac-deep"
        >
          + New story
        </button>
      </header>

      <nav className="mb-6 flex gap-6">
        <ViewTab active={view === "stories"} onClick={() => setView("stories")}>
          Stories ({active.length})
        </ViewTab>
        <ViewTab active={view === "trash"} onClick={() => setView("trash")}>
          Trash ({trashed.length})
        </ViewTab>
      </nav>

      {!hydrated ? (
        <p className="text-base text-ink-dim">Loading…</p>
      ) : view === "stories" ? (
        active.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-mist bg-lilac-mist p-10 text-center">
            <p className="text-lg text-ink">You haven&apos;t written any stories yet.</p>
            <p className="mt-2 text-base text-ink-dim">
              Click &ldquo;+ New story&rdquo; to create your first one.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((s) => (
              <li key={s.id} className="group relative">
                <Link
                  href={`/workspace/${s.id}`}
                  className="block h-full rounded-2xl border border-mist bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-lilac-soft hover:shadow-md"
                >
                  <h3 className="pr-6 text-xl font-semibold text-ink group-hover:text-lilac">
                    {s.title || "Untitled story"}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-ink-dim">{snippet(s)}</p>
                  <footer className="mt-4 text-sm text-ink-dim">
                    Updated {formatUpdatedAt(s.updatedAt)}
                  </footer>
                </Link>
                <button
                  type="button"
                  onClick={() => moveStoryToTrash(s.id)}
                  aria-label="Move to Trash"
                  title="Move to Trash"
                  className="absolute right-3 top-3 cursor-pointer rounded-md px-1.5 text-lg text-ink-dim opacity-0 transition hover:text-red-500 group-hover:opacity-100"
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        )
      ) : (
        <section aria-label="Trash">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold uppercase tracking-wider text-ink">Trash</h2>
            {trashed.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Permanently delete ALL stories in Trash? This cannot be undone.")) {
                    emptyTrash();
                  }
                }}
                className="cursor-pointer rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Permanently Delete All
              </button>
            )}
          </div>

          {trashed.length === 0 ? (
            <p className="text-base text-ink-dim">Trash is empty.</p>
          ) : (
            <ul className="grid gap-3">
              {trashed.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-mist bg-white p-4 shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-ink">
                      {s.title || "Untitled story"}
                    </p>
                    <p className="text-sm text-ink-dim">
                      Deleted {formatUpdatedAt(s.deletedAt ?? s.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => restoreStory(s.id)}
                      className="cursor-pointer rounded-full bg-sage px-4 py-1.5 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Permanently delete "${s.title || "Untitled story"}"?`)) {
                          permanentlyDeleteStory(s.id);
                        }
                      }}
                      className="cursor-pointer rounded-full border border-mist px-4 py-1.5 text-sm font-semibold text-ink"
                    >
                      Delete forever
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-6 text-sm text-ink-dim">
            Stories stay in Trash indefinitely — nothing is deleted automatically.
          </p>
        </section>
      )}
    </main>
  );
}