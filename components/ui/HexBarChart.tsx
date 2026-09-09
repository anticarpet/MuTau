interface HexBarChartProps {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
  className?: string;
}

export default function HexBarChart({
  data,
  width = 400,
  height = 250,
  className = '',
}: HexBarChartProps) {
  const padding = 40;
  const plotW = width - padding * 2;
  const plotH = height - padding * 2;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barW = Math.min(plotW / data.length * 0.6, 50);
  const gap = (plotW - barW * data.length) / (data.length + 1);

  const hexTop = (x: number, y: number, w: number): string => {
    const hw = w / 2;
    const hh = hw * 0.5;
    return `M ${x} ${y + hh} L ${x + hw} ${y} L ${x + w} ${y + hh}`;
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className}>
      <defs>
        <marker
          id="bar-arrow-x"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="4"
          orient="auto"
        >
          <path d="M 0 0 L 8 4 L 0 8" fill="none" stroke="#000" strokeWidth="2" />
        </marker>
        <marker
          id="bar-arrow-y"
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
        markerEnd="url(#bar-arrow-x)"
      />
      <line
        x1={padding}
        y1={padding + plotH}
        x2={padding}
        y2={padding}
        stroke="#000"
        strokeWidth={2}
        markerEnd="url(#bar-arrow-y)"
      />

      {data.map((d, i) => {
        const x = padding + gap + i * (barW + gap);
        const barH = (d.value / maxVal) * plotH;
        const y = padding + plotH - barH;

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              fill="#000000"
              stroke="#000000"
              strokeWidth={1.5}
            />
            <path
              d={hexTop(x, y, barW)}
              fill="#000000"
              stroke="#000000"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            <text
              x={x + barW / 2}
              y={padding + plotH + 16}
              textAnchor="middle"
              className="fill-black"
              style={{ fontSize: 10 }}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
