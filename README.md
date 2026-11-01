# Story Atelier

A calm, pastel-themed writing workspace — chapters, a hierarchical outline, an interactive timeline, a character database, and a world map — built with [Next.js](https://nextjs.org) (App Router), [TipTap](https://tiptap.dev), and [Tailwind CSS v4](https://tailwindcss.com).

## Getting Started

Run the development server from the project folder (the one containing `package.json`; on this machine PowerShell requires `npm.cmd`):

```powershell
cd "[your-folder-path]\story-atelier"
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app **hot-reloads** — every design change below appears as soon as you save the file.

---

# Design Customization

All visual design is driven by **design tokens**. This section explains, step by step, how to change the fonts, font sizes, and colors — for beginners (follow the numbered steps) and advanced users (use the tables and advanced notes).

## Where things live

| What you want to change | File | Where in the file |
|---|---|---|
| Interface font family | `app/layout.tsx` | the `localFont({ ... })` block |
| Writing-area font (manuscript) | `app/globals.css` | the `.font-story` rule |
| Global font size | `app/globals.css` | the `html { font-size: ... }` rule |
| Editor font size + size dropdown | `components/rich-editor.tsx` | `text-[24px]` class, `FONT_SIZES`, select default |
| Colors (background, text, accents) | `app/globals.css` | `:root` variables + `@theme inline` |
| Map terrain colors | `lib/story-store.ts` | the `TERRAINS` object |
| Panel widths (layout balance) | `app/workspace/[id]/workspace.tsx`, `components/map-view.tsx` | draggable dividers + `layout` state (persisted in `localStorage` key `story-atelier:layout:v1`) / `w-*` classes |

## The two-font rule (read this first)

The app deliberately uses **two fonts**:

1. **Interface font** — currently *Agbalumo* (the file `app/fonts/Agbalumo-Regular.ttf`). It is applied to every menu, button, label, and panel through the CSS variable `--font-brunette`.
2. **Writing-area font** — **Times New Roman**, applied to everything inside the manuscript (the TipTap editor body and the chapter title) through the `.font-story` class.

Keep this separation while customizing: change #1 freely, and leave `.font-story` alone unless you intend to reformat the manuscript itself.

## 1. Change the interface font family

**Step-by-step:**

1. **Add the font file** — copy your `.ttf`, `.otf`, or `.woff2` file into `app/fonts/`.
2. **Point the loader at it** — open `app/layout.tsx` and edit the `localFont` block:

   ```ts
   const uiFont = localFont({
     src: "./fonts/YOUR-FONT.ttf",   // ← the file you just added
     variable: "--font-brunette",    // CSS variable name (see note below)
     weight: "400",
     display: "swap",
   });
   ```

3. **Save.** The variable `--font-brunette` is referenced by `app/globals.css` (the `body` rule and the `--font-sans` token), so the entire interface switches instantly.

**Notes for advanced users**

- If you rename the CSS variable (e.g. `--font-myfont`), update **both** places in `app/globals.css` that reference it: `body { font-family: ... }` and `--font-sans` inside `@theme inline`.
- Multiple weights? Provide them as a list and the browser will use real bold instead of synthesis:

  ```ts
  src: [
    { path: "./fonts/MyFont-Regular.ttf", weight: "400" },
    { path: "./fonts/MyFont-Bold.ttf", weight: "700" },
  ],
  ```

- `app/globals.css` sets `font-synthesis: style` on `body`, which **disables fake bold**. With a single-weight font, headings stay crisp at regular weight; if you provide a real Bold file, real bold is used automatically. Set `font-synthesis: normal` to re-enable fake bold.

## 2. Change the writing-area font

The manuscript is pinned to **Times New Roman** on purpose (chapter headings and body). To use a different serif, edit the `.font-story` rule in `app/globals.css`:

```css
.font-story {
  font-family: "Georgia", Georgia, serif;   /* ← your choice */
}
```

This single class is applied to both manuscript editors (chapters and outline notes) and the chapter title, so one change covers the whole writing area.

## 3. Change font sizes

There are three levels — use whichever matches your goal.

**Level 1 — the whole interface (recommended).** In `app/globals.css`:

```css
html {
  font-size: 24px;   /* ← one number scales the entire UI */
  line-height: 1.65;
}
```

Every Tailwind size (`text-xs`, `text-sm`, `text-base`, …) is `rem`-based and scales proportionally, so the layout keeps its balance. Effective sizes at the current `24px` root:

| Tailwind class | Effective size |
|---|---|
| `text-xs` | 18px |
| `text-sm` | 21px |
| `text-base` | 24px |
| `text-lg` | 27px |
| `text-2xl` | 36px |
| `text-3xl` | ~43px |

**Level 2 — the manuscript only.** In `components/rich-editor.tsx`:

```tsx
class: "font-story mt-4 min-h-[60vh] text-[24px] leading-[1.6] text-ink outline-none",
```

Keep the size dropdown consistent with it: update `const FONT_SIZES = [...]` and the select's fallback value (`?? "24px"`) in the same file.

**Level 3 — a single element.** Apply a Tailwind size utility directly on that component's `className` (e.g. change `text-lg` to `text-xl`).

## 4. Change colors

All colors are **CSS variables** declared in the `:root` block of `app/globals.css`:

| Variable | Default | Used for |
|---|---|---|
| `--canvas` | `#fdfbff` | app background |
| `--ink` | `#3f3d56` | primary text |
| `--ink-dim` | `#7a7691` | secondary text |
| `--mist` | `#ede9f5` | borders |
| `--lilac` / `--lilac-deep` | `#8b5cf6` / `#7c4cd9` | primary accent (buttons, links, active states) |
| `--lilac-soft` / `--lilac-mist` | `#efe6fb` / `#f7f3fc` | soft fills and hover states |
| `--sage` / `--sage-soft` | `#48bb78` / `#e3f5e9` | secondary accent (outline, timeline) |

The `@theme inline` block converts each variable into Tailwind utilities (`--color-lilac` → `bg-lilac`, `text-lilac`, `border-lilac`, …). **Change the value in `:root` and every usage across the app updates.** Example — make the primary accent green:

```css
:root {
  --lilac: #2f9e6e;      /* was #8b5cf6 */
  --lilac-deep: #257a55; /* was #7c4cd9 */
}
```

**Map terrain colors** are separate — they live in `lib/story-store.ts`:

```ts
export const TERRAINS: Record<TerrainType, { label: string; color: string }> = {
  ocean: { label: "Ocean", color: "#8fb8dc" },
  lake: { label: "Lake", color: "#7fccbe" },
  river: { label: "River", color: "#4a7fb5" },
  stream: { label: "Stream", color: "#d6ecf5" },
  plain: { label: "Plain", color: "#cde8c6" },
  countryside: { label: "Countryside", color: "#d6e3a8" },
  forest: { label: "Forest", color: "#7fa768" },
  mountain: { label: "Mountain", color: "#9b93c9" },
  desert: { label: "Desert", color: "#f2ddc0" },
  city: { label: "City", color: "#d98f7a" },
};
```

Edit any `color` value and repaint an area to see it (or generate a new map).

## 5. Advanced tweaks

| What | Where |
|---|---|
| Faux-bold behavior | `app/globals.css` → `font-synthesis: style;` (current: no fake bold; use `normal` to re-enable) |
| Line height | `html { line-height }` in `globals.css` (UI) · `leading-[1.6]` in `rich-editor.tsx` (manuscript) |
| Panel widths | `workspace.tsx` → drag the dividers between the columns (persisted in `localStorage` key `story-atelier:layout:v1`) · map → `w-56` / `w-[352px]` |
| Font-size dropdown options | `components/rich-editor.tsx` → `FONT_SIZES` |

## Verify your changes

1. Save the file — the dev server hot-reloads automatically.
2. If a **font** change doesn't appear, hard-refresh the browser (`Ctrl+Shift+R`); fonts are cached aggressively.
3. DevTools (F12) → **Elements** → select the element → the **Computed** pane shows the winning `font-family`, `font-size`, and `color`, so you can confirm exactly what is applied.

## Deploy on Vercel

The easiest way to deploy is the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). See the [deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for details.