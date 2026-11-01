"use client";

import { useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import {
  addMapFloodFill,
  addMapLine,
  clearMap,
  createId,
  deleteMapFill,
  deleteMapLine,
  deleteMapNote,
  deleteMapSegment,
  regenerateMap,
  setMapContent,
  setMapEnabled,
  setMapScale,
  TERRAINS,
  upsertMapNote,
  useStories,
  type MapFill,
  type MapLine,
  type MapPoint,
  type TerrainType,
} from "@/lib/story-store";
import { floodFillRects } from "@/lib/map/flood";

type Mode = "select" | "draw" | "paint" | "note" | "erase";
type LineMode = "freeform" | "straight";
type EraseMode = "line" | "partial" | "terrain";

const LINE_STROKE = "#6b6788"; // unified neutral ink — no per-feature coloring
const PARTIAL_ERASE_TOLERANCE = 1.0; // world units

function pointSegDist(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

/** Chaikin smoothing — turns hurried freehand points into fluid curves. */
function smoothPolyline(points: MapPoint[], iterations = 2): MapPoint[] {
  let out = points;
  for (let it = 0; it < iterations; it++) {
    if (out.length < 3) break;
    const next: MapPoint[] = [out[0]];
    for (let i = 0; i + 1 < out.length; i++) {
      const a = out[i];
      const b = out[i + 1];
      next.push({ x: a.x * 0.75 + b.x * 0.25, y: a.y * 0.75 + b.y * 0.25 });
      next.push({ x: a.x * 0.25 + b.x * 0.75, y: a.y * 0.25 + b.y * 0.75 });
    }
    next.push(out[out.length - 1]);
    out = next;
  }
  return out;
}

export function MapView({ storyId }: { storyId: string }) {
  const story = useStories().find((s) => s.id === storyId);
  const [mode, setMode] = useState<Mode>("select");
  const [lineMode, setLineMode] = useState<LineMode>("freeform");
  const [eraseMode, setEraseMode] = useState<EraseMode>("line");
  const [zoom, setZoom] = useState(1);
  const [draft, setDraft] = useState<MapPoint[]>([]);
  const [freehand, setFreehand] = useState<MapPoint[]>([]);
  const [freehanding, setFreehanding] = useState(false);
  const [terrain, setTerrain] = useState<TerrainType>("plain");
  const [erasing, setErasing] = useState(false);
  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [history, setHistory] = useState<{ mapLines: MapLine[]; mapFills: MapFill[] }[]>([]);
  const [future, setFuture] = useState<{ mapLines: MapLine[]; mapFills: MapFill[] }[]>([]);
  const flashTimeout = useRef<number | undefined>(undefined);

  if (!story) return null;

  if (!story.mapEnabled) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-ink">No map for this story yet.</p>
          <button
            type="button"
            onClick={() => setMapEnabled(storyId, true)}
            className="mt-3 cursor-pointer rounded-full bg-lilac px-5 py-2 text-base font-semibold text-white"
          >
            ⬡ Enable map
          </button>
        </div>
      </div>
    );
  }

  const toWorld = (e: ReactMouseEvent<SVGSVGElement>): MapPoint => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 70,
    };
  };

  // Undo: snapshot the immutable lines+fills arrays before each mutation.
  const pushHistory = () => {
    setHistory((h) => [...h, { mapLines: story.mapLines, mapFills: story.mapFills }]);
    setFuture([]);
  };
  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [...f, { mapLines: story.mapLines, mapFills: story.mapFills }]);
    setMapContent(storyId, prev);
  };
  const redo = () => {
    if (future.length === 0) return;
    const next = future[future.length - 1];
    setFuture((f) => f.slice(0, -1));
    setHistory((h) => [...h, { mapLines: story.mapLines, mapFills: story.mapFills }]);
    setMapContent(storyId, next);
  };

  const flashFill = (id: string | undefined) => {
    if (!id) return;
    setFlashId(id);
    window.clearTimeout(flashTimeout.current);
    flashTimeout.current = window.setTimeout(() => setFlashId(null), 2000);
  };

  const partialEraseAt = (p: MapPoint) => {
    let best: { lineId: string; seg: number } | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const line of story.mapLines) {
      for (let i = 0; i + 1 < line.points.length; i++) {
        const a = line.points[i];
        const b = line.points[i + 1];
        const d = pointSegDist(p.x, p.y, a.x, a.y, b.x, b.y);
        if (d < bestDist) {
          bestDist = d;
          best = { lineId: line.id, seg: i };
        }
      }
    }
    if (best && bestDist < PARTIAL_ERASE_TOLERANCE) {
      deleteMapSegment(storyId, best.lineId, best.seg);
    }
  };

  const handleCanvasClick = (e: ReactMouseEvent<SVGSVGElement>) => {
    const p = toWorld(e);
    if (mode === "draw" && lineMode === "straight") {
      if (draft.length === 0) {
        setDraft([p]);
      } else {
        pushHistory();
        addMapLine(storyId, [draft[0], p]);
        setDraft([]);
      }
    } else if (mode === "paint") {
      const rects = floodFillRects(story.mapLines, p);
      if (rects.length > 0) {
        pushHistory();
        addMapFloodFill(storyId, terrain, rects);
      }
    } else if (mode === "erase") {
      if (eraseMode === "partial") {
        pushHistory();
        partialEraseAt(p);
      }
    } else if (mode === "note") {
      upsertMapNote(storyId, {
        id: createId(),
        x: p.x,
        y: p.y,
        title: `Note ${story.mapNotes.length + 1}`,
        description: "",
      });
      setMode("select");
    }
  };

  const cancelDraft = () => {
    setDraft([]);
  };

  const commitFreehand = () => {
    if (freehand.length >= 2) {
      const smoothed = smoothPolyline(freehand);
      if (smoothed.length >= 2) {
        pushHistory();
        addMapLine(storyId, smoothed);
      }
    }
    setFreehand([]);
    setFreehanding(false);
  };

  const fillClick = (f: MapFill) => (e: ReactMouseEvent) => {
    e.stopPropagation();
    if (mode === "erase" && eraseMode === "terrain") {
      pushHistory();
      deleteMapFill(storyId, f.id);
    } else if (mode === "select") {
      flashFill(f.id);
    }
  };

  const selectedNote = story.mapNotes.find((n) => n.id === selectedNoteId) ?? null;

  const toolButton = (m: Mode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      className={`w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-sm ${
        mode === m ? "bg-lilac-soft font-semibold text-ink" : "text-ink"
      }`}
    >
      {label}
    </button>
  );

  const toggleChip = (active: boolean, label: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 cursor-pointer rounded px-1 py-0.5 text-xs ${
        active ? "bg-lilac-soft font-semibold text-lilac" : "text-ink-dim"
      }`}
    >
      {label}
    </button>
  );

  const lineProps = (l: { id: string; points: MapPoint[] }) => {
    const common = {
      points: l.points.map((p) => `${p.x},${p.y}`).join(" "),
      fill: "none" as const,
      strokeLinecap: "round" as const,
      strokeLinejoin: "round" as const,
    };
    if (mode === "erase" && eraseMode === "line") {
      return {
        ...common,
        stroke: hoveredLineId === l.id ? "#e11d48" : "#d8b4fe",
        strokeWidth: 0.6,
        className: "cursor-pointer",
        onMouseEnter: () => {
          setHoveredLineId(l.id);
          if (erasing) deleteMapLine(storyId, l.id);
        },
        onMouseLeave: () => setHoveredLineId(null),
        onClick: (e: ReactMouseEvent) => {
          e.stopPropagation();
          deleteMapLine(storyId, l.id);
        },
      };
    }
    return { ...common, stroke: LINE_STROKE, strokeWidth: 0.22 };
  };

  return (
    <div className="flex h-full">
      {/* Toolbar */}
      <aside className="w-56 shrink-0 space-y-3 overflow-auto border-r border-mist p-3">
        <h2 className="text-lg font-semibold text-ink">⬡ Map</h2>

        <div>
          <p className="mb-1 text-xs text-ink-dim">Mode</p>
          {toolButton("select", "🖱 Select")}
          {toolButton("draw", "✏️ Draw line")}
          {toolButton("paint", "🎨 Paint terrain")}
          {toolButton("erase", "🧽 Eraser")}
          {toolButton("note", "📍 Add note")}

          {mode === "draw" && (
            <div className="mt-1 flex gap-1 rounded border border-mist p-0.5">
              {toggleChip(lineMode === "freeform", "Freeform", () => setLineMode("freeform"))}
              {toggleChip(lineMode === "straight", "Straight", () => setLineMode("straight"))}
            </div>
          )}

          {mode === "erase" && (
            <div className="mt-1 flex gap-1 rounded border border-mist p-0.5">
              {toggleChip(eraseMode === "line", "Whole line", () => setEraseMode("line"))}
              {toggleChip(eraseMode === "partial", "Partial", () => setEraseMode("partial"))}
              {toggleChip(eraseMode === "terrain", "Terrain", () => setEraseMode("terrain"))}
            </div>
          )}

          {draft.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="px-1 text-xs text-ink-dim">Click a second point.</p>
              <button
                type="button"
                onClick={cancelDraft}
                className="w-full cursor-pointer rounded-md border border-mist px-2 py-1 text-xs text-ink"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={history.length === 0}
            className="flex-1 cursor-pointer rounded-md border border-mist px-2 py-1 text-sm text-ink disabled:opacity-40"
          >
            ↶ Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={future.length === 0}
            className="flex-1 cursor-pointer rounded-md border border-mist px-2 py-1 text-sm text-ink disabled:opacity-40"
          >
            ↷ Redo
          </button>
        </div>

        {mode === "paint" && (
          <div>
            <p className="mb-1 text-xs text-ink-dim">Terrain color</p>
            <div className="grid grid-cols-2 gap-1">
              {(Object.keys(TERRAINS) as TerrainType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTerrain(t)}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs ${
                    terrain === t ? "bg-lilac-soft font-semibold" : ""
                  }`}
                >
                  <span
                    className="inline-block h-4 w-4 shrink-0 rounded-full border border-mist"
                    style={{ background: TERRAINS[t].color }}
                  />
                  {TERRAINS[t].label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-1 text-xs text-ink-dim">Zoom</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="cursor-pointer rounded-l-md border border-mist px-2 py-1 text-base text-ink"
            >
              −
            </button>
            <span className="flex-1 border-y border-mist px-1 py-1 text-center text-xs text-ink">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
              className="cursor-pointer rounded-r-md border border-mist px-2 py-1 text-base text-ink"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <p className="mb-1 text-xs text-ink-dim">Map scale (next random)</p>
          <select
            value={story.mapScale}
            onChange={(e) => setMapScale(storyId, Number(e.target.value))}
            className="w-full rounded-md border border-mist bg-white px-2 py-1 text-sm"
          >
            <option value={1}>1 — Small</option>
            <option value={2}>2 — Medium</option>
            <option value={3}>3 — Large</option>
          </select>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              pushHistory();
              regenerateMap(storyId);
            }}
            className="w-full cursor-pointer rounded-md bg-sage px-2 py-1 text-sm font-semibold text-white"
          >
            🎲 Random
          </button>
          <button
            type="button"
            onClick={() => {
              pushHistory();
              clearMap(storyId);
            }}
            className="w-full cursor-pointer rounded-md border border-mist px-2 py-1 text-sm text-ink"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setMapEnabled(storyId, false)}
            className="w-full cursor-pointer rounded-md border border-mist px-2 py-1 text-sm text-ink"
          >
            Disable
          </button>
        </div>
      </aside>

      {/* Canvas */}
      <div className="min-w-0 flex-1 overflow-auto p-4">
        <svg
          viewBox="0 0 100 70"
          className="rounded-lg border border-mist bg-white"
          style={{ width: 640 * zoom, height: 448 * zoom, maxWidth: "none" }}
          onClick={handleCanvasClick}
          onMouseDown={(e) => {
            if (mode === "draw" && lineMode === "freeform") {
              const p = toWorld(e);
              setFreehanding(true);
              setFreehand([p]);
            }
            if (mode === "erase" && eraseMode === "line") {
              pushHistory();
              setErasing(true);
            }
          }}
          onMouseMove={(e) => {
            if (!freehanding) return;
            const p = toWorld(e);
            if (e.shiftKey) {
              setFreehand((prev) => (prev.length ? [prev[0], p] : [p]));
            } else {
              setFreehand((prev) => [...prev, p]);
            }
          }}
          onMouseUp={() => {
            if (freehanding) commitFreehand();
            setErasing(false);
          }}
          onMouseLeave={() => {
            if (freehanding) commitFreehand();
            setFreehanding(false);
            setErasing(false);
            setHoveredLineId(null);
          }}
        >
          {/* Filled terrain areas render UNDER the lines */}
          {story.mapFills.map((f) => (
            <g
              key={f.id}
              onClick={fillClick(f)}
              className={flashId === f.id ? "fill-flash" : undefined}
            >
              {f.rects.length > 0 ? (
                f.rects.map((r, i) => (
                  <rect
                    key={i}
                    x={r.x}
                    y={r.y}
                    width={r.w}
                    height={r.h}
                    fill={TERRAINS[f.terrain].color}
                    fillOpacity={0.45}
                  />
                ))
              ) : (
                <polygon
                  points={f.points.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill={TERRAINS[f.terrain].color}
                  fillOpacity={0.45}
                  stroke={TERRAINS[f.terrain].color}
                  strokeOpacity={0.7}
                  strokeWidth={0.08}
                />
              )}
            </g>
          ))}

          {story.mapLines.map((l) => (
            <polyline key={l.id} {...lineProps(l)} />
          ))}

          {freehanding && freehand.length > 1 && (
            <polyline
              points={freehand.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth={0.3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {draft.length === 1 && mode === "draw" && lineMode === "straight" && (
            <circle cx={draft[0].x} cy={draft[0].y} r={0.5} fill="#8b5cf6" />
          )}

          {story.mapNotes.map((n) => (
            <g
              key={n.id}
              transform={`translate(${n.x} ${n.y})`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNoteId(n.id);
              }}
              className="cursor-pointer"
            >
              <circle r={1.5} fill="#8b5cf6" stroke="#ffffff" strokeWidth={0.26} />
              {n.title && (
                <text x={2} y={0.5} fontSize={2.8} fill="#3f3d56">
                  {n.title}
                </text>
              )}
            </g>
          ))}
        </svg>

        {mode === "draw" && lineMode === "freeform" && (
          <p className="mt-2 text-sm text-ink-dim">
            Drag to draw freely; hold Shift for a straight line.
          </p>
        )}
        {mode === "draw" && lineMode === "straight" && (
          <p className="mt-2 text-sm text-ink-dim">Click the start point, then the end point.</p>
        )}
        {mode === "paint" && (
          <p className="mt-2 text-sm text-ink-dim">
            Click inside a closed area to fill it with the selected color.
          </p>
        )}
        {mode === "erase" && eraseMode === "line" && (
          <p className="mt-2 text-sm text-ink-dim">Click or drag over lines to erase whole lines.</p>
        )}
        {mode === "erase" && eraseMode === "partial" && (
          <p className="mt-2 text-sm text-ink-dim">Click a segment to delete that portion.</p>
        )}
        {mode === "erase" && eraseMode === "terrain" && (
          <p className="mt-2 text-sm text-ink-dim">Click a painted area to remove it.</p>
        )}
      </div>

      {/* Right panel: terrain areas + notes */}
      <aside className="flex w-[352px] shrink-0 flex-col border-l border-mist">
        <div className="min-h-0 basis-2/5 overflow-auto border-b border-mist">
          <header className="border-b border-mist px-3 py-2">
            <h2 className="text-lg font-semibold text-ink">🎨 Terrain areas</h2>
          </header>
          <div className="px-3 py-2">
            {story.mapFills.length === 0 ? (
              <p className="text-sm text-ink-dim">No terrains painted yet. Use “Paint terrain”.</p>
            ) : (
              <ul className="space-y-1">
                {story.mapFills.map((f) => (
                  <li key={f.id} className="flex items-center gap-2 text-sm">
                    <span
                      className="inline-block h-4 w-4 shrink-0 rounded-full border border-mist"
                      style={{ background: TERRAINS[f.terrain].color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-ink">
                      {TERRAINS[f.terrain].label}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        pushHistory();
                        deleteMapFill(storyId, f.id);
                      }}
                      className="cursor-pointer text-ink-dim hover:text-red-500"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <header className="border-b border-mist px-3 py-2">
            <h2 className="text-lg font-semibold text-ink">📍 Notes</h2>
          </header>

          <div className="min-h-0 flex-1 overflow-auto px-3 py-2">
            {story.mapNotes.length === 0 ? (
              <p className="text-sm text-ink-dim">No notes yet. Choose “Add note” and click the map.</p>
            ) : (
              <ul className="space-y-1.5">
                {story.mapNotes.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedNoteId(n.id)}
                      className={`w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-sm ${
                        selectedNoteId === n.id ? "bg-lilac-soft font-semibold" : ""
                      }`}
                    >
                      {n.title || "(untitled note)"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedNote && (
            <div className="border-t border-mist p-3">
              <div className="space-y-2">
                <input
                  value={selectedNote.title}
                  onChange={(e) => upsertMapNote(storyId, { ...selectedNote, title: e.target.value })}
                  placeholder="Note title"
                  className="w-full rounded-md border border-mist bg-white px-2 py-1 text-sm outline-none"
                />
                <textarea
                  value={selectedNote.description}
                  onChange={(e) =>
                    upsertMapNote(storyId, { ...selectedNote, description: e.target.value })
                  }
                  placeholder="Description"
                  rows={3}
                  className="w-full resize-none rounded-md border border-mist bg-white px-2 py-1 text-sm outline-none"
                />
                <p className="text-xs text-ink-dim">
                  Location: ({selectedNote.x.toFixed(1)}, {selectedNote.y.toFixed(1)})
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  deleteMapNote(storyId, selectedNote.id);
                  setSelectedNoteId(null);
                }}
                className="mt-3 w-full cursor-pointer rounded-md border border-mist px-2 py-1 text-sm text-ink hover:text-red-500"
              >
                Delete note
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}