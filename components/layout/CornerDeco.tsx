'use client';

import { useMemo } from 'react';
import { getSVG } from '@/lib/svgStore';

type Pos = 'tl' | 'tr' | 'bl' | 'br';

interface CornerDecoProps {
  SVGnum: number;
  seed: number;
  pos: Pos;
  offset?: { x: number; y: number };
}

const POSITIONS: Record<Pos, string> = {
  tl: 'top-0 left-0',
  tr: 'top-0 right-0',
  bl: 'bottom-0 left-0',
  br: 'bottom-0 right-0',
};

const FLIP: Record<Pos, string> = {
  tl: 'scale(1,1)',
  tr: 'scale(-1,1)',
  bl: 'scale(1,-1)',
  br: 'scale(-1,-1)',
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function CornerDeco({
  SVGnum,
  seed,
  pos,
  offset = { x: 0, y: 0 },
}: CornerDecoProps) {
  const src = useMemo(() => getSVG(SVGnum), [SVGnum]);
  const deg = useMemo(() => (seededRandom(seed)() - 0.5) * 20, [seed]);

  return (
    <div
      className={`absolute pointer-events-none z-0 ${POSITIONS[pos]}`}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px) rotate(${deg}deg) ${FLIP[pos]}`,
      }}
    >
      <img src={src} alt="" width={160} height={160} className="opacity-80" />
    </div>
  );
}