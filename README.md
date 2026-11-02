# Story Atelier

A calm, pastel-themed writing workspace — chapters, a hierarchical outline, an interactive timeline, a character database, and a world map — built with [Next.js](https://nextjs.org) (App Router), [TipTap](https://tiptap.dev), and [Tailwind CSS v4](https://tailwindcss.com).

**Languages / Ngôn ngữ:** [English](#english) | [Tiếng Việt](#tiếng-việt)

---

# English

## 1. Overview

**Story Atelier** gives fiction authors everything they need to plan and draft a story in one place:

| Feature | Description |
|---|---|
| **Chapters** | Write and organize manuscript chapters in a rich text editor |
| **Outline** | Plan your story structure with nested outline notes |
| **Timeline** | Track events in chronological order |
| **Characters** | Manage profiles for every character |
| **Map** | A generated, colored world map with editable terrain regions |
| **Quote carousel** | A rotating wall of writing inspiration |

**Technology stack:**

- [Next.js](https://nextjs.org) 16 (App Router) + [React](https://react.dev) 19
- [TipTap](https://tiptap.dev) 3 — the rich text editor powering the manuscript
- [Tailwind CSS](https://tailwindcss.com) v4 — all styling, driven by design tokens
- [TypeScript](https://www.typescriptlang.org) 5
- **No backend required** — all story data is saved automatically in your browser's `localStorage`. Nothing leaves your machine.

## 2. Getting Started

Run the development server from the project folder (the one containing `package.json`; on Windows PowerShell you may need `npm.cmd`):

```powershell
cd "[your-folder-path]\story-atelier"
npm.cmd run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app **hot-reloads** — every design change below appears as soon as you save the file.

## 3. Prerequisites

Install these **before** you begin:

| Requirement | Minimum version | How to check | Download |
|---|---|---|---|
| Node.js | **20.9 or later** (LTS 22 recommended) | `node -v` | https://nodejs.org |
| npm | Comes with Node.js | `npm -v` | (included) |
| Git | Optional — only needed to clone the repository | `git --version` | https://git-scm.com |
| A modern browser | Chrome, Edge, or Firefox, recent version | — | — |

**Verify your tools**

1. Press `Win + R`, type `powershell`, press `Enter`.
2. Type `node -v` and press `Enter`. You should see something like `v22.14.0`. If you see *"not recognized"*, install Node.js from the link above and **restart PowerShell** afterward.
3. Type `npm -v` and press `Enter`. You should see a version like `10.9.2`.

> **Windows note:** PowerShell sometimes requires `npm.cmd` instead of `npm`. Both commands do the same thing; if plain `npm` fails, use `npm.cmd`.

## 4. Installation

**Step 1 — Get the project**

> **Before you start:** throughout this guide, `[your-folder-path]` is a placeholder for the folder where the project lives on *your* machine (e.g. `C:\Projects` or `D:\My Documents`). Replace it with your own location. The **project folder** is the folder named `story-atelier` that directly contains the `package.json` file.

**Option A - download with Git:**

```powershell
cd "[your-folder-path]"
git clone (https://github.com/nhi120-7/story-atelier.git) story-atelier
cd story-atelier
```

**Option B - the project aldready exists:**

```powershell
cd "[your-folder-path]\story-atelier"
Get-ChildItem package.json   # lists the file when you're in the correct folder
```

**Option C: more details**

1. **Install Node.js.** Go to https://nodejs.org, download the **LTS** version for Windows, run the installer, and accept all defaults. Restart your computer if the installer asks.
2. **Find the project folder** in File Explorer — it is the `story-atelier` folder that contains a file named `package.json`.
3. **Open a terminal inside that folder.** Click inside the folder, click the address bar at the top of File Explorer, type `powershell`, and press `Enter`. A PowerShell window opens already located in the project folder. (On Windows 11 you can also right-click an empty spot in the folder and choose *Open in Terminal*.)
4. **Confirm you're in the right place:** type `Get-ChildItem package.json` and press `Enter`. If a file is listed, you're set; if you see an error, go back to step 2.
5. **Install the app's parts:** type `npm install` and press `Enter`. Wait 1–3 minutes until the blinking cursor returns. If `npm` reports *"not recognized"*, use `npm.cmd install` instead.
6. **Start the app:** type `npm.cmd run dev` and press `Enter`. Wait until you see `✓ Ready`.
7. **Open the app:** in your browser, go to `http://localhost:3000`. Click **+ New story**, give it a title, and open it — you are now in the writing area.
8. **When you're done:** press `Ctrl + C` in the PowerShell window to stop the app. You can close the browser tab at any time — your work is saved automatically.

**Step 2 — Install dependencies**

```powershell
npm install
```

This downloads all packages listed in `package.json` (Next.js, React, TipTap, Tailwind, …) into the `node_modules` folder. Expect it to take 1–3 minutes depending on your internet speed.

**Step 3 — Start**

```powershell
cd "[your-folder-path]"
npm.cmd run dev
```

Successful output looks like:

```
▲ Next.js 16.4.2
- Local:  http://localhost:3000
✓ Ready in 2.1s
```

**Step 4 — Open**

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the Story Atelier home page.

**Step 5 — Stop the server**

Click on the PowerShell window and press `Ctrl + C` or `exit`.

## 5. Usage Instructions

### 5.1 Development mode (daily writing)

```powershell
cd "[your-folder-path]"
npm.cmd run dev
```

Then open [http://localhost:3000](http://localhost:3000). Every file you save hot-reloads in the browser.

### 5.2 Using the workspace

1. From the home page, click **+ New story** (give it a title).
2. Open the story to enter the **workspace**, which has three panels:
   - **Left — Chapters & Outline:** add chapters with **+ Chapter**, reorder them, and draft in the TipTap editor (bold, italic, underline, headings, text align, font family, font size).
   - **Center — the writing area:** the manuscript itself, always in the serif `.font-story` font (Times New Roman).
   - **Right — Timeline, Characters, Map:** switch views to plan events (**+ Milestone**), build character profiles (**+ Character**), and paint your world map by choosing terrain types.
   - **Resizing:** drag the thin dividers between the columns to grow or shrink the writing area; the widths are remembered.
   - **Character Editor:** click **Open** in the Characters header to turn the writing area into a dynamic table (add/remove rows and columns with **+ Add row** and **Add column**, edit any cell); **Close** returns to the manuscript and the simplified summaries view.
   - **Timeline:** drag the ⠿ handle to reorder milestones; the **— link outline —** dropdown shows 5 options at a time (scroll for more) with a magnifier button that toggles the **Search outline…** field.
3. **Everything is saved automatically** to your browser's `localStorage` — there is no Save button and no server. Closing the tab does not lose your work.
4. To **back up or move** your data: open DevTools (F12) → *Application* → *Local Storage* → `http://localhost:3000` → copy the `story-atelier` entry's value. To restore, paste it back on another machine/browser.

### 5.3 Production build

```powershell
npm run build     # compiles an optimized production bundle
npm run start     # serves it at http://localhost:3000
```

Run `build` before `start`. Use production mode when you want the fastest, most realistic performance check.

### 5.4 Linting

```powershell
npm run lint      # runs ESLint (eslint-config-next)
```

Fix any reported issues before committing changes.

### 5.5 Deployment

The easiest way to deploy is the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). Push the repository to GitHub, import it at vercel.com, and Vercel detects Next.js automatically. See the [deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for details. Note: story data lives in each visitor's browser, so there is no server-side data to migrate.

## 6. Configuration & Design Customization

The app needs **no environment variables, database, or API keys**. All configuration is done in code as **design tokens** — change a value, save, and the running app updates instantly (hot reload). This section explains, step by step, how to change the fonts, font sizes, and colors — for beginners (follow the numbered steps) and advanced users (use the tables and advanced notes).

### 6.1 Where things live

| What you want to change | File | Where in the file |
|---|---|---|
| Interface font family | `app/layout.tsx` | the `localFont({ ... })` block |
| Writing-area font (manuscript) | `app/globals.css` | the `.font-story` rule |
| Global font size | `app/globals.css` | the `html { font-size: ... }` rule |
| Editor font size + size dropdown | `components/rich-editor.tsx` | `text-[24px]` class, `FONT_SIZES`, select default |
| Colors (background, text, accents) | `app/globals.css` | `:root` variables + `@theme inline` |
| Map terrain colors | `lib/story-store.ts` | the `TERRAINS` object |
| Panel widths (layout balance) | `app/workspace/[id]/workspace.tsx`, `components/map-view.tsx` | draggable dividers + `layout` state (persisted in `localStorage` key `story-atelier:layout:v1`) / `w-*` classes |

### 6.2 The two-font rule (read this first)

The app deliberately uses **two fonts**:

1. **Interface font** — currently *Agbalumo* (the file `app/fonts/Agbalumo-Regular.ttf`). It is applied to every menu, button, label, and panel through the CSS variable `--font-brunette`.
2. **Writing-area font** — **Times New Roman**, applied to everything inside the manuscript (the TipTap editor body and the chapter title) through the `.font-story` class.

Keep this separation while customizing: change #1 freely, and leave `.font-story` alone unless you intend to reformat the manuscript itself.

### 6.3 Change the interface font family

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

### 6.4 Change the writing-area font

The manuscript is pinned to **Times New Roman** on purpose (chapter headings and body). To use a different serif, edit the `.font-story` rule in `app/globals.css`:

```css
.font-story {
  font-family: "Georgia", Georgia, serif;   /* ← your choice */
}
```

This single class is applied to both manuscript editors (chapters and outline notes) and the chapter title, so one change covers the whole writing area.

### 6.5 Change font sizes

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

### 6.6 Change colors

All colors are **CSS variables** declared in the `:root` block of `app/globals.css`. Quick reference — edit the CSS variables in `:root`; every usage across the app updates:

```css
:root {
  --canvas: #fdfbff;      /* app background */
  --ink: #3f3d56;         /* primary text */
  --lilac: #8b5cf6;       /* primary accent */
  --sage: #48bb78;        /* secondary accent */
  /* ...see the full table below */
}
```

Full color reference:

| Variable | Default | Used for |
|---|---|---|
| `--canvas` | `#fdfbff` | app background |
| `--ink` | `#3f3d56` | primary text |
| `--ink-dim` | `#7a7691` | secondary text |
| `--mist` | `#ede9f5` | borders |
| `--lilac` / `--lilac-deep` | `#8b5cf6` / `#7c4cd9` | primary accent (buttons, links, active states) |
| `--lilac-soft` / `--lilac-mist` | `#efe6fb` / `#f7f3fc` | soft fills and hover states |
| `--sage` / `--sage-soft` | `#48bb78` / `#e3f5e9` | secondary accent (Outline, Timeline) |

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

### 6.7 Advanced tweaks

| What | Where |
|---|---|
| Faux-bold behavior | `app/globals.css` → `font-synthesis: style;` (current: no fake bold; use `normal` to re-enable) |
| Line height | `html { line-height }` in `globals.css` (UI) · `leading-[1.6]` in `rich-editor.tsx` (manuscript) |
| Panel widths | `workspace.tsx` → drag the dividers between the columns (persisted in `localStorage` key `story-atelier:layout:v1`) · map → `w-56` / `w-[352px]` |
| Font-size dropdown options | `components/rich-editor.tsx` → `FONT_SIZES` |

### 6.8 Verify your changes

1. Save the file — the dev server hot-reloads automatically.
2. If a **font** change doesn't appear, hard-refresh the browser (`Ctrl+Shift+R`); fonts are cached aggressively.
3. DevTools (F12) → **Elements** → select the element → the **Computed** pane shows the winning `font-family`, `font-size`, and `color`, so you can confirm exactly what is applied.

## 7. Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| `npm` is not recognized | Node.js not installed, or PATH not refreshed | Install Node.js 20.9+, then **restart PowerShell**. On Windows, try `npm.cmd` instead of `npm`. |
| Port 3000 is already in use | Another dev server is running | Stop it (`Ctrl + C` in its window), or run `npm.cmd run dev -- -p 3001` and open http://localhost:3001. |
| `npm install` fails with errors | Corrupted cache or partial download | Delete `node_modules` and `package-lock.json`, then run `npm cache clean --force` and `npm install` again. |
| App shows a Node version error | Node.js older than 20.9 | Upgrade Node.js from https://nodejs.org (LTS), restart PowerShell. |
| Font/color change not appearing | Browser cache | Hard-refresh with `Ctrl + Shift + R`. Fonts are cached aggressively. |
| My story data disappeared | Different browser, profile, or cleared site data | Data is per-browser `localStorage`. Switch back to the original browser/profile, or restore a backup (see 5.2 step 4). |
| Editor toolbar not responding | Dev server still compiling after startup | Wait a few seconds until the terminal shows *Ready*, then reload the page. |
| `npm run start` fails | No production build yet | Run `npm run build` first. |
| TypeScript errors in the editor | Stale type info | Restart the TS server: in VS Code, `Ctrl+Shift+P` → *TypeScript: Restart TS Server*. |

---

# Tiếng Việt

## 1. Tổng quan 

**Story Atelier** là một không gian viết truyện yên tĩnh với tông màu pastel, dành cho tác giả tiểu thuyết. Ứng dụng hội tụ mọi thứ bạn cần để lên kế hoạch và viết một câu chuyện trong cùng một nơi:

| Tính năng | Mô tả |
|---|---|
| **Chapters** | Viết và tổ chức các chương bản thảo bằng trình soạn thảo văn bản định dạng |
| **Outline** | Lập dàn ý nhiều cấp độ với các ghi chú lồng nhau |
| **Timeline** | Theo dõi các sự kiện theo trình tự thời gian |
| **Characters** | Quản lý hồ sơ cho từng nhân vật |
| **Map** | Bản đồ thế giới được sinh tự động, tô màu theo vùng địa hình chỉnh sửa được |
| **Quote carousel** | Bảng trích dẫn cảm hứng viết lách thay đổi liên tục |

**Công nghệ sử dụng:**

- [Next.js](https://nextjs.org) 16 (App Router) + [React](https://react.dev) 19
- [TipTap](https://tiptap.dev) 3 — trình soạn thảo định dạng của bản thảo
- [Tailwind CSS](https://tailwindcss.com) v4 — toàn bộ giao diện, điều khiển bằng design token
- [TypeScript](https://www.typescriptlang.org) 5
- **Không cần backend** — toàn bộ dữ liệu truyện được lưu tự động trong `localStorage` của trình duyệt. Không có gì rời khỏi máy của bạn.

## 2. Yêu cầu 

Cài đặt những thứ sau **trước khi** bắt đầu:

| Yêu cầu | Phiên bản tối thiểu | Cách kiểm tra | Tải về |
|---|---|---|---|
| Node.js | **20.9 trở lên** (khuyên dùng LTS 22) | `node -v` | https://nodejs.org |
| npm | Đi kèm Node.js | `npm -v` | (có sẵn) |
| Git | Tùy chọn — chỉ cần khi muốn clone repository | `git --version` | https://git-scm.com |
| Trình duyệt hiện đại | Chrome, Edge hoặc Firefox, bản mới | — | — |

**Các bước kiểm tra công cụ:**

1. Nhấn `Win + R`, gõ `powershell`, nhấn `Enter`.
2. Gõ `node -v` rồi nhấn `Enter`. Bạn sẽ thấy dòng kiểu `v22.14.0`. Nếu thấy thông báo *"not recognized"*, hãy cài Node.js từ đường dẫn trên và **khởi động lại PowerShell**.
3. Gõ `npm -v` rồi nhấn `Enter`. Bạn sẽ thấy phiên bản dạng `10.9.2`.

> **Lưu ý trên Windows:** PowerShell đôi khi yêu cầu dùng `npm.cmd` thay vì `npm`. Hai lệnh làm cùng một việc; nếu `npm` thường báo lỗi, hãy dùng `npm.cmd`.

## 3. Cài đặt (Installation)

**Bước 1 — Đưa dự án về máy**

> **Trước khi bắt đầu:** trong toàn bộ hướng dẫn, `[your-folder-path]` là chỗ giữ chỗ cho thư mục chứa dự án trên máy *của bạn* (ví dụ `C:\Projects` hoặc `D:\My Documents`). Hãy thay bằng vị trí thật của bạn. **Thư mục dự án** là thư mục tên `story-atelier` chứa trực tiếp tệp `package.json`.

**Cách A:**

```powershell
cd "[your-folder-path]"
git clone <url-repository-cua-ban> story-atelier
cd story-atelier
```

**Cách B:** di chuyển vào thư mục dự án và kiểm tra đúng vị trí:

```powershell
cd "[your-folder-path]\story-atelier"
Get-ChildItem package.json   # hiển thị tệp nghĩa là bạn đang ở đúng thư mục
```

Lưu ý: lệnh `cd` chỉ đổi vị trí của terminal — nó **không** khởi động ứng dụng và không mở gì cả. Để thực sự vào **writing area**, hãy tiếp tục Bước 2–4 bên dưới (cài đặt → chạy → mở trình duyệt), rồi tạo hoặc mở một truyện. Writing area là một màn hình bên trong ứng dụng, không phải một thư mục trên ổ đĩa.

**Cách C:**

1. **Cài Node.js.** Vào https://nodejs.org, tải bản **LTS** cho Windows, chạy trình cài đặt và giữ nguyên mọi lựa chọn mặc định. Khởi động lại máy nếu trình cài đặt yêu cầu.
2. **Tìm thư mục dự án** trong File Explorer — đó là thư mục `story-atelier` chứa tệp tên `package.json`.
3. **Mở terminal ngay trong thư mục đó.** Nhấp vào bên trong thư mục, nhấp vào thanh địa chỉ phía trên của File Explorer, gõ `powershell` rồi nhấn `Enter`. Cửa sổ PowerShell sẽ mở ra đã sẵn ở đúng thư mục dự án. (Trên Windows 11 bạn cũng có thể nhấp chuột phải vào chỗ trống trong thư mục và chọn *Open in Terminal*.)
4. **Xác nhận đúng vị trí:** gõ `Get-ChildItem package.json` rồi nhấn `Enter`. Nếu thấy tệp được liệt kê thì bạn đã sẵn sàng; nếu báo lỗi, quay lại bước 2.
5. **Cài các thành phần của ứng dụng:** gõ `npm install` rồi nhấn `Enter`. Chờ 1–3 phút đến khi con trỏ nhấp nháy quay lại. Nếu `npm` báo *"not recognized"*, hãy dùng `npm.cmd install` thay thế.
6. **Khởi động ứng dụng:** gõ `npm.cmd run dev` rồi nhấn `Enter`. Chờ đến khi thấy dòng `✓ Ready`.
7. **Mở ứng dụng:** trong trình duyệt, vào `http://localhost:3000`. Nhấn **+ New story**, đặt tiêu đề và mở ra — bạn đã ở trong writing area.
8. **Khi dùng xong:** nhấn `Ctrl + C` trong cửa sổ PowerShell để dừng ứng dụng. Bạn có thể đóng tab trình duyệt bất cứ lúc nào — dữ liệu được lưu tự động.

**Bước 2 — Cài đặt các thư viện phụ thuộc**

```powershell
npm install
```

Lệnh này tải tất cả gói trong `package.json` (Next.js, React, TipTap, Tailwind, …) vào thư mục `node_modules`. Thời gian khoảng 1–3 phút tùy tốc độ mạng.

**Bước 3 — Chạy máy chủ phát triển (dev server)**

```powershell
npm.cmd run dev
```

Kết quả thành công trông như sau:

```
▲ Next.js 16.4.2
- Local:  http://localhost:3000
✓ Ready in 2.1s
```

**Bước 4 — Mở ứng dụng**

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt. Bạn sẽ thấy trang chủ Story Atelier.

**Bước 5 — Dừng máy chủ**

Nhấp vào cửa sổ PowerShell rồi nhấn `Ctrl + C`.

## 4. Hướng dẫn sử dụng (Usage)

### 4.1 Chế độ phát triển (viết hằng ngày)

```powershell
npm.cmd run dev
```

Sau đó mở [http://localhost:3000](http://localhost:3000). Mọi tệp bạn lưu đều được tải lại tức thì trong trình duyệt.

### 4.2 Sử dụng không gian làm việc

1. Từ trang chủ, nhấn **+ New story** (đặt tiêu đề).
2. Mở truyện để vào **workspace** gồm ba khung:
   - **Trái — Chapters & Outline:** thêm chương bằng **+ Chapter**, sắp xếp lại, và soạn thảo trong trình soạn thảo TipTap (in đậm, in nghiêng, gạch chân, đề mục, căn lề, họ font, cỡ chữ).
   - **Giữa — writing area:** chính là bản thảo, luôn dùng font serif `.font-story` (Times New Roman).
   - **Phải — Timeline, Characters, Map:** chuyển chế độ xem để lập mốc sự kiện (**+ Milestone**), xây hồ sơ nhân vật (**+ Character**), và tô bản đồ thế giới bằng cách chọn loại địa hình.
   - **Chỉnh độ rộng:** kéo thanh chia mảnh giữa các khung để thu nhỏ/mở rộng writing area; kích thước được ghi nhớ.
   - **Character Editor:** nhấn **Open** trong tiêu đề Characters để biến writing area thành bảng động (thêm/xóa hàng và cột bằng **+ Add row** và **Add column**, sửa ô bất kỳ); **Close** quay về bản thảo và dạng xem tóm tắt đơn giản.
   - **Timeline:** kéo nút ⠿ để sắp xếp lại các cột mốc; ô chọn **— link outline —** hiển thị 5 mục mỗi lần (cuộn để xem thêm) với nút kính lúp bật/tắt ô **Search outline…**.
3. **Mọi thứ được lưu tự động** vào `localStorage` của trình duyệt — không có nút Lưu và không có máy chủ. Đóng tab không làm mất dữ liệu.
4. Để **sao lưu hoặc chuyển** dữ liệu: mở DevTools (F12) → *Application* → *Local Storage* → `http://localhost:3000` → sao chép giá trị của mục `story-atelier`. Để khôi phục, dán lại trên máy/trình duyệt khác.

### 4.3 Build cho môi trường sản xuất

```powershell
npm run build     # biên dịch bản tối ưu cho sản xuất
npm run start     # phục vụ tại http://localhost:3000
```

Chạy `build` trước rồi mới `start`. Dùng chế độ sản xuất khi muốn kiểm tra hiệu năng thực tế nhanh nhất.

### 4.4 Kiểm tra lỗi phong cách code (lint)

```powershell
npm run lint      # chạy ESLint (eslint-config-next)
```

Hãy sửa hết lỗi được báo trước khi commit thay đổi.

### 4.5 Triển khai (Deploy)

Cách dễ nhất là dùng nền tảng [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme). Đưa repository lên GitHub, nhập dự án tại vercel.com, Vercel tự nhận diện Next.js. Xem [tài liệu triển khai](https://nextjs.org/docs/app/building-your-application/deploying) để biết chi tiết. Lưu ý: dữ liệu truyện nằm trong trình duyệt của từng người dùng nên không cần di chuyển dữ liệu phía máy chủ.

## 5. Cấu hình & Tùy biến thiết kế (Configuration & Design Customization)

Ứng dụng **không cần biến môi trường, cơ sở dữ liệu hay khóa API**. Mọi cấu hình đều nằm trong mã nguồn dưới dạng **design token** — sửa giá trị, lưu lại, ứng dụng đang chạy cập nhật ngay (hot reload). Phần này hướng dẫn từng bước cách đổi font, cỡ chữ và màu sắc — người mới đi theo các bước đánh số, người có kinh nghiệm dùng bảng và ghi chú nâng cao.

### 5.1 Vị trí từng thiết lập

| Muốn thay đổi | Tệp | Vị trí trong tệp |
|---|---|---|
| Font chữ của giao diện | `app/layout.tsx` | khối `localFont({ ... })` |
| Font writing area (bản thảo) | `app/globals.css` | quy tắc `.font-story` |
| Cỡ chữ toàn cục | `app/globals.css` | `html { font-size: ... }` |
| Cỡ chữ trình soạn thảo + danh sách chọn | `components/rich-editor.tsx` | `text-[24px]`, `FONT_SIZES` |
| Màu sắc (nền, chữ, điểm nhấn) | `app/globals.css` | biến `:root` + `@theme inline` |
| Màu địa hình bản đồ | `lib/story-store.ts` | đối tượng `TERRAINS` |
| Độ rộng các khung | `app/workspace/[id]/workspace.tsx`, `components/map-view.tsx` | thanh chia kéo được + trạng thái `layout` (lưu trong `localStorage`, khóa `story-atelier:layout:v1`) / `w-*` |

### 5.2 Quy tắc hai font

Ứng dụng cố ý dùng hai font — hãy giữ nguyên sự tách biệt này khi tùy biến:

1. **Font giao diện** — *Agbalumo* (`app/fonts/Agbalumo-Regular.ttf`), áp dụng cho mọi menu, nút, nhãn qua biến CSS `--font-brunette`.
2. **Font writing area** — **Times New Roman**, áp dụng cho bản thảo qua lớp `.font-story`. Đừng đổi trừ khi bạn muốn định dạng lại toàn bộ bản thảo.

**Đổi font giao diện:**

1. Chép tệp `.ttf`, `.otf` hoặc `.woff2` của bạn vào `app/fonts/`.
2. Trong `app/layout.tsx`, sửa:

   ```ts
   const uiFont = localFont({
     src: "./fonts/TEN-FONT-CUA-BAN.ttf", // ← tệp mới của bạn
     variable: "--font-brunette",
     weight: "400",
     display: "swap",
   });
   ```

3. Lưu lại — toàn bộ giao diện đổi ngay lập tức.

**Ghi chú nâng cao:**

- Nếu đổi tên biến CSS (ví dụ `--font-myfont`), hãy cập nhật **cả hai** chỗ tham chiếu trong `app/globals.css`: `body { font-family: ... }` và `--font-sans` bên trong `@theme inline`.
- Nhiều độ đậm? Khai báo dạng danh sách và trình duyệt sẽ dùng chữ đậm thật thay vì giả lập:

  ```ts
  src: [
    { path: "./fonts/MyFont-Regular.ttf", weight: "400" },
    { path: "./fonts/MyFont-Bold.ttf", weight: "700" },
  ],
  ```

- `app/globals.css` đặt `font-synthesis: style` trên `body`, **tắt chữ đậm giả**. Với font chỉ có một độ đậm, đề mục vẫn sắc nét ở độ đậm thường; nếu có tệp Bold thật, chữ đậm thật sẽ tự được dùng. Đặt `font-synthesis: normal` để bật lại chữ đậm giả.

### 5.3 Đổi font của writing area

Bản thảo cố ý dùng **Times New Roman** (đề mục chương và phần thân). Để dùng font serif khác, sửa quy tắc `.font-story` trong `app/globals.css`:

```css
.font-story {
  font-family: "Georgia", Georgia, serif;   /* ← lựa chọn của bạn */
}
```

Lớp này áp dụng cho cả hai trình soạn thảo bản thảo (Chapters và ghi chú Outline) lẫn tiêu đề chương, nên một thay đổi phủ toàn bộ writing area.

### 5.4 Đổi màu

Mọi màu đều là **biến CSS** khai báo trong khối `:root` của `app/globals.css`. Tham khảo nhanh — sửa các biến CSS trong `:root`; mọi nơi dùng đến đều cập nhật theo:

```css
:root {
  --canvas: #fdfbff;      /* nền ứng dụng */
  --ink: #3f3d56;         /* chữ chính */
  --lilac: #8b5cf6;       /* màu nhấn chính */
  --sage: #48bb78;        /* màu nhấn phụ */
  /* ...bảng đầy đủ ở dưới */
}
```

Bảng màu đầy đủ:

| Biến | Mặc định | Dùng cho |
|---|---|---|
| `--canvas` | `#fdfbff` | nền ứng dụng |
| `--ink` | `#3f3d56` | chữ chính |
| `--ink-dim` | `#7a7691` | chữ phụ |
| `--mist` | `#ede9f5` | đường viền |
| `--lilac` / `--lilac-deep` | `#8b5cf6` / `#7c4cd9` | màu nhấn chính (nút, liên kết, trạng thái kích hoạt) |
| `--lilac-soft` / `--lilac-mist` | `#efe6fb` / `#f7f3fc` | nền nhạt và hiệu ứng hover |
| `--sage` / `--sage-soft` | `#48bb78` / `#e3f5e9` | màu nhấn phụ (Outline, Timeline) |

Khối `@theme inline` chuyển mỗi biến thành tiện ích Tailwind (`--color-lilac` → `bg-lilac`, `text-lilac`, `border-lilac`, …). **Đổi giá trị trong `:root` và mọi nơi dùng đến đều cập nhật theo.** Ví dụ — đổi màu nhấn chính sang xanh lá:

```css
:root {
  --lilac: #2f9e6e;      /* trước: #8b5cf6 */
  --lilac-deep: #257a55; /* trước: #7c4cd9 */
}
```

Màu địa hình bản đồ nằm riêng trong `lib/story-store.ts` (`TERRAINS`): `ocean` (biển), `lake` (hồ), `river` (sông), `stream` (suối), `plain` (đồng bằng), `countryside` (nông thôn), `forest` (rừng), `mountain` (núi), `desert` (sa mạc), `city` (thành phố). Sửa giá trị `color` bất kỳ rồi tô lại một vùng để thấy (hoặc tạo bản đồ mới).

### 5.5 Ba mức cỡ chữ

- **Toàn bộ giao diện (khuyên dùng):** `app/globals.css` → `html { font-size: 24px; }`. Mọi cỡ Tailwind đều theo `rem` nên co giãn theo tỷ lệ.
- **Chỉ bản thảo:** `components/rich-editor.tsx` → lớp `text-[24px]`, kèm `FONT_SIZES` và giá trị dự phòng của ô chọn (`?? "24px"`).
- **Một phần tử riêng:** đổi lớp cỡ chữ Tailwind trên `className` của chính thành phần đó.

### 5.6 Tinh chỉnh nâng cao

| Cái cần đổi | Vị trí |
|---|---|
| Hành vi chữ đậm giả | `app/globals.css` → `font-synthesis: style;` (hiện tại: không đậm giả; dùng `normal` để bật lại) |
| Độ cao dòng | `html { line-height }` trong `globals.css` (giao diện) · `leading-[1.6]` trong `rich-editor.tsx` (bản thảo) |
| Độ rộng các khung | `workspace.tsx` → kéo thanh chia giữa các cột (lưu trong `localStorage`, khóa `story-atelier:layout:v1`) · map → `w-56` / `w-[352px]` |
| Các lựa chọn cỡ chữ | `components/rich-editor.tsx` → `FONT_SIZES` |

### 5.7 Kiểm chứng thay đổi

1. Lưu tệp — dev server tự hot-reload.
2. Nếu thay đổi **font** không hiện ra, làm mới cứng trình duyệt (`Ctrl+Shift+R`); font bị lưu đệm rất mạnh.
3. DevTools (F12) → **Elements** → chọn phần tử → khung **Computed** sẽ hiển thị đúng `font-family`, `font-size`, và `color` đang được áp dụng.

## 6. Xử lý sự cố (Troubleshooting)

| Vấn đề | Nguyên nhân | Cách khắc phục |
|---|---|---|
| `npm` không được nhận dạng | Chưa cài Node.js, hoặc PATH chưa cập nhật | Cài Node.js 20.9 trở lên rồi **khởi động lại PowerShell**. Trên Windows, thử `npm.cmd` thay vì `npm`. |
| Cổng 3000 đã bị chiếm | Máy chủ dev khác đang chạy | Dừng nó (`Ctrl + C` trong cửa sổ đó), hoặc chạy `npm.cmd run dev -- -p 3001` rồi mở http://localhost:3001. |
| `npm install` báo lỗi | Bộ nhớ đệm hỏng hoặc tải dở dang | Xóa `node_modules` và `package-lock.json`, chạy `npm cache clean --force` rồi `npm install` lại. |
| Ứng dụng báo lỗi phiên bản Node | Node.js cũ hơn 20.9 | Nâng cấp Node.js từ https://nodejs.org (bản LTS), khởi động lại PowerShell. |
| Đổi font/màu không hiện ra | Bộ nhớ đệm trình duyệt | Làm mới cứng bằng `Ctrl + Shift + R`. Font bị lưu đệm rất "cứng đầu". |
| Dữ liệu truyện biến mất | Dùng trình duyệt/hồ sơ khác, hoặc đã xóa dữ liệu trang | Dữ liệu nằm trong `localStorage` của từng trình duyệt. Quay lại trình duyệt/hồ sơ cũ, hoặc khôi phục từ bản sao lưu (xem mục 4.2 bước 4). |
| Thanh công cụ soạn thảo không phản hồi | Dev server vẫn đang biên dịch sau khi khởi động | Chờ vài giây đến khi terminal hiện *Ready* rồi tải lại trang. |
| `npm run start` thất bại | Chưa build bản sản xuất | Chạy `npm run build` trước. |
| Lỗi TypeScript trong trình soạn thảo | Thông tin kiểu đã cũ | Khởi động lại TS server: trong VS Code, `Ctrl+Shift+P` → *TypeScript: Restart TS Server*. |
