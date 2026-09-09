export const SVG_STORE = ['/path2.svg', '/globe.svg', '/next.svg', '/vercel.svg', '/window.svg'] as const;

export function getSVG(SVGnum: number): string {
  const index = ((SVGnum - 1) % SVG_STORE.length + SVG_STORE.length) % SVG_STORE.length;
  return SVG_STORE[index];
}