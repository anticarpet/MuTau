export interface ColorWeight {
  col: string;
  prob: number;
}

export const COLOR_POOLS: Record<number, ColorWeight[]> = {
  1: [
    { col: '#ffffff', prob: 6 },
    { col: '#1e40af', prob: 2 },
    { col: '#dc2626', prob: 2 },
    { col: '#16a34a', prob: 1 },
  ],
  2: [
    { col: '#ffffff', prob: 8 },
    { col: '#082130', prob: 3 },
  ],
  3: [
    { col: '#000000', prob: 4 },
    { col: '#2563eb', prob: 3 },
    { col: '#dc2626', prob: 3 },
    { col: '#15803d', prob: 2 },
  ],
};

export function randomHexaCol(poolNum: number): string {
  const pool = COLOR_POOLS[poolNum] ?? COLOR_POOLS[1];
  const totalWeight = pool.reduce((sum, entry) => sum + entry.prob, 0);
  let rand = Math.random() * totalWeight;
  for (const entry of pool) {
    rand -= entry.prob;
    if (rand <= 0) return entry.col;
  }
  return pool[pool.length - 1].col;
}
