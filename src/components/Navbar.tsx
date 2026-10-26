'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Palette,
  Volume2,
  Gift,
  PartyPopper,
  Lock,
  ShieldCheck
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    setIsAdminLoggedIn(!!token);
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent, action: 'worksheets' | 'sounds' | 'free' | 'jumbo') => {
    e.preventDefault();

    if (pathname !== '/') {
      window.location.href = `/?action=${action}`;
      return;
    }

    if (action === 'worksheets') {
      const el = document.getElementById('worksheets-grid');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (action === 'sounds') {
      const el = document.getElementById('fun-soundboard');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      window.dispatchEvent(new CustomEvent('kids-action', { detail: { type: 'play-sound' } }));
    } else if (action === 'free') {
      const el = document.getElementById('free-gift-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      window.dispatchEvent(new CustomEvent('kids-action', { detail: { type: 'show-free' } }));
    } else if (action === 'jumbo') {
      const el = document.getElementById('mega-bundle');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      window.dispatchEvent(new CustomEvent('kids-action', { detail: { type: 'open-jumbo' } }));
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-amber-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-amber-400 to-rose-500 flex items-center justify-center text-white text-xl sm:text-2xl shadow-md shadow-pink-500/20 group-hover:scale-110 transition-transform">
              🎈
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-xl text-slate-900 tracking-tight">
                  Kids WonderLand
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200 hidden sm:inline-block">
                  बाल वाटिका
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] font-bold text-amber-600 hidden md:block">
                Printable Activity Packs &amp; Worksheets
              </p>
            </div>
          </Link>

          {/* Interactive Navigation Buttons */}
          <nav className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap justify-end">
            {/* 1. Worksheets Button */}
            <button
              onClick={e => handleNavClick(e, 'worksheets')}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold text-slate-700 hover:text-pink-600 hover:bg-pink-50 active:scale-95 transition-all cursor-pointer"
              title="Jump to Worksheets"
            >
              <Palette className="w-4 h-4 text-pink-500 shrink-0" />
              <span>वर्कशीट्स</span>
            </button>

            {/* 2. Fun Sounds Button */}
            <button
              onClick={e => handleNavClick(e, 'sounds')}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold text-slate-700 hover:text-purple-600 hover:bg-purple-50 active:scale-95 transition-all cursor-pointer"
              title="Play Animal Sounds"
            >
              <Volume2 className="w-4 h-4 text-purple-500 shrink-0" />
              <span>Fun Sounds 🦁</span>
            </button>

            {/* 3. Free Gift Button */}
            <button
              onClick={e => handleNavClick(e, 'free')}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-extrabold bg-amber-50 text-amber-900 border-2 border-amber-300 hover:bg-amber-100 hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Download Free Worksheets"
            >
              <Gift className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Free Gift 🎁</span>
            </button>

            {/* 4. Jumbo Pack (₹99) Button */}
            <button
              onClick={e => handleNavClick(e, 'jumbo')}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white shadow-md shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Buy Mega Jumbo Bundle"
            >
              <PartyPopper className="w-4 h-4 text-yellow-200 shrink-0" />
              <span>Jumbo Pack (₹99)</span>
            </button>

            {/* 5. Admin Panel Button */}
            <Link
              href="/admin"
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black shadow-sm transition-all hover:scale-105 active:scale-95 ${
                pathname === '/admin'
                  ? 'bg-purple-700 text-white shadow-purple-700/30'
                  : isAdminLoggedIn
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
              }`}
              title="Open Admin Panel"
            >
              {isAdminLoggedIn ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Admin</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse hidden sm:inline-block"></span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Admin</span>
                </>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
