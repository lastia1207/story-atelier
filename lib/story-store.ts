// Single source of truth for stories and all of their sub-modules, persisted
// in localStorage. Exposed as an external store via `useSyncExternalStore` so
// every panel reactively re-renders on change (React 19 pattern — no
// setState-in-effect). The Trash workflow keeps stories recoverable forever:
// there is intentionally NO expiration/auto-delete; removal is always manual.

import { useSyncExternalStore } from "react";

// Outline items are grouped into FOLDERS (folder membership) rather than
// nested via parentId.
export interface OutlineNode {
  id: string;
  title: string;
  summary: string;
  folderId: string | null; // null = ungrouped
  content: string; // rich-text body (TipTap JSON string), editable in the writing area
}

export interface OutlineFolder {
  id: string;
  title: string;
}

export interface TimelineMilestone {
  id: string;
  timestamp: string; // free-text in-story date/time, e.g. "Day 1 — 08:00"
  title: string;
  summary: string;
  outlineNodeId: string | null; // bidirectional link to the outline
}

export interface CharacterField {
  id: string;
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "boolean";
}

export interface Character {
  id: string;
  name: string;
  role: string;
  summary: string; // brief multi-line description shown in the simplified panel view
  data: Record<string, string>; // values keyed by CharacterField.key
}

// Chapters are a flat, ordered list (no folders — folders now live in Outline).
export interface ChapterItem {
  id: string;
  title: string;
  content: string;
}

// Line-based map model. Lines are PURE GEOMETRY (no color/style) — styling is
// deliberately left to a separate process. Notes are located annotations.
// Fills are painted terrain areas for visual distinction.
export interface MapPoint {
  x: number;
  y: number;
}

export interface MapLine {
  id: string;
  points: MapPoint[];
}

export interface MapNote {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
}

export type TerrainType =
  | "ocean"
  | "lake"
  | "river"
  | "stream"
  | "plain"
  | "countryside"
  | "forest"
  | "mountain"
  | "desert"
  | "city";

export interface MapFill {
  id: string;
  terrain: TerrainType;
  points: MapPoint[]; // lasso polygon fills (manual "Paint terrain")
  rects: { x: number; y: number; w: number; h: number }[]; // raster flood-fill areas
}

export const TERRAINS: Record<TerrainType, { label: string; color: string }> = {
  // Water features: distinct hues + lightness steps so they never blur together.
  ocean: { label: "Ocean", color: "#8fb8dc" }, // medium blue
  lake: { label: "Lake", color: "#7fccbe" }, // teal — hue-shifted from the blues
  river: { label: "River", color: "#4a7fb5" }, // deep blue — darkest water
  stream: { label: "Stream", color: "#d6ecf5" }, // ice pale — lightest water
  plain: { label: "Plain", color: "#cde8c6" },
  countryside: { label: "Countryside", color: "#d6e3a8" }, // olive-lime, distinct from plain/forest
  forest: { label: "Forest", color: "#7fa768" }, // darkened for clear contrast vs plain/countryside
  mountain: { label: "Mountain", color: "#9b93c9" }, // cool violet — high contrast vs City
  desert: { label: "Desert", color: "#f2ddc0" },
  city: { label: "City", color: "#d98f7a" }, // warm terracotta — high contrast vs Mountain
};

export interface Story {
  id: string;
  title: string;
  synopsis: string;
  content: string;
  chapters: ChapterItem[];
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null; // null = active; timestamp = in Trash

  outline: OutlineNode[];
  outlineFolders: OutlineFolder[];
  timeline: TimelineMilestone[];
  characterFields: CharacterField[];
  characters: Character[];

  mapEnabled: boolean;
  mapLines: MapLine[];
  mapFills: MapFill[];
  mapNotes: MapNote[];
  mapScale: number; // world size/detail (1–3), used by random generation
  mapSeed: number | null;
}

const STORAGE_KEY = "story-atelier:stories:v1";

// Stable reference returned by the server snapshot. Returning a fresh array
// on every call makes `useSyncExternalStore` re-render forever (infinite loop).
const EMPTY: Story[] = [];

const listeners = new Set<() => void>();
let cachedSnapshot: Story[] | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

type LegacyChapter = {
  id?: string;
  parentId?: string | null;
  kind?: string;
  title?: string;
  content?: string;
};

/** Normalize persisted records so older shapes gain all new fields (migration). */
function normalize(raw: Partial<Story> & { id: string }): Story {
  const story: Story = {
    title: "",
    synopsis: "",
    content: "",
    chapters: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    deletedAt: null,
    outline: [],
    outlineFolders: [],
    timeline: [],
    characterFields: [],
    characters: [],
    mapEnabled: false,
    mapLines: [],
    mapFills: [],
    mapNotes: [],
    mapScale: 1,
    mapSeed: null,
    ...raw,
  };

  // Chapters: flatten the old folder-era chapter tree (drop folders).
  story.chapters = ((story.chapters ?? []) as unknown as LegacyChapter[])
    .filter((c) => c.kind !== "folder")
    .map((c) => ({
      id: String(c.id ?? ""),
      title: String(c.title ?? ""),
      content: typeof c.content === "string" ? c.content : "",
    }));

  if (story.chapters.length === 0 && story.content.trim()) {
    story.chapters = [{ id: createId(), title: "Chapter 1", content: story.content }];
  }

  // Outline: flatten legacy parent/child nesting and normalize folderId.
  story.outline = ((story.outline ?? []) as unknown as Array<Record<string, unknown>>).map((n) => ({
    id: String(n.id ?? ""),
    title: String(n.title ?? ""),
    summary: typeof n.summary === "string" ? n.summary : "",
    folderId: typeof n.folderId === "string" ? (n.folderId as string) : null,
    content: typeof n.content === "string" ? n.content : "",
  }));

  const folderIds = new Set((story.outlineFolders ?? []).map((f) => f.id));
  story.outline = story.outline.map((n) =>
    n.folderId && !folderIds.has(n.folderId) ? { ...n, folderId: null } : n,
  );

  // Characters: gain the multi-line `summary` field for legacy records.
  story.characters = ((story.characters ?? []) as unknown as Array<Record<string, unknown>>).map(
    (c) => ({
      id: String(c.id ?? ""),
      name: typeof c.name === "string" ? c.name : "",
      role: typeof c.role === "string" ? c.role : "",
      summary: typeof c.summary === "string" ? c.summary : "",
      data:
        c.data && typeof c.data === "object" && !Array.isArray(c.data)
          ? (c.data as Record<string, string>)
          : {},
    }),
  );

  story.mapFills = (story.mapFills ?? []).map((f) => ({
    ...f,
    points: Array.isArray(f.points) ? f.points : [],
    rects: Array.isArray(f.rects) ? f.rects : [],
  }));

  // Drop the removed `meta` field from any persisted notes.
  story.mapNotes = (story.mapNotes ?? []).map((n) => ({
    id: String(n.id ?? ""),
    x: n.x ?? 0,
    y: n.y ?? 0,
    title: typeof n.title === "string" ? n.title : "",
    description: typeof n.description === "string" ? n.description : "",
  }));

  return story;
}

function readAll(): Story[] {
  if (!isBrowser()) return [];
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    const parsed = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsed)
      ? parsed.map((r: Partial<Story> & { id: string }) => normalize(r))
      : [];
  } catch {
    return [];
  }
}

function writeAll(stories: Story[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
  } catch {
    // Storage unavailable (private mode / quota) — fail silently.
  }
}

function computeSnapshot(): Story[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

function emitChange(): void {
  cachedSnapshot = null;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  if (!isBrowser()) return () => {};
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): Story[] {
  if (!isBrowser()) return EMPTY;
  if (cachedSnapshot === null) cachedSnapshot = computeSnapshot();
  return cachedSnapshot;
}

function getServerSnapshot(): Story[] {
  return EMPTY; // cached — never allocate per call
}

/** Reactive list of all stories (active + trashed), most-recently-updated first. */
export function useStories(): Story[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** True once the app has hydrated on the client (false during SSR). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** Apply a mutation to one story, bump `updatedAt`, persist, and notify. */
function op(id: string, fn: (story: Story) => Story): Story | undefined {
  const stories = readAll();
  const idx = stories.findIndex((s) => s.id === id);
  if (idx === -1) return undefined;
  stories[idx] = { ...fn(stories[idx]), updatedAt: Date.now() };
  writeAll(stories);
  emitChange();
  return stories[idx];
}

export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createStory(partial: Partial<Story> = {}): Story {
  const now = Date.now();
  const firstChapter: ChapterItem = { id: createId(), title: "Chapter 1", content: "" };
  const story = normalize({
    id: createId(),
    createdAt: now,
    updatedAt: now,
    chapters: [firstChapter],
    ...partial,
  });
  writeAll([story, ...readAll()]);
  emitChange();
  return story;
}

export function updateStory(
  id: string,
  patch: Partial<Omit<Story, "id" | "createdAt">>,
): Story | undefined {
  return op(id, (s) => ({ ...s, ...patch }));
}

// ---------------------------------------------------------------------------
// Trash workflow — stories remain in Trash indefinitely; no auto-delete ever.
// ---------------------------------------------------------------------------

export function moveStoryToTrash(id: string): Story | undefined {
  return op(id, (s) => ({ ...s, deletedAt: Date.now() }));
}

export function restoreStory(id: string): Story | undefined {
  return op(id, (s) => ({ ...s, deletedAt: null }));
}

export function permanentlyDeleteStory(id: string): void {
  writeAll(readAll().filter((s) => s.id !== id));
  emitChange();
}

export function emptyTrash(): void {
  writeAll(readAll().filter((s) => s.deletedAt === null));
  emitChange();
}

// ---------------------------------------------------------------------------
// Chapters (flat, ordered list — folders live in Outline)
// ---------------------------------------------------------------------------

export function addChapterItem(storyId: string, title: string): Story | undefined {
  return op(storyId, (s) => ({
    ...s,
    chapters: [...s.chapters, { id: createId(), title, content: "" }],
  }));
}

export function renameChapterItem(storyId: string, id: string, title: string): Story | undefined {
  return op(storyId, (s) => ({
    ...s,
    chapters: s.chapters.map((c) => (c.id === id ? { ...c, title } : c)),
  }));
}

export function updateChapterContent(storyId: string, id: string, content: string): Story | undefined {
  return op(storyId, (s) => ({
    ...s,
    chapters: s.chapters.map((c) => (c.id === id ? { ...c, content } : c)),
  }));
}

export function deleteChapterItem(storyId: string, id: string): Story | undefined {
  return op(storyId, (s) => ({ ...s, chapters: s.chapters.filter((c) => c.id !== id) }));
}

// ---------------------------------------------------------------------------
// Outline (folder membership) — folders + outline items
// ---------------------------------------------------------------------------

export function upsertOutlineNode(storyId: string, node: OutlineNode): Story | undefined {
  return op(storyId, (s) => {
    const normalized: OutlineNode = { ...node, folderId: node.folderId ?? null };
    const exists = s.outline.some((n) => n.id === node.id);
    return {
      ...s,
      outline: exists
        ? s.outline.map((n) => (n.id === node.id ? normalized : n))
        : [...s.outline, normalized],
    };
  });
}

export function deleteOutlineNode(storyId: string, nodeId: string): Story | undefined {
  return op(storyId, (s) => ({
    ...s,
    outline: s.outline.filter((n) => n.id !== nodeId),
    timeline: s.timeline.map((m) =>
      m.outlineNodeId === nodeId ? { ...m, outlineNodeId: null } : m,
    ),
  }));
}

/** Update an outline node's body (rich text), edited in the writing area. */
export function updateOutlineContent(storyId: string, id: string, content: string): Story | undefined {
  return op(storyId, (s) => ({
    ...s,
    outline: s.outline.map((n) => (n.id === id ? { ...n, content } : n)),
  }));
}

/** Move an existing outline item into a folder (or null = ungrouped). */
export function setOutlineFolder(
  storyId: string,
  nodeId: string,
  folderId: string | null,
): Story | undefined {
  return op(storyId, (s) => ({
    ...s,
    outline: s.outline.map((n) => (n.id === nodeId ? { ...n, folderId } : n)),
  }));
}

export function addOutlineFolder(storyId: string, title: string): Story | undefined {
  return op(storyId, (s) => ({
    ...s,
    outlineFolders: [...s.outlineFolders, { id: createId(), title }],
  }));
}

export function renameOutlineFolder(storyId: string, id: string, title: string): Story | undefined {
  return op(storyId, (s) => ({
    ...s,
    outlineFolders: s.outlineFolders.map((f) => (f.id === id ? { ...f, title } : f)),
  }));
}

export function deleteOutlineFolder(storyId: string, folderId: string): Story | undefined {
  return op(storyId, (s) => ({
    ...s,
    outlineFolders: s.outlineFolders.filter((f) => f.id !== folderId),
    // members become ungrouped, never deleted
    outline: s.outline.map((n) => (n.folderId === folderId ? { ...n, folderId: null } : n)),
  }));
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export function upsertMilestone(storyId: string, m: TimelineMilestone): Story | undefined {
  return op(storyId, (s) => {
    const exists = s.timeline.some((x) => x.id === m.id);
    return {
      ...s,
      timeline: exists
        ? s.timeline.map((x) => (x.id === m.id ? m : x))
        : [...s.timeline, m],
    };
  });
}

export function deleteMilestone(storyId: string, id: string): Story | undefined {
  return op(storyId, (s) => ({ ...s, timeline: s.timeline.filter((m) => m.id !== id) }));
}

/** Reorder the timeline by supplying the full list of milestone ids in the
 *  new order. Ids missing from the list keep their relative order at the end. */
export function setTimelineOrder(storyId: string, orderedIds: string[]): Story | undefined {
  return op(storyId, (s) => {
    const byId = new Map(s.timeline.map((m) => [m.id, m] as const));
    const next: TimelineMilestone[] = [];
    for (const mid of orderedIds) {
      const m = byId.get(mid);
      if (m) {
        next.push(m);
        byId.delete(mid);
      }
    }
    for (const m of s.timeline) if (byId.has(m.id)) next.push(m);
    return { ...s, timeline: next };
  });
}

// ---------------------------------------------------------------------------
// Characters (dynamic columns)
// ---------------------------------------------------------------------------

export function upsertCharacter(storyId: string, c: Character): Story | undefined {
  return op(storyId, (s) => {
    const exists = s.characters.some((x) => x.id === c.id);
    return {
      ...s,
      characters: exists
        ? s.characters.map((x) => (x.id === c.id ? c : x))
        : [...s.characters, c],
    };
  });
}

export function deleteCharacter(storyId: string, id: string): Story | undefined {
  return op(storyId, (s) => ({ ...s, characters: s.characters.filter((c) => c.id !== id) }));
}

export function upsertCharacterField(storyId: string, f: CharacterField): Story | undefined {
  return op(storyId, (s) => {
    const exists = s.characterFields.some((x) => x.id === f.id);
    return {
      ...s,
      characterFields: exists
        ? s.characterFields.map((x) => (x.id === f.id ? f : x))
        : [...s.characterFields, f],
    };
  });
}

export function deleteCharacterField(storyId: string, fieldId: string): Story | undefined {
  return op(storyId, (s) => {
    const field = s.characterFields.find((f) => f.id === fieldId);
    if (!field) return s;
    return {
      ...s,
      characterFields: s.characterFields.filter((f) => f.id !== fieldId),
      characters: s.characters.map((c) => {
        if (!(field.key in c.data)) return c;
        const data = { ...c.data };
        delete data[field.key];
        return { ...c, data };
      }),
    };
  });
}

// ---------------------------------------------------------------------------
// Map — line-based vector rendering; random gen produces geometry only.
// ---------------------------------------------------------------------------

export function setMapEnabled(storyId: string, enabled: boolean): Story | undefined {
  return op(storyId, (s) => {
    if (!enabled) return { ...s, mapEnabled: false };
    if (s.mapLines.length > 0) return { ...s, mapEnabled: true };
    const seed = randomSeed();
    return { ...s, mapEnabled: true, mapSeed: seed, mapLines: generateMapLines(seed, s.mapScale) };
  });
}

export function setMapScale(storyId: string, scale: number): Story | undefined {
  return op(storyId, (s) => ({ ...s, mapScale: scale }));
}

export function regenerateMap(storyId: string): Story | undefined {
  return op(storyId, (s) => {
    const seed = randomSeed();
    return {
      ...s,
      mapSeed: seed,
      mapLines: generateMapLines(seed, s.mapScale),
      mapFills: [], // reset all terrain paint data along with the lines
    };
  });
}

export function clearMap(storyId: string): Story | undefined {
  return op(storyId, (s) => ({ ...s, mapLines: [], mapFills: [], mapNotes: [] }));
}

export function addMapLine(storyId: string, points: MapPoint[]): Story | undefined {
  return op(storyId, (s) => ({ ...s, mapLines: [...s.mapLines, { id: createId(), points }] }));
}

export function deleteMapLine(storyId: string, id: string): Story | undefined {
  return op(storyId, (s) => ({ ...s, mapLines: s.mapLines.filter((l) => l.id !== id) }));
}

export function addMapFloodFill(
  storyId: string,
  terrain: TerrainType,
  rects: { x: number; y: number; w: number; h: number }[],
): Story | undefined {
  return op(storyId, (s) => ({
    ...s,
    mapFills: [...s.mapFills, { id: createId(), terrain, points: [], rects }],
  }));
}

/** Delete a single segment of a polyline: removes a 2-point line entirely, or
 *  splits a longer polyline at the given segment into two lines. */
export function deleteMapSegment(
  storyId: string,
  lineId: string,
  segmentIndex: number,
): Story | undefined {
  return op(storyId, (s) => {
    const line = s.mapLines.find((l) => l.id === lineId);
    if (!line) return s;
    const pts = line.points;
    if (pts.length <= 2) {
      return { ...s, mapLines: s.mapLines.filter((l) => l.id !== lineId) };
    }
    const prefix = pts.slice(0, segmentIndex + 1);
    const suffix = pts.slice(segmentIndex + 1);
    const next: MapLine[] = s.mapLines.filter((l) => l.id !== lineId);
    if (prefix.length >= 2) next.push({ id: createId(), points: prefix });
    if (suffix.length >= 2) next.push({ id: createId(), points: suffix });
    return { ...s, mapLines: next };
  });
}

export function deleteMapFill(storyId: string, id: string): Story | undefined {
  return op(storyId, (s) => ({ ...s, mapFills: s.mapFills.filter((f) => f.id !== id) }));
}

/** Replace map lines + fills wholesale (used by undo/redo). */
export function setMapContent(
  storyId: string,
  content: { mapLines: MapLine[]; mapFills: MapFill[] },
): Story | undefined {
  return op(storyId, (s) => ({ ...s, mapLines: content.mapLines, mapFills: content.mapFills }));
}

export function upsertMapNote(storyId: string, note: MapNote): Story | undefined {
  return op(storyId, (s) => {
    const exists = s.mapNotes.some((n) => n.id === note.id);
    return {
      ...s,
      mapNotes: exists
        ? s.mapNotes.map((n) => (n.id === note.id ? note : n))
        : [...s.mapNotes, note],
    };
  });
}

export function deleteMapNote(storyId: string, id: string): Story | undefined {
  return op(storyId, (s) => ({ ...s, mapNotes: s.mapNotes.filter((n) => n.id !== id) }));
}

function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic 2D Perlin (gradient) noise, returning values in [-1, 1]. */
function createPerlin2(seed: number): (x: number, y: number) => number {
  const rand = mulberry32(seed);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];

  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a: number, b: number, t: number) => a + t * (b - a);
  const grad = (hash: number, x: number, y: number) => {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  };

  return (x: number, y: number) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);

    const aa = perm[perm[X] + Y];
    const ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y];
    const bb = perm[perm[X + 1] + Y + 1];

    return lerp(
      lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u),
      lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u),
      v,
    );
  };
}

/** Fractal Brownian motion — stack noise octaves (the article's loop). */
function fbm(
  noise: (x: number, y: number) => number,
  x: number,
  y: number,
  scale: number,
  octaves: number,
  persistence: number,
  lacunarity: number,
): number {
  let amplitude = 1;
  let frequency = 1;
  let total = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    total += noise((x / scale) * frequency, (y / scale) * frequency) * amplitude;
    norm += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  return total / norm;
}

/** Extract contour line segments at one iso level via marching squares. */
function contourSegments(
  lattice: number[],
  gw: number,
  gh: number,
  iso: number,
): [MapPoint, MapPoint][] {
  const segs: [MapPoint, MapPoint][] = [];
  const val = (x: number, y: number) => lattice[y * (gw + 1) + x];
  const corner = (cx: number, cy: number, k: number): MapPoint => {
    if (k === 0) return { x: cx, y: cy };
    if (k === 1) return { x: cx + 1, y: cy };
    if (k === 2) return { x: cx + 1, y: cy + 1 };
    return { x: cx, y: cy + 1 };
  };
  for (let cy = 0; cy < gh; cy++) {
    for (let cx = 0; cx < gw; cx++) {
      const vs = [val(cx, cy), val(cx + 1, cy), val(cx + 1, cy + 1), val(cx, cy + 1)];
      const pts: MapPoint[] = [];
      for (let e = 0; e < 4; e++) {
        const a = e;
        const b = (e + 1) % 4;
        const va = vs[a];
        const vb = vs[b];
        if ((va >= iso) !== (vb >= iso)) {
          const t = (iso - va) / (vb - va);
          const A = corner(cx, cy, a);
          const B = corner(cx, cy, b);
          pts.push({ x: A.x + (B.x - A.x) * t, y: A.y + (B.y - A.y) * t });
        }
      }
      if (pts.length === 2) segs.push([pts[0], pts[1]]);
      else if (pts.length === 4) {
        segs.push([pts[0], pts[2]]);
        segs.push([pts[1], pts[3]]);
      }
    }
  }
  return segs;
}

/**
 * Procedural generation returns LINE GEOMETRY ONLY (contour/outline style).
 *
 * Elevation is produced with fractal Perlin noise (fBm) — layered octaves with
 * persistence/lacunarity — normalized to [0,1] via min/max, then contour lines
 * are traced at the article's biome transition thresholds. The result is a
 * structural guide with no color/style: terrain is defined manually afterward.
 */
// Small/Medium/Large → clearly differentiated feature scale + detail level.
const SCALE_PRESETS: Record<number, { scale: number; octaves: number; levels: number[] }> = {
  1: { scale: 34, octaves: 4, levels: [0.42, 0.5, 0.58] }, // few, broad landmasses
  2: { scale: 20, octaves: 6, levels: [0.36, 0.44, 0.5, 0.58, 0.66] }, // balanced
  3: { scale: 12, octaves: 8, levels: [0.3, 0.36, 0.42, 0.48, 0.54, 0.6, 0.66, 0.72] }, // dense, detailed
};

export function generateMapLines(seed: number, detail: number): MapLine[] {
  const perlin = createPerlin2(seed);
  const gw = 36;
  const gh = 24;
  const preset = SCALE_PRESETS[detail] ?? SCALE_PRESETS[2];
  const scale = preset.scale;
  const octaves = preset.octaves;
  const persistence = 0.5;
  const lacunarity = 2.5;

  // 1) Elevation map via fractal noise.
  const lattice = new Array<number>((gw + 1) * (gh + 1));
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let y = 0; y <= gh; y++) {
    for (let x = 0; x <= gw; x++) {
      const v = fbm(perlin, x, y, scale, octaves, persistence, lacunarity);
      lattice[y * (gw + 1) + x] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }

  // 2) Linear-interpolate elevation into [0,1].
  const range = max - min || 1;
  for (let i = 0; i < lattice.length; i++) lattice[i] = (lattice[i] - min) / range;

  // 3) Trace contour lines at the preset's biome transition thresholds.
  const levels = preset.levels;
  const lines: MapLine[] = [];
  for (const iso of levels) {
    for (const seg of contourSegments(lattice, gw, gh, iso)) {
      lines.push({
        id: createId(),
        points: [
          { x: (seg[0].x / gw) * 100, y: (seg[0].y / gh) * 70 },
          { x: (seg[1].x / gw) * 100, y: (seg[1].y / gh) * 70 },
        ],
      });
    }
  }
  return lines;
}

export function formatUpdatedAt(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}