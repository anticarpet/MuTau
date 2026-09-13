'use client';

import Sidebar from '@/components/layout/Sidebar';
import CornerDeco from '@/components/layout/CornerDeco';
import HexInput from '@/components/ui/HexInput';
import HexCheckbox from '@/components/ui/HexCheckbox';
import HexDropdown from '@/components/ui/HexDropdown';
import HoverText from '@/components/typography/HoverText';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />

      <main className="flex-1 ml-14 relative overflow-hidden min-h-screen flex flex-col items-center justify-center px-4">
       

        <div className="w-full max-w-md z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight">sign in</h1>
            <div className="h-[3px] bg-black mt-2 w-24" />
            <div className="h-[1.5px] bg-black mt-1 w-16 opacity-40" />
          </div>

          <div className="space-y-5">
            <HexInput label="username" placeholder="enter username" />

            <HexInput label="password" type="password" placeholder="enter password" />

            <div className="flex items-center gap-6 pt-2">
              <HexCheckbox label="yes" />
              <HexCheckbox label="no" />
            </div>

            <HexDropdown
              label="options"
              options={['option a', 'option b', 'option c']}
              placeholder="please select"
            />

            <div className="pt-4">
              <button
                type="button"
                className="clip-hex-wide-border bg-black w-full"
                style={{ padding: '2.5px' }}
              >
                <div className="clip-hex-wide bg-black text-white py-3 text-sm font-bold tracking-wider uppercase">
                  submit
                </div>
              </button>
            </div>

            <div className="flex justify-between pt-4">
              <HoverText href="/" as="link" className="text-xs font-bold">
                &lt; back
              </HoverText>
              <HoverText href="/settings" as="link" className="text-xs font-bold">
                settings &gt;
              </HoverText>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
