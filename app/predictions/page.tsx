import Sidebar from '@/components/layout/Sidebar';
import CornerDeco from '@/components/layout/CornerDeco';
import HexBarChart from '@/components/ui/HexBarChart';
import HoverText from '@/components/typography/HoverText';

const predictionData = [
  { label: 'Q1', value: 45 },
  { label: 'Q2', value: 72 },
  { label: 'Q3', value: 58 },
  { label: 'Q4', value: 89 },
];

export default function PredictionsPage() {
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />

      <main className="flex-1 ml-14 relative overflow-hidden min-h-screen px-8 py-10">
        <CornerDeco SVGnum={3} seed={3} pos="bl" offset={{ x: 10, y: -10 }} />

        <div className="max-w-4xl mx-auto z-10 relative">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight">predictions</h1>
            <div className="h-[3px] bg-black mt-2 w-24" />
            <div className="h-[1.5px] bg-black mt-1 w-16 opacity-40" />
          </div>

          <div className="grid grid-cols-3 gap-6 mb-10">
            {['model accuracy', 'data quality', 'confidence'].map((title) => (
              <div
                key={title}
                className="border-[2.5px] border-black p-6 relative"
              >
                <svg
                  className="absolute -top-2 -left-2"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                >
                  <polygon
                    points="12,1 22,6.5 22,17.5 12,23 2,17.5 2,6.5"
                    fill="#000"
                  />
                </svg>
                <svg
                  className="absolute -top-2 -right-2"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                >
                  <polygon
                    points="12,1 22,6.5 22,17.5 12,23 2,17.5 2,6.5"
                    fill="#000"
                  />
                </svg>
                <svg
                  className="absolute -bottom-2 -left-2"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                >
                  <polygon
                    points="12,1 22,6.5 22,17.5 12,23 2,17.5 2,6.5"
                    fill="#000"
                  />
                </svg>
                <svg
                  className="absolute -bottom-2 -right-2"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                >
                  <polygon
                    points="12,1 22,6.5 22,17.5 12,23 2,17.5 2,6.5"
                    fill="#000"
                  />
                </svg>

                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">
                  {title}
                </p>
                <p className="text-2xl font-black">--</p>
              </div>
            ))}
          </div>

          <HexBarChart data={predictionData} width={500} height={260} />

          <div className="flex justify-between pt-8">
            <HoverText href="/analytics" as="link" className="text-xs font-bold">
              &lt; analytics
            </HoverText>
            <HoverText href="/map" as="link" className="text-xs font-bold">
              map &gt;
            </HoverText>
          </div>
        </div>
      </main>
    </div>
  );
}
