import Sidebar from '@/components/layout/Sidebar';
import CornerDeco from '@/components/layout/CornerDeco';
import HoverText from '@/components/typography/HoverText';

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />

      <main className="flex-1 ml-14 relative overflow-hidden min-h-screen px-8 py-10">
      

        <div className="max-w-3xl mx-auto z-10 relative">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight">account</h1>
            <div className="h-[3px] bg-black mt-2 w-24" />
            <div className="h-[1.5px] bg-black mt-1 w-16 opacity-40" />
          </div>

          <div className="border-[2.5px] border-black p-8 relative">
            <svg
              className="absolute -top-3 -left-3"
              width={24}
              height={24}
              viewBox="0 0 24 24"
            >
              <polygon
                points="12,1 22,6.5 22,17.5 12,23 2,17.5 2,6.5"
                fill="#000"
                stroke="#000"
                strokeWidth={1}
              />
            </svg>
            <svg
              className="absolute -top-3 -right-3"
              width={24}
              height={24}
              viewBox="0 0 24 24"
            >
              <polygon
                points="12,1 22,6.5 22,17.5 12,23 2,17.5 2,6.5"
                fill="#000"
                stroke="#000"
                strokeWidth={1}
              />
            </svg>
            <svg
              className="absolute -bottom-3 -left-3"
              width={24}
              height={24}
              viewBox="0 0 24 24"
            >
              <polygon
                points="12,1 22,6.5 22,17.5 12,23 2,17.5 2,6.5"
                fill="#000"
                stroke="#000"
                strokeWidth={1}
              />
            </svg>
            <svg
              className="absolute -bottom-3 -right-3"
              width={24}
              height={24}
              viewBox="0 0 24 24"
            >
              <polygon
                points="12,1 22,6.5 22,17.5 12,23 2,17.5 2,6.5"
                fill="#000"
                stroke="#000"
                strokeWidth={1}
              />
            </svg>

            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full border-[2.5px] border-black flex items-center justify-center text-2xl font-black">
                AV
              </div>
              <div>
                <h2 className="text-xl font-bold">user profile</h2>
                <p className="text-sm text-gray-500">account details</p>
              </div>
            </div>

            <div className="space-y-3 text-sm font-medium">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">username</span>
                <span>guest_user</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">role</span>
                <span>viewer</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">status</span>
                <span>active</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-8">
            <HoverText href="/map" as="link" className="text-xs font-bold">
              &lt; map
            </HoverText>
            <HoverText href="/" as="link" className="text-xs font-bold">
              home &gt;
            </HoverText>
          </div>
        </div>
      </main>
    </div>
  );
}
