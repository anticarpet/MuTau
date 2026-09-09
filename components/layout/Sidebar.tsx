'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'home', href: '/' },
  { label: 'analytics', href: '/analytics' },
  { label: 'predictions', href: '/predictions' },
  { label: 'map', href: '/map' },
];

const LOWER_NAV = [
  { label: 'settings', href: '/settings' },
  { label: 'account', href: '/account' },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen bg-white border-r-[2.5px] border-black
        flex flex-col justify-between z-50 transition-all duration-300
        ${expanded ? 'w-56' : 'w-[60px]'}
      `}
    >
      <div>
        <div className="flex items-center justify-between px-3 py-4 border-b border-gray-200">
          {expanded ? (
            <>
              <Link href="/" className="font-black italic text-xl tracking-tight">
                MuTau
              </Link>
              <button
                onClick={() => setExpanded(false)}
                className="text-sm font-bold hover:bg-gray-100 rounded px-1"
                aria-label="Collapse sidebar"
              >
                &lt;
              </button>
            </>
          ) : (
            <button
              onClick={() => setExpanded(true)}
              className="w-full text-center text-lg font-bold hover:bg-gray-100 rounded py-1"
              aria-label="Expand sidebar"
            >
              &mu;
            </button>
          )}
        </div>

        <nav className="mt-4 px-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                block py-2 px-3 mb-1 rounded text-sm font-medium
                hover:bg-black hover:text-white transition-colors
                ${pathname === item.href ? 'bg-black text-white' : ''}
                ${expanded ? '' : 'text-center text-xs px-1'}
              `}
            >
              {expanded ? item.label : item.label[0]}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 mt-4 pt-4 px-2">
          {LOWER_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                block py-2 px-3 mb-1 rounded text-sm font-medium
                hover:bg-black hover:text-white transition-colors
                ${pathname === item.href ? 'bg-black text-white' : ''}
                ${expanded ? '' : 'text-center text-xs px-1'}
              `}
            >
              {expanded ? item.label : item.label[0]}
            </Link>
          ))}
        </div>
      </div>

      <div className="px-3 py-4 border-t border-gray-200">
        {expanded ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold">
              AV
            </div>
            <span className="text-xs font-medium">profile</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-9 h-9 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold">
              AV
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
