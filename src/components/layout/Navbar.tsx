import React from "react";
import Link from "next/link";

export function Navbar() {
  return (
    <div className="sticky top-6 z-50 flex justify-center w-full px-4 md:px-8 pointer-events-none transition-transform duration-300" suppressHydrationWarning>
      <header className="pointer-events-auto rounded-full bg-white/80 backdrop-blur-2xl border border-black/5 shadow-[0_8px_32px_rgb(0,0,0,0.06)] w-full max-w-[1000px] transition-all duration-500 hover:bg-white/95">
        <div className="flex h-[72px] items-center justify-between px-6 md:px-8">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center focus:outline-none shrink-0 border border-transparent hover:opacity-80 transition-opacity">
              <img 
                src="/images/logo.PNG" 
                alt="Tela Logo" 
                className="object-contain h-[28px] w-auto mix-blend-multiply" 
              />
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#093C15]/70">
              <Link href="/" className="transition-colors hover:text-[#093C15]">Products</Link>
              <Link href="/blog" className="transition-colors text-[#093C15] font-semibold">Learn</Link>
              <Link href="/company" className="transition-colors hover:text-[#093C15]">Company</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline-flex text-[15px] font-medium text-[#093C15] hover:opacity-70 transition-opacity px-4 py-2">
              Log in
            </Link>
            <Link href="/signup" className="hidden sm:inline-flex h-[44px] items-center justify-center rounded-full bg-[#093C15] px-6 text-[15px] font-semibold text-white transition-transform hover:scale-105 shadow-sm">
              Get started
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}
