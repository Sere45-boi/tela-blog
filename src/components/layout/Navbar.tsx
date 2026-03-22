import React from "react";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-6 z-50 flex justify-center w-full px-4 md:px-8 pointer-events-none transition-transform duration-300">
      <div className="pointer-events-auto rounded-full bg-white/80 backdrop-blur-2xl border border-black/5 shadow-[0_8px_32px_rgb(0,0,0,0.06)] w-full max-w-[1000px] transition-all duration-500 hover:bg-white/95">
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
              <Link href="https://tela.ng/Payment" className="transition-colors hover:text-[#093C15]">Payment</Link>
              <Link href="https://tela.ng/Business" className="transition-colors text-[#093C15] font-semibold">Business</Link>
              <Link href="https://tela.ng/ai" className="transition-colors hover:text-[#093C15]">Artificial Intelligence</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* <Link href="/login" className="hidden sm:inline-flex text-[15px] font-medium text-[#093C15] hover:opacity-70 transition-opacity px-4 py-2">
              Log in
            </Link> */}
            <Link href="https://quiz.tela.ng/" className="hidden sm:inline-flex h-[44px] items-center justify-center rounded-full bg-[#093C15] px-6 text-[15px] font-semibold text-white transition-transform hover:scale-105 shadow-sm">
              Quiz
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
