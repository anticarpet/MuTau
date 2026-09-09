import Sidebar from '@/components/layout/Sidebar';
import CornerDeco from '@/components/layout/CornerDeco';
import HoverText from '@/components/typography/HoverText';

export default function MapPage() {
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />

      <main className="flex-1 ml-14 relative overflow-hidden min-h-screen px-8 py-10">
        
        <div className="max-w-5xl mx-auto z-10 relative">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight">map</h1>
            <div className="h-[3px] bg-black mt-2 w-24" />
            <div className="h-[1.5px] bg-black mt-1 w-16 opacity-40" />
          </div>

          <div className="border-[2.5px] border-black bg-gray-50 w-full h-[500px] flex items-center justify-center">
            <span className="text-gray-400 font-medium text-sm">map canvas</span>
          </div>

          <div className="flex justify-between pt-8">
            <HoverText href="/predictions" as="link" className="text-xs font-bold">
              &lt; predictions
            </HoverText>
            <HoverText href="/account" as="link" className="text-xs font-bold">
              account &gt;
            </HoverText>
          </div>
        </div>
      </main>
    </div>
  );
}
