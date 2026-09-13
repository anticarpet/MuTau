interface HexLineGraphProps {
  data: { x: number; y: number; label?: string }[];
  width?: number;
  height?: number;
  className?: string;
}

export default function HexLineGraph({
  data,
  width = 400,
  height = 250,
  className = '',
}: HexLineGraphProps) {
  const padding = 40;
  const plotW = width - padding * 2;
  const plotH = height - padding * 2;

  const maxX = Math.max(...data.map((d) => d.x), 1);
  const maxY = Math.max(...data.map((d) => d.y), 1);

  const points = data.map((d) => ({
    x: padding + (d.x / maxX) * plotW,
    y: padding + plotH - (d.y / maxY) * plotH,
    label: d.label,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className}>
      <defs>
        <marker
          id="arrow-x"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <path d="M 0 0 L 8 4 L 0 8" fill="none" stroke="#000" strokeWidth="2" />
        </marker>
        <marker
          id="arrow-y"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="1"
          orient="auto"
        >
          <path d="M 0 8 L 4 0 L 8 8" fill="none" stroke="#000" strokeWidth="2" />
        </marker>
      </defs>

      <line
        x1={padding}
        y1={padding + plotH}
        x2={padding + plotW}
        y2={padding + plotH}
        stroke="#000"
        strokeWidth={2}
        markerEnd="url(#arrow-x)"
      />
      <line
        x1={padding}
        y1={padding + plotH}
        x2={padding}
        y2={padding}
        stroke="#000"
        strokeWidth={2}
        markerEnd="url(#arrow-y)"
      />

      <path
        d={pathD}
        fill="none"
        stroke="#000"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={5} fill="#dc2626" stroke="#000" strokeWidth={2} />
          {p.label && (
            <text
              x={p.x}
              y={p.y - 12}
              textAnchor="middle"
              className="fill-black"
              style={{ fontSize: 10 }}
            >
              {p.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
