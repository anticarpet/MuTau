import Sidebar from '@/components/layout/Sidebar';
import CornerDeco from '@/components/layout/CornerDeco';
import HoverText from '@/components/typography/HoverText';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />

      <main className="flex-1 ml-14 relative overflow-hidden min-h-screen flex flex-col">
        

        <div className="absolute top-6 left-8 z-10 text-left">
          <div className="text-7xl font-black ">MuTau</div>
          <p className="text-lg font-light tracking-wide mt-3 text-gray-600">
            a frontend website template
          </p>
        </div>

        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center z-10">
          <HoverText href="/signin" as="link" className="text-sm font-bold">
            &lt; get started
          </HoverText>
          <HoverText href="/signin" as="link" className="text-sm font-bold">
            sign up &gt;
          </HoverText>
        </div>
      </main>
    </div>
  );
}
