import Sidebar from '@/components/layout/Sidebar';
import CornerDeco from '@/components/layout/CornerDeco';
import HexStatGauge from '@/components/ui/HexStatGauge';
import HexLineGraph from '@/components/ui/HexLineGraph';
import HexTable from '@/components/ui/HexTable';
import HoverText from '@/components/typography/HoverText';

const sampleData = [
  { x: 1, y: 3, label: 'jan' },
  { x: 2, y: 5, label: 'feb' },
  { x: 3, y: 4, label: 'mar' },
  { x: 4, y: 7, label: 'apr' },
  { x: 5, y: 6, label: 'may' },
  { x: 6, y: 9, label: 'jun' },
];

const tableHeaders = ['metric', 'value', 'change'];
const tableRows = [
  ['visitors', '12,340', '+8.2%'],
  ['sessions', '45,670', '+12.1%'],
  ['bounce rate', '34.5%', '-2.3%'],
  ['avg duration', '3m 24s', '+0.8%'],
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />

      <main className="flex-1 ml-14 relative overflow-hidden min-h-screen px-8 py-10">
       

        <div className="max-w-4xl mx-auto z-10 relative">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight">analytics</h1>
            <div className="h-[3px] bg-black mt-2 w-24" />
            <div className="h-[1.5px] bg-black mt-1 w-16 opacity-40" />
          </div>

          <div className="flex gap-12 mb-10">
            <HexStatGauge percentage={67} size={140} label="engagement" />
            <HexStatGauge percentage={42} size={140} label="retention" />
          </div>

          <div className="mb-10">
            <HexLineGraph data={sampleData} width={600} height={280} />
          </div>

          <HexTable
            title="results"
            headers={tableHeaders}
            rows={tableRows}
            className="max-w-lg"
          />

          <div className="flex justify-between pt-8">
            <HoverText href="/settings" as="link" className="text-xs font-bold">
              &lt; settings
            </HoverText>
            <HoverText href="/predictions" as="link" className="text-xs font-bold">
              predictions &gt;
            </HoverText>
          </div>
        </div>
      </main>
    </div>
  );
}
