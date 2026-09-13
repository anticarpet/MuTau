export interface HexTile {
  cx: number;
  cy: number;
  points: string;
}

function hexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

export function generateCluster(
  count: number,
  radius: number,
  spread: number,
  seed = 42,
): HexTile[] {
  const tiles: HexTile[] = [];
  const rng = mulberry32(seed);
  for (let i = 0; i < count; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * spread;
    const cx = radius + Math.cos(angle) * dist;
    const cy = radius + Math.sin(angle) * dist;
    tiles.push({ cx, cy, points: hexPoints(cx, cy, radius * 0.42) });
  }
  return tiles;
}

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateGridCluster(
  cols: number,
  rows: number,
  radius: number,
  padX = 2,
  padY = 2,
): HexTile[] {
  const tiles: HexTile[] = [];
  const w = radius * 2;
  const h = radius * Math.sqrt(3);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offset = row % 2 === 1 ? radius + padX : 0;
      const cx = col * (w + padX) + radius + offset;
      const cy = row * (h * 0.75 + padY) + radius;
      tiles.push({ cx, cy, points: hexPoints(cx, cy, radius) });
    }
  }
  return tiles;
}
