// Raster flood-fill ("paint bucket") for the map. Lines form walls; clicking
// inside a closed area fills the region bounded by those walls with a color.
import type { MapLine, MapPoint } from "@/lib/story-store";

export interface RasterRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const GRID_W = 200;
const GRID_H = 140;

const toCell = (p: MapPoint): [number, number] => [
  Math.floor((p.x / 100) * GRID_W),
  Math.floor((p.y / 70) * GRID_H),
];

export function floodFillRects(lines: MapLine[], click: MapPoint): RasterRect[] {
  const wall = new Uint8Array(GRID_W * GRID_H);
  const mark = (cx: number, cy: number) => {
    if (cx >= 0 && cy >= 0 && cx < GRID_W && cy < GRID_H) wall[cy * GRID_W + cx] = 1;
  };

  // Rasterize each line segment as a wall (DDA).
  for (const line of lines) {
    for (let i = 0; i + 1 < line.points.length; i++) {
      const [ax, ay] = toCell(line.points[i]);
      const [bx, by] = toCell(line.points[i + 1]);
      const steps = Math.max(Math.abs(bx - ax), Math.abs(by - ay)) || 1;
      for (let s = 0; s <= steps; s++) {
        mark(
          Math.round(ax + ((bx - ax) * s) / steps),
          Math.round(ay + ((by - ay) * s) / steps),
        );
      }
    }
  }

  const [sx, sy] = toCell(click);
  if (sx < 0 || sy < 0 || sx >= GRID_W || sy >= GRID_H || wall[sy * GRID_W + sx]) return [];

  // Flood fill (4-neighborhood, iterative).
  const filled = new Uint8Array(GRID_W * GRID_H);
  const stack: number[] = [sy * GRID_W + sx];
  filled[sy * GRID_W + sx] = 1;
  while (stack.length) {
    const idx = stack.pop()!;
    const cx = idx % GRID_W;
    const cy = Math.floor(idx / GRID_W);
    const neighbors: [number, number][] = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ];
    for (const [nx, ny] of neighbors) {
      if (
        nx >= 0 && ny >= 0 && nx < GRID_W && ny < GRID_H &&
        !wall[ny * GRID_W + nx] && !filled[ny * GRID_W + nx]
      ) {
        filled[ny * GRID_W + nx] = 1;
        stack.push(ny * GRID_W + nx);
      }
    }
  }

  // Compress filled cells into horizontal run-length rectangles (world coords).
  const cellW = 100 / GRID_W;
  const cellH = 70 / GRID_H;
  const rects: RasterRect[] = [];
  for (let cy = 0; cy < GRID_H; cy++) {
    let cx = 0;
    while (cx < GRID_W) {
      if (!filled[cy * GRID_W + cx]) {
        cx++;
        continue;
      }
      const start = cx;
      while (cx < GRID_W && filled[cy * GRID_W + cx]) cx++;
      rects.push({ x: start * cellW, y: cy * cellH, w: (cx - start) * cellW, h: cellH });
    }
  }
  return rects;
}