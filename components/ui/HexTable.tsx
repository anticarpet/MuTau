interface HexTableProps {
  title?: string;
  headers: string[];
  rows: string[][];
  className?: string;
}

function MiniHex({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <polygon
      points={points}
      fill="#000000"
      stroke="#000000"
      strokeWidth={1}
    />
  );
}

export default function HexTable({
  title = 'results',
  headers,
  rows,
  className = '',
}: HexTableProps) {
  const hexR = 8;

  return (
    <div className={`relative border-[2.5px] border-black bg-white ${className}`}>
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        width={hexR * 2 + 4}
        height={hexR * 2 + 4}
        style={{ margin: -hexR - 2 }}
      >
        <MiniHex cx={hexR + 2} cy={hexR + 2} r={hexR} />
      </svg>
      <svg
        className="absolute top-0 right-0 pointer-events-none"
        width={hexR * 2 + 4}
        height={hexR * 2 + 4}
        style={{ margin: -hexR - 2 }}
      >
        <MiniHex cx={hexR + 2} cy={hexR + 2} r={hexR} />
      </svg>
      <svg
        className="absolute bottom-0 left-0 pointer-events-none"
        width={hexR * 2 + 4}
        height={hexR * 2 + 4}
        style={{ margin: -hexR - 2 }}
      >
        <MiniHex cx={hexR + 2} cy={hexR + 2} r={hexR} />
      </svg>
      <svg
        className="absolute bottom-0 right-0 pointer-events-none"
        width={hexR * 2 + 4}
        height={hexR * 2 + 4}
        style={{ margin: -hexR - 2 }}
      >
        <MiniHex cx={hexR + 2} cy={hexR + 2} r={hexR} />
      </svg>

      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-bold">&lt;{title}</span>
        </div>
        <div className="h-[3px] bg-black mb-4" />
        <div className="h-[1.5px] bg-black mb-4 opacity-40" />

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-black">
              {headers.map((h) => (
                <th
                  key={h}
                  className="text-left py-2 px-3 font-bold uppercase text-xs tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {row.map((cell, j) => (
                  <td key={j} className="py-2 px-3 font-medium">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
