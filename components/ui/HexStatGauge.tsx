interface HexStatGaugeProps {
  percentage: number;
  size?: number;
  label?: string;
  className?: string;
}

export default function HexStatGauge({
  percentage,
  size = 120,
  label,
  className = '',
}: HexStatGaugeProps) {
  const r = size * 0.4;
  const cx = size / 2;
  const cy = size / 2;

  const hexPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');

  const innerR = r * 0.82;
  const innerPoints = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${cx + innerR * Math.cos(angle)},${cy + innerR * Math.sin(angle)}`;
  }).join(' ');

  const fillHeight = (r * 2 * 0.82 * Math.min(percentage, 100)) / 100;
  const fillY = cy + r * 0.82 - fillHeight;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <clipPath id={`hex-clip-${percentage}`}>
            <polygon points={innerPoints} />
          </clipPath>
        </defs>

        <polygon
          points={hexPoints}
          fill="none"
          stroke="#000000"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        <g clipPath={`url(#hex-clip-${percentage})`}>
          <rect
            x={cx - r}
            y={fillY}
            width={r * 2}
            height={fillHeight}
            fill="#000000"
            opacity={0.08}
          />
          <rect
            x={cx - r}
            y={cy}
            width={r * 2}
            height={r * 2}
            fill="#000000"
          />
          <rect
            x={cx - r}
            y={fillY}
            width={r * 2}
            height={fillHeight}
            fill="#ffffff"
          />
        </g>

        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-black font-black text-lg"
          style={{ fontSize: size * 0.18 }}
        >
          {percentage}%
        </text>
      </svg>
      {label && (
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      )}
    </div>
  );
}
